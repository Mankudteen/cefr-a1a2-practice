const SOURCE_STUDY_STORE_KEY='cefr-source-study-v1';
const sourceStudySaved=JSON.parse(localStorage.getItem(SOURCE_STUDY_STORE_KEY)||'{}');
const sourceStudyState={
  random:sourceStudySaved.random||{},
  lessonProgress:sourceStudySaved.lessonProgress||{},
  lessonAttempts:sourceStudySaved.lessonAttempts||{},
  currentLesson:sourceStudySaved.currentLesson||{},
  vocabCategory:sourceStudySaved.vocabCategory||'b1b2'
};
function persistSourceStudy(){localStorage.setItem(SOURCE_STUDY_STORE_KEY,JSON.stringify(sourceStudyState));window.CEFR_SYNC?.queueSync?.();}
function hideSourceStudyViews(){
  const lv=$('#sourceLessonView'), vv=$('#sourceVocabView');
  if(lv) lv.hidden=true; if(vv) vv.hidden=true;
}

// Allow the existing source quiz renderer to open a persisted virtual random set.
const _sourceSetById=sourceSetById;
sourceSetById=function(category,setId){
  if(String(setId||'').startsWith('__random__')) return sourceStudyState.random[category]||null;
  return _sourceSetById(category,setId);
};

const SOURCE_VOCAB_MANUAL={
  'admit':'ยอมรับ','acknowledge':'ยอมรับ/รับรู้','liable':'ต้องรับผิด','debt':'หนี้','pull over':'จอดรถข้างทาง','license':'ใบอนุญาต','interfere':'รบกวน/ขัดขวาง','provide':'จัดหาให้','support':'สนับสนุน','anniversary':'วันครบรอบ','honesty':'ความซื่อสัตย์','courage':'ความกล้าหาญ','consist of':'ประกอบด้วย','admissions office':'สำนักงานรับสมัคร','old-fashioned':'ล้าสมัย','get over':'ฟื้นจาก/ทำใจผ่าน','shock':'ความตกใจ','go off':'ดังขึ้น/ทำงานขึ้น','prevent':'ป้องกัน','used to':'เคย','be used to':'คุ้นเคยกับ','get on':'ก้าวหน้า/เข้ากันได้','shirt':'เสื้อเชิ้ต','turn up':'ปรากฏตัว/โผล่มา','widen':'ทำให้กว้างขึ้น','notorious':'มีชื่อเสีย','glance':'เหลือบมอง','shortcoming':'ข้อบกพร่อง','eligible':'มีสิทธิ์','make sense':'สมเหตุสมผล','so far':'จนถึงตอนนี้','fond of':'ชอบ','sensitive':'อ่อนไหว','minutes':'รายงานการประชุม','bronchitis':'หลอดลมอักเสบ','graduate program':'หลักสูตรบัณฑิตศึกษา','leftovers':'อาหารเหลือ','scathing':'รุนแรง/เผ็ดร้อน','volume':'เล่ม','tidy up':'จัดให้เรียบร้อย','obtain':'ได้รับ/หาได้','scarce':'ขาดแคลน','accept':'ยอมรับ','tissue of lies':'เรื่องโกหกเป็นชุด','standardized examination':'การสอบมาตรฐาน','worth':'คุ้มค่า','annual leave':'ลาพักร้อนประจำปี','wounded':'บาดเจ็บ','arbitrary':'ตามอำเภอใจ','alter':'เปลี่ยนแปลง','fare':'ค่าโดยสาร','time is up':'หมดเวลา',
  'imply':'สื่อเป็นนัย','suggest':'แนะนำ/เสนอ','intend':'ตั้งใจ','express':'แสดงออก','infer':'อนุมาน','conclusion':'ข้อสรุป','occupation':'อาชีพ','observation':'ข้อสังเกต','significant':'สำคัญ/มาก','eateries':'ร้านอาหาร','generation':'รุ่น/ชั่วอายุคน','side effect':'ผลกระทบข้างเคียง','wildlife':'สัตว์ป่า','bring up':'เลี้ยงดู','mince your words':'พูดอ้อมค้อม','optimism':'การมองโลกในแง่ดี','strike':'การนัดหยุดงาน','stranded':'ติดค้าง','idyllic':'สงบสวยงาม','up to me':'ขึ้นอยู่กับฉัน/เป็นอำนาจฉัน','precisely':'อย่างแม่นยำ','effectively':'อย่างมีประสิทธิภาพ','decline':'ปฏิเสธ','recommend':'แนะนำ','familiar':'คุ้นเคย','critic':'นักวิจารณ์','explore':'สำรวจ',
  'collocation':'คำที่มักใช้คู่กัน','have lunch':'รับประทานอาหารกลางวัน','go home':'กลับบ้าน','do homework':'ทำการบ้าน','fast food':'อาหารจานด่วน','take notes':'จดบันทึก','run out of time':'เวลาไม่พอ/หมดเวลา','draw your attention':'ดึงความสนใจ','rather than':'แทนที่จะ','such as':'เช่น','out of':'ทำจาก/ออกจาก','since then':'ตั้งแต่นั้นมา','by themselves':'ด้วยตัวเอง','look at':'มอง/ดู','recycled':'รีไซเคิลแล้ว','sustainable':'ยั่งยืน','functional':'ใช้งานได้จริง','donation':'เงินบริจาค','grant':'เงินสนับสนุน',
  'aisle':'ทางเดินระหว่างชั้นสินค้า','supermarket':'ซูเปอร์มาร์เก็ต','screen':'หน้าจอ','surf the internet':'ท่องอินเทอร์เน็ต','cereal':'ซีเรียล','cut down on':'ลดปริมาณ','fireworks':'ดอกไม้ไฟ','victorian':'ยุควิกตอเรีย','ignition':'ระบบจุดระเบิด','clutch':'คลัตช์','handbrake':'เบรกมือ','foreign correspondent':'ผู้สื่อข่าวต่างประเทศ','world affairs':'ข่าว/กิจการโลก','audition':'ทดสอบบท','starring role':'บทนำ','songwriter':'นักแต่งเพลง','lyrics':'เนื้อเพลง','courtroom':'ห้องพิจารณาคดี','flight cancelled':'เที่ยวบินถูกยกเลิก','mechanical failure':'เครื่องขัดข้อง','checked baggage':'สัมภาระโหลดใต้เครื่อง','complimentary':'ให้ฟรี','boarding':'การขึ้นเครื่อง','luggage':'สัมภาระ','promotion':'การเลื่อนตำแหน่ง','estimate':'ใบประเมินราคา','brochure':'แผ่นพับ','presentation':'การนำเสนอ',
  'prefer':'ชอบมากกว่า','had better':'ควรจะ','either':'เช่นกันในประโยคปฏิเสธ','whole':'ทั้งหมด','another':'อีกหนึ่ง','next to':'ถัดจาก','what is ... like':'...เป็นอย่างไร','childhood':'วัยเด็ก','road network':'เครือข่ายถนน','tight':'ตึง/ขัดสน','affected':'ได้รับผลกระทบ','decision':'การตัดสินใจ','recipe':'สูตรอาหาร','ingredient':'วัตถุดิบ','stir':'คน/กวน','proud':'ภูมิใจ','treasure':'สมบัติ','architecture':'สถาปัตยกรรม','garbage':'ขยะ','fashion':'แฟชั่น','funding':'เงินทุน'
};

function sourceCorpus(category){
  const collection=extendedCollections?.[category]; if(!collection) return [];
  const rows=[];
  collection.sets.forEach(set=>{
    set.items.forEach(item=>{
      const text=[item.q,...(item.options||[])].join(' ');
      rows.push({text,ref:`${set.title} · ข้อ ${item.sourceNo}`});
    });
    (set.passages||[]).forEach(p=>rows.push({text:p.text||'',ref:`${set.title} · Passage`}));
  });
  return rows;
}
function normalizeLookup(t){return String(t||'').toLowerCase().replace(/[“”"'’‘.,!?():;\[\]]/g,' ').replace(/\s+/g,' ').trim();}
function sourceVocabThai(term){
  const key=normalizeLookup(term);
  if(SOURCE_VOCAB_MANUAL[key]) return SOURCE_VOCAB_MANUAL[key];
  if(typeof vocabularyData!=='undefined'){
    const hit=vocabularyData.find(v=>normalizeLookup(v.term)===key && v.thai); if(hit) return hit.thai;
  }
  return '';
}
function buildSourceVocabulary(category){
  const rows=sourceCorpus(category), joined=rows.map(r=>r.text).join(' ').toLowerCase();
  const candidates=new Map();
  function add(term,thai,categoryName='คำศัพท์',priority=2){
    term=String(term||'').trim(); if(!term||!thai) return;
    const needle=term.toLowerCase();
    const count=(joined.match(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
    if(!count) return;
    const example=rows.find(r=>r.text.toLowerCase().includes(needle));
    const key=normalizeLookup(term); const existing=candidates.get(key);
    const row={term,thai,category:categoryName,count,priority,example:example?.text||'',ref:example?.ref||''};
    if(!existing||count>existing.count)candidates.set(key,row);
  }
  if(typeof vocabularyData!=='undefined') vocabularyData.forEach(v=>add(v.term,v.thai,v.category||'คำศัพท์',v.category==='วลี/รูปประโยค'?0:1));
  Object.entries(SOURCE_VOCAB_MANUAL).forEach(([term,thai])=>add(term,thai,term.includes(' ')?'วลี/รูปประโยค':'คำศัพท์',term.includes(' ')?0:1));
  // Correct answer phrases are useful exam vocabulary when a translation is known.
  extendedCollections[category].sets.forEach(set=>set.items.forEach(item=>{
    if(!sourceItemScorable(item)) return;
    const label=(item.options&&item.options.length)?item.options[letters.indexOf(item.key)]:String(item.key||'');
    const thai=sourceVocabThai(label); if(thai) add(label,thai,label.includes(' ')?'วลี/รูปประโยค':'คำตอบสำคัญ',0);
  }));
  return [...candidates.values()];
}
function showSourceVocabulary(category=state.sourceCategory){
  state.sourceCategory=category; sourceStudyState.vocabCategory=category; persist(); persistSourceStudy();
  $('#homeView').hidden=true; $('#quizView').hidden=true; $('#vocabView').hidden=true; $('#lessonView').hidden=true; $('#collectionView').hidden=true; $('#sourceQuizView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=false;
  const c=extendedCollections[category]; $('#sourceVocabTitle').textContent=`คำศัพท์ท่องจำ · ${c.title}`; $('#sourceVocabDescription').textContent=`คำและวลีที่พบจริงในโจทย์ ${c.title} พร้อมคำแปลไทยและตำแหน่งที่พบ`;
  renderSourceVocabulary(); window.scrollTo({top:0,behavior:'smooth'});
}
function renderSourceVocabulary(){
  const category=sourceStudyState.vocabCategory||state.sourceCategory; const q=$('#sourceVocabSearch').value.trim().toLowerCase(); const sort=$('#sourceVocabSort').value;
  let rows=((typeof extendedVocabularyData!=='undefined'&&extendedVocabularyData[category])?extendedVocabularyData[category]:buildSourceVocabulary(category)).filter(v=>!q||[v.term,v.thai,v.example,v.exampleThai||''].join(' ').toLowerCase().includes(q));
  if(sort==='az')rows.sort((a,b)=>a.term.localeCompare(b.term)); else if(sort==='frequency')rows.sort((a,b)=>b.count-a.count||a.term.localeCompare(b.term)); else rows.sort((a,b)=>a.priority-b.priority||b.count-a.count||a.term.localeCompare(b.term));
  $('#sourceVocabCount').textContent=`${rows.length.toLocaleString()} คำ/วลี`; $('#sourceVocabEmpty').hidden=rows.length>0;
  $('#sourceVocabList').innerHTML=rows.map(v=>`<article class="vocab-card"><div class="vocab-term"><strong>${escapeHtml(v.term)}</strong><span class="thai">${escapeHtml(v.thai)}</span><div class="vocab-tags"><span class="vocab-tag">${escapeHtml(v.category)}</span><span class="vocab-tag">พบ ${v.count} ครั้ง</span></div></div><div class="vocab-detail"><div class="vocab-example"><div class="en">${escapeHtml(v.example)}</div>${v.exampleThai?`<div class="th">${escapeHtml(v.exampleThai)}</div>`:''}</div><div class="vocab-refs">พบใน: ${escapeHtml(v.ref||((v.refs&&v.refs.length)?v.refs.join(' · '):'โจทย์ในหมวดนี้'))}</div></div></article>`).join('');
}

function findSourceContext(set,item){
  const no=item.sourceNo;
  const passage=(set.passages||[]).find(p=>no>=p.from&&no<=p.to)||null;
  const audio=(set.audioGroups||[]).find(a=>no>=a.from&&no<=a.to)||null;
  return {passage,audio};
}
function makeSourceRandomSet(category){
  const collection=extendedCollections[category], pool=[];
  collection.sets.forEach(set=>set.items.filter(sourceItemAnswerable).forEach(item=>{
    const ctx=findSourceContext(set,item);
    pool.push({item,set,ctx});
  }));
  const picked=shuffleCopy(pool).slice(0,Math.min(30,pool.length));
  const items=[],passages=[],audioGroups=[];
  picked.forEach((entry,index)=>{
    const n=index+1; const item={...entry.item,sourceNo:n,originSetId:entry.set.id,originTitle:entry.set.title,originSourceNo:entry.item.sourceNo};
    items.push(item);
    if(entry.ctx.passage){const rec=extendedLearningData?.[category]?.[entry.set.id]?.passages?.find(p=>p.from===entry.ctx.passage.from);passages.push({from:n,to:n,title:`${entry.ctx.passage.title||'Passage'} · ${entry.set.title}`,text:entry.ctx.passage.text||'',thai:rec?.thai||''});}
    if(entry.ctx.audio) audioGroups.push({from:n,to:n,title:`${entry.ctx.audio.title||'Audio'} · ${entry.set.title}`,audio:entry.ctx.audio.audio});
  });
  const statuses=new Set(picked.map(x=>x.set.keyStatus));
  let keyStatus=statuses.size===1?[...statuses][0]:'mixed';
  const set={id:`__random__-${category}`,title:`สุ่ม ${items.length} ข้อ · ${collection.title}`,subtitle:`สุ่มจากทุกชุดในหมวด ${collection.title}`,type:'random',keyStatus,items,passages,audioGroups,random:true};
  sourceStudyState.random[category]=set; persistSourceStudy(); return set;
}
function startSourceRandom(category=state.sourceCategory,forceNew=true){
  let set=forceNew?makeSourceRandomSet(category):(sourceStudyState.random[category]||makeSourceRandomSet(category));
  if(forceNew){const k=sourceAttemptKey(category,set.id);state.sourceAnswers[k]={};state.sourceChecked[k]=false;}
  state.sourceCategory=category; state.sourceSetId=set.id; state.mode='source-quiz'; state.lastActivity={kind:'source-random',category}; persist();
  $('#homeView').hidden=true; $('#quizView').hidden=true; $('#vocabView').hidden=true; $('#lessonView').hidden=true; $('#collectionView').hidden=true; $('#sourceLessonView').hidden=true; $('#sourceVocabView').hidden=true; $('#sourceQuizView').hidden=false;
  renderSourceQuiz(); window.scrollTo({top:0,behavior:'smooth'});
}

const SOURCE_LESSON_GUIDES={
  'Tense & เวลา':{pattern:'ดูคำบอกเวลา → เลือก tense ที่สัมพันธ์กับเหตุการณ์',basic:'แยกอดีต ปัจจุบัน เหตุการณ์ต่อเนื่อง และเหตุการณ์ที่เชื่อมถึงปัจจุบันจากคำบอกเวลาและบริบท',tip:'วงคำบอกเวลา เช่น yesterday, since, for, so far, already ก่อนเลือกคำตอบ'},
  'Verb patterns & รูปกริยา':{pattern:'คำก่อนช่องว่าง → บังคับ V1 / to + V1 / V-ing / V3',basic:'คำบางคำและโครงสร้างบางแบบบังคับรูปกริยาที่ตามมาโดยตรง',tip:'อย่าแปลอย่างเดียว ให้ดูคำก่อนช่องว่างว่าเป็น modal, preposition, suggest, wish, prefer หรือสำนวนใด'},
  'Question & Clause':{pattern:'Question word / auxiliary / clause order',basic:'ฝึกโครงสร้างคำถาม question tag, indirect question, relative clause และ conditional',tip:'หากเป็นคำถาม ให้หา auxiliary ก่อน แล้วตรวจว่าประธานกับกริยาเรียงถูกหรือไม่'},
  'Noun · Pronoun · Determiner':{pattern:'ดูคำนามหลังช่องว่างและหน้าที่ในประโยค',basic:'แยก article, pronoun, possessive, quantifier และคำที่ใช้กับคำนามนับได้/นับไม่ได้',tip:'ดูว่าหลังช่องว่างมีคำนามหรือไม่ และคำนามเป็นเอกพจน์ พหูพจน์ หรือนับไม่ได้'},
  'Adjective · Adverb · Comparison':{pattern:'ตำแหน่งคำ → adjective / adverb / comparative / superlative',basic:'เลือกชนิดคำและรูปเปรียบเทียบให้ตรงตำแหน่งและความหมายของประโยค',tip:'หลัง linking verb มักใช้ adjective; ถ้ามี than ให้คิด comparative ก่อน'},
  'Preposition · Collocation · Phrasal verb':{pattern:'จำเป็นวลีทั้งก้อน ไม่แปล preposition แยกคำ',basic:'หลายข้อวัดคำที่มักใช้คู่กัน เช่น proud of, consist of, get over หรือ turn up',tip:'จดคำเป็นวลี เช่นคำหลัก + preposition/particle แล้วท่องทั้งก้อน'},
  'Vocabulary & Meaning':{pattern:'อ่านบริบททั้งประโยค → ตัดตัวเลือกที่ความหมายหรือหน้าที่ไม่เข้ากัน',basic:'ใช้บริบท เลือกคำศัพท์ และแยกความหมายของสำนวนหรือประโยคที่ใกล้กัน',tip:'แทนตัวเลือกกลับเข้าไปในประโยคทีละตัว แล้วถามว่าความหมายสมเหตุสมผลหรือไม่'},
  'Reading: Form':{pattern:'สังเกต grammar signal รอบช่องว่าง',basic:'Focus on Form วัดรูปประโยคและไวยากรณ์จากบริบทสั้น ๆ',tip:'อ่านคำก่อน–หลังช่องว่างก่อน แล้วค่อยอ่านทั้งประโยคเพื่อยืนยันความหมาย'},
  'Reading: Meaning & Intention':{pattern:'อ่านข้อความ/บทสนทนา → หาเจตนา ไม่ยึดคำแปลตรงตัว',basic:'ฝึกจับว่าผู้พูดต้องการสื่อ ชวน ปฏิเสธ แนะนำ เห็นด้วย หรือรู้สึกอย่างไร',tip:'ให้ถามว่า “ทำไมเขาพูดประโยคนี้ตอนนี้?” มากกว่าถามว่าแต่ละคำแปลว่าอะไร'},
  'Reading: Inference & Context':{pattern:'หลักฐานในข้อความ + สิ่งที่อนุมานได้โดยไม่เกินข้อมูล',basic:'ฝึก inference, conclusion และความหมายจากบริบท โดยใช้หลักฐานที่มีจริงในข้อความ',tip:'ตัดตัวเลือกที่แรงเกินหลักฐาน หรือเพิ่มข้อมูลที่ข้อความไม่ได้บอก'},
  'Reading: Cloze & Form + Meaning':{pattern:'grammar + collocation + ความหมายของย่อหน้า',basic:'เติมคำในบทความโดยต้องให้ทั้งรูปประโยคและเนื้อหาไหลต่อกัน',tip:'อ่านทั้งประโยคก่อน แล้วอ่านประโยคก่อนหน้า/ถัดไปเมื่อคำเชื่อมหรือ reference ยังไม่ชัด'},
  'Listening: People & Jobs':{pattern:'ฟังคำบอกบทบาท หน้าที่ สถานที่ทำงาน และกิจกรรม',basic:'จับอาชีพหรือความสัมพันธ์ของผู้พูดจากสิ่งที่เขาทำและคำศัพท์เฉพาะบริบท',tip:'อ่านตัวเลือกก่อนฟัง แล้วคาดว่าต้องฟัง “อาชีพ/บุคคล” คำไหนบ้าง'},
  'Listening: Place & Situation':{pattern:'ฟังสิ่งของ การกระทำ และคำศัพท์เฉพาะสถานที่',basic:'ระบุสถานที่หรือสถานการณ์จากบริบท แม้ผู้พูดจะไม่พูดชื่อสถานที่ตรง ๆ',tip:'จดคำชี้สถานที่ เช่น aisle, boarding, bill, courtroom, office และดูว่าคำไหนเกิดร่วมกัน'},
  'Listening: Details · Time · Number':{pattern:'อ่านคำถามก่อน → คาดชนิดข้อมูล → ฟังตัวเลข/เวลา/จำนวน',basic:'ฝึกดึงรายละเอียดเฉพาะ เช่น เวลา จำนวน สัมภาระ หรือข้อมูลที่ผู้พูดระบุ',tip:'ก่อนฟัง ให้เดาว่าคำตอบควรเป็นเวลา จำนวน ชื่อ หรือสถานที่ แล้วรอฟังข้อมูลประเภทนั้น'},
  'Listening: Reason & Intention':{pattern:'ฟัง because / so / decided / plan / want และผลลัพธ์',basic:'จับเหตุผล การตัดสินใจ แผน และจุดประสงค์ของผู้พูด',tip:'อย่าหยุดที่ keyword เดียว ฟังว่าผู้พูดสรุปว่าจะทำอะไรหรือเพราะอะไร'},
  'Listening: Gist & Inference':{pattern:'รวมหลักฐานหลายจุด → เลือกภาพรวมที่ตรงที่สุด',basic:'จับใจความ ความรู้สึก หรือข้อสรุปจากบทสนทนาโดยไม่ต้องเข้าใจทุกคำ',tip:'ถ้าพลาดคำหนึ่ง ให้ปล่อยแล้วตามต่อ เพราะข้อมูลสำคัญมักมีมากกว่าหนึ่งจุด'},
  'Verb patterns · Questions · Clauses':{pattern:'ดูคำก่อนช่องว่าง + auxiliary + ลำดับ clause',basic:'รวมรูปกริยา คำถาม question tag, indirect question, relative clause และเงื่อนไขที่มักออกสอบร่วมกัน',tip:'หาโครงหลักก่อนว่าเป็นคำถามหรือประโยคบอกเล่า แล้วดูว่าคำใดบังคับรูปกริยา'},
  'Vocabulary · Preposition · Comparison':{pattern:'ความหมาย + collocation + ตำแหน่งคำ + การเปรียบเทียบ',basic:'ฝึกคำศัพท์ สำนวน preposition/phrasal verb และรูป comparative/adjective ที่ต้องอาศัยทั้งความหมายและรูปประโยค',tip:'ถ้าแปลได้หลายตัว ให้ดูคำที่อยู่ติดกันและตำแหน่งในประโยคเพื่อเลือกคำที่ใช้ร่วมกันจริง'},
  'Reading: Meaning · Intention · Inference':{pattern:'หลักฐานในข้อความ → เจตนา → ข้อสรุปที่ไม่เกินหลักฐาน',basic:'รวมการจับความหมาย เจตนาผู้พูด และ inference จากบริบท เพื่อเลือกคำตอบที่ข้อความสนับสนุนมากที่สุด',tip:'ขีดคำหลักฐาน แล้วตัดตัวเลือกที่เพิ่มข้อมูลเองหรือแรงกว่าที่ข้อความบอก'},
  'Listening: People · Place · Details':{pattern:'อ่านคำถามก่อน → คาดชนิดข้อมูล → ฟังคน/สถานที่/เวลา/จำนวน',basic:'ฝึกจับบุคคล อาชีพ สถานที่ เวลา และรายละเอียดเฉพาะจากสัญญาณเสียงและคำศัพท์บริบท',tip:'ก่อนกดเล่น ให้รู้ก่อนว่าข้อนี้กำลังรอฟัง “คน สถานที่ เวลา หรือจำนวน”'},
  'Listening: Reason · Gist · Inference':{pattern:'ฟังเหตุผล + การตัดสินใจ + ใจความรวม',basic:'จับเหตุผล จุดประสงค์ ความรู้สึก และภาพรวมจากบทสนทนา โดยไม่ติดอยู่กับคำที่ฟังพลาดคำเดียว',tip:'ตามคำเชื่อมเหตุผลและประโยคสรุปท้าย แล้วเทียบกับตัวเลือกทั้งความหมาย'}
};

function grammarBucket(item){
  const correct=(item.options&&item.options.length&&letters.includes(item.key))?item.options[letters.indexOf(item.key)]:String(item.key||'');
  const topic=lessonGuide('',item.q,correct).topic;
  if(/Past Simple|Present Perfect|Continuous tense/i.test(topic)) return 'Tense & เวลา';
  if(/Modal|Infinitive|Gerund|make \+|Subjunctive|Verb to be|Passive/i.test(topic)) return 'Verb patterns & รูปกริยา';
  if(/Question|Conditional|another|other/i.test(topic)) return 'Question & Clause';
  if(/คำนาม|article|a \/ an|ความเป็นเจ้าของ|pronoun/i.test(topic)) return 'Noun · Pronoun · Determiner';
  if(/Comparative|Superlative|adjective|คำคุณศัพท์/i.test(topic)) return 'Adjective · Adverb · Comparison';
  if(/Preposition|Collocation|Phrasal/i.test(topic)) return 'Preposition · Collocation · Phrasal verb';
  return 'Vocabulary & Meaning';
}
function sourceLessonBucket(category,set,item){
  const text=`${set.title} ${set.subtitle} ${item.q}`.toLowerCase();
  if(category==='b1b2') return grammarBucket(item);
  if(category==='levelup'){
    if(/focus on meaning/.test(text)) return /infer|conclusion|likely|feel|experience|connection/.test(text)?'Reading: Inference & Context':'Reading: Meaning & Intention';
    if(/form and meaning/.test(text)) return 'Reading: Cloze & Form + Meaning';
    return grammarBucket(item);
  }
  if(category==='reading'){
    if((set.id==='reading-test-1'||set.id==='reading-test-2')&&Number(item.sourceNo)>=21) return 'Reading: Cloze & Form + Meaning';
    if(/fill in|writing|form and meaning|teaching children|trash|language|holiday/.test(text)) return 'Reading: Cloze & Form + Meaning';
    if(/focus on meaning/.test(text)||/what does|what can be inferred|imply|suggest|intend|express|conclusion|likely occupation|feel about/.test(text)) return /infer|conclusion|likely occupation|experience|connection/.test(text)?'Reading: Inference & Context':'Reading: Meaning & Intention';
    return 'Reading: Form';
  }
  if(category==='listening'){
    if(/profession|jobs?|occupation|position|who will|who/.test(text)) return 'Listening: People & Jobs';
    if(/where|place|sector/.test(text)) return 'Listening: Place & Situation';
    if(/how much|how many|what time|when/.test(text)) return 'Listening: Details · Time · Number';
    if(/why|decided|intend|offering|doing|forgot/.test(text)) return 'Listening: Reason & Intention';
    return 'Listening: Gist & Inference';
  }
  return 'Vocabulary & Meaning';
}
const SOURCE_LESSON_ORDER={
  b1b2:['Tense & เวลา','Verb patterns & รูปกริยา','Question & Clause','Noun · Pronoun · Determiner','Adjective · Adverb · Comparison','Preposition · Collocation · Phrasal verb','Vocabulary & Meaning'],
  reading:['Reading: Form','Reading: Meaning & Intention','Reading: Inference & Context','Reading: Cloze & Form + Meaning'],
  listening:['Listening: People & Jobs','Listening: Place & Situation','Listening: Details · Time · Number','Listening: Reason & Intention','Listening: Gist & Inference'],
  levelup:['Reading: Form','Tense & เวลา','Verb patterns & รูปกริยา','Question & Clause','Noun · Pronoun · Determiner','Preposition · Collocation · Phrasal verb','Reading: Meaning & Intention','Reading: Inference & Context','Reading: Cloze & Form + Meaning']
};
const sourceLessonCache={};
function combineSourceLessonGroups(category,lessons){
  const plans={
    b1b2:[['Tense & เวลา',['Tense & เวลา']],['Verb patterns · Questions · Clauses',['Verb patterns & รูปกริยา','Question & Clause']],['Noun · Pronoun · Determiner',['Noun · Pronoun · Determiner']],['Vocabulary · Preposition · Comparison',['Vocabulary & Meaning','Preposition · Collocation · Phrasal verb','Adjective · Adverb · Comparison']]],
    reading:[['Reading: Form',['Reading: Form']],['Reading: Meaning · Intention · Inference',['Reading: Meaning & Intention','Reading: Inference & Context']],['Reading: Cloze & Form + Meaning',['Reading: Cloze & Form + Meaning']]],
    listening:[['Listening: People · Place · Details',['Listening: People & Jobs','Listening: Place & Situation','Listening: Details · Time · Number']],['Listening: Reason · Gist · Inference',['Listening: Reason & Intention','Listening: Gist & Inference']]],
    levelup:[['Tense & เวลา',['Tense & เวลา']],['Verb patterns · Questions · Clauses',['Verb patterns & รูปกริยา','Question & Clause']],['Noun · Pronoun · Determiner',['Noun · Pronoun · Determiner']],['Vocabulary · Preposition · Comparison',['Vocabulary & Meaning','Preposition · Collocation · Phrasal verb','Adjective · Adverb · Comparison']],['Reading: Meaning · Intention · Inference',['Reading: Meaning & Intention','Reading: Inference & Context']],['Reading: Cloze & Form + Meaning',['Reading: Cloze & Form + Meaning']]]
  };
  const plan=plans[category]; if(!plan)return lessons;
  const grouped=[];
  plan.forEach(([title,names])=>{
    const members=lessons.filter(l=>names.includes(l.topic)); const items=members.flatMap(l=>l.items);
    if(!items.length||!items.some(x=>x.scorable))return;
    grouped.push({id:`${category}-lesson-${grouped.length+1}`,topic:title,guide:SOURCE_LESSON_GUIDES[title]||members[0].guide,items});
  });
  return grouped;
}
function buildSourceLessonCatalog(category){
  if(sourceLessonCache[category]) return sourceLessonCache[category];
  const map=new Map();
  extendedCollections[category].sets.forEach(set=>set.items.filter(sourceItemAnswerable).forEach(item=>{
    const topic=sourceLessonBucket(category,set,item); if(!map.has(topic))map.set(topic,[]);
    map.get(topic).push({id:`${set.id}::${item.sourceNo}`,set,item,scorable:sourceItemScorable(item)});
  }));
  const order=SOURCE_LESSON_ORDER[category]||[...map.keys()];
  const lessons=[];
  order.forEach(topic=>{
    const items=map.get(topic)||[]; if(!items.length||!items.some(x=>x.scorable))return;
    lessons.push({id:`${category}-lesson-${lessons.length+1}`,topic,guide:SOURCE_LESSON_GUIDES[topic]||SOURCE_LESSON_GUIDES['Vocabulary & Meaning'],items});
  });
  [...map.keys()].filter(t=>!order.includes(t)).forEach(topic=>{const items=map.get(topic);if(items.some(x=>x.scorable))lessons.push({id:`${category}-lesson-${lessons.length+1}`,topic,guide:SOURCE_LESSON_GUIDES[topic]||SOURCE_LESSON_GUIDES['Vocabulary & Meaning'],items});});
  const grouped=combineSourceLessonGroups(category,lessons);
  sourceLessonCache[category]=grouped; return grouped;
}
function sourceLessonProgress(category){
  sourceStudyState.lessonProgress[category] ||= {passed:{},attempts:{},recent:{},lastQuiz:{}};
  return sourceStudyState.lessonProgress[category];
}
function sourceLessonStats(category){const lessons=buildSourceLessonCatalog(category),p=sourceLessonProgress(category),passed=lessons.filter(l=>p.passed[l.id]).length;return{passed,total:lessons.length,percent:lessons.length?Math.round(passed/lessons.length*100):0};}
function sourceLessonUnlocked(category,index){if(index===0)return true;const lessons=buildSourceLessonCatalog(category),p=sourceLessonProgress(category);return !!p.passed[lessons[index-1]?.id];}
function showSourceLessons(category=state.sourceCategory){
  state.sourceCategory=category; persist();
  $('#homeView').hidden=true; $('#quizView').hidden=true; $('#vocabView').hidden=true; $('#lessonView').hidden=true; $('#collectionView').hidden=true; $('#sourceQuizView').hidden=true; $('#sourceVocabView').hidden=true; $('#sourceLessonView').hidden=false;
  const c=extendedCollections[category]; $('#sourceLessonTitle').textContent=`บทเรียน · ${c.title}`; $('#sourceLessonDescription').textContent=`บทเรียนจัดหมวดจากโจทย์ต้นฉบับ ${c.title} เท่านั้น · ผ่านท้ายบทอย่างน้อย 80% เพื่อปลดล็อกบทถัดไป`;
  renderSourceLessonCatalog(category); window.scrollTo({top:0,behavior:'smooth'});
}
function updateSourceLessonHeader(category){const st=sourceLessonStats(category);$('#sourceLessonPercent').textContent=`${st.percent}%`;$('#sourceLessonMeta').textContent=`ผ่าน ${st.passed} / ${st.total} บท`;$('#sourceLessonBar').style.width=`${st.percent}%`;}
function renderSourceLessonCatalog(category=state.sourceCategory){
  updateSourceLessonHeader(category); $('#sourceLessonCatalogPanel').hidden=false; $('#sourceLessonDetailPanel').hidden=true;
  const p=sourceLessonProgress(category),lessons=buildSourceLessonCatalog(category);
  $('#sourceLessonGrid').innerHTML=lessons.map((lesson,i)=>{const unlocked=sourceLessonUnlocked(category,i),passed=p.passed[lesson.id],scored=lesson.items.filter(x=>x.scorable).length;return `<button class="lesson-card ${passed?'passed':''} ${unlocked?'':'locked'}" type="button" data-source-lesson="${i}" ${unlocked?'':'disabled'}><span class="lesson-card-no">บท ${i+1}</span><strong>${escapeHtml(lesson.topic)}</strong><p>${escapeHtml(lesson.guide.basic)}</p><div class="lesson-card-meta"><span>${passed?`ผ่านแล้ว · ${passed.bestPercent}%`:unlocked?'พร้อมเรียน':'ล็อก'}</span><span>ตัวอย่าง ${lesson.items.length} · ตรวจได้ ${scored}</span></div></button>`}).join('');
  $('#sourceLessonGrid').querySelectorAll('[data-source-lesson]').forEach(b=>b.addEventListener('click',()=>openSourceLesson(category,Number(b.dataset.sourceLesson))));
}
function sourceLessonExample(entry){
  const item=entry.item, correct=sourceItemScorable(item)?sourceCorrectDisplay(item):'';
  return `<article class="lesson-example"><div class="lesson-example-source">${escapeHtml(entry.set.title)} · ข้อ ${item.originSourceNo||item.sourceNo}</div><div class="lesson-example-question">${escapeHtml(item.q)}</div>${correct?`<div class="lesson-example-answer"><strong>เฉลย:</strong> ${escapeHtml(correct)}</div>`:''}</article>`;
}
function openSourceLesson(category,index){
  if(!sourceLessonUnlocked(category,index))return; const lesson=buildSourceLessonCatalog(category)[index]; if(!lesson)return;
  sourceStudyState.currentLesson[category]=index; state.lastActivity={kind:'source-lesson',category,index}; persist(); persistSourceStudy(); updateSourceLessonHeader(category);
  $('#sourceLessonCatalogPanel').hidden=true; $('#sourceLessonDetailPanel').hidden=false;
  const p=sourceLessonProgress(category),passed=p.passed[lesson.id],attempt=sourceStudyState.lessonAttempts[category];
  const examples=lesson.items.slice(0,3);
  $('#sourceLessonDetailPanel').innerHTML=`<button class="text-btn source-lesson-back-list" type="button">← กลับรายการบทเรียน</button><div class="lesson-detail-head"><div><span class="lesson-card-no">บท ${index+1}</span><h2>${escapeHtml(lesson.topic)}</h2><p>${escapeHtml(lesson.guide.basic)}</p></div><div class="lesson-state-badge ${passed?'passed':''}">${passed?`ผ่าน ${passed.bestPercent}%`:'ต้องผ่าน 80%'}</div></div><div class="lesson-core-grid"><div class="lesson-core-card"><span>หลักที่ควรจำ</span><code>${escapeHtml(lesson.guide.pattern)}</code></div><div class="lesson-core-card"><span>ทริกทำข้อสอบ</span><strong>${escapeHtml(lesson.guide.tip)}</strong></div></div><section class="lesson-examples-section"><div class="lesson-subhead"><div><h3>ตัวอย่างจากโจทย์ต้นฉบับ</h3><p>ไม่มีโจทย์เสริมถูกนำมาใช้</p></div></div><div class="lesson-examples">${examples.map(sourceLessonExample).join('')}</div></section><section class="lesson-checkpoint"><div><h3>แบบทดสอบท้ายบท</h3><p>สุ่มจากข้อในเอกสารต้นฉบับของหัวข้อนี้เท่านั้น ต้องได้อย่างน้อย 80% เพื่อปลดล็อกบทถัดไป</p></div>${attempt&&attempt.category===category&&attempt.lessonId===lesson.id?'':'<button class="primary-btn start-source-lesson-quiz" type="button">เริ่มแบบทดสอบท้ายบท</button>'}</section><div id="sourceLessonQuizArea">${attempt&&attempt.category===category&&attempt.lessonId===lesson.id?sourceLessonQuizHtml(category,index,lesson,attempt):''}</div>`;
  $('#sourceLessonDetailPanel').querySelector('.source-lesson-back-list').addEventListener('click',()=>renderSourceLessonCatalog(category));
  $('#sourceLessonDetailPanel').querySelector('.start-source-lesson-quiz')?.addEventListener('click',()=>startSourceLessonQuiz(category,index));
  wireSourceLessonQuiz(category,index);
}
function startSourceLessonQuiz(category,index){
  const lesson=buildSourceLessonCatalog(category)[index],p=sourceLessonProgress(category); const eligible=lesson.items.filter(x=>x.scorable); const recent=new Set(p.recent[lesson.id]||[]); let pool=[...shuffleCopy(eligible.filter(x=>!recent.has(x.id))),...shuffleCopy(eligible.filter(x=>recent.has(x.id)))]; const picked=pool.slice(0,Math.min(5,pool.length));
  sourceStudyState.lessonAttempts[category]={category,lessonId:lesson.id,lessonIndex:index,itemIds:picked.map(x=>x.id),answers:{},checked:false}; persistSourceStudy(); openSourceLesson(category,index);
}
function sourceLessonEntry(lesson,id){return lesson.items.find(x=>x.id===id);}
function sourceLessonQuizHtml(category,index,lesson,attempt){
  const entries=attempt.itemIds.map(id=>sourceLessonEntry(lesson,id)).filter(Boolean),answered=Object.keys(attempt.answers).length,checked=attempt.checked; let score=0;if(checked)entries.forEach(e=>{if(sourceAnswerCorrect(e.item,attempt.answers[e.id]))score++;});const pct=entries.length?Math.round(score/entries.length*100):0;
  const cards=entries.map((e,i)=>{const item=e.item,selected=attempt.answers[e.id]||'',isMcq=Array.isArray(item.options)&&item.options.length,correct=checked?sourceAnswerCorrect(item,selected):null;let controls='';if(isMcq)controls=`<div class="lesson-quiz-options">${item.options.map((o,ix)=>{const l=letters[ix];let c='lesson-quiz-option';if(selected===l)c+=' selected';if(checked&&l===item.key)c+=' correct';if(checked&&selected===l&&l!==item.key)c+=' wrong';return `<button type="button" class="${c}" data-source-lesson-item="${escapeHtml(e.id)}" data-choice="${l}" ${checked?'disabled':''}><span>${l}</span><strong>${escapeHtml(o)}</strong></button>`}).join('')}</div>`;else controls=`<label class="source-text-answer"><span>คำตอบ</span><input data-source-lesson-input="${escapeHtml(e.id)}" value="${escapeHtml(selected)}" ${checked?'disabled':''}></label>`;const fb=checked?`<div class="lesson-mini-feedback ${correct?'good':'bad'}"><strong>${correct?'ถูก':'เฉลย: '+escapeHtml(sourceCorrectDisplay(item))}</strong><p>${escapeHtml(SOURCE_LESSON_GUIDES[lesson.topic]?.tip||lesson.guide.tip)}</p></div>`:'';return `<article class="lesson-quiz-card ${checked?(correct?'good':'bad'):''}"><div class="lesson-quiz-top"><span>ข้อ ${i+1}</span><small>${escapeHtml(e.set.title)} · ข้อ ${item.sourceNo}</small></div><p>${escapeHtml(item.q)}</p>${controls}${fb}</article>`}).join('');
  const complete=answered===entries.length&&entries.length>0,result=checked?`<div class="lesson-quiz-result ${pct>=80?'pass':'fail'}"><strong>${pct>=80?'ผ่านบทเรียน':'ยังไม่ผ่าน'}</strong><span>${score}/${entries.length} · ${pct}%</span></div>`:'';const actions=checked?`<div class="lesson-quiz-actions"><button class="secondary-btn source-lesson-retry" type="button">ทำใหม่</button>${pct>=80&&index+1<buildSourceLessonCatalog(category).length?'<button class="primary-btn source-lesson-next" type="button">ไปบทถัดไป →</button>':'<button class="secondary-btn source-lesson-list" type="button">กลับรายการบทเรียน</button>'}</div>`:`<div class="lesson-quiz-actions"><span>ตอบแล้ว ${answered}/${entries.length}</span><button class="primary-btn source-lesson-submit" type="button" ${complete?'':'disabled'}>ตรวจแบบทดสอบ</button></div>`;
  return `<div class="lesson-quiz-shell"><div class="lesson-quiz-heading"><div><h3>ทดสอบ: ${escapeHtml(lesson.topic)}</h3><p>เกณฑ์ผ่าน 80%</p></div><span>${answered}/${entries.length}</span></div>${result}<div class="lesson-quiz-list">${cards}</div>${actions}</div>`;
}
function wireSourceLessonQuiz(category,index){
  const area=$('#sourceLessonQuizArea');if(!area)return;
  area.querySelectorAll('[data-source-lesson-item]').forEach(b=>b.addEventListener('click',()=>{const a=sourceStudyState.lessonAttempts[category];if(a&&!a.checked){a.answers[b.dataset.sourceLessonItem]=b.dataset.choice;persistSourceStudy();openSourceLesson(category,index);}}));
  area.querySelectorAll('[data-source-lesson-input]').forEach(inp=>inp.addEventListener('input',()=>{const a=sourceStudyState.lessonAttempts[category];if(a&&!a.checked){a.answers[inp.dataset.sourceLessonInput]=inp.value;persistSourceStudy();const submit=area.querySelector('.source-lesson-submit');if(submit){const lesson=buildSourceLessonCatalog(category)[index];const entries=a.itemIds.map(id=>sourceLessonEntry(lesson,id)).filter(Boolean);submit.disabled=Object.keys(a.answers).length<entries.length;const counter=area.querySelector('.lesson-quiz-heading>span');if(counter)counter.textContent=`${Object.keys(a.answers).length}/${entries.length}`;}}}));
  area.querySelector('.source-lesson-submit')?.addEventListener('click',()=>checkSourceLessonQuiz(category,index));
  area.querySelector('.source-lesson-retry')?.addEventListener('click',()=>startSourceLessonQuiz(category,index));
  area.querySelector('.source-lesson-list')?.addEventListener('click',()=>renderSourceLessonCatalog(category));
  area.querySelector('.source-lesson-next')?.addEventListener('click',()=>openSourceLesson(category,index+1));
}
function checkSourceLessonQuiz(category,index){
  const lesson=buildSourceLessonCatalog(category)[index],attempt=sourceStudyState.lessonAttempts[category];if(!lesson||!attempt||attempt.checked)return;const entries=attempt.itemIds.map(id=>sourceLessonEntry(lesson,id)).filter(Boolean);if(Object.keys(attempt.answers).length<entries.length)return;let score=0;entries.forEach(e=>{if(sourceAnswerCorrect(e.item,attempt.answers[e.id]))score++;});const pct=Math.round(score/entries.length*100);attempt.checked=true;attempt.score=score;attempt.percent=pct;const p=sourceLessonProgress(category),meta=p.attempts[lesson.id]||{count:0,bestPercent:0};meta.count++;meta.bestPercent=Math.max(meta.bestPercent,pct);meta.lastPercent=pct;p.attempts[lesson.id]=meta;p.recent[lesson.id]=[...new Set([...attempt.itemIds,...(p.recent[lesson.id]||[])])].slice(0,Math.max(10,lesson.items.length));if(pct>=80){const old=p.passed[lesson.id];p.passed[lesson.id]={bestPercent:Math.max(old?.bestPercent||0,pct),passedAt:old?.passedAt||Date.now()};}persistSourceStudy();openSourceLesson(category,index);
}

// Add origin labels to random source cards and richer learning feedback using the same grammar analyzer as A1–A2.
const _sourceFeedbackHtml=sourceFeedbackHtml;
sourceFeedbackHtml=function(item,selected,set){
  if(!sourceItemScorable(item)) return _sourceFeedbackHtml(item,selected,set);
  const correct=sourceAnswerCorrect(item,selected),correctLabel=sourceCorrectDisplay(item),isMcq=Array.isArray(item.options)&&item.options.length;
  const correctText=isMcq?(item.options[letters.indexOf(item.key)]||''):String(item.key||'');
  const selectedText=isMcq&&selected?(item.options[letters.indexOf(selected)]||''):String(selected||'');
  const guide=lessonGuide('',item.q,correctText),correctMeaning=sourceVocabThai(correctText),selectedMeaning=sourceVocabThai(selectedText);
  const filled=fillCorrectAnswer(item.q,correctText); let structure='';
  if(isMcq){const fake={data:{q:item.q,options:item.options}};structure=sentenceStructureHtml(fake,correctText,guide);}
  return `<div class="source-feedback ${correct?'good':'bad'} detailed-source-feedback"><div class="feedback-result-row"><span class="result-status ${correct?'good':'bad'}">${correct?'ตอบถูก':'ตอบผิด'}</span><div class="answer-compare"><div><span>คำตอบของคุณ</span><strong class="${correct?'answer-text-correct':'answer-text-wrong'}">${escapeHtml(selectedText||'—')}</strong>${selectedMeaning?`<small>${escapeHtml(selectedMeaning)}</small>`:''}</div><div><span>เฉลย</span><strong class="answer-text-correct">${escapeHtml(correctLabel)}</strong>${correctMeaning?`<small>${escapeHtml(correctMeaning)}</small>`:''}</div></div></div><div class="lesson-section question-focus"><h4>ประโยคหลังเติมคำตอบ</h4><p class="lesson-question">${escapeHtml(item.q)}</p><div class="correct-translation"><div class="en">${escapeHtml(filled)}</div>${correctMeaning?`<div class="th translation-correct">คำ/วลีคำตอบ: ${escapeHtml(correctMeaning)}</div>`:''}</div></div><div class="lesson-grid"><div class="lesson-section"><h4>หลักที่ข้อนี้กำลังทดสอบ</h4><strong class="lesson-topic">${escapeHtml(guide.topic)}</strong><p>${escapeHtml(guide.basic)}</p></div><div class="lesson-section pattern-box"><h4>รูปประโยคที่ควรจำ</h4><code>${escapeHtml(guide.pattern)}</code><p><strong>ทริก:</strong> ${escapeHtml(guide.tip)}</p></div></div>${!correct&&selected?`<div class="lesson-section your-mistake"><h4>ทำไมตัวเลือกนี้จึงไม่เหมาะ</h4><p>${escapeHtml(choiceDiagnostic(guide,selectedText,correctText))}</p></div>`:''}${structure}<small>${item.answerSource==='transcript-derived'?'เฉลยนี้อนุมานจาก transcript ในต้นฉบับ':'อ้างอิง Official KEY'}</small></div>`;
};

// Collection controls
function updateSourceStudyControls(category=state.sourceCategory){
  const saved=sourceStudyState.random[category];
  const attemptKey=saved?sourceAttemptKey(category,saved.id):'';
  const hasSaved=!!(saved && state.sourceAnswers[attemptKey] && Object.keys(state.sourceAnswers[attemptKey]).length);
  $('#sourceRandomStart').textContent=hasSaved?'ทำต่อชุดสุ่ม':'สุ่มคำถาม';
  $('#sourceRandomNew').hidden=!saved;
}
const _showCollectionForStudy=showCollection;
showCollection=function(category){const out=_showCollectionForStudy(category);updateSourceStudyControls(category);return out;};
$('#sourceRandomStart').addEventListener('click',()=>{const saved=sourceStudyState.random[state.sourceCategory];const attemptKey=saved?sourceAttemptKey(state.sourceCategory,saved.id):'';const hasSaved=!!(saved&&state.sourceAnswers[attemptKey]&&Object.keys(state.sourceAnswers[attemptKey]).length);startSourceRandom(state.sourceCategory,!hasSaved);});
$('#sourceRandomNew').addEventListener('click',()=>startSourceRandom(state.sourceCategory,true));
$('#sourceLessonsOpen').addEventListener('click',()=>showSourceLessons(state.sourceCategory));
$('#sourceVocabularyOpen').addEventListener('click',()=>showSourceVocabulary(state.sourceCategory));
$('#sourceLessonBack').addEventListener('click',()=>showCollection(state.sourceCategory));
$('#sourceVocabBack').addEventListener('click',()=>showCollection(state.sourceCategory));
$('#sourceVocabSearch').addEventListener('input',renderSourceVocabulary);
$('#sourceVocabSort').addEventListener('change',renderSourceVocabulary);

// Keep the random set usable after a refresh if the user was in it.
if(state.sourceSetId&&String(state.sourceSetId).startsWith('__random__')&&sourceStudyState.random[state.sourceCategory]){
  // Nothing to render automatically; the persisted set is available when opened again.
}


// Full A1–A2-style learning feedback for every imported category.
function sourceLearningRecord(item,set){
  if(typeof extendedLearningData==='undefined') return {};
  const category=state.sourceCategory;
  const setId=item.originSetId||set.id;
  const sourceNo=item.originSourceNo||item.sourceNo;
  return extendedLearningData?.[category]?.[setId]?.items?.[String(sourceNo)]||{};
}
function sourceChoiceReason(guide,label,correctLabel,category){
  if(category==='reading'||category==='listening') return `เมื่อนำความหมายของ “${label}” กลับไปเทียบกับคำถามและบริบท จะไม่ตรงหลักฐานหรือเจตนาที่โจทย์ต้องการมากเท่า “${correctLabel}”`;
  return choiceDiagnostic(guide,label,correctLabel);
}
function sourceOptionsLearningHtml(item,selected,set,guide,record){
  if(!Array.isArray(item.options)||!item.options.length) return '';
  const hasKey=sourceItemScorable(item);
  return `<div class="lesson-section option-analysis"><h4>6. วิเคราะห์ทุกตัวเลือก</h4><div class="option-analysis-list">${item.options.map((label,i)=>{
    const letter=letters[i],info=record.options?.[letter]||{},isCorrect=hasKey&&letter===item.key,isSelected=letter===selected;
    const tone=isCorrect?'correct-choice':(hasKey&&isSelected?'wrong-choice':'');
    const reason=!hasKey?'ยังไม่มี KEY ทางการ จึงแสดงเฉพาะความหมายโดยไม่ตัดสินถูกผิด':isCorrect?`ตัวเลือกนี้ทำให้รูปประโยค/ความหมายสอดคล้องกับโจทย์: ${guide.basic}`:sourceChoiceReason(guide,label,item.options[letters.indexOf(item.key)]||'',state.sourceCategory);
    return `<article class="option-analysis-item ${tone}"><div class="option-analysis-head"><strong>${letter}. ${escapeHtml(label)}</strong>${isCorrect?'<span>คำตอบถูก</span>':isSelected&&hasKey?'<span>คำตอบที่เลือก</span>':''}</div><p><b>ความหมาย:</b> ${escapeHtml(info.meaning||'—')}</p>${info.filled&&info.filled!==item.q?`<div class="option-sentence"><div class="en">${escapeHtml(info.filled)}</div><div class="th">${escapeHtml(info.thai||'')}</div></div>`:`<p><b>เมื่อนำมาตอบ:</b> ${escapeHtml(info.thai||info.meaning||'—')}</p>`}<p><b>${hasKey?'เหตุผล':'สถานะ'}:</b> ${escapeHtml(reason)}</p></article>`;
  }).join('')}</div></div>`;
}

sourceFeedbackHtml=function(item,selected,set){
  const record=sourceLearningRecord(item,set);
  const scorable=sourceItemScorable(item),isMcq=Array.isArray(item.options)&&item.options.length>0;
  if(!scorable){
    const selectedText=isMcq&&selected?item.options[letters.indexOf(selected)]||'':String(selected||'');
    const selectedInfo=isMcq&&selected?record.options?.[selected]||{}:{};
    return `<div class="source-feedback neutral detailed-source-feedback"><div class="feedback-result-row"><span class="result-status unanswered">ไม่มี KEY ทางการ</span><div class="answer-compare"><div><span>คำตอบของคุณ</span><strong>${escapeHtml(selectedText||'—')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>สถานะ</span><strong>ไม่เดาเฉลยแทนต้นฉบับ</strong></div></div></div><div class="lesson-section question-focus"><h4>โจทย์ + คำแปลช่วยเรียน</h4><p class="lesson-question">${escapeHtml(item.q)}</p>${record.qThai?`<p class="source-question-thai">${escapeHtml(record.qThai)}</p>`:''}</div>${sourceOptionsLearningHtml(item,selected,set,{basic:'',topic:'',pattern:'',tip:''},record)}<div class="memory-tip"><strong>ทริก</strong> อ่านคำถามก่อน แล้วตัดตัวเลือกจากหลักฐานที่ได้ยิน/อ่านจริง โดยไม่ให้ระบบสร้างคำตอบที่เอกสารไม่ได้ยืนยัน</div></div>`;
  }
  const correct=sourceAnswerCorrect(item,selected);
  const correctText=isMcq?(item.options[letters.indexOf(item.key)]||''):String(item.key||'');
  const selectedText=isMcq&&selected?(item.options[letters.indexOf(selected)]||''):String(selected||'');
  const correctInfo=isMcq?(record.options?.[item.key]||{}):{meaning:record.answerThai||'',filled:fillCorrectAnswer(item.q,correctText),thai:''};
  const selectedInfo=isMcq&&selected?(record.options?.[selected]||{}):{};
  const guide=lessonGuide('',item.q,correctText);
  const correctSentence=correctInfo.filled||fillCorrectAnswer(item.q,correctText);
  const selectedSentence=selectedInfo.filled||fillCorrectAnswer(item.q,selectedText);
  const sourceText=item.answerSource==='transcript-derived'?'เฉลยนี้อนุมานจาก transcript ในเอกสารต้นฉบับ ไม่ใช่ Official KEY':'อ้างอิง Official KEY';
  let structure='';
  if(isMcq){const fake={data:{q:item.q,options:item.options}};structure=sentenceStructureHtml(fake,correctText,guide);}
  return `<div class="source-feedback ${correct?'good':'bad'} detailed-source-feedback">
    <div class="feedback-result-row"><span class="result-status ${correct?'good':'bad'}">${correct?'ตอบถูก':'ตอบผิด'}</span><div class="answer-compare"><div><span>คำตอบของคุณ</span><strong class="${correct?'answer-text-correct':'answer-text-wrong'}">${escapeHtml(selectedText||'—')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>เฉลยที่ถูกต้อง</span><strong class="answer-text-correct">${escapeHtml(sourceCorrectDisplay(item))}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div></div></div>
    <div class="lesson-section question-focus"><h4>1. โจทย์และคำแปล</h4><p class="lesson-question">${escapeHtml(item.q)}</p>${record.qThai?`<p class="source-question-thai">${escapeHtml(record.qThai)}</p>`:''}<div class="correct-translation"><span class="label">คำตอบที่ถูกเมื่ออยู่ในโจทย์</span><div class="en">${escapeHtml(correctSentence)}</div>${correctInfo.thai?`<div class="th translation-correct">${escapeHtml(correctInfo.thai)}</div>`:''}</div></div>
    <div class="lesson-section"><h4>2. ทำไมคำตอบนี้ถึงถูก</h4><p><strong>${escapeHtml(correctText)}</strong>${correctInfo.meaning?` = ${escapeHtml(correctInfo.meaning)}`:''}</p><p>${escapeHtml(guide.basic)}</p></div>
    <div class="lesson-grid"><div class="lesson-section"><h4>3. หลักที่กำลังทดสอบ</h4><strong class="lesson-topic">${escapeHtml(guide.topic)}</strong><p>${escapeHtml(guide.basic)}</p></div><div class="lesson-section pattern-box"><h4>4. รูปประโยค/วิธีคิด</h4><code>${escapeHtml(guide.pattern)}</code><p><b>วิธีสังเกต:</b> ${escapeHtml(guide.tip)}</p></div></div>
    ${!correct&&selected?`<div class="lesson-section your-mistake"><h4>5. คำตอบที่เลือกหมายถึงอะไร และผิดตรงไหน</h4><p>คุณเลือก <strong>${escapeHtml(selectedText)}</strong>${selectedInfo.meaning?` = <strong>${escapeHtml(selectedInfo.meaning)}</strong>`:''}</p>${selectedSentence!==item.q?`<div class="option-sentence"><div class="en">${escapeHtml(selectedSentence)}</div><div class="th translation-wrong">${escapeHtml(selectedInfo.thai||'')}</div></div>`:''}<p>${escapeHtml(sourceChoiceReason(guide,selectedText,correctText,state.sourceCategory))}</p></div>`:`<div class="lesson-section success-review"><h4>5. แม้ตอบถูกก็ทบทวนเหตุผล</h4><p>จำทั้งความหมาย รูปประโยค และคำสัญญาณ ไม่จำแค่ตัวอักษรคำตอบ</p></div>`}
    ${sourceOptionsLearningHtml(item,selected,set,guide,record)}
    <div class="memory-tip"><strong>7. ทริกจำสำหรับข้อนี้</strong>${escapeHtml(guide.tip)} อ่านโจทย์และคำตอบที่ถูกออกเสียง 2–3 รอบ แล้วจำเป็นวลีหรือสถานการณ์ทั้งก้อน</div>
    ${structure}
    <small>${escapeHtml(sourceText)}</small>
  </div>`;
};

const _sourcePassageHtmlLearning=sourcePassageHtml;
sourcePassageHtml=function(passage){
  let thai=passage.thai||'';
  if(!thai&&typeof extendedLearningData!=='undefined'){
    const setId=state.sourceSetId||'';
    thai=extendedLearningData?.[state.sourceCategory]?.[setId]?.passages?.find(p=>p.from===passage.from)?.thai||'';
  }
  const base=_sourcePassageHtmlLearning(passage);
  if(!thai)return base;
  return base.replace('</aside>',`<details class="source-passage-translation"><summary>ดูคำแปลไทยของบทอ่าน</summary><p>${escapeHtml(thai)}</p></details></aside>`);
};
