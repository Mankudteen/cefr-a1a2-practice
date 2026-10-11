const answerKeys = {
  1:['D','B','B','D','C','A','D','C','D','D','A','B','C','B','C'],
  2:['D','C','B','A','C','B','C','D','A','B','B','C','C','B','C'],
  3:['A','B','C','D','B','D','D','B','B','D','C','B','D','A','B'],
  4:['D','B','C','B','C','B','B','B','B','A','C','C','B','D','D'],
  5:['D','D','B','C','B','A','B','B','D','C','C','D','C','C','D'],
  6:['D','C','C','B','B','B','C','C','C','C','C','B','B','A','B'],
  7:['B','C','B','D','C','A','C','C','D','B','A','D','D','D','B'],
  8:['D','A','B','A','C','D','D','A','D','A','B','D','C','B','D'],
  9:['D','C','D','A','B','B','B','C','C','D','C','C','C','B','C'],
 10:['C','B','D','D','A','D','C','B','C','C','A','C','A','D','C'],
 11:['B','D','C','D','A','A','B','B','D','A','A','C','B','C','B'],
 12:['B','C','C','A','B','B','C','A','D','A','C','A','B','B','C'],
 13:['D','C','B','B','D','C','C','A','C','A','B','B','B','A','C'],
 14:['C','D','C','B','B','D','B','B','A','A','B','B','A','A','C'],
 15:['D','C','A','A','B','B','D','B','C','B','B','A','B','B','B'],
 16:['C','D','C','C','D','A','B','C','B','D','A','A','B','C','D'],
 17:['A','C','B','D','B','B','C','B','B','B','A','B','B','B','C'],
 18:['C','C','C','A','D','B','A','D','D','B','B','C','C','A','D'],
 19:['D','A','B','B','A','B','D','D','D','C','D','B','B','B','C'],
 20:['C','C','A','A','D','C','D','D','C','C','B','B','B','B','D']
};

const STORE_KEY = 'cefr-a1a2-practice-v2';
const saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
const state = {
  mode: 'set',
  currentSet: saved.currentSet || 1,
  answers: saved.answers || {},
  checked: saved.checked || {},
  randomAttempt: saved.randomAttempt || null,
  bestRandom: saved.bestRandom || null,
  detailMode: saved.detailMode ?? false,
  lessonProgress: saved.lessonProgress || {passed:{}, attempts:{}, recent:{}},
  lessonAttempt: saved.lessonAttempt || null,
  lessonCurrent: Number.isInteger(saved.lessonCurrent) ? saved.lessonCurrent : 0,
  sourceCategory: saved.sourceCategory || 'b1b2',
  sourceSetId: saved.sourceSetId || null,
  sourceAnswers: saved.sourceAnswers || {},
  sourceChecked: saved.sourceChecked || {},
  lastActivity: saved.lastActivity || null
};

const $ = (s) => document.querySelector(s);
const letters = ['A','B','C','D'];

function persist(){
  localStorage.setItem(STORE_KEY, JSON.stringify({
    currentSet: state.currentSet,
    answers: state.answers,
    checked: state.checked,
    randomAttempt: state.randomAttempt,
    bestRandom: state.bestRandom,
    detailMode: state.detailMode,
    lessonProgress: state.lessonProgress,
    lessonAttempt: state.lessonAttempt,
    lessonCurrent: state.lessonCurrent,
    sourceCategory: state.sourceCategory,
    sourceSetId: state.sourceSetId,
    sourceAnswers: state.sourceAnswers,
    sourceChecked: state.sourceChecked,
    lastActivity: state.lastActivity
  }));
  window.CEFR_SYNC?.queueSync?.();
}

function setAnswers(setNo){
  if(!state.answers[setNo]) state.answers[setNo] = {};
  return state.answers[setNo];
}

function checkedScore(setNo){
  if(!state.checked[setNo]) return null;
  const answers=setAnswers(setNo);
  return answerKeys[setNo].reduce((sum,key,i)=>sum+(answers[i+1]===key?1:0),0);
}

function homeStats(){
  let answered=0, checkedSets=0, checkedCorrect=0;
  for(let s=1;s<=20;s++){
    answered += Object.keys(setAnswers(s)).length;
    const score=checkedScore(s);
    if(score!==null){checkedSets++; checkedCorrect+=score;}
  }
  return {answered,checkedSets,checkedCorrect};
}

function showHome(){
  state.mode='set';
  $('#quizView').hidden=true;
  $('#vocabView').hidden=true;
  $('#lessonView').hidden=true;
  $('#collectionView').hidden=true;
  $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true;
  $('#homeView').hidden=false;
  renderHome();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderResumeLast(){
  const btn=$('#resumeLast'); if(!btn)return;
  const a=state.lastActivity; btn.hidden=!a; if(!a)return;
  let title='การฝึกล่าสุด';
  if(a.kind==='a1-set')title=`A1–A2 · Set ${a.set}`;
  else if(a.kind==='a1-random')title='A1–A2 · สุ่ม 30 ข้อ';
  else if(a.kind==='a1-lesson')title=`A1–A2 · บทเรียนที่ ${Number(a.index)+1}`;
  else if(a.kind==='source-set')title=sourceSetById(a.category,a.setId)?.title||`${extendedCollections?.[a.category]?.title||a.category} · ชุดฝึก`;
  else if(a.kind==='source-random')title=`${extendedCollections?.[a.category]?.title||a.category} · ชุดสุ่ม`;
  else if(a.kind==='source-lesson')title=`${extendedCollections?.[a.category]?.title||a.category} · บทเรียนที่ ${Number(a.index)+1}`;
  $('#resumeLastTitle').textContent=title;
  btn.onclick=()=>{
    if(a.kind==='a1-set')openSet(a.set);
    else if(a.kind==='a1-random')startRandom(false);
    else if(a.kind==='a1-lesson'){showLessons();openLesson(Number(a.index)||0);}
    else if(a.kind==='source-set')openSourceSet(a.category,a.setId);
    else if(a.kind==='source-random')startSourceRandom(a.category,false);
    else if(a.kind==='source-lesson'){showSourceLessons(a.category);openSourceLesson(a.category,Number(a.index)||0);}
  };
}

function renderHome(){
  renderCategoryGrid();
  renderResumeLast();
  const stats=homeStats();
  const learning=lessonStats();
  $('#overview').innerHTML=`
    <div class="stat"><span>คลังโจทย์</span><strong>300 ข้อ</strong><small>20 Sets × 15 ข้อ</small></div>
    <div class="stat"><span>ทำไปแล้ว</span><strong>${stats.answered} / 300</strong><small>คำตอบถูกเก็บไว้ในเครื่องนี้</small></div>
    <div class="stat"><span>ตรวจแล้ว</span><strong>${stats.checkedSets} / 20 Sets</strong><small>${stats.checkedSets ? `รวมถูก ${stats.checkedCorrect} ข้อ` : 'ยังไม่มีชุดที่ตรวจ'}</small></div>
    <div class="stat"><span>บทเรียน</span><strong>${learning.percent}%</strong><small>ผ่าน ${learning.passed} / ${learning.total} บท</small></div>`;

  const grid=$('#setGrid');
  grid.innerHTML='';
  for(let s=1;s<=20;s++){
    const answered=Object.keys(setAnswers(s)).length;
    const score=checkedScore(s);
    const pct=Math.round(answered/15*100);
    const btn=document.createElement('button');
    btn.className=`set-card ${score!==null?'checked':''}`;
    btn.type='button';
    btn.innerHTML=`
      <span class="set-kicker">A1–A2 Grammar</span>
      <strong>Set ${s}</strong>
      <div class="set-card-bottom">
        <div class="mini-progress"><span style="width:${pct}%"></span></div>
        <div class="mini-meta"><span>ตอบ ${answered}/15</span><span>${score===null?'ยังไม่ตรวจ':`คะแนน ${score}/15`}</span></div>
      </div>`;
    btn.addEventListener('click',()=>openSet(s));
    grid.appendChild(btn);
  }
}

function openSet(setNo){
  state.mode='set'; state.lastActivity={kind:'a1-set',set:setNo};
  state.currentSet=setNo;
  persist();
  $('#homeView').hidden=true;
  $('#vocabView').hidden=true;
  $('#lessonView').hidden=true;
  $('#collectionView').hidden=true;
  $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true;
  $('#quizView').hidden=false;
  renderQuiz();
  window.scrollTo({top:0,behavior:'smooth'});
}

function makeRandomItems(){
  const pool=[];
  for(let s=1;s<=20;s++) for(let q=1;q<=15;q++) pool.push({set:s,q});
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool.slice(0,30);
}

function startRandom(forceNew=true){
  if(forceNew || !state.randomAttempt){
    state.randomAttempt={items:makeRandomItems(),answers:{},checked:false,createdAt:Date.now()};
  }
  state.mode='random'; state.lastActivity={kind:'a1-random'};
  persist();
  $('#homeView').hidden=true;
  $('#vocabView').hidden=true;
  $('#lessonView').hidden=true;
  $('#collectionView').hidden=true;
  $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true;
  $('#quizView').hidden=false;
  renderQuiz();
  window.scrollTo({top:0,behavior:'smooth'});
}

function currentItems(){
  if(state.mode==='random') return state.randomAttempt.items.map((ref,index)=>({
    displayNo:index+1,
    set:ref.set,
    q:ref.q,
    data:questionBank[ref.set][ref.q-1],
    key:answerKeys[ref.set][ref.q-1]
  }));
  return questionBank[state.currentSet].map((data,index)=>({
    displayNo:index+1,
    set:state.currentSet,
    q:index+1,
    data,
    key:answerKeys[state.currentSet][index]
  }));
}

function currentAnswers(){
  return state.mode==='random' ? state.randomAttempt.answers : setAnswers(state.currentSet);
}

function isChecked(){
  return state.mode==='random' ? !!state.randomAttempt.checked : !!state.checked[state.currentSet];
}

function scoreCurrent(){
  const answers=currentAnswers();
  return currentItems().reduce((sum,item)=>sum+(answers[item.displayNo]===item.key?1:0),0);
}

function showVocabulary(){
  state.mode='vocab';
  $('#homeView').hidden=true;
  $('#quizView').hidden=true;
  $('#lessonView').hidden=true;
  $('#collectionView').hidden=true;
  $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true;
  $('#vocabView').hidden=false;
  if(!$('#vocabSetFilter').dataset.ready){
    for(let i=1;i<=20;i++) $('#vocabSetFilter').insertAdjacentHTML('beforeend',`<option value="${i}">Set ${i}</option>`);
    $('#vocabSetFilter').dataset.ready='1';
  }
  renderVocabulary();
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderVocabulary(){
  const query=$('#vocabSearch').value.trim().toLowerCase();
  const setFilter=$('#vocabSetFilter').value;
  const typeFilter=$('#vocabTypeFilter').value;
  const sort=$('#vocabSort').value;
  let rows=(typeof vocabularyData!=='undefined'?vocabularyData:[]).filter(v=>{
    const hay=[v.term,v.thai,v.category,v.example,v.exampleThai,...(v.refs||[])].join(' ').toLowerCase();
    const matchQuery=!query || hay.includes(query);
    const matchSet=setFilter==='all' || (v.refs||[]).some(r=>r.startsWith(`Set ${setFilter} ·`));
    const matchType=typeFilter==='all' || v.category===typeFilter;
    return matchQuery && matchSet && matchType;
  });
  if(sort==='az') rows.sort((a,b)=>a.term.localeCompare(b.term,'en'));
  else if(sort==='frequency') rows.sort((a,b)=>(b.count||0)-(a.count||0)||a.term.localeCompare(b.term,'en'));
  else rows.sort((a,b)=>{
    const ap=a.category==='วลี/รูปประโยค'?0:a.category==='คำไวยากรณ์/คำเชื่อม'?1:2;
    const bp=b.category==='วลี/รูปประโยค'?0:b.category==='คำไวยากรณ์/คำเชื่อม'?1:2;
    return ap-bp || (b.count||0)-(a.count||0) || a.term.localeCompare(b.term,'en');
  });
  $('#vocabCount').textContent=`${rows.length.toLocaleString()} คำ/วลี`;
  $('#vocabEmpty').hidden=rows.length>0;
  $('#vocabList').innerHTML=rows.map(v=>`<article class="vocab-card">
    <div class="vocab-term"><strong>${escapeHtml(v.term)}</strong><span class="thai">${escapeHtml(v.thai||'—')}</span><div class="vocab-tags"><span class="vocab-tag">${escapeHtml(v.category)}</span><span class="vocab-tag">พบ ${v.count||1} ข้อ</span></div></div>
    <div class="vocab-detail">${v.example?`<div class="vocab-example"><div class="en">${escapeHtml(v.example)}</div><div class="th">${escapeHtml(v.exampleThai||'')}</div></div>`:''}<div class="vocab-refs">พบใน: ${(v.refs&&v.refs.length)?v.refs.map(escapeHtml).join(' · '):'สรุปจากรูปประโยค/วลีที่ใช้ในชุดฝึก'}</div></div>
  </article>`).join('');
}

function optionFormDescription(label){
  const text=String(label||'').trim();
  if(text==='—' || text==='-') return 'ไม่เติมคำในช่องว่าง';
  if(/^to\s+[a-z]/i.test(text)) return 'รูป to + กริยา (to-infinitive)';
  if(/\b\w+ing\b/i.test(text)) return 'มีรูป V-ing / -ing';
  if(/\b(was|were|did|went|came|took|sank|spoke|made|had)\b/i.test(text)) return 'มีรูปอดีต (Past)';
  if(/\b(have|has)\s+been\b/i.test(text)) return 'รูป Perfect/Continuous ที่มี have/has been';
  if(/\b(can|could|will|would|may|might|must|should)\b/i.test(text)) return 'มี modal verb';
  if(/\//.test(text)) return 'เป็นคำตอบหลายช่อง ต้องเติมตามลำดับ';
  return 'ดูความหมายและหน้าที่ของคำในประโยค';
}

function answerParts(answer){
  let raw=String(answer||'').trim();
  if(raw==='—'||raw==='-') return [''];
  return raw.includes('/') ? raw.split(/\s*\/\s*/) : [raw];
}

function fillAnswerMarkup(question, answer, tone='correct-answer'){
  const q=String(question||'');
  const parts=answerParts(answer);
  const re=/_{2,}/g;
  let out='', last=0, index=0, match;
  while((match=re.exec(q))){
    out+=escapeHtml(q.slice(last,match.index));
    const value=parts[Math.min(index,parts.length-1)] ?? '';
    out+=`<span class="answer-highlight ${tone}">${escapeHtml(value||'—')}</span>`;
    last=match.index+match[0].length;
    index++;
  }
  if(index){
    out+=escapeHtml(q.slice(last));
    return out.replace(/\s+([?.!,;:])/g,'$1').replace(/\s{2,}/g,' ');
  }
  return `${escapeHtml(q)}${String(answer||'').trim()?` <span class="answer-arrow">→</span> <span class="answer-highlight ${tone}">${escapeHtml(answer)}</span>`:''}`;
}

function highlightAnswerInText(text, answer, tone='correct-answer'){
  const source=String(text||'');
  const parts=answerParts(answer).filter(Boolean);
  if(!parts.length) return escapeHtml(source);
  const target=parts.join(' / ');
  const idx=source.toLowerCase().indexOf(target.toLowerCase());
  if(idx<0) return escapeHtml(source);
  return `${escapeHtml(source.slice(0,idx))}<span class="answer-highlight ${tone}">${escapeHtml(source.slice(idx,idx+target.length))}</span>${escapeHtml(source.slice(idx+target.length))}`;
}

function optionAnalysisHtml(item, selected, guide, explanation){
  const translated=learningData?.[item.set]?.[item.q-1]?.options || {};
  const correctLabel=item.data.options[letters.indexOf(item.key)]||'';
  return `<div class="option-analysis"><h4>6. วิเคราะห์ตัวเลือก A–D ทีละข้อ</h4><div class="option-analysis-list">${letters.map((letter,i)=>{
    const label=item.data.options[i]||'';
    const info=translated[letter]||{};
    const correct=letter===item.key;
    const chosen=letter===selected;
    const rowClass=correct?'correct-option':(chosen?'selected-wrong':'');
    const tone=correct?'correct-answer':'wrong-answer';
    const reason=correct?`ตัวเลือกนี้ถูก เพราะ ${explanation}`:choiceDiagnostic(guide,label,correctLabel);
    const correctThai=translated[item.key]?.thai||'';
    const sameThai=!correct && info.thai && correctThai && info.thai.trim()===correctThai.trim();
    const filled=info.filled||fillCorrectAnswer(item.data.q,label);
    const sentenceMarkup=item.data.q.includes('__')?fillAnswerMarkup(item.data.q,label,tone):highlightAnswerInText(filled,label,tone);
    const translationClass=correct?'translation-correct':'translation-wrong';
    return `<div class="option-analysis-row ${rowClass}"><div class="option-analysis-head"><strong class="option-choice-word ${tone}">${letter}. ${escapeHtml(label||'—')}</strong>${correct?'<span class="option-pill correct">คำตอบถูก</span>':''}${chosen?'<span class="option-pill chosen">คุณเลือก</span>':''}${!correct?'<span class="option-pill wrong">ตัวเลือกผิด</span>':''}</div><div class="option-meaning"><strong>ความหมาย:</strong> <span class="${translationClass}">${escapeHtml(info.meaning||'ดูความหมายจากบริบท')}</span> · <strong>รูปคำ:</strong> ${escapeHtml(optionFormDescription(label))}</div><div class="option-sentence"><div class="en"><strong>ถ้าเติมข้อนี้:</strong> ${sentenceMarkup}</div><div class="th"><strong>แปลโดยประมาณ:</strong> <span class="${translationClass}">${escapeHtml(info.thai||'—')}</span></div></div><div class="option-reason"><strong>${correct?'ทำไมจึงถูก':'ทำไมจึงไม่เลือกข้อนี้'}:</strong> ${escapeHtml(reason)}${sameThai?' แม้คำแปลไทยจะออกมาใกล้หรือเหมือนเฉลย แต่ภาษาอังกฤษยังถือว่าผิด เพราะรูปไวยากรณ์/ตำแหน่งคำไม่ตรงกฎของประโยคนี้':''}</div></div>`;
  }).join('')}</div></div>`;
}

function renderQuiz(){
  const items=currentItems();
  const answers=currentAnswers();
  const checked=isChecked();
  const answered=Object.keys(answers).length;
  const total=items.length;
  const pct=Math.round(answered/total*100);
  const score=checked?scoreCurrent():null;

  $('#quizTitle').textContent=state.mode==='random'?'สุ่มทดสอบ 30 ข้อ':`A1–A2 · Set ${state.currentSet}`;
  $('#modeBadge').textContent=state.mode==='random'?'Random 30':'Set';
  $('#modeBadge').className=`mode-badge ${state.mode==='random'?'random':''}`;
  $('#quizMeta').textContent=`ตอบแล้ว ${answered}/${total} ข้อ${state.mode==='random'?' · สุ่มจากทุก Set':''}`;
  $('#progressBar').style.width=`${pct}%`;
  $('#scoreChip').className=`score-chip ${checked?'done':'pending'}`;
  $('#scoreChip').textContent=checked?`${score} / ${total}`:'ยังไม่ตรวจ';
  $('#toggleDetailMode').hidden=!checked;
  $('#toggleDetailMode').textContent=state.detailMode?'ซ่อนรายละเอียด':'แสดงแบบละเอียด';
  $('#quizView').classList.toggle('compact-explanations',checked && !state.detailMode);

  $('#statusBanner').hidden=!checked;
  if(checked){
    const unanswered=total-answered;
    $('#statusBanner').innerHTML=`ตรวจเรียบร้อยแล้ว · ถูก <strong>${score}</strong> จาก ${total} ข้อ${unanswered?` · ไม่ได้ตอบ ${unanswered} ข้อ`:''}`;
  }

  const list=$('#questionList');
  list.innerHTML='';
  items.forEach(item=>{
    const selected=answers[item.displayNo];
    const card=document.createElement('article');
    card.className=`question-card ${checked?(!selected?'is-unanswered':selected===item.key?'is-correct':'is-wrong'):''}`;
    const origin=state.mode==='random'?`<span class="origin">Set ${item.set} · ข้อ ${item.q}</span>`:'';
    const opts=item.data.options.map((label,i)=>{
      const letter=letters[i];
      let cls='answer-option';
      if(selected===letter) cls+=' selected';
      if(checked && letter===item.key) cls+=' correct';
      if(checked && selected===letter && letter!==item.key) cls+=' wrong';
      return `<button type="button" class="${cls}" data-n="${item.displayNo}" data-choice="${letter}" aria-pressed="${selected===letter}">
        <span class="answer-letter">${letter}</span><span class="answer-text">${escapeHtml(label || '—')}</span>
      </button>`;
    }).join('');
    card.innerHTML=`
      <div class="question-top"><span class="question-no">${item.displayNo}</span>${origin}</div>
      <p class="question-text">${escapeHtml(item.data.q)}</p>
      <div class="answer-options">${opts}</div>
      ${checked?feedbackHtml(item,selected):''}`;
    list.appendChild(card);
  });

  list.querySelectorAll('.answer-option').forEach(btn=>btn.addEventListener('click',()=>chooseAnswer(Number(btn.dataset.n),btn.dataset.choice)));

  $('#dockTitle').textContent=checked?'ตรวจแล้ว — เปลี่ยนคำตอบได้ แล้วกดตรวจใหม่':'เลือกคำตอบ แล้วค่อยตรวจพร้อมกัน';
  $('#dockMeta').textContent=checked?`คะแนนล่าสุด ${score}/${total}`:`ตอบแล้ว ${answered}/${total} · ยังไม่แสดงเฉลย`;
  $('#checkAnswers').textContent=checked?'ตรวจใหม่':'ตรวจคำตอบ';

  $('#resultPanel').hidden=!checked;
  if(checked){
    const percent=Math.round(score/total*100);
    $('#resultScore').textContent=`${score} / ${total}`;
    $('#resultPercent').textContent=`${percent}%`;
    $('#resultSummary').innerHTML=summaryMessage(percent,total-answered);
  }

  const random=state.mode==='random';
  $('#prevSet').hidden=random;
  $('#nextSet').hidden=random;
  $('#newRandom').hidden=!random;
  if(!random){
    $('#prevSet').disabled=state.currentSet===1;
    $('#nextSet').disabled=state.currentSet===20;
  }
}

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function fillCorrectAnswer(question, answer){
  let q=String(question || '');
  let raw=String(answer || '').trim();
  const blanks=(q.match(/_{2,}/g)||[]).length;
  if(!blanks) return `${q}  →  ${raw}`;
  let parts=raw.includes('/') ? raw.split(/\s*\/\s*/) : [raw];
  if(raw==='—' || raw==='-') parts=[''];
  if(blanks>1 && parts.length>=blanks){
    parts.slice(0,blanks).forEach(part=>{q=q.replace(/_{2,}/,part)});
  }else q=q.replace(/_{2,}/,parts[0]||'');
  return q.replace(/\s+([?.!,;:])/g,'$1').replace(/\s{2,}/g,' ').trim();
}

function lessonGuide(explanation, question, correctLabel){
  const text=String(explanation || '');
  const source=`${text} ${question} ${correctLabel}`.toLowerCase();
  const guides=[
    {re:/make \+|made him|make \+ กรรม/,topic:'โครงสร้าง make + คน/สิ่ง + กริยารูปพื้นฐาน',pattern:'make / made + object + V1',basic:'เมื่อ make มีความหมายว่า “ทำให้ใครทำอะไร” หลังคนหรือสิ่งที่ถูกทำให้ทำ เราใช้กริยารูปพื้นฐานทันที ไม่เติม to เช่น make me laugh, made him think',tip:'ถ้าเห็น make/made + คน แล้วช่องว่างเป็นกริยา ให้มองหา V1 ก่อน'},
    {re:/present perfect continuous|have been working|has been selling/,topic:'Present Perfect Continuous',pattern:'have/has + been + V-ing',basic:'ใช้เมื่อการกระทำเริ่มในอดีต ดำเนินต่อเนื่องมาระยะหนึ่ง และยังเกี่ยวข้องกับปัจจุบัน มักเจอ for + ระยะเวลา หรือ since + จุดเริ่มต้น',tip:'เห็น for/since และเน้นว่า “ทำมาตลอด” ให้คิดถึง have/has been + V-ing'},
    {re:/present perfect|have fallen|has not finished|haven't talked|hasn't visited|have been to|for \+|since \+/,topic:'Present Perfect',pattern:'have/has + V3',basic:'ใช้พูดถึงสิ่งที่เริ่มหรือเกิดในอดีตแต่ยังเชื่อมกับปัจจุบัน หรือเป็นประสบการณ์ที่ไม่ระบุเวลาแน่นอน คำบอกเวลาที่พบบ่อยคือ for, since, yet, already, ever, never',tip:'for = ระยะเวลา เช่น for ten years; since = จุดเริ่ม เช่น since Monday'},
    {re:/past simple|last night|ago|yesterday|v2|sank|turned on|went/,topic:'Past Simple',pattern:'Subject + V2 / did + Subject + V1',basic:'ใช้กับเหตุการณ์ที่จบไปแล้วในอดีต โดยมักมีคำบอกเวลา เช่น yesterday, last night, ... ago ถ้าเป็นประโยคคำถามหรือปฏิเสธและมี did กริยาหลักต้องกลับเป็น V1',tip:'เห็น last / yesterday / ago ให้ตรวจ Past Simple เป็นอย่างแรก'},
    {re:/present continuous|are watching|is learning|was writing/,topic:'Continuous tense',pattern:'be + V-ing',basic:'ใช้เมื่อเน้นว่าการกระทำกำลังเกิดอยู่หรือกำลังดำเนินอยู่ คำอย่าง Look!, now มักบอก Present Continuous ส่วนเหตุการณ์ที่กำลังเกิดในอดีตใช้ was/were + V-ing',tip:'หา verb to be ให้ตรงกับประธานก่อน แล้วตามด้วย V-ing'},
    {re:/passive|ถูก|be caught|was taken|was made|was sentenced|is composed/,topic:'Passive Voice',pattern:'be + V3',basic:'ใช้เมื่อประธานเป็น “ผู้ถูกกระทำ” ไม่ใช่ผู้ลงมือทำ เช่น The thief was sentenced = ขโมยถูกตัดสินโทษ รูปของ be เปลี่ยนตาม tense แต่กริยาหลักเป็น V3',tip:'ถามตัวเองว่า “ประธานทำเอง หรือถูกทำ?” ถ้าถูกทำ มักใช้ be + V3'},
    {re:/subjunctive|suggest that|insist that|preferred that|prefer that/,topic:'Subjunctive หลังคำแนะนำ/ยืนยัน/ความต้องการ',pattern:'suggest / insist / prefer + that + Subject + V1',basic:'หลังคำบางคำ เช่น suggest, insist และในแบบฝึกหัดนี้ preferred that ประโยคย่อยใช้กริยารูปพื้นฐาน แม้ประธานจะเป็น he/she ก็ตาม และ verb to be ใช้ be',tip:'หลัง suggest/insist + that อย่าเติม -s ที่กริยา'},
    {re:/modal|may \+|can \+|could|will \+|had better|can't \+|must/,topic:'Modal verb + V1',pattern:'can / could / may / will / must / had better + V1',basic:'หลัง modal verb กริยาหลักใช้รูปพื้นฐานเสมอ ไม่เติม to, -s, -ed เช่น can swim, will go, had better work',tip:'ถ้าหน้าช่องว่างเป็น can/could/may/will/must/had better ให้เลือก V1'},
    {re:/comparative|better than|more interesting|less than|much less|the longer|the more/,topic:'การเปรียบเทียบ Comparative',pattern:'comparative + than  |  much + comparative',basic:'เมื่อเปรียบเทียบสองสิ่ง ใช้คำขั้นกว่า เช่น better, more interesting, less แล้วตามด้วย than ได้ คำว่า much ใช้ขยายขั้นกว่าเพื่อแปลว่า “มากกว่ามาก”',tip:'better เป็นขั้นกว่าของ well/good; less ใช้กับปริมาณที่น้อยกว่า'},
    {re:/superlative|biggest|in the world|the most beautiful/,topic:'การเปรียบเทียบขั้นสูงสุด Superlative',pattern:'the + adjective-est / the most + adjective',basic:'ใช้เมื่อพูดถึงสิ่งหนึ่งที่เด่นที่สุดในกลุ่ม ตั้งแต่สามสิ่งขึ้นไป เช่น the biggest country, the most beautiful building',tip:'ถ้าเห็น “in the world / of all” มักเป็นสัญญาณของ superlative'},
    {re:/countable|uncountable|นับไม่ได้|less|fewer|few|little|many|much/,topic:'คำนามนับได้และนับไม่ได้',pattern:'few/fewer + countable plural | little/less + uncountable',basic:'คำนามนับได้พหูพจน์ เช่น seats, books ใช้ few/fewer ส่วนคำนามนับไม่ได้ เช่น coffee, money, time, difficulty ใช้ little/less และ many/much ก็เลือกตามชนิดคำนามเช่นกัน',tip:'ลองถามว่า “นับเป็น 1, 2, 3 ได้ไหม?” ถ้าไม่ได้ มักใช้ much/little/less'},
    {re:/article|a\/an|the capital|the piano|ไม่มี article|ไม่ต้องมี article|โดยไม่ต้องมี the/,topic:'การใช้ a / an / the',pattern:'a/an + คำนามเอกพจน์ทั่วไป | the + สิ่งเฉพาะเจาะจง',basic:'a/an ใช้เมื่อกล่าวถึงสิ่งหนึ่งแบบไม่เฉพาะเจาะจง ส่วน the ใช้เมื่อผู้พูดและผู้ฟังรู้ว่าสิ่งไหน หรือเป็นสิ่งเฉพาะ เช่น the capital, the piano ในสำนวนเล่นเครื่องดนตรี',tip:'อย่าดูแค่คำนาม ให้ดูด้วยว่าพูดแบบทั่วไปหรือชี้เฉพาะ'},
    {re:/possessive|ความเป็นเจ้าของ|mine|yours|hers|his sisters|kate’s|sister’s|their names/,topic:'คำแสดงความเป็นเจ้าของ',pattern:'my/your/his/her/their + noun | mine/yours/hers + ไม่มี noun ตาม',basic:'possessive adjective ต้องมีคำนามตาม เช่น my book, his sisters แต่ possessive pronoun ใช้เดี่ยว ๆ เช่น mine, yours, hers เพราะมันแทนทั้ง “ของฉัน/ของคุณ/ของเธอ” แล้ว',tip:'ถ้าหลังช่องว่างมีคำนาม ให้คิด my/your/his/her/their; ถ้าไม่มีคำนามตาม ให้คิด mine/yours/hers'},
    {re:/object pronoun|กรรม|him|her|them|me\b|listen to/,topic:'Subject pronoun กับ Object pronoun',pattern:'ประธาน: I/he/she/we/they | กรรม: me/him/her/us/them',basic:'ถ้าคำสรรพนามเป็นผู้กระทำ ใช้รูปประธาน แต่ถ้าอยู่หลัง verb หรือ preposition และเป็นผู้รับการกระทำ ให้ใช้รูปกรรม เช่น know him, listen to her, give it to me',tip:'หลัง to/with/of หรือหลังคำกริยาที่กระทำต่อคน มักต้องใช้ object pronoun'},
    {re:/adjective order|ลำดับ adjective|จำนวน \+ ขนาด \+ สี/,topic:'ลำดับคำคุณศัพท์',pattern:'number + size + color + noun',basic:'ภาษาอังกฤษวาง adjective หลายคำตามลำดับที่ค่อนข้างตายตัว ในระดับนี้ให้จำง่าย ๆ ว่า “จำนวน → ขนาด → สี → คำนาม” เช่น two small black kittens',tip:'อย่าเรียงคำคุณศัพท์ตามภาษาไทย ให้จำลำดับจากตัวอย่างเป็นชุด'},
    {re:/linking verb|became|adjective|adj\./,topic:'Linking verb + adjective',pattern:'be / become / feel / look + adjective',basic:'กริยาบางตัวไม่ได้บอกการกระทำ แต่เชื่อมประธานกับคำบอกลักษณะ เช่น become, be, feel หลังคำเหล่านี้มักใช้ adjective ไม่ใช่ adverb',tip:'ถามว่า “คำหลังช่องว่างกำลังบอกลักษณะของประธานไหม?” ถ้าใช่ มักเป็น adjective'},
    {re:/gerund|v-ing|can't help|look forward to|stop smoking|how about|spend .* v-ing/,topic:'Gerund (V-ing)',pattern:'บางคำ/สำนวน + V-ing',basic:'กริยาบางคำและสำนวนต้องตามด้วย V-ing เช่น can’t help doing, look forward to doing, stop doing, How about doing และ spend time doing',tip:'อย่าคิดว่า to ทุกตัวต้องตามด้วย V1 เพราะใน look forward to คำว่า to เป็น preposition จึงตามด้วย V-ing'},
    {re:/to-infinitive|to v1|to \+ v1|would you like|decide not to|too .* to/,topic:'Infinitive (to + V1)',pattern:'to + verb base form',basic:'บางคำต้องตามด้วย to + กริยารูปพื้นฐาน เช่น want to go, decide to leave, would like to talk รวมถึงโครงสร้าง too + adjective + to + V1',tip:'จำเป็นกลุ่มคำ มากกว่าพยายามแปลทีละคำ'},
    {re:/conditional|first conditional|second conditional|third conditional|if \+/,topic:'Conditional (ประโยคเงื่อนไข)',pattern:'If-clause + ผลลัพธ์',basic:'Conditional ใช้พูดถึง “ถ้า...แล้ว...” First Conditional พูดถึงอนาคตที่มีโอกาสเกิด: if + present, will + V1; Second Conditional เป็นสมมติ: if + V2, would + V1; Third Conditional พูดถึงอดีตที่ไม่เกิดขึ้น: if + had + V3, would have + V3',tip:'ดู tense หลัง if ก่อน แล้วค่อยจับคู่กับส่วนผลลัพธ์'},
    {re:/tag question|tag|isn't it|don't you|will they|didn't you/,topic:'Question Tag',pattern:'ประโยคบอกเล่า + tag ปฏิเสธ / ประโยคปฏิเสธ + tag บอกเล่า',basic:'Question tag คือคำถามสั้นท้ายประโยคเพื่อขอการยืนยัน ถ้าประโยคหลักเป็นบวก tag มักเป็นลบ และถ้าหลักเป็นลบ tag เป็นบวก โดยใช้ auxiliary ให้ตรงกับ tense',tip:'หา auxiliary ของประโยคหลักก่อน เช่น is→isn’t, did→didn’t, won’t→will'},
    {re:/wh-question|ถาม|what|where|how often|how much|how do you do/,topic:'Question word',pattern:'Wh-word + auxiliary/be + subject ...?',basic:'คำถามแต่ละคำถามคนละข้อมูล: What = อะไร, Where = ที่ไหน, Who = ใคร, How = อย่างไร, How often = บ่อยแค่ไหน, How much = เท่าไร/มากเท่าไร',tip:'อ่าน “คำตอบที่คาดว่าจะได้” ก่อน จะช่วยเลือกคำถามได้ เช่น By coach → ถามวิธี = How'},
    {re:/preposition|สำนวน|arrive at|proud of|at the weekend|in \+ year|on tuesday|good at|next to|for sale|at school/,topic:'Preposition และสำนวนที่ต้องจำเป็นชุด',pattern:'verb/adjective + preposition ที่ใช้คู่กัน',basic:'คำบุพบทอังกฤษหลายกรณีแปลตรงตัวไม่ได้ ต้องจำเป็นวลี เช่น proud of, arrive at, good at, on Tuesday, in 1973, at school เพราะเปลี่ยน preposition แล้วความหมายหรือความถูกต้องเปลี่ยน',tip:'จำเป็น “ก้อนคำ” ทั้งชุด เช่น proud of ไม่ใช่จำ proud แยกจาก of'},
    {re:/another|the other|others|other side|any other/,topic:'another / other / the other / others',pattern:'another + singular | other + noun | the other = อีกอันที่เหลือ | others = อื่น ๆ',basic:'another หมายถึง “อีกหนึ่ง” และตามด้วยคำนามเอกพจน์; the other มักหมายถึงอีกอันที่เหลือจากสองอัน; others ใช้เดี่ยว ๆ แทนคำนามพหูพจน์',tip:'ดูก่อนว่ามีกี่สิ่ง และหลังคำตอบมีคำนามตามหรือไม่'},
    {re:/short answer|yes, i do|คำถาม do|do you|does|did \+ v1/,topic:'Do / Does / Did ในประโยคคำถาม',pattern:'Do/Does/Did + Subject + V1 ?',basic:'ถ้าคำถามใช้ do/does/did กริยาหลักต้องเป็น V1 และคำตอบสั้นต้องใช้ auxiliary ตัวเดิม เช่น Do you like tea? — Yes, I do.',tip:'เมื่อ did โผล่มา กริยาหลักห้ามเป็น V2 เพราะความเป็นอดีตอยู่ที่ did แล้ว'},
    {re:/be \+|verb to be|where is|are your|were you/,topic:'Verb to be',pattern:'am/is/are (ปัจจุบัน) | was/were (อดีต)',basic:'verb to be เปลี่ยนตามประธานและเวลา: I am, he/she/it is, you/we/they are; อดีตใช้ was/were ในคำถามให้นำ be ไปหน้าประธาน เช่น Where is my pen?',tip:'หา “ประธาน” และ “เวลา” ก่อนเลือก am/is/are/was/were'},
    {re:/collocation|สำนวน|phrasal verb|take up|put on|make peace|make up|give .* notice|at work/,topic:'Collocation / Phrasal verb',pattern:'คำที่เจ้าของภาษาใช้คู่กันเป็นชุด',basic:'บางข้อไม่ได้วัด tense แต่ดูว่าคำใดใช้คู่กันตามธรรมชาติ เช่น make peace, take up painting, put on a coat, at work การจำเป็นวลีจะช่วยได้มากกว่าการแปลคำต่อคำ',tip:'จดทั้งวลีพร้อมความหมายและตัวอย่างสั้น ๆ เวลาเจออีกจะจำได้ทันที'}
  ];
  const found=guides.find(g=>g.re.test(source));
  if(found) return found;
  return {
    topic:'โครงสร้างและความหมายของประโยค',
    pattern:'อ่านคำก่อน–หลังช่องว่าง แล้วเลือกชนิดคำ/รูปกริยาให้เข้ากับประโยค',
    basic:'ข้อนี้ต้องใช้ทั้งความหมายและโครงสร้างประโยคประกอบกัน ให้สังเกตคำบอกเวลา คำเชื่อม คำบุพบท รูปกริยา และหน้าที่ของคำในตำแหน่งช่องว่าง',
    tip:'อย่ารีบดูแค่คำแปลของตัวเลือก ให้ลองใส่แต่ละตัวเลือกกลับเข้าไปในประโยคแล้วอ่านทั้งประโยค'
  };
}

function choiceDiagnostic(guide, selectedLabel, correctLabel){
  const topic=guide.topic;
  const choice=String(selectedLabel || '');
  if(topic.includes('make +')){
    if(/^to\s/i.test(choice)) return `ตัวเลือก “${choice}” มี to นำหน้า แต่หลัง make/made + object ห้ามใส่ to จึงต้องใช้กริยารูปพื้นฐาน “${correctLabel}”`;
    if(/ing$/i.test(choice)) return `ตัวเลือก “${choice}” เป็น V-ing แต่ตำแหน่งนี้หลัง make/made ต้องเป็น V1 จึงไม่ใช้ -ing`;
    return `รูปของ “${choice}” ไม่ใช่ V1 ที่โครงสร้าง make/made + object ต้องการ`;
  }
  if(topic.includes('Modal verb')) return `หลัง modal verb ต้องใช้ V1 ทันที ตัวเลือกที่เลือกไม่ตรงรูปนี้ ส่วน “${correctLabel}” อยู่ในรูปที่โครงสร้างต้องการ`;
  if(topic.includes('Present Perfect Continuous')) return `โจทย์เน้นการกระทำที่ต่อเนื่องจากอดีตถึงปัจจุบัน จึงต้องมี have/has + been + V-ing; “${correctLabel}” มีโครงสร้างครบ`;
  if(topic==='Present Perfect') return `คำบอกเวลา/ความหมายของโจทย์เชื่อมอดีตกับปัจจุบัน จึงต้องใช้ have/has + V3 ซึ่ง “${correctLabel}” ตรงรูปนี้มากกว่า`;
  if(topic==='Past Simple') return `โจทย์วางเหตุการณ์ไว้ในอดีตที่จบแล้ว จึงต้องใช้รูปอดีต หรือ did + V1 ตามชนิดประโยค; “${correctLabel}” ตรงกับเวลาของโจทย์`;
  if(topic.includes('Question word')) return `ให้ดูว่าคำตอบของบทสนทนากำลังบอก “อะไร/ที่ไหน/ใคร/อย่างไร/บ่อยแค่ไหน” ตัวเลือก “${choice}” ถามข้อมูลคนละชนิดกับคำตอบที่โจทย์ให้`;
  if(topic.includes('คำนามนับได้')) return `ต้องดูคำนามหลังช่องว่างว่านับได้หรือไม่ ตัวเลือก “${choice}” ใช้กับชนิดคำนามไม่ตรงกับโจทย์ ขณะที่ “${correctLabel}” ตรงกว่า`;
  if(topic.includes('Possessive') || topic.includes('ความเป็นเจ้าของ')) return `ต้องดูว่าหลังช่องว่างมีคำนามตามหรือไม่ ตัวเลือก “${choice}” เป็นรูปความเป็นเจ้าของที่ไม่เหมาะกับตำแหน่งนี้ ส่วน “${correctLabel}” ทำหน้าที่ได้ถูกต้อง`;
  if(topic.includes('Subject pronoun')) return `ตำแหน่งนี้ต้องแยกว่าเป็น “ผู้กระทำ” หรือ “ผู้รับการกระทำ” ตัวเลือก “${choice}” ใช้รูปสรรพนามไม่ตรงหน้าที่ในประโยค`;
  if(topic.includes('Gerund')) return `คำ/สำนวนก่อนช่องว่างบังคับ V-ing ดังนั้นตัวเลือกที่ไม่ใช่ V-ing จะใช้ไม่ได้ ส่วน “${correctLabel}” อยู่ในรูปที่ถูกต้อง`;
  if(topic.includes('Infinitive')) return `ตำแหน่งนี้ต้องใช้ to + V1 ตามคำหรือโครงสร้างข้างหน้า ตัวเลือก “${choice}” จึงไม่เข้ารูปที่กำหนด`;
  if(topic.includes('Conditional')) return `ประโยค if ต้องจับคู่ tense ของเงื่อนไขกับผลลัพธ์ ตัวเลือก “${choice}” ทำให้คู่ tense ไม่ตรงชนิด Conditional ของข้อนี้`;
  if(topic.includes('Question Tag')) return `question tag ต้องสลับบวก/ลบจากประโยคหลักและใช้ auxiliary ให้ตรง tense ตัวเลือก “${choice}” ไม่ตรงหนึ่งในสองเงื่อนไขนี้`;
  if(topic.includes('Verb to be')) return `ต้องเลือก am/is/are/was/were ให้ตรงทั้งประธานและเวลา ตัวเลือก “${choice}” ไม่ตรงกับรูปที่ประโยคต้องการ`;
  if(topic.includes('Preposition')) return `ข้อนี้เป็นการใช้คำเป็นชุด (collocation) จึงไม่สามารถสลับ preposition ตามคำแปลไทยตรง ๆ ได้ รูปมาตรฐานในข้อนี้คือ “${correctLabel}”`;
  return `เมื่อใส่ “${choice}” กลับเข้าไปในประโยค รูปคำหรือความสัมพันธ์กับคำรอบข้างไม่ตรงกับหลักที่โจทย์วัด ส่วน “${correctLabel}” ทำให้ทั้งโครงสร้างและความหมายสมบูรณ์กว่า`;
}

function sentenceStructureHtml(item, correctLabel, guide){
  if(typeof sentenceStructureAnalyzer==='undefined') return '';
  const analysis=sentenceStructureAnalyzer.analyze(item.data.q,correctLabel,guide);
  const tagName={S:'S',V:'V',O:'O',C:'C',QW:'QW',Aux:'Aux',V1:'V1',Inf:'Inf',Ger:'V-ing',PrepP:'Prep.P',Adv:'Adv',Conj:'Conj',N:'N',Det:'Det',Pron:'Pron',Num:'Num',Part:'Part',Frag:'Frag',Clause:'Clause',Other:'—'};
  const legend=[
    ['S','Subject','ประธาน'],['V','Verb','กริยา'],['O','Object','กรรม'],['C','Complement','ส่วนเติมเต็ม'],
    ['Aux','Auxiliary','กริยาช่วย'],['QW','Question word','คำแสดงคำถาม'],['Adj','Adjective','คำคุณศัพท์'],
    ['Adv','Adverb','คำวิเศษณ์'],['PrepP','Prep.P','วลีบุพบท']
  ].map(([tag,en,th])=>`<span class="syntax-legend-item role-${tag.toLowerCase()}"><b>${tagName[tag]||tag}</b>${en} · ${th}</span>`).join('');

  const clauses=analysis.clauses.map((clause,ci)=>{
    const segments=clause.segments.map(seg=>{
      const cls=String(seg.tag||'Other').toLowerCase();
      return `<span class="syntax-inline-piece role-${cls}" title="${escapeHtml(seg.role)} — ${escapeHtml(seg.thai)}"><span class="syntax-inline-tag">${escapeHtml(tagName[seg.tag]||seg.tag)}</span><span class="syntax-inline-word">${escapeHtml(seg.text)}</span></span>`;
    }).join('');
    const tokenPairs=clause.tokens.map(t=>({token:t,info:sentenceStructureAnalyzer.tokenInfo(t)})).filter(x=>x.info);
    const wordChips=tokenPairs.map(({token,info})=>{
      const role=token.role && analysis.legend[token.role] ? token.role : '';
      return `<span class="word-chip pos-${String(info.tag).toLowerCase()}" title="${escapeHtml(info.role)} · ${escapeHtml(info.thai)}${role?` · อยู่ใน ${role}`:''}"><b>${escapeHtml(info.tag)}</b><span>${escapeHtml(info.text)}</span></span>`;
    }).join('');
    const rows=tokenPairs.map(({token,info})=>{
      const phraseRole=token.role && analysis.legend[token.role] ? `${token.role} · ${analysis.legend[token.role].th}` : '—';
      return `<tr><td><strong>${escapeHtml(info.text)}</strong></td><td><span class="word-pos">${escapeHtml(info.tag)}</span> ${escapeHtml(info.thai)}</td><td>${escapeHtml(phraseRole)}</td><td>${escapeHtml(info.note)}</td></tr>`;
    }).join('');
    const hasS=clause.segments.some(x=>x.tag==='S'), hasV=clause.segments.some(x=>x.tag==='V'||x.tag==='Aux'||x.tag==='V1');
    const fragmentNote=(!hasS||!hasV)?`<div class="syntax-fragment-note"><strong>ข้อนี้ไม่ได้มี S + V ครบในส่วนคำตอบที่เห็น</strong> เพราะเป็นคำตอบสั้น วลี สำนวน หรือมีส่วนของประโยคถูกละไว้จากบริบท จึงไม่ควรฝืนเรียกคำที่ไม่มีหน้าที่นั้นว่า S/V</div>`:'';
    return `<div class="syntax-clause">
      ${analysis.clauses.length>1?`<div class="syntax-clause-label">ส่วนที่ ${ci+1}</div>`:''}
      <div class="syntax-map-label">หน้าที่ในประโยค — ป้ายอยู่ด้านบน สีอยู่ที่คำ</div>
      <div class="syntax-inline-sentence" aria-label="Sentence structure">${segments}</div>
      <div class="syntax-pattern"><span>โครงสร้างที่มองเห็นได้</span><code>${escapeHtml(clause.pattern||guide.pattern)}</code></div>
      ${fragmentNote}
      <div class="word-map-label">ชนิดคำทีละคำ — ป้ายอยู่ด้านบน เช่น N, V, Adj, Adv, Prep</div>
      <div class="word-chip-map">${wordChips}</div>
      <div class="syntax-role-vs-pos"><strong>ต่างกันอย่างไร?</strong> S/V/O/C คือ <b>หน้าที่ในประโยค</b> ส่วน N/V/Adj/Adv/Prep คือ <b>ชนิดของคำ</b> เช่น <em>sad</em> เป็น Adj แต่ทั้งวลี <em>This sad story</em> ทำหน้าที่ S.</div>
      <details class="word-breakdown" ${ci===0?'open':''}>
        <summary>ดูหน้าที่ทีละคำแบบตาราง</summary>
        <div class="word-table-wrap"><table class="word-table"><thead><tr><th>คำในโจทย์</th><th>ชนิดคำ</th><th>อยู่ในส่วนไหน</th><th>เข้าใจแบบง่าย</th></tr></thead><tbody>${rows}</tbody></table></div>
      </details>
    </div>`;
  }).join('');

  return `<div class="lesson-section syntax-analysis">
    <div class="syntax-heading"><div><h4>8. วิเคราะห์โครงสร้างประโยค S / V / O แบบชี้จากคำในโจทย์</h4><p>อ่านเป็นประโยคต่อเนื่อง โดยสีอยู่ที่ตัวคำและมีป้าย S / V / O / Adj / Adv ฯลฯ อยู่เหนือคำ เพื่อมองตำแหน่งได้ทันที</p></div><span class="syntax-learning-badge">Sentence Map</span></div>
    <div class="syntax-legend">${legend}</div>
    ${clauses}
    <div class="syntax-help"><strong>วิธีอ่าน:</strong> เริ่มหา <b>S</b> (ใคร/อะไร) → <b>V</b> (ทำอะไร/เป็นอะไร) → ดูว่ามี <b>O</b> (ทำต่อใคร/อะไร) หรือ <b>C</b> (บอกลักษณะ/สถานะ) หรือไม่ แล้วค่อยดูส่วนขยาย เช่น <b>Adj, Adv, Prep.P</b></div>
  </div>`;
}

function feedbackHtml(item,selected){
  const ok=selected===item.key;
  const correctIndex=letters.indexOf(item.key);
  const correctLabel=item.data.options[correctIndex] || '';
  const selectedIndex=selected ? letters.indexOf(selected) : -1;
  const selectedLabel=selectedIndex>=0 ? (item.data.options[selectedIndex] || '') : '';
  const explanation=explanations?.[item.set]?.[item.q-1] || 'เฉลยอ้างอิงจากไฟล์ KEY ของชุดแบบฝึกหัดนี้';
  const guide=lessonGuide(explanation,item.data.q,correctLabel);
  const correctInfo=learningData?.[item.set]?.[item.q-1]?.options?.[item.key] || {};
  const selectedInfo=selected ? (learningData?.[item.set]?.[item.q-1]?.options?.[selected] || {}) : {};
  const completedSentence=correctInfo.filled || fillCorrectAnswer(item.data.q,correctLabel);
  const correctSentenceMarkup=item.data.q.includes('__')?fillAnswerMarkup(item.data.q,correctLabel,'correct-answer'):highlightAnswerInText(completedSentence,correctLabel,'correct-answer');
  const selectedSentenceMarkup=selected?(item.data.q.includes('__')?fillAnswerMarkup(item.data.q,selectedLabel,ok?'correct-answer':'wrong-answer'):highlightAnswerInText(selectedInfo.filled||fillCorrectAnswer(item.data.q,selectedLabel),selectedLabel,ok?'correct-answer':'wrong-answer')):'';
  const resultText=!selected?'ไม่ได้ตอบข้อนี้':ok?'ตอบถูก':'ตอบผิด';
  const resultClass=!selected?'unanswered':ok?'good':'bad';
  return `<div class="feedback lesson-feedback ${resultClass}">
    <div class="feedback-result-row"><span class="result-status ${resultClass}">${resultText}</span><div class="answer-compare"><div><span>คำตอบของคุณ</span><strong class="${selected?(ok?'answer-text-correct':'answer-text-wrong'):''}">${selected ? `${selected}. ${escapeHtml(selectedLabel)}` : '— ไม่ได้ตอบ —'}</strong>${selected?`<small>${escapeHtml(selectedInfo.meaning||'')}</small>`:''}</div><div><span>เฉลยที่ถูกต้อง</span><strong class="answer-text-correct">${item.key}. ${escapeHtml(correctLabel)}</strong><small>${escapeHtml(correctInfo.meaning||'')}</small></div></div></div>
    <div class="lesson-section question-focus"><h4>1. ดูโจทย์และประโยคหลังเติมคำตอบที่ถูก</h4><p class="lesson-question">${escapeHtml(item.data.q)}</p><div class="correct-translation"><span class="label">ประโยคที่ถูกต้อง + คำแปล</span><div class="en">${correctSentenceMarkup}</div><div class="th translation-correct">${escapeHtml(correctInfo.thai||'')}</div></div></div>
    <div class="lesson-section"><h4>2. คำตอบที่ถูกหมายถึงอะไร และทำไมถึงถูก</h4><p><strong>${item.key}. ${escapeHtml(correctLabel)}</strong> — ${escapeHtml(correctInfo.meaning||'ดูความหมายจากประโยค')}</p><p style="margin-top:8px!important">${escapeHtml(explanation)}</p><p class="beginner-note">สำหรับผู้เริ่มต้น: อย่าเลือกจากคำแปลอย่างเดียว ให้ดูด้วยว่าช่องว่างต้องการ “คำนาม / กริยา / adjective / preposition” แบบไหน และมีกฎอะไรจากคำก่อนหรือหลังช่องว่างบังคับอยู่หรือไม่</p></div>
    <div class="lesson-grid"><div class="lesson-section"><h4>3. หลักที่ข้อนี้กำลังทดสอบ</h4><strong class="lesson-topic">${escapeHtml(guide.topic)}</strong><p>${escapeHtml(guide.basic)}</p></div><div class="lesson-section pattern-box"><h4>4. รูปประโยคที่ควรจำ</h4><code>${escapeHtml(guide.pattern)}</code><p><strong>วิธีสังเกต:</strong> ${escapeHtml(guide.tip)}</p></div></div>
    ${selected && !ok ? `<div class="lesson-section your-mistake"><h4>5. คำตอบที่คุณเลือกแปลว่าอะไร และผิดตรงไหน</h4><p>คุณเลือก <strong>${selected}. ${escapeHtml(selectedLabel)}</strong> — ความหมายโดยประมาณ: <strong>${escapeHtml(selectedInfo.meaning||'ดูจากบริบท')}</strong></p><div class="option-sentence" style="margin-top:9px"><div class="en"><strong>เมื่อเอาไปเติม:</strong> ${selectedSentenceMarkup}</div><div class="th translation-wrong"><strong>จะได้ความหมายประมาณ:</strong> ${escapeHtml(selectedInfo.thai||'—')}</div></div><p style="margin-top:9px!important">${escapeHtml(choiceDiagnostic(guide,selectedLabel,correctLabel))}</p><p style="margin-top:8px!important">จึงต้องเปลี่ยนเป็น <strong>${item.key}. ${escapeHtml(correctLabel)}</strong> ซึ่งทำให้ทั้งรูปประโยคและความหมายตรงกับโจทย์</p></div>` : `<div class="lesson-section success-review"><h4>5. แม้ตอบถูกก็ต้องจำเหตุผล</h4><p>คุณเลือก <strong>${selected ? `${selected}. ${escapeHtml(selectedLabel)}` : 'ไม่ได้ตอบ'}</strong>${selected?' และตรงกับเฉลย':''} ให้จำหลักและ “คำสัญญาณ” ของข้อนี้ไว้ เพราะข้อสอบจริงอาจเปลี่ยนคำศัพท์แต่ใช้รูปประโยคเดียวกัน</p></div>`}
    ${optionAnalysisHtml(item,selected,guide,explanation)}
    <div class="memory-tip"><strong>7. ทริกจำสำหรับข้อนี้</strong>${escapeHtml(guide.tip)} ลองอ่านประโยคที่ถูกออกเสียง 2–3 รอบ และจำเป็นวลีทั้งก้อน เช่นคำที่อยู่ก่อน–หลังช่องว่าง จะจำได้ง่ายกว่าท่องเฉพาะตัวเลือก</div>
    ${sentenceStructureHtml(item,correctLabel,guide)}
  </div>`;
}

function chooseAnswer(displayNo,choice){
  const answers=currentAnswers();
  answers[displayNo]=choice;
  if(state.mode==='random') state.randomAttempt.checked=false;
  else state.checked[state.currentSet]=false;
  persist();
  renderQuiz();
  document.querySelectorAll('.question-card')[displayNo-1]?.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function checkAnswers(){
  if(state.mode==='random'){
    state.randomAttempt.checked=true;
    const score=scoreCurrent();
    if(!state.bestRandom || score>state.bestRandom.score) state.bestRandom={score,date:Date.now()};
  }else{
    state.checked[state.currentSet]=true;
  }
  persist();
  renderQuiz();
  $('#scoreChip').scrollIntoView({behavior:'smooth',block:'center'});
}

function resetAttempt(){
  if(state.mode==='random'){
    state.randomAttempt={items:state.randomAttempt.items,answers:{},checked:false,createdAt:state.randomAttempt.createdAt};
  }else{
    state.answers[state.currentSet]={};
    state.checked[state.currentSet]=false;
  }
  persist();
  renderQuiz();
  window.scrollTo({top:0,behavior:'smooth'});
}

function summaryMessage(percent,unanswered){
  let title='ทบทวนอีกนิดแล้วลองใหม่ได้';
  let body='ดูคำอธิบายใต้ข้อที่ผิด แล้วแก้คำตอบก่อนกดตรวจใหม่';
  if(percent>=90){title='ทำได้ดีมาก';body='ลองข้ามไป Set อื่น หรือสุ่ม 30 ข้อเพื่อทดสอบแบบผสม';}
  else if(percent>=70){title='ผ่านระดับฝึกได้ดี';body='ทบทวนข้อที่ผิดแล้วลองตรวจใหม่เพื่อเก็บจุดที่ยังสับสน';}
  return `<strong>${title}</strong><p>${body}${unanswered?` และยังมี ${unanswered} ข้อที่ไม่ได้ตอบ`:''}</p>`;
}

function extendedCategoryCount(category){
  const collection=extendedCollections?.[category];
  if(!collection) return 0;
  return collection.sets.reduce((sum,set)=>sum+(set.items?.length||0),0);
}

function renderCategoryGrid(){
  const grid=$('#categoryGrid');
  if(!grid || typeof extendedCollections==='undefined') return;
  const cards=[
    {id:'a1a2',mark:'A1',title:'A1–A2',desc:'Grammar 20 Sets พร้อมเฉลยละเอียด บทเรียน และคำศัพท์',count:300},
    {id:'b1b2',mark:'B1',title:'B1–B2',desc:'9 Sets จากแบบฝึก B1–B2 พร้อม KEY ใน Drive',count:extendedCategoryCount('b1b2')},
    {id:'reading',mark:'R',title:'Reading',desc:'Reading Test 1–3 · Form · Meaning · Fill in the blanks',count:extendedCategoryCount('reading')},
    {id:'listening',mark:'L',title:'Listening',desc:'Listening Test 1–2 พร้อมไฟล์เสียงต้นฉบับ',count:extendedCategoryCount('listening')},
    {id:'levelup',mark:'UP',title:'Level Up',desc:'Reading Practice ฉบับ Level Up พร้อม KEY',count:extendedCategoryCount('levelup')}
  ];
  grid.innerHTML=cards.map(card=>`<button type="button" class="category-card ${card.id==='a1a2'?'active':''}" data-category="${card.id}">
    <span class="category-mark">${card.mark}</span><span class="category-card-copy"><strong>${escapeHtml(card.title)}</strong><small>${escapeHtml(card.desc)}</small></span><span class="category-count">${card.count} ข้อ</span>
  </button>`).join('');
  grid.querySelectorAll('[data-category]').forEach(btn=>btn.addEventListener('click',()=>{
    const category=btn.dataset.category;
    if(category==='a1a2') document.querySelector('.a1-section-label')?.scrollIntoView({behavior:'smooth',block:'start'});
    else showCollection(category);
  }));
}

function sourceAttemptKey(category,setId){ return `${category}::${setId}`; }
function sourceSetById(category,setId){ return extendedCollections?.[category]?.sets?.find(set=>set.id===setId) || null; }
function sourceSetAnswers(category,setId){
  const key=sourceAttemptKey(category,setId);
  if(!state.sourceAnswers[key]) state.sourceAnswers[key]={};
  return state.sourceAnswers[key];
}
function sourceItemAnswerable(item){ return item.kind!=='source-note'; }
function sourceItemScorable(item){ return item.key!==null && item.key!==undefined && String(item.key).length>0; }
function normalizeSourceAnswer(value){ return String(value??'').trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' '); }
function sourceAnswerCorrect(item,value){
  if(!sourceItemScorable(item)) return null;
  if(item.kind==='mcq' || (Array.isArray(item.options)&&item.options.length)) return value===item.key;
  return normalizeSourceAnswer(value)===normalizeSourceAnswer(item.key);
}
function sourceScore(category,setId){
  const set=sourceSetById(category,setId); if(!set) return {score:0,total:0};
  const answers=sourceSetAnswers(category,setId); let score=0,total=0;
  set.items.forEach(item=>{if(sourceItemScorable(item)){total++; if(sourceAnswerCorrect(item,answers[item.sourceNo])) score++;}});
  return {score,total};
}
function sourceAnsweredCount(category,setId){
  const set=sourceSetById(category,setId); if(!set) return 0;
  const answers=sourceSetAnswers(category,setId);
  return set.items.filter(sourceItemAnswerable).filter(item=>String(answers[item.sourceNo]??'').trim()!=='').length;
}
function sourceAnswerableCount(set){ return set.items.filter(sourceItemAnswerable).length; }
function sourceStatusLabel(status){
  if(status==='official') return 'มี KEY ทางการ';
  if(status==='transcript-derived') return 'เฉลยจาก transcript';
  if(status==='mixed') return 'เฉลยหลายสถานะ';
  return 'ไม่มี KEY ทางการ';
}

function showCollection(category){
  const collection=extendedCollections?.[category]; if(!collection) return;
  state.mode='source-collection'; state.sourceCategory=category; persist();
  $('#homeView').hidden=true; $('#quizView').hidden=true; $('#vocabView').hidden=true; $('#lessonView').hidden=true; $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true; $('#collectionView').hidden=false;
  $('#collectionMark').textContent=collection.accent||'CE';
  $('#collectionTitle').textContent=collection.title;
  $('#collectionDescription').textContent=collection.description;
  const total=extendedCategoryCount(category);
  $('#collectionCount').textContent=`${total.toLocaleString()} ข้อ/กิจกรรม`;
  const missing=collection.sets.filter(s=>s.keyStatus==='missing').length;
  const derived=collection.sets.filter(s=>s.keyStatus==='transcript-derived').length;
  $('#collectionNotice').innerHTML=missing||derived
    ? `<strong>สถานะเฉลย:</strong> ชุดที่มี KEY จะตรวจคะแนนตามเอกสารต้นฉบับ${missing?` · ${missing} ชุดไม่มี KEY ในโฟลเดอร์ จึงเก็บคำตอบแต่ไม่ตัดสินถูกผิด`:''}${derived?` · ${derived} ชุดใช้เฉลยที่อนุมานจาก transcript และติดป้ายแยกชัดเจน`:''}`
    : '<strong>เฉลย:</strong> ชุดในหมวดนี้อ้างอิง KEY ที่พบใน Google Drive';
  renderCollectionGrid(category);
  window.scrollTo({top:0,behavior:'smooth'});
}

function renderCollectionGrid(category){
  const collection=extendedCollections[category]; const grid=$('#collectionGrid');
  grid.innerHTML=collection.sets.map((set,index)=>{
    const answers=sourceSetAnswers(category,set.id); const answered=sourceAnsweredCount(category,set.id); const total=sourceAnswerableCount(set);
    const checked=!!state.sourceChecked[sourceAttemptKey(category,set.id)]; const score=sourceScore(category,set.id);
    const progress=total?Math.round(answered/total*100):0;
    const result=checked && score.total?`คะแนน ${score.score}/${score.total}`:sourceStatusLabel(set.keyStatus);
    return `<button type="button" class="collection-card ${checked?'checked':''}" data-source-set="${escapeHtml(set.id)}">
      <div class="collection-card-top"><span class="collection-index">${index+1}</span><span class="key-status ${set.keyStatus||'missing'}">${sourceStatusLabel(set.keyStatus)}</span></div>
      <strong>${escapeHtml(set.title)}</strong><p>${escapeHtml(set.subtitle||'')}</p>
      <div class="mini-progress"><span style="width:${progress}%"></span></div><div class="mini-meta"><span>ตอบ ${answered}/${total}</span><span>${result}</span></div>
    </button>`;
  }).join('');
  grid.querySelectorAll('[data-source-set]').forEach(btn=>btn.addEventListener('click',()=>openSourceSet(category,btn.dataset.sourceSet)));
  const resources=collection.resources||[];
  $('#collectionResources').innerHTML=resources.length?`<div class="section-head"><div><h2>แหล่งฝึกเพิ่มเติมจากเอกสาร</h2><p>ลิงก์ที่ปรากฏอยู่ในไฟล์ต้นฉบับ</p></div></div>${resources.map(r=>`<a class="resource-card" href="${escapeHtml(r.url)}" target="_blank" rel="noopener"><strong>${escapeHtml(r.title)}</strong><span>${escapeHtml(r.description)}</span><b>เปิดแหล่งต้นฉบับ ↗</b></a>`).join('')}`:'';
}

function openSourceSet(category,setId){
  const set=sourceSetById(category,setId); if(!set) return;
  state.mode='source-quiz'; state.sourceCategory=category; state.sourceSetId=setId; state.lastActivity={kind:'source-set',category,setId}; persist();
  $('#homeView').hidden=true; $('#quizView').hidden=true; $('#vocabView').hidden=true; $('#lessonView').hidden=true; $('#collectionView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true; $('#sourceQuizView').hidden=false;
  renderSourceQuiz(); window.scrollTo({top:0,behavior:'smooth'});
}

function sourceKeyNotice(set){
  if(set.keyStatus==='official') return '<strong>Official KEY:</strong> การตรวจถูก/ผิดใช้เฉลยที่พบในเอกสาร KEY ของ Google Drive';
  if(set.keyStatus==='transcript-derived') return '<strong>ไม่มี KEY ทางการในโฟลเดอร์:</strong> คะแนนของชุดนี้อนุมานจาก transcript ที่อยู่ในเอกสารต้นฉบับ จึงแยกสถานะออกจาก Official KEY';
  if(set.keyStatus==='mixed') return '<strong>ชุดสุ่มหลายแหล่ง:</strong> ข้อที่มี KEY จะตรวจคะแนน ข้อที่ไม่มี KEY จะบันทึกคำตอบแต่ไม่เดาถูก/ผิด';
  return '<strong>ไม่มี KEY ทางการในโฟลเดอร์:</strong> คุณยังทำและบันทึกคำตอบได้ แต่ระบบจะไม่เดาเฉลยหรือแสดงว่าถูก/ผิด';
}

function sourcePassageHtml(passage){
  return `<aside class="source-passage"><span>PASSAGE · ข้อ ${passage.from}${passage.to!==passage.from?`–${passage.to}`:''}</span><h3>${escapeHtml(passage.title||'Reading passage')}</h3><p>${escapeHtml(passage.text||'')}</p></aside>`;
}
function sourceAudioHtml(group){
  return `<aside class="source-audio"><div><span>LISTENING AUDIO</span><strong>${escapeHtml(group.title||'Audio')}</strong></div><audio controls preload="none" src="${escapeHtml(group.audio)}">Your browser does not support audio.</audio></aside>`;
}
function sourceCorrectDisplay(item){
  if(!sourceItemScorable(item)) return '—';
  if(item.kind==='mcq' || (Array.isArray(item.options)&&item.options.length)){
    const idx=letters.indexOf(item.key); return `${item.key}. ${item.options[idx]??''}`;
  }
  return String(item.key);
}
function sourceFeedbackHtml(item,selected,set){
  const scorable=sourceItemScorable(item);
  if(!scorable) return `<div class="source-feedback neutral"><strong>บันทึกคำตอบแล้ว</strong><p>เอกสารที่ได้รับไม่มี KEY ทางการสำหรับข้อนี้ ระบบจึงไม่เติมหรือเดาเฉลยแทนต้นฉบับ</p>${selected?`<p>คำตอบของคุณ: <b>${escapeHtml(selected)}</b></p>`:''}</div>`;
  const correct=sourceAnswerCorrect(item,selected); const sourceText=item.answerSource==='transcript-derived'?'อนุมานจาก transcript ในต้นฉบับ':'อ้างอิง Official KEY';
  const correctLabel=sourceCorrectDisplay(item);
  let learning='';
  if(item.kind==='mcq' || (Array.isArray(item.options)&&item.options.length)){
    const idx=letters.indexOf(item.key), label=item.options[idx]||'';
    const guide=lessonGuide('',item.q,label);
    learning=`<details class="source-learning"><summary>ดูแนวคิดช่วยเรียน</summary><div><strong>${escapeHtml(guide.topic)}</strong><code>${escapeHtml(guide.pattern)}</code><p>${escapeHtml(guide.basic)}</p><p><b>ทริก:</b> ${escapeHtml(guide.tip)}</p></div></details>`;
  }
  return `<div class="source-feedback ${correct?'good':'bad'}"><strong>${correct?'ตอบถูก':'ตอบผิด'}</strong><p>คำตอบของคุณ: <b>${escapeHtml(selected||'—')}</b></p><p>เฉลย: <b class="answer-text-correct">${escapeHtml(correctLabel)}</b></p><small>${sourceText}</small>${learning}</div>`;
}

function renderSourceQuiz(){
  const category=state.sourceCategory, set=sourceSetById(category,state.sourceSetId); if(!set) return showCollection(category);
  const key=sourceAttemptKey(category,set.id), answers=sourceSetAnswers(category,set.id), checked=!!state.sourceChecked[key];
  const answerable=sourceAnswerableCount(set), answered=sourceAnsweredCount(category,set.id), progress=answerable?Math.round(answered/answerable*100):0;
  const score=sourceScore(category,set.id);
  $('#sourceQuizTitle').textContent=set.title; $('#sourceQuizMeta').textContent=`ตอบแล้ว ${answered}/${answerable} · ${set.subtitle||''}`;
  $('#sourceProgressBar').style.width=`${progress}%`;
  $('#sourceKeyBadge').textContent=sourceStatusLabel(set.keyStatus); $('#sourceKeyBadge').className=`mode-badge source-${set.keyStatus||'missing'}`;
  $('#sourceScoreChip').className=`score-chip ${checked&&score.total?'done':'pending'}`;
  $('#sourceScoreChip').textContent=checked?(score.total?`${score.score}/${score.total}`:'บันทึกแล้ว'):'ยังไม่ตรวจ';
  $('#sourceToggleDetail').hidden=!checked;
  $('#sourceToggleDetail').textContent=state.detailMode?'ซ่อนรายละเอียด':'แสดงแบบละเอียด';
  $('#sourceQuizView').classList.toggle('compact-explanations',checked && !state.detailMode);
  $('#sourceQuizNotice').innerHTML=sourceKeyNotice(set);
  const passageByFrom=new Map((set.passages||[]).map(p=>[p.from,p]));
  const audioByFrom=new Map((set.audioGroups||[]).map(a=>[a.from,a]));
  const list=$('#sourceQuizList');
  list.innerHTML=set.items.map((item,index)=>{
    const selected=answers[item.sourceNo]??''; const scorable=sourceItemScorable(item); const correctness=checked?sourceAnswerCorrect(item,selected):null;
    let className='question-card source-question-card';
    if(checked&&scorable) className+=correctness?' is-correct':' is-wrong';
    let control='';
    if(item.kind==='mcq' || (Array.isArray(item.options)&&item.options.length)){
      control=`<div class="answer-options">${item.options.map((label,i)=>{const letter=letters[i];let cls='answer-option';if(selected===letter)cls+=' selected';if(checked&&scorable&&letter===item.key)cls+=' correct';if(checked&&scorable&&selected===letter&&letter!==item.key)cls+=' wrong';return `<button type="button" class="${cls}" data-source-no="${item.sourceNo}" data-source-choice="${letter}" aria-pressed="${selected===letter}"><span class="answer-letter">${letter}</span><span class="answer-text">${escapeHtml(label||'—')}</span></button>`}).join('')}</div>`;
    }else if(item.kind==='text'){
      control=`<label class="source-text-answer"><span>คำตอบของคุณ</span><input type="text" data-source-input="${item.sourceNo}" value="${escapeHtml(selected)}" autocomplete="off" placeholder="พิมพ์คำที่เติมในช่องว่าง"></label>`;
    }else control='<div class="source-note-box">กิจกรรมนี้เก็บไว้ตามต้นฉบับ แต่ไม่มีข้อมูลเพียงพอสำหรับตรวจอัตโนมัติ</div>';
    return `${passageByFrom.has(item.sourceNo)?sourcePassageHtml(passageByFrom.get(item.sourceNo)):''}${audioByFrom.has(item.sourceNo)?sourceAudioHtml(audioByFrom.get(item.sourceNo)):''}<article class="${className}"><div class="question-top"><span class="question-no">${item.sourceNo}</span>${item.answerSource==='transcript-derived'?'<span class="origin">Transcript-derived key</span>':item.answerSource==='official-key'?'<span class="origin">Official KEY</span>':'<span class="origin">No official KEY</span>'}</div><p class="question-text">${escapeHtml(item.q)}</p>${control}${checked?sourceFeedbackHtml(item,selected,set):''}</article>`;
  }).join('');
  list.querySelectorAll('[data-source-choice]').forEach(btn=>btn.addEventListener('click',()=>chooseSourceAnswer(Number(btn.dataset.sourceNo),btn.dataset.sourceChoice)));
  list.querySelectorAll('[data-source-input]').forEach(input=>input.addEventListener('input',()=>inputSourceAnswer(Number(input.dataset.sourceInput),input.value)));
  $('#sourceDockTitle').textContent=set.keyStatus==='missing'?'ตอบเพื่อเก็บไว้ทบทวน':'ทำเสร็จแล้วค่อยตรวจพร้อมกัน';
  $('#sourceDockMeta').textContent=`ตอบแล้ว ${answered}/${answerable} · ${sourceStatusLabel(set.keyStatus)}`;
  $('#sourceCheck').textContent=checked?(score.total?'ตรวจใหม่':'บันทึกแล้ว'):(score.total?'ตรวจคำตอบ':'บันทึกคำตอบ');
  $('#sourceResultPanel').hidden=!checked;
  if(checked){
    if(score.total){const pct=Math.round(score.score/score.total*100);$('#sourceResultPanel').innerHTML=`<div class="source-result-score"><span>คะแนน</span><strong>${score.score}/${score.total}</strong><b>${pct}%</b></div><div><strong>${sourceStatusLabel(set.keyStatus)}</strong><p>${set.keyStatus==='transcript-derived'?'คะแนนนี้มาจากคำตอบที่สรุปจาก transcript ไม่ใช่ KEY ทางการ':'ตรวจตาม KEY ของชุดเอกสาร'}</p></div>`}
    else $('#sourceResultPanel').innerHTML='<div><strong>บันทึกคำตอบแล้ว</strong><p>ชุดนี้ไม่มี KEY ทางการใน Google Drive จึงไม่แสดงคะแนนถูก/ผิด</p></div>';
  }
}

function chooseSourceAnswer(no,choice){
  const key=sourceAttemptKey(state.sourceCategory,state.sourceSetId); const answers=sourceSetAnswers(state.sourceCategory,state.sourceSetId); answers[no]=choice;
  if(state.sourceChecked[key]) state.sourceChecked[key]=false; persist(); renderSourceQuiz();
  document.querySelector(`[data-source-no="${no}"]`)?.closest('.question-card')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function inputSourceAnswer(no,value){
  const key=sourceAttemptKey(state.sourceCategory,state.sourceSetId); const answers=sourceSetAnswers(state.sourceCategory,state.sourceSetId); answers[no]=value;
  if(state.sourceChecked[key]){state.sourceChecked[key]=false;persist();renderSourceQuiz();return;}
  persist(); const set=sourceSetById(state.sourceCategory,state.sourceSetId), answered=sourceAnsweredCount(state.sourceCategory,state.sourceSetId), total=sourceAnswerableCount(set);
  $('#sourceQuizMeta').textContent=`ตอบแล้ว ${answered}/${total} · ${set.subtitle||''}`; $('#sourceProgressBar').style.width=`${total?Math.round(answered/total*100):0}%`; $('#sourceDockMeta').textContent=`ตอบแล้ว ${answered}/${total} · ${sourceStatusLabel(set.keyStatus)}`;
}
function checkSourceAnswers(){
  const key=sourceAttemptKey(state.sourceCategory,state.sourceSetId); state.sourceChecked[key]=true; persist(); renderSourceQuiz(); $('#sourceScoreChip').scrollIntoView({behavior:'smooth',block:'center'});
}
function resetSourceAttempt(){
  const key=sourceAttemptKey(state.sourceCategory,state.sourceSetId); state.sourceAnswers[key]={}; state.sourceChecked[key]=false; persist(); renderSourceQuiz(); window.scrollTo({top:0,behavior:'smooth'});
}


const LESSON_SEQUENCE = [
  'Verb to be',
  'Subject pronoun กับ Object pronoun',
  'คำแสดงความเป็นเจ้าของ',
  'การใช้ a / an / the',
  'คำนามนับได้และนับไม่ได้',
  'ลำดับคำคุณศัพท์',
  'Linking verb + adjective',
  'Preposition และสำนวนที่ต้องจำเป็นชุด',
  'Do / Does / Did ในประโยคคำถาม',
  'Question word',
  'Question Tag',
  'Past Simple',
  'Continuous tense',
  'Present Perfect',
  'Present Perfect Continuous',
  'Passive Voice',
  'Modal verb + V1',
  'Infinitive (to + V1)',
  'Gerund (V-ing)',
  'โครงสร้าง make + คน/สิ่ง + กริยารูปพื้นฐาน',
  'การเปรียบเทียบ Comparative',
  'การเปรียบเทียบขั้นสูงสุด Superlative',
  'Conditional (ประโยคเงื่อนไข)',
  'Subjunctive หลังคำแนะนำ/ยืนยัน/ความต้องการ',
  'Collocation / Phrasal verb',
  'โครงสร้างและความหมายของประโยค'
];

// Supplemental lesson questions are intentionally kept for later, but disabled for now.
const LESSON_EXTRA_ENABLED = false;

const EXTRA_LESSON_QUESTIONS = {
  'Verb to be': [
    {q:'They ___ at home yesterday.',options:['was','were','are','be'],key:'B',explanation:'ประธาน they ในอดีตใช้ were'},
    {q:'I ___ ready now.',options:['am','is','are','were'],key:'A',explanation:'ประธาน I ในปัจจุบันใช้ am'},
    {q:'She ___ my teacher last year.',options:['were','are','was','be'],key:'C',explanation:'ประธาน she ในอดีตใช้ was'},
    {q:'___ you tired?',options:['Is','Am','Are','Be'],key:'C',explanation:'ประธาน you ใช้ are และในคำถามนำ are ไว้หน้าประธาน'},
    {q:'The books ___ on the desk.',options:['is','are','am','was'],key:'B',explanation:'ประธานพหูพจน์ books ในปัจจุบันใช้ are'}
  ],
  'ลำดับคำคุณศัพท์': [
    {q:'She has ___ kittens.',options:['two small black','black two small','small black two','two black small'],key:'A',explanation:'ในบทนี้จำลำดับ จำนวน → ขนาด → สี → คำนาม'},
    {q:'He bought ___ boxes.',options:['large three red','three red large','three large red','red three large'],key:'C',explanation:'จำนวนมาก่อนขนาด และขนาดมาก่อนสี'},
    {q:'We saw ___ cats.',options:['white two small','two small white','small two white','two white small'],key:'B',explanation:'two → small → white → cats'},
    {q:'They carried ___ balloons.',options:['four big blue','blue four big','big blue four','four blue big'],key:'A',explanation:'จำนวน → ขนาด → สี'},
    {q:'I need ___ bags.',options:['small three green','green small three','three small green','three green small'],key:'C',explanation:'three → small → green → bags'}
  ],
  'โครงสร้าง make + คน/สิ่ง + กริยารูปพื้นฐาน': [
    {q:'She made me ___ the report.',options:['finish','to finish','finished','finishing'],key:'A',explanation:'make + object + V1 ใช้กริยารูปพื้นฐานโดยไม่ใส่ to'},
    {q:'The joke made us ___.',options:['to laugh','laughed','laugh','laughing'],key:'C',explanation:'made + us + V1 → laugh'},
    {q:'The rain made them ___ inside.',options:['stay','to stay','stayed','staying'],key:'A',explanation:'made + them + V1 → stay'},
    {q:'His story made her ___.',options:['smiled','smile','to smile','smiling'],key:'B',explanation:'made + her + V1 → smile'},
    {q:'The teacher made the students ___ again.',options:['to read','reading','read','reads'],key:'C',explanation:'made + object + V1 → read'}
  ],
  'Present Perfect Continuous': [
    {q:'I ___ English for two hours.',options:['have been studying','have studied','studied','am studying'],key:'A',explanation:'การกระทำต่อเนื่องจากอดีตถึงปัจจุบันใช้ have been + V-ing'},
    {q:'She ___ here since morning.',options:['waited','has been waiting','is waiting','has waited'],key:'B',explanation:'since + จุดเริ่ม และเน้นความต่อเนื่อง → has been waiting'},
    {q:'They ___ all day.',options:['have been working','worked','are work','have work'],key:'A',explanation:'all day และยังต่อเนื่อง → have been working'},
    {q:'He ___ for the bus for thirty minutes.',options:['waits','has been waiting','waited','is waited'],key:'B',explanation:'for + ระยะเวลา และยังดำเนินอยู่ → has been waiting'},
    {q:'We ___ this project since Monday.',options:['have been doing','did','do','are done'],key:'A',explanation:'since Monday และต่อเนื่องถึงตอนนี้ → have been doing'}
  ],
  'การเปรียบเทียบขั้นสูงสุด Superlative': [
    {q:'This is ___ building in town.',options:['the tallest','taller','most tall','tallest'],key:'A',explanation:'ขั้นสูงสุดใช้ the + adjective-est'},
    {q:'It is ___ book in the class.',options:['more interesting','the most interesting','most interesting','the more interesting'],key:'B',explanation:'adjective ยาวใช้ the most + adjective'},
    {q:'That is ___ box here.',options:['the biggest','bigger','biggest than','more big'],key:'A',explanation:'ขั้นสูงสุดของ big คือ the biggest'},
    {q:'She is ___ student in the group.',options:['the youngest','younger','youngest than','the more young'],key:'A',explanation:'พูดถึงคนที่อายุน้อยที่สุดในกลุ่มใช้ the youngest'}
  ],
  'Conditional (ประโยคเงื่อนไข)': [
    {q:'If it rains, we ___ at home.',options:['will stay','stayed','would stay','stay yesterday'],key:'A',explanation:'First Conditional: if + present, will + V1'},
    {q:'If I had more time, I ___ more.',options:['will travel','would travel','travelled yesterday','have travelled'],key:'B',explanation:'Second Conditional: if + V2, would + V1'},
    {q:'If she had studied, she ___ the test.',options:['would pass','will pass','would have passed','passed'],key:'C',explanation:'Third Conditional: if + had + V3, would have + V3'},
    {q:'If you heat ice, it ___.',options:['melts','will melted','would melt yesterday','melted'],key:'A',explanation:'ความจริงทั่วไปใช้ if + present, present'},
    {q:'If he calls tonight, I ___ him the news.',options:['told','will tell','would told','have tell'],key:'B',explanation:'เงื่อนไขอนาคตที่เป็นไปได้ใช้ will + V1 ในผลลัพธ์'}
  ],
  'Do / Does / Did ในประโยคคำถาม': [
    {q:'Does he ___ coffee?',options:['like','likes','liked','liking'],key:'A',explanation:'หลัง does กริยาหลักกลับเป็น V1'},
    {q:'Did they ___ to school yesterday?',options:['went','go','going','goes'],key:'B',explanation:'หลัง did ใช้ V1 เพราะความเป็นอดีตอยู่ที่ did แล้ว'},
    {q:'Do you ___ English?',options:['speaks','spoke','speak','speaking'],key:'C',explanation:'หลัง do ใช้กริยารูปพื้นฐาน'},
    {q:'Does Anna ___ here?',options:['works','work','worked','working'],key:'B',explanation:'หลัง does ใช้ V1 → work'}
  ],
  'Continuous tense': [
    {q:'Look! The child ___.',options:['runs','is running','ran','has run'],key:'B',explanation:'Look! บอกเหตุการณ์ที่กำลังเกิด ใช้ be + V-ing'},
    {q:'They ___ TV right now.',options:['are watching','watch','watched','have watched'],key:'A',explanation:'right now → Present Continuous'},
    {q:'At 8 p.m. yesterday, I ___ dinner.',options:['cook','was cooking','cooked now','have cooked'],key:'B',explanation:'กำลังเกิด ณ จุดหนึ่งในอดีตใช้ was/were + V-ing'}
  ],
  'Subjunctive หลังคำแนะนำ/ยืนยัน/ความต้องการ': [
    {q:'The teacher suggested that he ___ more.',options:['studies','study','studied','to study'],key:'B',explanation:'หลัง suggest that ใช้ V1 ในประโยคย่อย'},
    {q:'I insist that she ___ on time.',options:['is','be','was','to be'],key:'B',explanation:'subjunctive ของ be ใช้ be'},
    {q:'They recommended that Tom ___ early.',options:['leave','leaves','left','leaving'],key:'A',explanation:'recommend that + subject + V1'}
  ],
  'Infinitive (to + V1)': [
    {q:'I want ___ a new bag.',options:['buy','to buy','buying','bought'],key:'B',explanation:'want ตามด้วย to + V1'},
    {q:'She decided ___ early.',options:['leave','leaving','to leave','left'],key:'C',explanation:'decide ตามด้วย to + V1'}
  ],
  'Collocation / Phrasal verb': [
    {q:'He is very proud ___ his son.',options:['at','of','on','for'],key:'B',explanation:'ใช้วลี proud of เป็นชุด'},
    {q:'Please ___ your coat before you go outside.',options:['put on','make up','take up','give up'],key:'A',explanation:'put on = สวมใส่'}
  ],
  'การใช้ a / an / the': [
    {q:'I saw ___ dog near the gate.',options:['a','an','the any','—'],key:'A',explanation:'กล่าวถึงสุนัขหนึ่งตัวแบบไม่เฉพาะเจาะจง ใช้ a'},
    {q:'___ sun is very bright today.',options:['A','An','The','—'],key:'C',explanation:'ดวงอาทิตย์เป็นสิ่งเฉพาะเจาะจง ใช้ the'}
  ],
  'Linking verb + adjective': [
    {q:'She looks ___ today.',options:['tired','tiredly','tire','more tiredly'],key:'A',explanation:'look เป็น linking verb และคำหลังบอกลักษณะของประธาน จึงใช้ adjective'},
    {q:'The soup tastes ___.',options:['wellly','good','goodly','nicely taste'],key:'B',explanation:'taste เป็น linking verb จึงตามด้วย adjective เช่น good'}
  ],
  'Question Tag': [
    {q:'You are ready, ___?',options:["aren’t you","are you","don’t you","weren’t you"],key:'A',explanation:'ประโยคหลักเป็นบวกและใช้ are จึงใช้ tag ปฏิเสธ aren’t you'},
    {q:"He didn’t come, ___?",options:["didn’t he","does he","did he","was he"],key:'C',explanation:'ประโยคหลักเป็นลบด้วย didn’t จึงใช้ tag บวก did he'}
  ],
  'Gerund (V-ing)': [
    {q:'She enjoys ___ books.',options:['read','to read only','reading','reads'],key:'C',explanation:'enjoy ตามด้วย V-ing'},
    {q:'How about ___ by bus?',options:['go','going','to go','went'],key:'B',explanation:'How about ตามด้วย V-ing'}
  ],
  'การเปรียบเทียบ Comparative': [
    {q:'My car is ___ than yours.',options:['fast','faster','fastest','the faster'],key:'B',explanation:'มี than และเปรียบเทียบสองสิ่ง จึงใช้ comparative faster'},
    {q:'This book is ___ than that one.',options:['interesting','more interesting','most interesting','the most interesting'],key:'B',explanation:'adjective ยาวใช้ more + adjective + than'}
  ]
};

let lessonCatalogCache = null;

function ensureLessonProgress(){
  if(!state.lessonProgress || typeof state.lessonProgress!=='object') state.lessonProgress={};
  state.lessonProgress.passed ||= {};
  state.lessonProgress.attempts ||= {};
  state.lessonProgress.recent ||= {};
  state.lessonProgress.lastQuiz ||= {};
  return state.lessonProgress;
}

function shuffleCopy(rows){
  const out=[...rows];
  for(let i=out.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [out[i],out[j]]=[out[j],out[i]];
  }
  return out;
}

function buildLessonCatalog(){
  if(lessonCatalogCache) return lessonCatalogCache;
  const map=new Map();
  for(let s=1;s<=20;s++){
    for(let q=1;q<=15;q++){
      const data=questionBank[s][q-1];
      const key=answerKeys[s][q-1];
      const correctLabel=data.options[letters.indexOf(key)]||'';
      const explanation=explanations?.[s]?.[q-1]||'';
      const guide=lessonGuide(explanation,data.q,correctLabel);
      if(!map.has(guide.topic)) map.set(guide.topic,{guide,items:[]});
      map.get(guide.topic).items.push({
        id:`exam-${s}-${q}`,kind:'exam',set:s,q,question:data.q,options:[...data.options],key,
        explanation,guide
      });
    }
  }
  if(LESSON_EXTRA_ENABLED){
  Object.entries(EXTRA_LESSON_QUESTIONS).forEach(([topic,rows])=>{
    if(!map.has(topic)) return;
    rows.forEach((row,i)=>map.get(topic).items.push({
      id:`extra-${LESSON_SEQUENCE.indexOf(topic)+1}-${i+1}`,kind:'extra',question:row.q,
      options:[...row.options],key:row.key,explanation:row.explanation,guide:map.get(topic).guide
    }));
  });
  if(typeof lessonExtraQuestionBank!=='undefined'){
    Object.entries(lessonExtraQuestionBank).forEach(([topic,rows])=>{
      if(!map.has(topic) || !Array.isArray(rows)) return;
      rows.forEach((row,i)=>map.get(topic).items.push({
        id:`bank-${LESSON_SEQUENCE.indexOf(topic)+1}-${i+1}`,kind:'extra',question:row.q,
        options:[...row.options],key:row.key,explanation:row.explanation,guide:map.get(topic).guide
      }));
    });
  }
  // Add a small concept-review pool per lesson. These are intentionally different from
  // sentence-completion items and help keep retries fresh while reinforcing the rule.
  const conceptSources=[...map.entries()].map(([topic,entry])=>({topic,guide:entry.guide}));
  conceptSources.forEach((source,sourceIndex)=>{
    const entry=map.get(source.topic);
    if(!entry) return;
    const otherPatterns=conceptSources.filter(x=>x.topic!==source.topic).map(x=>x.guide.pattern).filter((v,i,a)=>v&&a.indexOf(v)===i);
    const otherTips=conceptSources.filter(x=>x.topic!==source.topic).map(x=>x.guide.tip).filter((v,i,a)=>v&&a.indexOf(v)===i);
    const pickOther=(list,start,count=3)=>{
      const out=[];
      if(!list.length) return out;
      for(let n=0;n<list.length*2 && out.length<count;n++){
        const value=list[(start+n)%list.length];
        if(value && !out.includes(value)) out.push(value);
      }
      return out;
    };
    const makeConcept=(id,q,correct,distractors,explanation,shift)=>{
      const opts=[correct,...distractors.filter(x=>x!==correct)].slice(0,4);
      while(opts.length<4) opts.push(`ตัวลวง ${opts.length+1}`);
      const move=shift%4;
      const rotated=[...opts.slice(move),...opts.slice(0,move)];
      const key=letters[rotated.indexOf(correct)];
      entry.items.push({id:`concept-${sourceIndex+1}-${id}`,kind:'extra',question:q,options:rotated,key,explanation,guide:source.guide});
    };
    const p=source.guide.pattern, tip=source.guide.tip;
    makeConcept(1,`ทบทวนบท “${source.topic}”: รูปแบบใดเป็นสูตรหลักของบทนี้?`,p,pickOther(otherPatterns,sourceIndex),`สูตรที่ควรจำของบทนี้คือ ${p}`,sourceIndex+1);
    makeConcept(2,`ถ้าพบโจทย์หมวด “${source.topic}” ทริกใดช่วยตัดสินคำตอบได้ตรงที่สุด?`,tip,pickOther(otherTips,sourceIndex+3),`ทริกของบทนี้คือ: ${tip}`,sourceIndex+2);
    makeConcept(3,`ก่อนทำข้อสอบเรื่อง “${source.topic}” ควรจำ Pattern ใดเป็นอันดับแรก?`,p,pickOther(otherPatterns,sourceIndex+6),`Pattern หลักคือ ${p}`,sourceIndex+3);
    makeConcept(4,`ข้อใดเป็นวิธีสังเกตที่สอดคล้องกับบท “${source.topic}”?`,tip,pickOther(otherTips,sourceIndex+9),`ให้ใช้วิธีสังเกตนี้: ${tip}`,sourceIndex+4);
    makeConcept(5,`ถ้าต้องจดสรุปบท “${source.topic}” ลงหนึ่งบรรทัด ควรจดสูตรใด?`,p,pickOther(otherPatterns,sourceIndex+12),`สรุปสั้น ๆ ของบทนี้คือ ${p}`,sourceIndex+5);
  });
  }
  // Remove exact repeated question text after merging source questions and supplemental banks.
  // Original exam items are inserted first, so they win over a supplemental duplicate.
  for(const entry of map.values()){
    const seenQuestion=new Set();
    entry.items=entry.items.filter(item=>{
      const normalized=String(item.question||'').toLowerCase().replace(/\s+/g,' ').trim();
      if(seenQuestion.has(normalized)) return false;
      seenQuestion.add(normalized);
      return true;
    });
  }
  const ordered=[];
  LESSON_SEQUENCE.forEach(topic=>{
    const entry=map.get(topic);
    if(!entry) return;
    ordered.push({id:`lesson-${ordered.length+1}`,topic,guide:entry.guide,items:entry.items});
  });
  for(const [topic,entry] of map){
    if(ordered.some(x=>x.topic===topic)) continue;
    ordered.push({id:`lesson-${ordered.length+1}`,topic,guide:entry.guide,items:entry.items});
  }
  lessonCatalogCache=ordered;
  return ordered;
}

function lessonStats(){
  const lessons=buildLessonCatalog();
  const progress=ensureLessonProgress();
  const passed=lessons.filter(l=>progress.passed[l.id]).length;
  return {passed,total:lessons.length,percent:lessons.length?Math.round(passed/lessons.length*100):0};
}

function lessonUnlocked(index){
  if(index<=0) return true;
  const lessons=buildLessonCatalog();
  return !!ensureLessonProgress().passed[lessons[index-1]?.id];
}

function showLessons(){
  state.mode='lesson';
  $('#homeView').hidden=true;
  $('#quizView').hidden=true;
  $('#vocabView').hidden=true;
  $('#collectionView').hidden=true;
  $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true;
  $('#lessonView').hidden=false;
  renderLessonCatalog();
  window.scrollTo({top:0,behavior:'smooth'});
}

function updateLessonProgressHeader(){
  const stats=lessonStats();
  $('#lessonOverallPercent').textContent=`${stats.percent}%`;
  $('#lessonOverallMeta').textContent=`ผ่าน ${stats.passed} / ${stats.total} บท`;
  $('#lessonOverallBar').style.width=`${stats.percent}%`;
}

function renderLessonCatalog(){
  const lessons=buildLessonCatalog();
  const progress=ensureLessonProgress();
  $('#lessonCatalogPanel').hidden=false;
  $('#lessonDetailPanel').hidden=true;
  updateLessonProgressHeader();
  $('#lessonGrid').innerHTML=lessons.map((lesson,index)=>{
    const unlocked=lessonUnlocked(index);
    const passed=progress.passed[lesson.id];
    const attempt=progress.attempts[lesson.id];
    const status=passed?`ผ่านแล้ว · ${passed.bestPercent}%`:unlocked?(attempt?`ยังไม่ผ่าน · ดีสุด ${attempt.bestPercent||0}%`:'พร้อมเรียน'):'ล็อก';
    const sourceCount=lesson.items.filter(x=>x.kind==='exam').length;
    return `<button class="lesson-card ${passed?'passed':''} ${unlocked?'':'locked'}" type="button" data-lesson-index="${index}" ${unlocked?'':'disabled'}>
      <span class="lesson-card-no">บท ${index+1}</span>
      <strong>${escapeHtml(lesson.topic)}</strong>
      <p>${escapeHtml(lesson.guide.basic)}</p>
      <div class="lesson-card-meta"><span>${status}</span><span>โจทย์ต้นฉบับ ${sourceCount} ข้อ</span></div>
    </button>`;
  }).join('');
  $('#lessonGrid').querySelectorAll('[data-lesson-index]').forEach(btn=>btn.addEventListener('click',()=>openLesson(Number(btn.dataset.lessonIndex))));
}

function openLesson(index){
  if(!lessonUnlocked(index)) return;
  const lessons=buildLessonCatalog();
  if(!lessons[index]) return;
  state.lessonCurrent=index; state.lastActivity={kind:'a1-lesson',index};
  persist();
  $('#lessonCatalogPanel').hidden=true;
  $('#lessonDetailPanel').hidden=false;
  renderLessonDetail(index);
  window.scrollTo({top:0,behavior:'smooth'});
}

function lessonItemById(lesson,itemId){
  return lesson.items.find(x=>x.id===itemId);
}

function lessonExampleHtml(item){
  const label=item.options[letters.indexOf(item.key)]||'';
  const filled=fillAnswerMarkup(item.question,label,'correct-answer');
  const info=item.kind==='exam' ? (learningData?.[item.set]?.[item.q-1]?.options?.[item.key]||{}) : {};
  const source=`จาก Set ${item.set} · ข้อ ${item.q}`;
  return `<article class="lesson-example">
    <div class="lesson-example-source">${source}</div>
    <div class="lesson-example-question">${escapeHtml(item.question)}</div>
    <div class="lesson-example-answer">${filled}</div>
    ${info.thai?`<div class="lesson-example-thai">${escapeHtml(info.thai)}</div>`:''}
    <p>${escapeHtml(item.explanation||'ใช้กฎเดียวกับบทเรียนนี้')}</p>
  </article>`;
}

function renderLessonDetail(index){
  updateLessonProgressHeader();
  const lesson=buildLessonCatalog()[index];
  if(!lesson) return;
  const progress=ensureLessonProgress();
  const passed=progress.passed[lesson.id];
  const attemptMeta=progress.attempts[lesson.id];
  const examOnly=lesson.items.filter(x=>x.kind==='exam');
  const examExamples=examOnly.slice(0,3);
  const active=state.lessonAttempt && state.lessonAttempt.lessonId===lesson.id ? state.lessonAttempt : null;
  const panel=$('#lessonDetailPanel');
  panel.innerHTML=`
    <button class="text-btn lesson-back-list" type="button">← กลับรายการบทเรียน</button>
    <div class="lesson-detail-head">
      <div><span class="lesson-card-no">บท ${index+1}</span><h2>${escapeHtml(lesson.topic)}</h2><p>${escapeHtml(lesson.guide.basic)}</p></div>
      <div class="lesson-state-badge ${passed?'passed':''}">${passed?`ผ่าน ${passed.bestPercent}%`:'ต้องผ่าน 80%'}</div>
    </div>
    <div class="lesson-core-grid">
      <div class="lesson-core-card"><span>รูปที่ควรจำ</span><code>${escapeHtml(lesson.guide.pattern)}</code></div>
      <div class="lesson-core-card"><span>วิธีสังเกต</span><strong>${escapeHtml(lesson.guide.tip)}</strong></div>
    </div>
    <section class="lesson-examples-section"><div class="lesson-subhead"><div><h3>ตัวอย่างจากโจทย์จริง</h3><p>ดูว่ากฎเดียวกันถูกใช้ในข้อสอบอย่างไร</p></div><span>${examExamples.length} ตัวอย่าง</span></div><div class="lesson-examples">${examExamples.map(lessonExampleHtml).join('')}</div></section>
    <section class="lesson-checkpoint">
      <div><h3>แบบทดสอบท้ายบท</h3><p>สุ่มจากโจทย์ต้นฉบับที่เกี่ยวข้องกับบทนี้ ระบบจะพยายามเปลี่ยนข้อเมื่อทำใหม่ และต้องได้อย่างน้อย 80% เพื่อปลดล็อกบทถัดไป</p>${attemptMeta?`<small>ทำมาแล้ว ${attemptMeta.count} ครั้ง · คะแนนดีที่สุด ${attemptMeta.bestPercent||0}%</small>`:''}</div>
      ${active?'':`<button class="primary-btn start-lesson-quiz" type="button">${passed?'ทบทวนด้วยแบบทดสอบอีกครั้ง':'เริ่มแบบทดสอบท้ายบท'}</button>`}
    </section>
    <div id="lessonQuizArea">${active?lessonQuizHtml(lesson,active):''}</div>`;
  panel.querySelector('.lesson-back-list').addEventListener('click',renderLessonCatalog);
  panel.querySelector('.start-lesson-quiz')?.addEventListener('click',()=>startLessonQuiz(index));
  wireLessonQuiz(index);
}

function makeLessonQuizItems(lesson){
  const progress=ensureLessonProgress();
  const recent=new Set(progress.recent[lesson.id]||[]);
  const pool=lesson.items;
  const target=Math.min(5,pool.length);
  let picked=[...shuffleCopy(pool.filter(x=>!recent.has(x.id))),...shuffleCopy(pool.filter(x=>recent.has(x.id)))].slice(0,target);
  const last=(progress.lastQuiz[lesson.id]||[]).slice().sort().join('|');
  let tries=0;
  while(tries<12 && picked.length===target && picked.map(x=>x.id).slice().sort().join('|')===last && pool.length>target){
    picked=shuffleCopy(pool).slice(0,target); tries++;
  }
  return picked;
}

function startLessonQuiz(index){
  const lesson=buildLessonCatalog()[index];
  if(!lesson) return;
  const picked=makeLessonQuizItems(lesson);
  state.lessonAttempt={lessonId:lesson.id,lessonIndex:index,itemIds:picked.map(x=>x.id),answers:{},checked:false,createdAt:Date.now()};
  persist();
  renderLessonDetail(index);
  setTimeout(()=>$('#lessonQuizArea')?.scrollIntoView({behavior:'smooth',block:'start'}),0);
}

function lessonQuizHtml(lesson,attempt){
  const items=attempt.itemIds.map(id=>lessonItemById(lesson,id)).filter(Boolean);
  const answered=Object.keys(attempt.answers||{}).length;
  const checked=!!attempt.checked;
  const score=checked?items.reduce((sum,item)=>sum+(attempt.answers[item.id]===item.key?1:0),0):0;
  const percent=items.length?Math.round(score/items.length*100):0;
  const result=checked?`<div class="lesson-quiz-result ${percent>=80?'pass':'fail'}"><strong>${percent>=80?'ผ่านบทเรียน':'ยังไม่ผ่าน'}</strong><span>${score}/${items.length} · ${percent}% ${percent>=80?'ปลดล็อกบทถัดไปแล้ว':'ต้องได้อย่างน้อย 80% ลองทำชุดใหม่ได้'}</span></div>`:'';
  const cards=items.map((item,no)=>{
    const selected=attempt.answers[item.id];
    const label=item.options[letters.indexOf(item.key)]||'';
    const source=`Set ${item.set} · ข้อ ${item.q}`;
    const options=item.options.map((text,i)=>{
      const letter=letters[i];
      let cls='lesson-quiz-option';
      if(selected===letter) cls+=' selected';
      if(checked && letter===item.key) cls+=' correct';
      if(checked && selected===letter && letter!==item.key) cls+=' wrong';
      return `<button type="button" class="${cls}" data-lesson-item="${item.id}" data-choice="${letter}" ${checked?'disabled':''}><span>${letter}</span><strong>${escapeHtml(text||'—')}</strong></button>`;
    }).join('');
    const feedback=checked?`<div class="lesson-mini-feedback ${selected===item.key?'good':'bad'}"><div>${selected===item.key?'ถูก':'เฉลย'}: <strong class="answer-text-correct">${item.key}. ${escapeHtml(label)}</strong></div><p>${escapeHtml(item.explanation||'ใช้กฎเดียวกับบทเรียนนี้')}</p><div class="lesson-mini-sentence">${fillAnswerMarkup(item.question,label,'correct-answer')}</div></div>`:'';
    return `<article class="lesson-quiz-card ${checked?(selected===item.key?'good':'bad'):''}"><div class="lesson-quiz-top"><span>ข้อ ${no+1}</span><small>${source}</small></div><p>${escapeHtml(item.question)}</p><div class="lesson-quiz-options">${options}</div>${feedback}</article>`;
  }).join('');
  const complete=answered===items.length && items.length>0;
  const nextIndex=attempt.lessonIndex+1;
  const hasNext=nextIndex<buildLessonCatalog().length;
  const actions=checked?`<div class="lesson-quiz-actions"><button class="secondary-btn retry-lesson-quiz" type="button">ทำชุดใหม่</button>${percent>=80&&hasNext?'<button class="primary-btn next-lesson-btn" type="button">ไปบทถัดไป →</button>':'<button class="secondary-btn back-lesson-list" type="button">กลับรายการบทเรียน</button>'}</div>`:`<div class="lesson-quiz-actions"><span>ตอบแล้ว ${answered}/${items.length}</span><button class="primary-btn submit-lesson-quiz" type="button" ${complete?'':'disabled'}>ตรวจแบบทดสอบ</button></div>`;
  return `<div class="lesson-quiz-shell"><div class="lesson-quiz-heading"><div><h3>ทดสอบ: ${escapeHtml(lesson.topic)}</h3><p>เกณฑ์ผ่าน 80%</p></div><span>${answered}/${items.length}</span></div>${result}<div class="lesson-quiz-list">${cards}</div>${actions}</div>`;
}

function wireLessonQuiz(index){
  const area=$('#lessonQuizArea');
  if(!area) return;
  area.querySelectorAll('[data-lesson-item]').forEach(btn=>btn.addEventListener('click',()=>chooseLessonAnswer(index,btn.dataset.lessonItem,btn.dataset.choice)));
  area.querySelector('.submit-lesson-quiz')?.addEventListener('click',()=>checkLessonQuiz(index));
  area.querySelector('.retry-lesson-quiz')?.addEventListener('click',()=>startLessonQuiz(index));
  area.querySelector('.back-lesson-list')?.addEventListener('click',renderLessonCatalog);
  area.querySelector('.next-lesson-btn')?.addEventListener('click',()=>openLesson(index+1));
}

function chooseLessonAnswer(index,itemId,choice){
  const attempt=state.lessonAttempt;
  if(!attempt || attempt.checked || attempt.lessonIndex!==index) return;
  attempt.answers[itemId]=choice;
  persist();
  const lesson=buildLessonCatalog()[index];
  $('#lessonQuizArea').innerHTML=lessonQuizHtml(lesson,attempt);
  wireLessonQuiz(index);
}

function checkLessonQuiz(index){
  const lesson=buildLessonCatalog()[index];
  const attempt=state.lessonAttempt;
  if(!lesson || !attempt || attempt.checked) return;
  const items=attempt.itemIds.map(id=>lessonItemById(lesson,id)).filter(Boolean);
  if(Object.keys(attempt.answers||{}).length<items.length) return;
  const score=items.reduce((sum,item)=>sum+(attempt.answers[item.id]===item.key?1:0),0);
  const percent=Math.round(score/items.length*100);
  attempt.checked=true; attempt.score=score; attempt.percent=percent; attempt.checkedAt=Date.now();
  const progress=ensureLessonProgress();
  const meta=progress.attempts[lesson.id]||{count:0,bestPercent:0};
  meta.count+=1; meta.bestPercent=Math.max(meta.bestPercent||0,percent); meta.lastPercent=percent; meta.lastAt=Date.now();
  progress.attempts[lesson.id]=meta;
  const oldRecent=progress.recent[lesson.id]||[];
  progress.recent[lesson.id]=[...new Set([...attempt.itemIds,...oldRecent])].slice(0,Math.max(8,lesson.items.length));
  progress.lastQuiz[lesson.id]=[...attempt.itemIds];
  if(percent>=80){
    const previous=progress.passed[lesson.id];
    progress.passed[lesson.id]={passedAt:previous?.passedAt||Date.now(),bestPercent:Math.max(previous?.bestPercent||0,percent)};
  }
  persist();
  renderLessonDetail(index);
  setTimeout(()=>$('#lessonQuizArea')?.scrollIntoView({behavior:'smooth',block:'start'}),0);
}


$('#brandHome').addEventListener('click',showHome);
$('#openAllCategories').addEventListener('click',showHome);
$('#collectionBackHome').addEventListener('click',showHome);
$('#sourceBackCollection').addEventListener('click',()=>showCollection(state.sourceCategory));
$('#sourceCheck').addEventListener('click',checkSourceAnswers);
$('#sourceReset').addEventListener('click',resetSourceAttempt);
$('#sourceToggleDetail').addEventListener('click',()=>{state.detailMode=!state.detailMode;persist();renderSourceQuiz();});
$('#openLessons').addEventListener('click',showLessons);
$('#openLessonsHome').addEventListener('click',showLessons);
$('#lessonBackHome').addEventListener('click',showHome);
$('#openVocabulary').addEventListener('click',showVocabulary);
$('#openVocabularyHome').addEventListener('click',showVocabulary);
$('#vocabBackHome').addEventListener('click',showHome);
['#vocabSearch','#vocabSetFilter','#vocabTypeFilter','#vocabSort'].forEach(sel=>{ const el=$(sel); el.addEventListener(el.tagName==='INPUT'?'input':'change',renderVocabulary); });
$('#openSetPicker').addEventListener('click',showHome);
$('#backHome').addEventListener('click',showHome);
$('#startRandom').addEventListener('click',()=>startRandom(true));
$('#newRandom').addEventListener('click',()=>startRandom(true));
$('#checkAnswers').addEventListener('click',checkAnswers);
$('#resetAttempt').addEventListener('click',resetAttempt);
$('#toggleDetailMode').addEventListener('click',()=>{ state.detailMode=!state.detailMode; persist(); renderQuiz(); });
$('#prevSet').addEventListener('click',()=>{if(state.currentSet>1) openSet(state.currentSet-1)});
$('#nextSet').addEventListener('click',()=>{if(state.currentSet<20) openSet(state.currentSet+1)});
$('#resetAll').addEventListener('click',()=>{
  if(confirm('ล้างคำตอบ คะแนน ความคืบหน้าบทเรียน และชุดสุ่มทั้งหมดหรือไม่?')){
    state.answers={}; state.checked={}; state.randomAttempt=null; state.bestRandom=null;
    state.lessonProgress={passed:{},attempts:{},recent:{}}; state.lessonAttempt=null; state.lessonCurrent=0;
    state.sourceAnswers={}; state.sourceChecked={}; state.sourceSetId=null; state.lastActivity=null;
    localStorage.removeItem('cefr-source-study-v1');
    if(typeof sourceStudyState!=='undefined'){
      sourceStudyState.random={}; sourceStudyState.lessonProgress={}; sourceStudyState.lessonAttempts={}; sourceStudyState.currentLesson={};
    }
    persist(); renderHome();
  }
});

renderHome();
