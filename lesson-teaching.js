// Deep lesson teaching layer for every CEFR category.
// Correct-answer authority still comes from the imported KEY / transcript-derived status.

const LT_SIGNAL_RULES = [
  [/\bsince\b/i,'since = จุดเริ่มเวลา'],[/\bfor\b/i,'for = ระยะเวลา'],[/\byesterday\b|\blast\s+(night|week|year|month)\b|\bago\b/i,'คำบอกอดีต → มองหา Past'],
  [/\bright now\b|\bnow\b|\blook!|\blisten!/i,'กำลังเกิดตอนนี้ → Continuous'],[/\balready\b|\byet\b|\bso far\b|\bever\b|\bnever\b/i,'สัญญาณของ Perfect'],
  [/\bthan\b/i,'than → Comparative'],[/\bthe most\b|\bthe least\b/i,'the most / least → Superlative'],[/\bif\b/i,'if → ตรวจชนิด Conditional'],
  [/\bdo\b|\bdoes\b|\bdid\b/i,'do / does / did → กริยาหลักกลับเป็น V1'],[/\bcan\b|\bcould\b|\bwill\b|\bwould\b|\bmay\b|\bmight\b|\bmust\b|\bshould\b/i,'Modal → ตามด้วย V1'],
  [/\bmake\b|\bmade\b/i,'make / made + object → ตรวจรูปกริยาหลังกรรม'],[/\bwhat\b|\bwhere\b|\bwhen\b|\bwhy\b|\bhow\b|\bwho\b/i,'Question word → ดูว่ากำลังถามข้อมูลชนิดใด'],
  [/\bhowever\b|\bbut\b|\balthough\b|\bthough\b/i,'คำเชื่อมขัดแย้ง → ข้อมูลหลังคำเชื่อมมักสำคัญ'],[/\bbecause\b|\bsince\b|\bso\b/i,'คำเชื่อมเหตุผล/ผลลัพธ์'],
  [/\bnot\b|\bnever\b|\bno\b/i,'มีคำปฏิเสธ → ระวังความหมายกลับด้าน']
];

function ltSignals(text, topic=''){
  const found=[];
  LT_SIGNAL_RULES.forEach(([re,label])=>{ if(re.test(String(text||'')) && !found.includes(label)) found.push(label); });
  if(!found.length){
    if(/preposition|collocation|phrasal/i.test(topic)) found.push('ดูคำที่ใช้คู่กันเป็นวลี ไม่แปลแยกคำ');
    else if(/noun|pronoun|determiner|คำนาม|ความเป็นเจ้าของ|article|a \/ an/i.test(topic)) found.push('ดูคำนามหลังช่องว่างและหน้าที่ของคำในประโยค');
    else if(/adjective|comparison|comparative|superlative|คำคุณศัพท์/i.test(topic)) found.push('ดูตำแหน่งคำและสิ่งที่กำลังเปรียบเทียบ');
    else found.push('อ่านคำก่อน–หลังช่องว่างและดูความหมายของทั้งประโยค');
  }
  return found.slice(0,5);
}

function ltIntent(question, category='a1a2'){
  const q=String(question||'').toLowerCase();
  if(/what does .* imply|what .* imply|what does .* mean|what .* mean/.test(q)) return 'ถามความหมายแฝงหรือเจตนา ต้องสรุปจากสิ่งที่พูด ไม่ใช่หาแค่คำที่เหมือนกัน';
  if(/what can be inferred|infer|conclusion|likely/.test(q)) return 'ถาม Inference/ข้อสรุป ต้องเลือกสิ่งที่อนุมานได้จากหลักฐาน โดยไม่เติมข้อมูลเกินข้อความ';
  if(/^why\b| why /.test(q)) return 'ถามเหตุผล ให้หา because / reason / เหตุที่ทำให้เกิดการตัดสินใจหรือเหตุการณ์';
  if(/^where\b| where /.test(q)) return 'ถามสถานที่ ให้หา clue ของสถานที่ เช่น สิ่งของ กิจกรรม หรือคำศัพท์เฉพาะสถานการณ์';
  if(/^when\b|what time|how long/.test(q)) return 'ถามเวลา/ระยะเวลา ให้โฟกัสตัวเลข หน่วยเวลา และคำบอกเวลา';
  if(/^who\b|profession|occupation|position|job/.test(q)) return 'ถามบุคคล/อาชีพ ให้ดูหน้าที่ งานที่ทำ และสถานที่ทำงาน';
  if(/how many|how much/.test(q)) return 'ถามจำนวนหรือปริมาณ ให้คาดก่อนว่าคำตอบต้องเป็นตัวเลข จำนวน หรือราคา';
  if(/_{2,}/.test(question)) return 'เป็นโจทย์เติมคำ: ต้องให้ทั้งรูปไวยากรณ์และความหมายของประโยคถูกพร้อมกัน';
  if(category==='listening') return 'ฟังใจความและรายละเอียดที่ตอบคำถามนี้โดยตรง พร้อมระวังคำลวงที่พูดถึงแต่ไม่ใช่คำตอบสุดท้าย';
  if(category==='reading') return 'อ่านหาหลักฐานที่ตอบคำถามตรงที่สุด แล้วตัดตัวเลือกที่เกินข้อความหรือเปลี่ยนความหมาย';
  return 'หาหน้าที่ของช่องว่างก่อน แล้วเลือกคำที่ทั้งรูปและความหมายเข้ากับประโยค';
}

function ltProfile(topic, guide, category='a1a2'){
  const t=String(topic||'');
  let steps=[
    'อ่านทั้งประโยคหนึ่งรอบเพื่อรู้ความหมายคร่าว ๆ ก่อนดูตัวเลือก',
    'ดูคำก่อน–หลังช่องว่างหรือคำถาม เพื่อหาสัญญาณว่าต้องการคำชนิดใด/ข้อมูลชนิดใด',
    'ตัดตัวเลือกที่ผิดรูป ผิด tense ผิดหน้าที่คำ หรือขัดกับหลักฐานออกก่อน',
    'เปรียบเทียบตัวเลือกที่เหลือด้วยความหมาย Collocation และบริบท',
    'นำคำตอบกลับไปใส่ แล้วอ่าน/แปลทั้งประโยคอีกครั้งเพื่อยืนยัน'
  ];
  let eliminate=['ตัดข้อที่ผิดไวยากรณ์ชัดเจนก่อน','ตัดข้อที่ความหมายไม่ตอบคำถาม','ถ้าเหลือ 2 ข้อ ให้กลับไปดูคำสัญญาณและบริบท'];
  let extra=['V1 = กริยารูปพื้นฐาน','V2 = กริยาช่อง 2','V3 = กริยาช่อง 3','V-ing = กริยาเติม -ing'];
  if(category==='reading' || /Reading:/.test(t)){
    steps=['อ่านคำถามก่อน เพื่อรู้ว่าต้องหา Fact, Meaning, Intention หรือ Inference','ขีดคำสำคัญในคำถาม แล้วหา paraphrase ในข้อความ','อ่านประโยคก่อนหน้าและถัดไป ไม่จับ keyword เพียงคำเดียว','ตัดตัวเลือกที่ข้อความไม่รองรับ หรือพูดแรง/กว้างเกินหลักฐาน','เลือกข้อที่อธิบายข้อความได้ครบที่สุด แล้วตรวจว่ามีหลักฐานชี้กลับได้'];
    eliminate=['ตัดข้อที่เพิ่มข้อมูลใหม่ซึ่งข้อความไม่ได้บอก','ตัดข้อที่ใช้คำเหมือนข้อความแต่เปลี่ยนความสัมพันธ์หรือเจตนา','ระวังคำ absolute เช่น always / never / completely ถ้าข้อความไม่ได้ยืนยันแรงขนาดนั้น'];
    extra=['Fact = สิ่งที่ข้อความบอกตรง ๆ','Inference = สิ่งที่สรุปได้จากหลักฐาน','Intention = ผู้พูด/ผู้เขียนต้องการทำอะไร','Paraphrase = ความหมายเดิมแต่ใช้คำต่างกัน'];
  }
  if(category==='listening' || /Listening:/.test(t)){
    steps=['อ่านคำถามและตัวเลือกก่อนกดฟัง เพื่อคาดว่าต้องฟัง “คน/สถานที่/เวลา/เหตุผล/ใจความ”','ฟังรอบแรกหาใจความรวม ไม่ต้องหยุดเพราะพลาดคำเดียว','ฟังคำเปลี่ยนทิศ เช่น but, actually, however, instead เพราะคำตอบจริงอาจมาตอนหลัง','ตัดตัวเลือกที่ถูกพูดถึงแต่ถูกแก้ไข/ปฏิเสธภายหลัง','ฟังรอบยืนยันเฉพาะช่วงที่เกี่ยวข้อง แล้วเลือกคำตอบที่ตรงกับการตัดสินใจหรือข้อมูลสุดท้าย'];
    eliminate=['ตัวเลือกที่ได้ยินจริงอาจเป็น distractor ถ้าผู้พูดแก้ข้อมูลทีหลัง','ตัวเลข/เวลาแรกที่ได้ยินไม่จำเป็นต้องเป็นคำตอบ ให้ฟังว่ามีการเปลี่ยนหรือไม่','ตัดข้อที่เป็นคน/สถานที่/เหตุผลคนละชนิดกับคำถาม'];
    extra=['Distractor = ตัวลวงที่ถูกพูดถึงแต่ไม่ใช่คำตอบ','Paraphrase = เสียงอาจไม่ใช้คำเดียวกับตัวเลือก','Gist = ใจความรวม','Detail = รายละเอียดเฉพาะ เช่น เวลา ราคา จำนวน'];
  } else if(/tense|Past Simple|Present Perfect|Continuous/i.test(t)){
    eliminate=['ตัดรูปกริยาที่ไม่สัมพันธ์กับคำบอกเวลา','ตรวจ auxiliary ว่าบังคับ V1 / V3 / V-ing หรือไม่','ถ้ามี since/for ให้แยก “จุดเริ่ม” กับ “ระยะเวลา”'];
  } else if(/Verb patterns|Modal|Infinitive|Gerund|make \+|Subjunctive|Passive/i.test(t)){
    eliminate=['ดูคำก่อนช่องว่างก่อน เพราะมักบังคับรูปกริยาที่ตามมา','ตัดรูปที่มี to / -ing / V2 / V3 ไม่ตรง Pattern','เมื่อเหลือรูปเดียวที่ตรงสูตร ค่อยตรวจความหมายซ้ำ'];
  } else if(/Question|Clause|Do \/ Does|Question word|Question Tag|Conditional/i.test(t)){
    eliminate=['หา auxiliary หรือ question word ก่อน','ตรวจลำดับ Subject + Verb และรูปกริยาหลัง auxiliary','ตัดตัวเลือกที่ polarity/tense ไม่สอดคล้องกับประโยคหลัก'];
  } else if(/Noun|Pronoun|Determiner|คำนาม|ความเป็นเจ้าของ|a \/ an \/ the/i.test(t)){
    eliminate=['ดูว่าหลังช่องว่างมีคำนามหรือไม่','ดูเอกพจน์/พหูพจน์/นับไม่ได้','ดูว่าต้องการเจ้าของ ประธาน กรรม หรือ article'];
  } else if(/Preposition|Collocation|Phrasal|Vocabulary|Comparison|Adjective|คำศัพท์/i.test(t)){
    eliminate=['ตัดข้อที่รูปคำวางตำแหน่งไม่ถูกก่อน','ตรวจคำที่ใช้คู่กันเป็นวลีหรือ collocation','แปลทั้งก้อน ไม่แปล preposition หรือ particle แยกคำ'];
  }
  return {steps,eliminate,extra,pattern:guide?.pattern||'',tip:guide?.tip||'',basic:guide?.basic||''};
}

function ltRelatedVocab(text, category='a1a2'){
  const bank=category==='a1a2'?(typeof vocabularyData!=='undefined'?vocabularyData:[]):(typeof extendedVocabularyData!=='undefined'?(extendedVocabularyData[category]||[]):[]);
  const hay=String(text||'').toLowerCase();
  return bank.filter(v=>v.term&&hay.includes(String(v.term).toLowerCase())).slice(0,6);
}

function ltVocabHtml(rows){
  if(!rows?.length) return '';
  return `<div class="lesson-vocab-strip"><span>คำ/วลีที่ควรจำจากตัวอย่างนี้</span><div>${rows.map(v=>`<b>${escapeHtml(v.term)} <small>= ${escapeHtml(v.thai||'')}</small></b>`).join('')}</div></div>`;
}

function ltLessonMethodHtml(topic,guide,category){
  const p=ltProfile(topic,guide,category);
  return `<section class="lesson-method-board">
    <div class="lesson-method-title"><span>HOW TO SOLVE</span><h3>วิธีคิดโจทย์บทนี้แบบทีละขั้น</h3><p>เป้าหมายคือรู้ว่า “ทำไมเลือกข้อนี้” ไม่ใช่จำแค่ตัวอักษรคำตอบ</p></div>
    <div class="lesson-method-grid">
      <div class="lesson-method-card"><strong>ลำดับทำข้อสอบ</strong><ol>${p.steps.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></div>
      <div class="lesson-method-card"><strong>วิธีตัดตัวเลือก</strong><ol>${p.eliminate.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></div>
      <div class="lesson-method-card lesson-method-extra"><strong>ส่วนเสริมที่ควรรู้</strong><div class="lesson-extra-chips">${p.extra.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div>
    </div>
  </section>`;
}

function ltA1OptionRows(item,guide){
  const record=learningData?.[item.set]?.[item.q-1]||{};
  const correctLabel=item.options[letters.indexOf(item.key)]||'';
  return item.options.map((label,i)=>{
    const letter=letters[i],info=record.options?.[letter]||{},correct=letter===item.key;
    const reason=correct?(item.explanation||`ตัวเลือกนี้ตรงกับกฎ ${guide.pattern}`):choiceDiagnostic(guide,label,correctLabel);
    const filled=info.filled||fillCorrectAnswer(item.question,label);
    return `<div class="lesson-eliminate-row ${correct?'keep':'drop'}">
      <div class="lesson-eliminate-choice"><strong>${letter}. ${escapeHtml(label||'—')}</strong><span>${correct?'✓ เก็บข้อนี้':'× ตัดออก'}</span></div>
      <div class="lesson-eliminate-meaning"><b>แปล:</b> ${escapeHtml(info.meaning||'—')}</div>
      <div class="lesson-eliminate-sentence"><div>${fillAnswerMarkup(item.question,label,correct?'correct-answer':'wrong-answer')}</div>${info.thai?`<small>${escapeHtml(info.thai)}</small>`:''}</div>
      <p><b>${correct?'เหตุผลที่เลือก':'เหตุผลที่ตัด'}:</b> ${escapeHtml(reason)}</p>
    </div>`;
  }).join('');
}

function ltA1ExampleHtml(item,lesson){
  const correctLabel=item.options[letters.indexOf(item.key)]||'';
  const record=learningData?.[item.set]?.[item.q-1]||{};
  const correctInfo=record.options?.[item.key]||{};
  const guide=lessonGuide(item.explanation||'',item.question,correctLabel);
  const signals=ltSignals(item.question,guide.topic);
  const vocab=ltRelatedVocab(`${item.question} ${correctLabel}`,'a1a2');
  return `<article class="lesson-example lesson-example-deep">
    <div class="lesson-example-source">จาก Set ${item.set} · ข้อ ${item.q} · Official KEY</div>
    <div class="lesson-example-question">${escapeHtml(item.question)}</div>
    <div class="lesson-example-intent"><span>โจทย์กำลังวัดอะไร</span><p>${escapeHtml(ltIntent(item.question,'a1a2'))}</p></div>
    <div class="lesson-answer-focus"><span>คำตอบที่ควรเลือก</span><strong>${item.key}. ${escapeHtml(correctLabel)}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div>
    <div class="lesson-filled-sentence"><span>เมื่อเติมคำตอบเข้าไป</span><div class="en">${fillAnswerMarkup(item.question,correctLabel,'correct-answer')}</div>${correctInfo.thai?`<div class="th">${escapeHtml(correctInfo.thai)}</div>`:''}</div>
    <div class="lesson-reason-box"><h4>ทำไมจึงเลือกข้อนี้</h4><p>${escapeHtml(item.explanation||guide.basic)}</p><code>${escapeHtml(guide.pattern)}</code></div>
    <div class="lesson-signal-box"><strong>คำสัญญาณ/จุดสังเกต</strong><div>${signals.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div><p>${escapeHtml(guide.tip)}</p></div>
    <div class="lesson-eliminate"><h4>ตัดตัวเลือกทีละข้อ</h4>${ltA1OptionRows(item,guide)}</div>
    ${ltVocabHtml(vocab)}
    <div class="lesson-source-note">เฉลยถูก/ผิดอ้างอิง KEY ของชุดฝึก ส่วนคำอธิบายวิธีคิดเป็นคำอธิบายช่วยเรียนเพื่อให้เห็นเหตุผลและวิธีตัดช้อยส์</div>
  </article>`;
}

lessonExampleHtml=function(item,lesson){ return ltA1ExampleHtml(item,lesson); };

renderLessonDetail=function(index){
  updateLessonProgressHeader();
  const lesson=buildLessonCatalog()[index]; if(!lesson)return;
  const progress=ensureLessonProgress(),passed=progress.passed[lesson.id],attemptMeta=progress.attempts[lesson.id];
  const examOnly=lesson.items.filter(x=>x.kind==='exam'),examExamples=examOnly.slice(0,3);
  const active=state.lessonAttempt&&state.lessonAttempt.lessonId===lesson.id?state.lessonAttempt:null;
  const panel=$('#lessonDetailPanel');
  panel.innerHTML=`<button class="text-btn lesson-back-list" type="button">← กลับรายการบทเรียน</button>
    <div class="lesson-detail-head"><div><span class="lesson-card-no">บท ${index+1}</span><h2>${escapeHtml(lesson.topic)}</h2><p>${escapeHtml(lesson.guide.basic)}</p></div><div class="lesson-state-badge ${passed?'passed':''}">${passed?`ผ่าน ${passed.bestPercent}%`:'ต้องผ่าน 80%'}</div></div>
    <div class="lesson-core-grid"><div class="lesson-core-card"><span>รูปที่ควรจำ</span><code>${escapeHtml(lesson.guide.pattern)}</code></div><div class="lesson-core-card"><span>วิธีสังเกต</span><strong>${escapeHtml(lesson.guide.tip)}</strong></div></div>
    ${ltLessonMethodHtml(lesson.topic,lesson.guide,'a1a2')}
    <section class="lesson-examples-section"><div class="lesson-subhead"><div><h3>สอนผ่านตัวอย่างจากโจทย์จริง</h3><p>ทุกตัวอย่างจะแปลคำตอบ เติมกลับในประโยค และตัด A–D ให้ดูทีละข้อ</p></div><span>${examExamples.length} ตัวอย่างละเอียด</span></div><div class="lesson-examples">${examExamples.map(item=>ltA1ExampleHtml(item,lesson)).join('')}</div></section>
    <section class="lesson-checkpoint"><div><h3>แบบทดสอบท้ายบท</h3><p>สุ่มจากโจทย์ต้นฉบับที่เกี่ยวข้องกับบทนี้ ต้องได้อย่างน้อย 80% เพื่อปลดล็อกบทถัดไป หลังตรวจจะมีเหตุผลและวิธีตัดตัวเลือกให้ทบทวน</p>${attemptMeta?`<small>ทำมาแล้ว ${attemptMeta.count} ครั้ง · คะแนนดีที่สุด ${attemptMeta.bestPercent||0}%</small>`:''}</div>${active?'':`<button class="primary-btn start-lesson-quiz" type="button">${passed?'ทบทวนด้วยแบบทดสอบอีกครั้ง':'เริ่มแบบทดสอบท้ายบท'}</button>`}</section>
    <div id="lessonQuizArea">${active?lessonQuizHtml(lesson,active):''}</div>`;
  panel.querySelector('.lesson-back-list').addEventListener('click',renderLessonCatalog);
  panel.querySelector('.start-lesson-quiz')?.addEventListener('click',()=>startLessonQuiz(index));
  wireLessonQuiz(index);
};

function ltA1QuizReview(item,selected,lesson){
  const label=item.options[letters.indexOf(item.key)]||'';
  const chosen=selected?item.options[letters.indexOf(selected)]||'':'';
  const record=learningData?.[item.set]?.[item.q-1]||{};
  const correctInfo=record.options?.[item.key]||{};
  const selectedInfo=selected?record.options?.[selected]||{}:{};
  const guide=lessonGuide(item.explanation||'',item.question,label);
  return `<details class="lesson-quiz-deep-review" open><summary>ดูวิธีคิดและการตัดตัวเลือกแบบละเอียด</summary><div class="lesson-quiz-review-body">
    <div class="lesson-review-compare"><div><span>คุณตอบ</span><strong>${escapeHtml(chosen||'—')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>คำตอบถูก</span><strong>${escapeHtml(label)}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div></div>
    <div class="lesson-filled-sentence"><span>ประโยคที่ถูก</span><div class="en">${fillAnswerMarkup(item.question,label,'correct-answer')}</div>${correctInfo.thai?`<div class="th">${escapeHtml(correctInfo.thai)}</div>`:''}</div>
    <p><b>หลัก:</b> ${escapeHtml(guide.basic)} · <b>Pattern:</b> ${escapeHtml(guide.pattern)}</p>
    <div class="lesson-eliminate compact">${ltA1OptionRows(item,guide)}</div>
  </div></details>`;
}

const ltOriginalLessonQuizHtml=lessonQuizHtml;
lessonQuizHtml=function(lesson,attempt){
  const items=attempt.itemIds.map(id=>lessonItemById(lesson,id)).filter(Boolean);
  const answered=Object.keys(attempt.answers||{}).length,checked=!!attempt.checked;
  const score=checked?items.reduce((sum,item)=>sum+(attempt.answers[item.id]===item.key?1:0),0):0;
  const percent=items.length?Math.round(score/items.length*100):0;
  const result=checked?`<div class="lesson-quiz-result ${percent>=80?'pass':'fail'}"><strong>${percent>=80?'ผ่านบทเรียน':'ยังไม่ผ่าน'}</strong><span>${score}/${items.length} · ${percent}% ${percent>=80?'ปลดล็อกบทถัดไปแล้ว':'ต้องได้อย่างน้อย 80% ลองทำชุดใหม่ได้'}</span></div>`:'';
  const cards=items.map((item,no)=>{
    const selected=attempt.answers[item.id],label=item.options[letters.indexOf(item.key)]||'',source=`Set ${item.set} · ข้อ ${item.q}`;
    const options=item.options.map((text,i)=>{const letter=letters[i];let cls='lesson-quiz-option';if(selected===letter)cls+=' selected';if(checked&&letter===item.key)cls+=' correct';if(checked&&selected===letter&&letter!==item.key)cls+=' wrong';return `<button type="button" class="${cls}" data-lesson-item="${item.id}" data-choice="${letter}" ${checked?'disabled':''}><span>${letter}</span><strong>${escapeHtml(text||'—')}</strong></button>`;}).join('');
    const feedback=checked?`<div class="lesson-mini-feedback ${selected===item.key?'good':'bad'}"><div>${selected===item.key?'ถูก':'เฉลย'}: <strong class="answer-text-correct">${item.key}. ${escapeHtml(label)}</strong></div><p>${escapeHtml(item.explanation||'ใช้กฎเดียวกับบทเรียนนี้')}</p></div>${ltA1QuizReview(item,selected,lesson)}`:'';
    return `<article class="lesson-quiz-card ${checked?(selected===item.key?'good':'bad'):''}"><div class="lesson-quiz-top"><span>ข้อ ${no+1}</span><small>${source}</small></div><p>${escapeHtml(item.question)}</p><div class="lesson-quiz-options">${options}</div>${feedback}</article>`;
  }).join('');
  const complete=answered===items.length&&items.length>0,nextIndex=attempt.lessonIndex+1,hasNext=nextIndex<buildLessonCatalog().length;
  const actions=checked?`<div class="lesson-quiz-actions"><button class="secondary-btn retry-lesson-quiz" type="button">ทำชุดใหม่</button>${percent>=80&&hasNext?'<button class="primary-btn next-lesson-btn" type="button">ไปบทถัดไป →</button>':'<button class="secondary-btn back-lesson-list" type="button">กลับรายการบทเรียน</button>'}</div>`:`<div class="lesson-quiz-actions"><span>ตอบแล้ว ${answered}/${items.length}</span><button class="primary-btn submit-lesson-quiz" type="button" ${complete?'':'disabled'}>ตรวจแบบทดสอบ</button></div>`;
  return `<div class="lesson-quiz-shell"><div class="lesson-quiz-heading"><div><h3>ทดสอบ: ${escapeHtml(lesson.topic)}</h3><p>เกณฑ์ผ่าน 80%</p></div><span>${answered}/${items.length}</span></div>${result}<div class="lesson-quiz-list">${cards}</div>${actions}</div>`;
};

function ltSourceRecord(entry){
  return extendedLearningData?.[state.sourceCategory]?.[entry.set.id]?.items?.[String(entry.item.sourceNo)]||{};
}

function ltSourceGuide(entry,lesson,category){
  const item=entry.item;
  if(category==='reading'||category==='listening') return lesson.guide;
  const correct=(item.options?.length&&letters.includes(item.key))?item.options[letters.indexOf(item.key)]||'':String(item.key||'');
  return lessonGuide('',item.q,correct);
}

function ltRuleFromItem(item,correctLabel){
  const q=String(item.q||item.question||''), lower=q.toLowerCase(), opts=(item.options||[]).map(x=>String(x||'').trim());
  const allPreps=opts.length>1&&opts.every(x=>/^(at|in|on|to|for|from|with|by|of|down|up|into|onto|over|under|through|across|around|between|among|about|after|before|during|without|within|off|out)$/i.test(x));
  const allQWords=opts.length>1&&opts.every(x=>/^(what|where|when|why|who|whom|whose|which|how)$/i.test(x));
  if(allPreps) return {pattern:'Preposition / Collocation',why:`ตัวเลือกทั้งหมดเป็น preposition จึงต้องดู “วลีที่ใช้จริง + ความสัมพันธ์ของความหมาย” ในบริบทนี้ “${correctLabel}” ทำให้ประโยคเป็นธรรมชาติที่สุด ไม่ควรแปล preposition แยกคำแล้วเลือกทันที`,drop:l=>`“${l}” เป็น preposition เหมือนกัน แต่เมื่อนำมาใส่ตำแหน่งนี้ วลี/ความสัมพันธ์ของความหมายไม่ตรงบริบทเท่า “${correctLabel}” จึงตัดออก`};
  if(allQWords) return {pattern:'Question word + information type',why:`ต้องเลือก Question word ให้ตรงกับชนิดข้อมูลที่คำตอบให้มา “${correctLabel}” ถามข้อมูลชนิดเดียวกับคำตอบในบริบท`,drop:l=>`“${l}” ใช้ถามข้อมูลคนละชนิดกับสิ่งที่ประโยคคำตอบกำลังให้ จึงตัดออก`};
  if(/\bdid\b/.test(lower)) return {pattern:'Did + S + V1',why:`เมื่อมี did ความเป็นอดีตอยู่ที่ did แล้ว กริยาหลักจึงใช้รูปพื้นฐาน V1; “${correctLabel}” ตรงรูปที่โครงสร้างต้องการ`,drop:l=>`ตัด “${l}” ถ้าทำให้กริยาหลักไม่เป็น V1 หลัง did หรือทำให้โครงสร้างคำถามผิด`};
  if(/\bdoes\b/.test(lower)) return {pattern:'Does + S + V1',why:`เมื่อใช้ does กับประธานเอกพจน์ กริยาหลักที่ตามมาจะกลับเป็น V1; “${correctLabel}” จึงตรงโครงสร้าง`,drop:l=>`ตัด “${l}” ถ้าเติมแล้วทำให้กริยาหลักมี -s/-ed/-ing ทั้งที่ does รับหน้าที่ผันกริยาแล้ว`};
  if(/\bdo\b/.test(lower)&&/\?/.test(q)) return {pattern:'Do + S + V1',why:`คำถามที่ใช้ do ต้องตามด้วยประธานและกริยารูปพื้นฐาน; “${correctLabel}” ตรงกับหน้าที่ที่ช่องว่างต้องการ`,drop:l=>`ตัด “${l}” ถ้ารูปกริยาไม่ใช่ V1 หรือทำให้ลำดับคำถามผิด`};
  if(/\b(can|could|will|would|may|might|must|should|had better)\b[^?.!]{0,45}_{2,}/i.test(q)) return {pattern:'Modal + V1',why:`หลัง modal verb ใช้กริยารูปพื้นฐานโดยไม่เติม to/-s/-ed; “${correctLabel}” จึงเข้ารูป`,drop:l=>`ตัด “${l}” ถ้าเป็น to + V1, V2, V-ing หรือรูปที่ไม่ใช่ V1 หลัง modal`};
  if(/\b(make|made)\b/i.test(q)&&/_{2,}/.test(q)) return {pattern:'make/made + object + V1',why:`หลัง make/made + คนหรือสิ่ง ใช้กริยารูปพื้นฐานโดยไม่ใส่ to; “${correctLabel}” จึงตรงสูตร`,drop:l=>`ตัด “${l}” ถ้าเป็น to + V1, V2 หรือ V-ing หลัง make/made + object`};
  if(/\b(have|has)\s+been\b/i.test(q)) return {pattern:'have/has been + V-ing',why:`โครงสร้างมี have/has been อยู่แล้ว ช่องว่างจึงต้องเป็น V-ing เพื่อสร้าง Present Perfect Continuous; “${correctLabel}” ตรงรูป`,drop:l=>`ตัด “${l}” ถ้าไม่ใช่ V-ing หลัง have/has been`};
  if(/\b(have|has)\b/i.test(q)&&!(/\bbeen\b/i.test(q))&&/_{2,}/.test(q)) return {pattern:'have/has + V3',why:`Present Perfect ใช้ have/has + V3; “${correctLabel}” ต้องทำให้กริยาเป็น past participle และสัมพันธ์กับคำบอกเวลา`,drop:l=>`ตัด “${l}” ถ้าเป็น V1/V2/V-ing ที่ไม่เข้ากับ have/has + V3`};
  if(/\bthan\b/i.test(q)) return {pattern:'Comparative + than',why:`คำว่า than เป็นสัญญาณว่ากำลังเปรียบเทียบสองสิ่ง จึงต้องใช้ comparative; “${correctLabel}” ทำให้โครงสร้างเปรียบเทียบสมบูรณ์`,drop:l=>`ตัด “${l}” ถ้าเป็นรูปธรรมดา/superlative หรือมี the โดยไม่เข้ากับ comparative + than`};
  if(/\bif\b/i.test(q)) return {pattern:'Conditional: จับคู่ tense ใน if-clause กับ main clause',why:`เมื่อมี if ต้องดูชนิดเงื่อนไขและจับคู่ tense ของสองส่วน; “${correctLabel}” ทำให้รูปเงื่อนไขสัมพันธ์กัน`,drop:l=>`ตัด “${l}” ถ้าทำให้ tense ใน if-clause กับผลลัพธ์ไม่เป็นคู่ของ Conditional ที่ใช้ในประโยค`};
  if(/^to\s+/i.test(correctLabel)) return {pattern:'Verb + to + V1 (Infinitive)',why:`คำก่อนช่องว่างในบริบทนี้ต้องตามด้วย to-infinitive; “${correctLabel}” จึงทำหน้าที่ได้ครบ`,drop:l=>`ตัด “${l}” ถ้ารูปกริยาไม่ตรง pattern to + V1 ที่คำก่อนหน้าบังคับ`};
  if(/ing$/i.test(correctLabel)&&/_{2,}/.test(q)) return {pattern:'V-ing ตามโครงสร้างรอบช่องว่าง',why:`ตำแหน่งนี้ต้องการรูป V-ing จาก auxiliary/preposition/verb pattern รอบช่องว่าง; “${correctLabel}” จึงเข้ารูป`,drop:l=>`ตัด “${l}” ถ้ารูปคำไม่ใช่ V-ing หรือไม่สัมพันธ์กับ auxiliary/คำก่อนช่องว่าง`};
  return {pattern:'Form + Meaning + Context',why:`ให้เลือก “${correctLabel}” เพราะเมื่อนำกลับไปใส่แล้ว ทั้งหน้าที่คำ รูปประโยค และความหมายรวมสอดคล้องกับบริบทมากที่สุด`,drop:l=>`ตัด “${l}” เมื่อเติมแล้วรูปคำ/ความหมายหรือวลีที่ได้ไม่สอดคล้องกับบริบทเท่า “${correctLabel}”`};
}

function ltSourceChoiceReason(entry,lesson,letter,label,correctLabel,category){
  const item=entry.item,correct=letter===item.key,guide=ltSourceGuide(entry,lesson,category);
  if(correct){
    if(category==='reading' && /_{2,}/.test(item.q)) return ltRuleFromItem(item,correctLabel).why;
    if(category==='reading') return `คำตอบนี้ตรงกับสิ่งที่โจทย์ถามมากที่สุดตาม KEY ให้ย้อนกลับไปชี้หลักฐานหรือความหมายในข้อความที่สนับสนุน “${correctLabel}”`;
    if(category==='listening') return item.answerSource==='transcript-derived'?`คำตอบนี้มาจากการอนุมานจาก transcript ต้นฉบับ ให้ฟังช่วงที่เกี่ยวข้องและจับคำหรือ paraphrase ที่ยืนยัน “${correctLabel}”`:`คำตอบนี้ตรงกับ KEY ของชุดฟัง`;
    return ltRuleFromItem(item,correctLabel).why;
  }
  if(category==='reading' && /_{2,}/.test(item.q)){const rule=ltRuleFromItem(item,correctLabel);return correct?rule.why:rule.drop(label);}
  if(category==='reading'){
    const intent=ltIntent(item.q,'reading');
    return `ตัด “${label}” เมื่อไม่สามารถชี้หลักฐานจากข้อความกลับมารองรับได้โดยตรง หรือเมื่อมันตอบคนละเจตนากับคำถามนี้ (${intent})`;
  }
  if(category==='listening') return `ตัด “${label}” ถ้าเสียงไม่ได้ยืนยันข้อมูลนี้ หรือถ้ามันเป็นข้อมูลที่ถูกพูดถึงก่อนแล้วถูกแก้/ปฏิเสธภายหลัง; อย่าเลือกเพียงเพราะได้ยินคำเดียวกับตัวเลือก`;
  const rule=ltRuleFromItem(item,correctLabel);
  return correct?rule.why:rule.drop(label);
}

function ltSourceContextHtml(entry,category){
  const ctx=findSourceContext(entry.set,entry.item),parts=[];
  if(ctx.passage){
    const tr=extendedLearningData?.[category]?.[entry.set.id]?.passages?.find(p=>p.from===ctx.passage.from)?.thai||'';
    parts.push(`<details class="lesson-source-context"><summary>เปิดบทอ่านที่ใช้ตอบข้อนี้</summary><div class="context-en">${escapeHtml(ctx.passage.text||'')}</div>${tr?`<div class="context-th">${escapeHtml(tr)}</div>`:''}</details>`);
  }
  if(ctx.audio?.audio || entry.item.audio){
    const src=ctx.audio?.audio||entry.item.audio;
    parts.push(`<div class="lesson-source-audio"><span>ฟังช่วงเสียงประกอบข้อนี้</span><audio controls preload="none" src="${escapeHtml(src)}"></audio><small>ก่อนฟัง อ่านคำถามและตัวเลือก แล้วคาดว่าต้องจับข้อมูลชนิดใด</small></div>`);
  }
  return parts.join('');
}

function ltSourceOptionRows(entry,lesson,record,category){
  const item=entry.item,correctLabel=item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'');
  if(!item.options?.length) return '';
  return item.options.map((label,i)=>{
    const letter=letters[i],info=record.options?.[letter]||{},correct=letter===item.key;
    const reason=ltSourceChoiceReason(entry,lesson,letter,label,correctLabel,category);
    return `<div class="lesson-eliminate-row ${correct?'keep':'drop'}">
      <div class="lesson-eliminate-choice"><strong>${letter}. ${escapeHtml(label||'—')}</strong><span>${correct?'✓ เก็บข้อนี้':'× ตัดออก'}</span></div>
      <div class="lesson-eliminate-meaning"><b>แปล:</b> ${escapeHtml(info.meaning||'—')}</div>
      ${info.filled&&info.filled!==item.q?`<div class="lesson-eliminate-sentence"><div>${escapeHtml(info.filled)}</div>${info.thai?`<small>${escapeHtml(info.thai)}</small>`:''}</div>`:''}
      <p><b>${correct?'เหตุผลที่เลือก':'เหตุผลที่ตัด'}:</b> ${escapeHtml(reason)}</p>
    </div>`;
  }).join('');
}

function ltSourceExampleHtml(entry,lesson,category){
  const item=entry.item,record=ltSourceRecord(entry),scorable=sourceItemScorable(item);
  const correctLabel=scorable?(item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'')):'';
  const correctInfo=scorable&&item.options?.length?(record.options?.[item.key]||{}):{};
  const guide=ltSourceGuide(entry,lesson,category),signals=ltSignals(item.q,lesson.topic);
  const vocab=ltRelatedVocab(`${item.q} ${correctLabel}`,category);
  const status=item.answerSource==='transcript-derived'?'Transcript-derived':item.answerSource==='official-key'?'Official KEY':'ไม่มี KEY ทางการ';
  return `<article class="lesson-example lesson-example-deep">
    <div class="lesson-example-source">${escapeHtml(entry.set.title)} · ข้อ ${item.sourceNo} · ${escapeHtml(status)}</div>
    <div class="lesson-example-question">${escapeHtml(item.q)}</div>
    ${record.qThai?`<div class="lesson-example-thai strong">${category==='reading'?ltReadingDialogueHtml(record.qThai):escapeHtml(record.qThai)}</div>`:''}
    ${ltSourceContextHtml(entry,category)}
    <div class="lesson-example-intent"><span>โจทย์กำลังถามอะไร</span><p>${escapeHtml(ltIntent(item.q,category))}</p></div>
    ${scorable?`<div class="lesson-answer-focus"><span>คำตอบที่ควรเลือก</span><strong>${escapeHtml(sourceCorrectDisplay(item))}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div>`:`<div class="lesson-answer-focus neutral"><span>สถานะเฉลย</span><strong>ไม่มี KEY ทางการ — ระบบจะไม่เดาคำตอบ</strong></div>`}
    ${scorable&&correctInfo.filled?`<div class="lesson-filled-sentence"><span>${correctInfo.filled===item.q?'ความหมายของคำตอบ':'เมื่อเติมคำตอบเข้าไป'}</span><div class="en">${escapeHtml(correctInfo.filled)}</div>${correctInfo.thai?`<div class="th">${escapeHtml(correctInfo.thai)}</div>`:''}</div>`:''}
    <div class="lesson-reason-box"><h4>ทำไมจึงเลือกแบบนี้</h4><p>${escapeHtml(scorable?ltSourceChoiceReason(entry,lesson,item.key,correctLabel,correctLabel,category):'ชุดนี้ไม่มี KEY ทางการ จึงสอนได้เฉพาะวิธีหา clue ความหมาย และการตัดตัวเลือก โดยไม่สร้างเฉลยขึ้นเอง')}</p><code>${escapeHtml(guide.pattern||lesson.guide.pattern)}</code></div>
    <div class="lesson-signal-box"><strong>คำสัญญาณ/จุดสังเกต</strong><div>${signals.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div><p>${escapeHtml(guide.tip||lesson.guide.tip)}</p></div>
    ${scorable?`<div class="lesson-eliminate"><h4>ตัดตัวเลือกทีละข้อ</h4>${ltSourceOptionRows(entry,lesson,record,category)}</div>`:`<div class="lesson-eliminate"><h4>วิธีตัดตัวเลือกเมื่อไม่มี KEY</h4><p class="no-key-teach">อ่าน/ฟังหาหลักฐานทีละตัวเลือก ตัดข้อที่ขัดกับข้อความก่อน และเก็บข้อที่ยังมีหลักฐานรองรับไว้ ระบบจะไม่ติดป้ายถูก/ผิดให้เอง</p></div>`}
    ${ltVocabHtml(vocab)}
    <div class="lesson-source-note">${item.answerSource==='transcript-derived'?'สถานะคำตอบมาจาก transcript-derived ไม่ใช่ Official KEY':''}${item.answerSource==='official-key'?'ความถูกต้องอ้างอิง Official KEY':''}${!scorable?'ไม่มี KEY ทางการในแหล่งที่นำเข้า':''} · คำแปลและวิธีคิดเป็นสื่อช่วยเรียน</div>
  </article>`;
}

sourceLessonExample=function(entry,lesson,category=state.sourceCategory){ return ltSourceExampleHtml(entry,lesson,category); };

openSourceLesson=function(category,index){
  if(!sourceLessonUnlocked(category,index))return;
  const lesson=buildSourceLessonCatalog(category)[index]; if(!lesson)return;
  sourceStudyState.currentLesson[category]=index; state.lastActivity={kind:'source-lesson',category,index}; persist();persistSourceStudy();updateSourceLessonHeader(category);
  $('#sourceLessonCatalogPanel').hidden=true;$('#sourceLessonDetailPanel').hidden=false;
  const p=sourceLessonProgress(category),passed=p.passed[lesson.id],attempt=sourceStudyState.lessonAttempts[category];
  const examples=[...lesson.items.filter(x=>x.scorable),...lesson.items.filter(x=>!x.scorable)].slice(0,3);
  $('#sourceLessonDetailPanel').innerHTML=`<button class="text-btn source-lesson-back-list" type="button">← กลับรายการบทเรียน</button>
    <div class="lesson-detail-head"><div><span class="lesson-card-no">บท ${index+1}</span><h2>${escapeHtml(lesson.topic)}</h2><p>${escapeHtml(lesson.guide.basic)}</p></div><div class="lesson-state-badge ${passed?'passed':''}">${passed?`ผ่าน ${passed.bestPercent}%`:'ต้องผ่าน 80%'}</div></div>
    <div class="lesson-core-grid"><div class="lesson-core-card"><span>หลักที่ควรจำ</span><code>${escapeHtml(lesson.guide.pattern)}</code></div><div class="lesson-core-card"><span>ทริกทำข้อสอบ</span><strong>${escapeHtml(lesson.guide.tip)}</strong></div></div>
    ${ltLessonMethodHtml(lesson.topic,lesson.guide,category)}
    <section class="lesson-examples-section"><div class="lesson-subhead"><div><h3>สอนผ่านตัวอย่างจากโจทย์ต้นฉบับ</h3><p>อธิบายความหมาย คำตอบ วิธีหา clue และตัดตัวเลือกทีละข้อ</p></div><span>${examples.length} ตัวอย่างละเอียด</span></div><div class="lesson-examples">${examples.map(e=>ltSourceExampleHtml(e,lesson,category)).join('')}</div></section>
    <section class="lesson-checkpoint"><div><h3>แบบทดสอบท้ายบท</h3><p>สุ่มจากข้อในเอกสารต้นฉบับของหัวข้อนี้เท่านั้น ต้องได้อย่างน้อย 80% เพื่อปลดล็อกบทถัดไป หลังตรวจสามารถเปิดวิธีคิดของแต่ละข้อได้</p></div>${attempt&&attempt.category===category&&attempt.lessonId===lesson.id?'':'<button class="primary-btn start-source-lesson-quiz" type="button">เริ่มแบบทดสอบท้ายบท</button>'}</section>
    <div id="sourceLessonQuizArea">${attempt&&attempt.category===category&&attempt.lessonId===lesson.id?sourceLessonQuizHtml(category,index,lesson,attempt):''}</div>`;
  $('#sourceLessonDetailPanel').querySelector('.source-lesson-back-list').addEventListener('click',()=>renderSourceLessonCatalog(category));
  $('#sourceLessonDetailPanel').querySelector('.start-source-lesson-quiz')?.addEventListener('click',()=>startSourceLessonQuiz(category,index));
  wireSourceLessonQuiz(category,index);
};

function ltSourceQuizReview(entry,lesson,selected,category){
  const item=entry.item,record=ltSourceRecord(entry),correctLabel=item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'');
  const selectedText=item.options?.length&&selected?item.options[letters.indexOf(selected)]||'':String(selected||'');
  const correctInfo=item.options?.length?(record.options?.[item.key]||{}):{},selectedInfo=item.options?.length&&selected?(record.options?.[selected]||{}):{};
  const guide=ltSourceGuide(entry,lesson,category);
  return `<details class="lesson-quiz-deep-review" open><summary>ดูวิธีคิด คำแปล และการตัดตัวเลือกแบบละเอียด</summary><div class="lesson-quiz-review-body">
    <div class="lesson-review-compare"><div><span>คุณตอบ</span><strong>${escapeHtml(selectedText||'—')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>คำตอบถูก</span><strong>${escapeHtml(correctLabel)}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div></div>
    ${record.qThai?`<p><b>แปลโจทย์:</b> ${escapeHtml(record.qThai)}</p>`:''}
    ${correctInfo.filled?`<div class="lesson-filled-sentence"><span>เมื่อนำคำตอบถูกไปใช้</span><div class="en">${escapeHtml(correctInfo.filled)}</div>${correctInfo.thai?`<div class="th">${escapeHtml(correctInfo.thai)}</div>`:''}</div>`:''}
    <p><b>วิธีคิด:</b> ${escapeHtml(ltSourceChoiceReason(entry,lesson,item.key,correctLabel,correctLabel,category))}</p>
    <div class="lesson-eliminate compact">${ltSourceOptionRows(entry,lesson,record,category)}</div>
  </div></details>`;
}

sourceLessonQuizHtml=function(category,index,lesson,attempt){
  const entries=attempt.itemIds.map(id=>sourceLessonEntry(lesson,id)).filter(Boolean),answered=Object.keys(attempt.answers).length,checked=attempt.checked;
  let score=0;if(checked)entries.forEach(e=>{if(sourceAnswerCorrect(e.item,attempt.answers[e.id]))score++;});const pct=entries.length?Math.round(score/entries.length*100):0;
  const cards=entries.map((e,i)=>{const item=e.item,selected=attempt.answers[e.id]||'',isMcq=Array.isArray(item.options)&&item.options.length,correct=checked?sourceAnswerCorrect(item,selected):null;let controls='';if(isMcq)controls=`<div class="lesson-quiz-options">${item.options.map((o,ix)=>{const l=letters[ix];let c='lesson-quiz-option';if(selected===l)c+=' selected';if(checked&&l===item.key)c+=' correct';if(checked&&selected===l&&l!==item.key)c+=' wrong';return `<button type="button" class="${c}" data-source-lesson-item="${escapeHtml(e.id)}" data-choice="${l}" ${checked?'disabled':''}><span>${l}</span><strong>${escapeHtml(o)}</strong></button>`}).join('')}</div>`;else controls=`<label class="source-text-answer"><span>คำตอบ</span><input data-source-lesson-input="${escapeHtml(e.id)}" value="${escapeHtml(selected)}" ${checked?'disabled':''}></label>`;const fb=checked?`<div class="lesson-mini-feedback ${correct?'good':'bad'}"><strong>${correct?'ถูก':'เฉลย: '+escapeHtml(sourceCorrectDisplay(item))}</strong><p>${escapeHtml(lesson.guide.tip)}</p></div>${ltSourceQuizReview(e,lesson,selected,category)}`:'';return `<article class="lesson-quiz-card ${checked?(correct?'good':'bad'):''}"><div class="lesson-quiz-top"><span>ข้อ ${i+1}</span><small>${escapeHtml(e.set.title)} · ข้อ ${item.sourceNo}</small></div><p>${escapeHtml(item.q)}</p>${controls}${fb}</article>`}).join('');
  const complete=answered===entries.length&&entries.length>0,result=checked?`<div class="lesson-quiz-result ${pct>=80?'pass':'fail'}"><strong>${pct>=80?'ผ่านบทเรียน':'ยังไม่ผ่าน'}</strong><span>${score}/${entries.length} · ${pct}%</span></div>`:'';
  const actions=checked?`<div class="lesson-quiz-actions"><button class="secondary-btn source-lesson-retry" type="button">ทำใหม่</button>${pct>=80&&index+1<buildSourceLessonCatalog(category).length?'<button class="primary-btn source-lesson-next" type="button">ไปบทถัดไป →</button>':'<button class="secondary-btn source-lesson-list" type="button">กลับรายการบทเรียน</button>'}</div>`:`<div class="lesson-quiz-actions"><span>ตอบแล้ว ${answered}/${entries.length}</span><button class="primary-btn source-lesson-submit" type="button" ${complete?'':'disabled'}>ตรวจแบบทดสอบ</button></div>`;
  return `<div class="lesson-quiz-shell"><div class="lesson-quiz-heading"><div><h3>ทดสอบ: ${escapeHtml(lesson.topic)}</h3><p>เกณฑ์ผ่าน 80%</p></div><span>${answered}/${entries.length}</span></div>${result}<div class="lesson-quiz-list">${cards}</div>${actions}</div>`;
};


// 2026-10-12 — Simplified lesson presentation: essential first, details on demand.
function ltShortReason(text,max=150){
  const value=String(text||'').replace(/\s+/g,' ').trim();
  return value.length>max?`${value.slice(0,max).replace(/\s+\S*$/,'')}…`:value;
}
function ltQuickFlow(topic,guide,category){
  const p=ltProfile(topic,guide,category);
  return [
    {n:'1',title:'หา clue',text:guide?.tip||p.steps[1]||p.steps[0]},
    {n:'2',title:'ตัดช้อยส์',text:p.eliminate[0]||'ตัดข้อที่ผิดรูปหรือความหมายก่อน'},
    {n:'3',title:'ยืนยัน',text:'เอาคำตอบกลับไปใส่ แล้วอ่าน/แปลทั้งประโยคอีกครั้ง'}
  ];
}
ltLessonMethodHtml=function(topic,guide,category){
  const flow=ltQuickFlow(topic,guide,category),p=ltProfile(topic,guide,category);
  return `<section class="lesson-quick-method">
    <h3>ทำข้อนี้ยังไง?</h3>
    <div class="lesson-quick-flow">${flow.map(x=>`<div><span>${x.n}</span><p><b>${escapeHtml(x.title)}</b>${escapeHtml(ltShortReason(x.text,115))}</p></div>`).join('')}</div>
    <details class="lesson-more"><summary>ดูหลักและส่วนเสริมของบทนี้</summary><div class="lesson-more-body"><p><b>Pattern:</b> ${escapeHtml(guide?.pattern||'ดูรูปและความหมายร่วมกัน')}</p><p><b>หลัก:</b> ${escapeHtml(guide?.basic||'')}</p><div class="lesson-extra-chips">${p.extra.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></div></details>
  </section>`;
};

function ltA1OptionSummary(item,guide){
  const record=learningData?.[item.set]?.[item.q-1]||{},correctLabel=item.options[letters.indexOf(item.key)]||'';
  return item.options.map((label,i)=>{
    const letter=letters[i],correct=letter===item.key,info=record.options?.[letter]||{};
    const reason=correct?(item.explanation||guide.basic):choiceDiagnostic(guide,label,correctLabel);
    return `<div class="lesson-choice-line ${correct?'keep':'drop'}"><span>${correct?'✓':'×'}</span><b>${letter}. ${escapeHtml(label||'—')}</b>${info.meaning?`<small>${escapeHtml(info.meaning)}</small>`:''}<em>${escapeHtml(ltShortReason(reason,105))}</em></div>`;
  }).join('');
}
ltA1ExampleHtml=function(item,lesson){
  const correctLabel=item.options[letters.indexOf(item.key)]||'',record=learningData?.[item.set]?.[item.q-1]||{},correctInfo=record.options?.[item.key]||{};
  const guide=lessonGuide(item.explanation||'',item.question,correctLabel),signals=ltSignals(item.question,guide.topic),vocab=ltRelatedVocab(`${item.question} ${correctLabel}`,'a1a2');
  return `<article class="lesson-example lesson-example-simple">
    <div class="lesson-example-source">Set ${item.set} · ข้อ ${item.q}</div>
    <div class="lesson-example-question">${escapeHtml(item.question)}</div>
    <div class="lesson-simple-answer"><span>ตอบ</span><strong>${item.key}. ${escapeHtml(correctLabel)}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div>
    <div class="lesson-simple-sentence"><div>${fillAnswerMarkup(item.question,correctLabel,'correct-answer')}</div>${correctInfo.thai?`<small>${escapeHtml(correctInfo.thai)}</small>`:''}</div>
    <p class="lesson-simple-reason"><b>เพราะ:</b> ${escapeHtml(ltShortReason(item.explanation||guide.basic,190))}</p>
    <div class="lesson-choice-summary"><h4>ตัดช้อยส์</h4>${ltA1OptionSummary(item,guide)}</div>
    <details class="lesson-more"><summary>ดูรายละเอียดเพิ่ม</summary><div class="lesson-more-body"><p><b>โจทย์กำลังวัด:</b> ${escapeHtml(ltIntent(item.question,'a1a2'))}</p><p><b>จุดสังเกต:</b> ${escapeHtml(signals.join(' · '))}</p><p><b>Pattern:</b> ${escapeHtml(guide.pattern)}</p>${ltVocabHtml(vocab)}<div class="lesson-detail-options">${ltA1OptionRows(item,guide)}</div></div></details>
  </article>`;
};
lessonExampleHtml=function(item,lesson){return ltA1ExampleHtml(item,lesson);};

function ltSourceOptionSummary(entry,lesson,record,category){
  const item=entry.item,correctLabel=item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'');
  if(!item.options?.length)return '';
  return item.options.map((label,i)=>{
    const letter=letters[i],correct=letter===item.key,info=record.options?.[letter]||{},reason=ltSourceChoiceReason(entry,lesson,letter,label,correctLabel,category);
    return `<div class="lesson-choice-line ${correct?'keep':'drop'}"><span>${correct?'✓':'×'}</span><b>${letter}. ${escapeHtml(label||'—')}</b>${info.meaning?`<small>${escapeHtml(info.meaning)}</small>`:''}<em>${escapeHtml(ltShortReason(reason,105))}</em></div>`;
  }).join('');
}
ltSourceExampleHtml=function(entry,lesson,category){
  const item=entry.item,record=ltSourceRecord(entry),scorable=sourceItemScorable(item),correctLabel=scorable?(item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'')):'',correctInfo=scorable&&item.options?.length?(record.options?.[item.key]||{}):{};
  const guide=ltSourceGuide(entry,lesson,category),signals=ltSignals(item.q,lesson.topic),vocab=ltRelatedVocab(`${item.q} ${correctLabel}`,category),ctx=findSourceContext(entry.set,item);
  const answerReason=scorable?ltSourceChoiceReason(entry,lesson,item.key,correctLabel,correctLabel,category):'ชุดนี้ไม่มี KEY ทางการ จึงสอนวิธีหา clue และตัดตัวเลือก แต่ไม่เดาคำตอบ';
  const status=item.answerSource==='transcript-derived'?'Transcript-derived':item.answerSource==='official-key'?'Official KEY':'ไม่มี KEY';
  return `<article class="lesson-example lesson-example-simple">
    <div class="lesson-example-source">${escapeHtml(entry.set.title)} · ข้อ ${item.sourceNo} · ${status}</div>
    <div class="lesson-example-question">${escapeHtml(item.q)}</div>
    ${record.qThai?`<div class="lesson-example-thai strong">${category==='reading'?ltReadingDialogueHtml(record.qThai):escapeHtml(record.qThai)}</div>`:''}
    ${ctx.audio?.audio||item.audio?`<div class="lesson-audio-inline"><audio controls preload="none" src="${escapeHtml(ctx.audio?.audio||item.audio)}"></audio></div>`:''}
    ${scorable?`<div class="lesson-simple-answer"><span>ตอบ</span><strong>${escapeHtml(sourceCorrectDisplay(item))}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div>`:`<div class="lesson-simple-answer neutral"><span>สถานะ</span><strong>ไม่มี KEY ทางการ</strong></div>`}
    ${scorable&&correctInfo.filled?`<div class="lesson-simple-sentence"><div>${escapeHtml(correctInfo.filled)}</div>${correctInfo.thai?`<small>${escapeHtml(correctInfo.thai)}</small>`:''}</div>`:''}
    <p class="lesson-simple-reason"><b>${scorable?'เพราะ:':'วิธีทำ:'}</b> ${escapeHtml(ltShortReason(answerReason,190))}</p>
    ${scorable&&item.options?.length?`<div class="lesson-choice-summary"><h4>ตัดช้อยส์</h4>${ltSourceOptionSummary(entry,lesson,record,category)}</div>`:''}
    <details class="lesson-more"><summary>ดูรายละเอียดเพิ่ม</summary><div class="lesson-more-body"><p><b>โจทย์กำลังถาม:</b> ${escapeHtml(ltIntent(item.q,category))}</p><p><b>จุดสังเกต:</b> ${escapeHtml(signals.join(' · '))}</p><p><b>Pattern:</b> ${escapeHtml(guide.pattern||lesson.guide.pattern)}</p>${ltSourceContextHtml(entry,category)}${scorable?`<div class="lesson-detail-options">${ltSourceOptionRows(entry,lesson,record,category)}</div>`:''}${ltVocabHtml(vocab)}</div></details>
  </article>`;
};
sourceLessonExample=function(entry,lesson,category=state.sourceCategory){return ltSourceExampleHtml(entry,lesson,category);};

ltA1QuizReview=function(item,selected,lesson){
  const label=item.options[letters.indexOf(item.key)]||'',chosen=selected?item.options[letters.indexOf(selected)]||'':'',record=learningData?.[item.set]?.[item.q-1]||{},correctInfo=record.options?.[item.key]||{},selectedInfo=selected?record.options?.[selected]||{}:{},guide=lessonGuide(item.explanation||'',item.question,label);
  return `<details class="lesson-quiz-deep-review"><summary>ดูเหตุผลและการตัดช้อยส์</summary><div class="lesson-quiz-review-body"><div class="lesson-review-compare"><div><span>คุณตอบ</span><strong>${escapeHtml(chosen||'—')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>คำตอบถูก</span><strong>${escapeHtml(label)}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div></div><p><b>เพราะ:</b> ${escapeHtml(item.explanation||guide.basic)}</p><div class="lesson-choice-summary">${ltA1OptionSummary(item,guide)}</div></div></details>`;
};
ltSourceQuizReview=function(entry,lesson,selected,category){
  const item=entry.item,record=ltSourceRecord(entry),correctLabel=item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||''),selectedText=item.options?.length&&selected?item.options[letters.indexOf(selected)]||'':String(selected||''),correctInfo=item.options?.length?(record.options?.[item.key]||{}):{},selectedInfo=item.options?.length&&selected?(record.options?.[selected]||{}):{};
  return `<details class="lesson-quiz-deep-review"><summary>ดูเหตุผลและการตัดช้อยส์</summary><div class="lesson-quiz-review-body"><div class="lesson-review-compare"><div><span>คุณตอบ</span><strong>${escapeHtml(selectedText||'—')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>คำตอบถูก</span><strong>${escapeHtml(correctLabel)}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div></div><p><b>เพราะ:</b> ${escapeHtml(ltSourceChoiceReason(entry,lesson,item.key,correctLabel,correctLabel,category))}</p><div class="lesson-choice-summary">${ltSourceOptionSummary(entry,lesson,record,category)}</div></div></details>`;
};


// 2026-10-12 — Reading dialogue readability + lesson answers reduced to correct answer only.
function ltReadingDialogueHtml(text){
  const raw=String(text||'').trim();
  const re=/(Woman|Man|Girl|Boy|Speaker\s*\d+|Customer|Clerk|Interviewer|Interviewee|Teacher|Student|Doctor|Patient|ผู้หญิง|ผู้ชาย|เด็กผู้หญิง|เด็กผู้ชาย|A|B)\s*:\s*/gi;
  const matches=[...raw.matchAll(re)];
  if(matches.length<2) return escapeHtml(raw);
  const speakers=new Map(), labels=['A','B','C','D'];
  let next=0, html='';
  const prefix=raw.slice(0,matches[0].index).trim();
  if(prefix) html+=`<div class="reading-dialogue-prompt">${escapeHtml(prefix)}</div>`;
  matches.forEach((m,i)=>{
    const speaker=m[1].toLowerCase();
    if(!speakers.has(speaker)) speakers.set(speaker,labels[next++]||String(next));
    const start=m.index+m[0].length, end=i+1<matches.length?matches[i+1].index:raw.length;
    const line=raw.slice(start,end).trim();
    html+=`<div class="reading-dialogue-line"><span class="reading-speaker">${speakers.get(speaker)}:</span><span>${escapeHtml(line)}</span></div>`;
  });
  return html;
}
function ltQuestionDisplayHtml(text,category){return category==='reading'?ltReadingDialogueHtml(text):escapeHtml(text);}
function ltFormatReadingNodes(root=document){
  if(state.sourceCategory!=='reading')return;
  root.querySelectorAll('.question-text,.lesson-question,.lesson-example-question,.lesson-example-thai,.source-question-thai,.lesson-quiz-card>p').forEach(el=>{
    const raw=el.dataset.rawQuestion||el.textContent.trim();
    if(!raw)return;
    const html=ltReadingDialogueHtml(raw);
    if(html!==escapeHtml(raw)){el.dataset.rawQuestion=raw;el.innerHTML=html;el.classList.add('reading-dialogue-question');}
  });
}

const ltRenderSourceQuizBeforeDialogue=renderSourceQuiz;
renderSourceQuiz=function(){ltRenderSourceQuizBeforeDialogue();ltFormatReadingNodes($('#sourceQuizView'));};

ltA1ExampleHtml=function(item,lesson){
  const correctLabel=item.options[letters.indexOf(item.key)]||'',record=learningData?.[item.set]?.[item.q-1]||{},info=record.options?.[item.key]||{};
  const guide=lessonGuide(item.explanation||'',item.question,correctLabel),vocab=ltRelatedVocab(`${item.question} ${correctLabel}`,'a1a2');
  return `<article class="lesson-example lesson-example-simple lesson-correct-only"><div class="lesson-example-source">Set ${item.set} · ข้อ ${item.q}</div><div class="lesson-example-question">${escapeHtml(item.question)}</div><div class="lesson-simple-answer"><span>คำตอบ</span><strong>${item.key}. ${escapeHtml(correctLabel)}</strong>${info.meaning?`<small>${escapeHtml(info.meaning)}</small>`:''}</div><div class="lesson-simple-sentence"><div>${fillAnswerMarkup(item.question,correctLabel,'correct-answer')}</div>${info.thai?`<small>${escapeHtml(info.thai)}</small>`:''}</div><p class="lesson-simple-reason"><b>เพราะ:</b> ${escapeHtml(ltShortReason(item.explanation||guide.basic,185))}</p><details class="lesson-more"><summary>ดูหลักเพิ่ม</summary><div class="lesson-more-body"><p><b>Pattern:</b> ${escapeHtml(guide.pattern)}</p><p><b>ทริก:</b> ${escapeHtml(guide.tip)}</p>${ltVocabHtml(vocab)}</div></details></article>`;
};
lessonExampleHtml=function(item,lesson){return ltA1ExampleHtml(item,lesson);};

ltSourceExampleHtml=function(entry,lesson,category){
  const item=entry.item,record=ltSourceRecord(entry),scorable=sourceItemScorable(item),correctLabel=scorable?(item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'')):'',info=scorable&&item.options?.length?(record.options?.[item.key]||{}):{};
  const guide=ltSourceGuide(entry,lesson,category),vocab=ltRelatedVocab(`${item.q} ${correctLabel}`,category),ctx=findSourceContext(entry.set,item);
  const reason=scorable?ltSourceChoiceReason(entry,lesson,item.key,correctLabel,correctLabel,category):'ชุดนี้ไม่มี KEY ทางการ จึงแสดงวิธีอ่านโจทย์และคำแปล แต่ไม่เดาคำตอบ';
  const status=item.answerSource==='transcript-derived'?'Transcript-derived':item.answerSource==='official-key'?'Official KEY':'ไม่มี KEY';
  return `<article class="lesson-example lesson-example-simple lesson-correct-only"><div class="lesson-example-source">${escapeHtml(entry.set.title)} · ข้อ ${item.sourceNo} · ${status}</div><div class="lesson-example-question">${ltQuestionDisplayHtml(item.q,category)}</div>${record.qThai?`<div class="lesson-example-thai strong">${category==='reading'?ltReadingDialogueHtml(record.qThai):escapeHtml(record.qThai)}</div>`:''}${ctx.audio?.audio||item.audio?`<div class="lesson-audio-inline"><audio controls preload="none" src="${escapeHtml(ctx.audio?.audio||item.audio)}"></audio></div>`:''}${scorable?`<div class="lesson-simple-answer"><span>คำตอบ</span><strong>${escapeHtml(sourceCorrectDisplay(item))}</strong>${info.meaning?`<small>${escapeHtml(info.meaning)}</small>`:''}</div>`:`<div class="lesson-simple-answer neutral"><span>สถานะ</span><strong>ไม่มี KEY ทางการ</strong></div>`}${scorable&&info.filled?`<div class="lesson-simple-sentence"><div>${category==='reading'?ltReadingDialogueHtml(info.filled):escapeHtml(info.filled)}</div>${info.thai?`<small>${category==='reading'?ltReadingDialogueHtml(info.thai):escapeHtml(info.thai)}</small>`:''}</div>`:''}<p class="lesson-simple-reason"><b>${scorable?'เพราะ:':'วิธีทำ:'}</b> ${escapeHtml(ltShortReason(reason,185))}</p><details class="lesson-more"><summary>ดูหลักเพิ่ม</summary><div class="lesson-more-body"><p><b>วิธีคิด:</b> ${escapeHtml(lesson.guide.tip)}</p><p><b>Pattern:</b> ${escapeHtml(guide.pattern||lesson.guide.pattern)}</p>${ltSourceContextHtml(entry,category)}${ltVocabHtml(vocab)}</div></details></article>`;
};
sourceLessonExample=function(entry,lesson,category=state.sourceCategory){return ltSourceExampleHtml(entry,lesson,category);};

ltA1QuizReview=function(item,selected,lesson){
  const label=item.options[letters.indexOf(item.key)]||'',record=learningData?.[item.set]?.[item.q-1]||{},info=record.options?.[item.key]||{},guide=lessonGuide(item.explanation||'',item.question,label);
  return `<details class="lesson-quiz-deep-review"><summary>ดูเหตุผล</summary><div class="lesson-quiz-review-body correct-only"><p class="lesson-review-correct"><b>คำตอบที่ถูก:</b> ${escapeHtml(label)}${info.meaning?` <small>(${escapeHtml(info.meaning)})</small>`:''}</p>${info.filled?`<div class="lesson-simple-sentence"><div>${escapeHtml(info.filled)}</div>${info.thai?`<small>${escapeHtml(info.thai)}</small>`:''}</div>`:''}<p><b>เพราะ:</b> ${escapeHtml(item.explanation||guide.basic)}</p></div></details>`;
};
ltSourceQuizReview=function(entry,lesson,selected,category){
  const item=entry.item,record=ltSourceRecord(entry),label=item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||''),info=item.options?.length?(record.options?.[item.key]||{}):{};
  return `<details class="lesson-quiz-deep-review"><summary>ดูเหตุผล</summary><div class="lesson-quiz-review-body correct-only"><p class="lesson-review-correct"><b>คำตอบที่ถูก:</b> ${escapeHtml(label)}${info.meaning?` <small>(${escapeHtml(info.meaning)})</small>`:''}</p>${record.qThai?`<p><b>แปลโจทย์:</b> ${escapeHtml(record.qThai)}</p>`:''}${info.filled?`<div class="lesson-simple-sentence"><div>${category==='reading'?ltReadingDialogueHtml(info.filled):escapeHtml(info.filled)}</div>${info.thai?`<small>${escapeHtml(info.thai)}</small>`:''}</div>`:''}<p><b>เพราะ:</b> ${escapeHtml(ltSourceChoiceReason(entry,lesson,item.key,label,label,category))}</p></div></details>`;
};

const ltRenderLessonDetailBeforeCopy=renderLessonDetail;
renderLessonDetail=function(index){ltRenderLessonDetailBeforeCopy(index);const p=$('#lessonDetailPanel .lesson-subhead p');if(p)p.textContent='ดูคำตอบที่ถูก คำแปล และเหตุผลแบบสั้น ๆ';const s=$('#lessonDetailPanel .lesson-subhead>span');if(s)s.textContent=s.textContent.replace('ตัวอย่างละเอียด','ตัวอย่าง');};
const ltOpenSourceLessonBeforeCopy=openSourceLesson;
openSourceLesson=function(category,index){ltOpenSourceLessonBeforeCopy(category,index);const p=$('#sourceLessonDetailPanel .lesson-subhead p');if(p)p.textContent='ดูคำตอบที่ถูก คำแปล และเหตุผลแบบสั้น ๆ';const s=$('#sourceLessonDetailPanel .lesson-subhead>span');if(s)s.textContent=s.textContent.replace('ตัวอย่างละเอียด','ตัวอย่าง');ltFormatReadingNodes($('#sourceLessonDetailPanel'));};
