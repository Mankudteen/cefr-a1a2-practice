(() => {
  const MAIN_KEY='cefr-a1a2-practice-v2';
  const SOURCE_KEY='cefr-source-study-v1';
  const config=window.CEFR_SUPABASE_CONFIG||{};
  const configured=!!(config.url&&config.anonKey&&window.supabase?.createClient);
  const client=configured?window.supabase.createClient(config.url,config.anonKey):null;
  let currentUser=null, syncing=false, timer=null, applyingCloud=false;
  const q=s=>document.querySelector(s);
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
  const snapshot=()=>({version:1,main:read(MAIN_KEY),sourceStudy:read(SOURCE_KEY),syncedAt:new Date().toISOString()});

  function merge(a,b){
    if(Array.isArray(b)) return b;
    if(!b||typeof b!=='object') return b===undefined?a:b;
    const out={...(a&&typeof a==='object'&&!Array.isArray(a)?a:{})};
    Object.entries(b).forEach(([k,v])=>out[k]=(v&&typeof v==='object'&&!Array.isArray(v))?merge(out[k],v):v);
    return out;
  }
  function message(text,bad=false){
    const el=q('#authMessage'); if(!el)return;
    el.hidden=!text; el.textContent=text||''; el.className=`auth-message ${bad?'bad':'good'}`;
  }
  function updateUI(){
    if(q('#accountButton'))q('#accountButton').textContent=currentUser?(currentUser.email||'บัญชีของฉัน'):'Guest';
    if(q('#authGuestPanel'))q('#authGuestPanel').hidden=!!currentUser;
    if(q('#authUserPanel'))q('#authUserPanel').hidden=!currentUser;
    if(currentUser&&q('#authUserEmail'))q('#authUserEmail').textContent=currentUser.email||currentUser.id;
    const n=q('#authConfigNotice');
    if(n){n.hidden=configured;n.textContent='ระบบ Login เตรียมไว้แล้ว แต่โปรเจกต์ Supabase ยังไม่ได้ใส่ค่า Public URL / anon key ฝั่งเว็บ ตอนนี้ยังใช้ Guest local progress';}
    ['#authSignIn','#authSignUp'].forEach(s=>{const el=q(s);if(el)el.disabled=!configured;});
  }
  function open(){updateUI();q('#authModal').hidden=false;message('');}
  function close(){q('#authModal').hidden=true;}

  async function pushNow(){
    if(!client||!currentUser||syncing||applyingCloud)return;
    syncing=true; if(q('#authSyncStatus'))q('#authSyncStatus').textContent='กำลังซิงก์…';
    const {error}=await client.from('user_progress').upsert({user_id:currentUser.id,payload:snapshot(),updated_at:new Date().toISOString()},{onConflict:'user_id'});
    syncing=false;
    if(q('#authSyncStatus'))q('#authSyncStatus').textContent=error?'ซิงก์ไม่สำเร็จ':'ซิงก์แล้ว';
    if(error)console.error('CEFR sync:',error.message);
  }
  function queueSync(){
    if(!client||!currentUser||applyingCloud)return;
    clearTimeout(timer); timer=setTimeout(pushNow,900);
  }
  async function hydrate(){
    if(!client||!currentUser)return;
    const {data,error}=await client.from('user_progress').select('payload').eq('user_id',currentUser.id).maybeSingle();
    if(error){console.error('CEFR hydrate:',error.message);return;}
    if(!data?.payload){await pushNow();return;}
    applyingCloud=true;
    localStorage.setItem(MAIN_KEY,JSON.stringify(merge(read(MAIN_KEY),data.payload.main||{})));
    localStorage.setItem(SOURCE_KEY,JSON.stringify(merge(read(SOURCE_KEY),data.payload.sourceStudy||{})));
    applyingCloud=false;
    sessionStorage.setItem('cefr-cloud-hydrated','1');
    location.reload();
  }
  async function signIn(){
    if(!client)return; message('กำลังเข้าสู่ระบบ…');
    const {data,error}=await client.auth.signInWithPassword({email:q('#authEmail').value.trim(),password:q('#authPassword').value});
    if(error)return message(error.message,true);
    currentUser=data.user; updateUI(); await hydrate();
  }
  async function signUp(){
    if(!client)return; message('กำลังสร้างบัญชี…');
    const {data,error}=await client.auth.signUp({email:q('#authEmail').value.trim(),password:q('#authPassword').value});
    if(error)return message(error.message,true);
    if(data.session){currentUser=data.user;updateUI();await pushNow();message('สร้างบัญชีและเข้าสู่ระบบแล้ว');}
    else message('สร้างบัญชีแล้ว กรุณาตรวจอีเมลเพื่อยืนยันก่อนเข้าสู่ระบบ');
  }
  async function signOut(){
    if(!client)return; await pushNow(); await client.auth.signOut(); currentUser=null; updateUI(); close(); location.reload();
  }
  async function init(){
    q('#accountButton')?.addEventListener('click',open);
    document.querySelectorAll('[data-auth-close]').forEach(x=>x.addEventListener('click',close));
    q('#authSignIn')?.addEventListener('click',signIn);
    q('#authSignUp')?.addEventListener('click',signUp);
    q('#authSignOut')?.addEventListener('click',signOut);
    q('#authSyncNow')?.addEventListener('click',pushNow);
    if(configured){
      const {data}=await client.auth.getSession(); currentUser=data.session?.user||null;
      client.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateUI();});
    }
    updateUI();
  }
  window.CEFR_SYNC={configured,queueSync,pushNow,getUser:()=>currentUser};
  init();
})();