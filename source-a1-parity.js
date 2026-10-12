// Make B1–B2 / Reading / Listening / Level Up use the A1–A2 answer layout as the source of truth.
// Source answer authority remains unchanged: Official KEY / transcript-derived / no-key.

function sourceParityText(text){
  if(state.sourceCategory==='reading' && typeof ltReadingDialogueHtml==='function') return ltReadingDialogueHtml(text);
  return escapeHtml(text||'');
}


function sourceParitySentenceMarkup(text,answer,cls){
  if(state.sourceCategory!=='reading') return highlightAnswerInText(text,answer,cls);
  const html=sourceParityText(text), needle=escapeHtml(answer||'');
  return needle?html.replace(needle,`<span class="answer-highlight ${cls}">${needle}</span>`):html;
}


function sourceParityGuide(item,set,correctText){
  let guide=lessonGuide('',item.q,correctText);
  const category=state.sourceCategory;
  if(['reading','listening','levelup'].includes(category) && typeof sourceLessonBucket==='function'){
    const sourceSet=(item.originSetId&&extendedCollections?.[category]?.sets?.find(s=>s.id===item.originSetId))||set;
    const topic=sourceSet?sourceLessonBucket(category,sourceSet,item):'';
    const specific=SOURCE_LESSON_GUIDES?.[topic];
    if(specific) guide={topic,...specific};
  }
  return guide;
}

function sourceParityCorrectReason(item,guide,correctText){
  if(state.sourceCategory==='reading') return `คำตอบ “${correctText}” สอดคล้องกับความหมายหรือหลักฐานที่โจทย์กำลังถามมากที่สุด ให้ย้อนดูคำสำคัญและบริบทรอบประโยคเพื่อยืนยันคำตอบ`;
  if(state.sourceCategory==='listening') return item.answerSource==='transcript-derived'?`คำตอบ “${correctText}” สอดคล้องกับข้อมูลใน transcript ต้นฉบับ จึงใช้เป็นคำตอบช่วยตรวจในชุดนี้`:`คำตอบ “${correctText}” ตรงกับ KEY ของชุดฟังและเข้ากับข้อมูลที่คำถามต้องการ`;
  return guide.basic;
}

function sourceParitySentenceMap(item,correctText,guide){
  if(!Array.isArray(item.options)||!item.options.length) return '';
  const fake={data:{q:item.q,options:item.options}};
  return sentenceStructureHtml(fake,correctText,guide);
}

function sourceParityOptionAnalysis(item,selected,record,guide){
  if(!Array.isArray(item.options)||!item.options.length) return '';
  return `<div class="lesson-section option-analysis"><h4>6. วิเคราะห์ตัวเลือก</h4><div class="option-analysis-list">${item.options.map((label,i)=>{
    const letter=letters[i], info=record.options?.[letter]||{}, isCorrect=letter===item.key, isSelected=letter===selected;
    let cls='option-analysis-row'; if(isCorrect)cls+=' correct-option'; if(isSelected&&!isCorrect)cls+=' selected-wrong';
    const reason=isCorrect?`ตัวเลือกนี้ทำให้รูปประโยคและความหมายตรงกับโจทย์: ${guide.basic}`:sourceChoiceReason(guide,label,item.options[letters.indexOf(item.key)]||'',state.sourceCategory);
    return `<div class="${cls}"><div class="option-analysis-head"><strong>${letter}. ${escapeHtml(label)}</strong>${isCorrect?'<span class="option-pill correct">คำตอบถูก</span>':isSelected?'<span class="option-pill wrong">คำตอบที่เลือก</span>':''}</div><div class="option-meaning"><b>ความหมาย:</b> ${escapeHtml(info.meaning||'—')}</div>${info.filled?`<div class="option-sentence"><div class="en">${sourceParityText(info.filled)}</div>${info.thai?`<div class="th">${sourceParityText(info.thai)}</div>`:''}</div>`:''}<div class="option-reason"><strong>${isCorrect?'เหตุผลที่ถูก':'เหตุผลที่ไม่เลือก'}:</strong> ${escapeHtml(reason)}</div></div>`;
  }).join('')}</div></div>`;
}

sourceFeedbackHtml=function(item,selected,set){
  const record=sourceLearningRecord(item,set);
  const scorable=sourceItemScorable(item), isMcq=Array.isArray(item.options)&&item.options.length>0;

  if(!scorable){
    const selectedText=isMcq&&selected?(item.options[letters.indexOf(selected)]||''):String(selected||'');
    const selectedInfo=isMcq&&selected?(record.options?.[selected]||{}):{};
    return `<div class="feedback lesson-feedback unanswered source-a1-feedback"><div class="feedback-result-row"><span class="result-status unanswered">ไม่มี KEY ทางการ</span><div class="answer-compare"><div><span>คำตอบของคุณ</span><strong>${escapeHtml(selectedText||'— ไม่ได้ตอบ —')}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>สถานะเฉลย</span><strong>ไม่เดาคำตอบแทนเอกสาร</strong><small>ยังบันทึกคำตอบไว้ทบทวนได้</small></div></div></div><div class="lesson-section question-focus"><h4>1. ดูโจทย์และคำแปล</h4><div class="lesson-question">${sourceParityText(item.q)}</div>${record.qThai?`<div class="source-question-thai">${sourceParityText(record.qThai)}</div>`:''}</div><div class="memory-tip"><strong>ทริกสำหรับข้อนี้</strong>ชุดนี้ไม่มี KEY ทางการ จึงใช้คำแปลและบริบทช่วยเรียนได้ แต่ระบบจะไม่สร้างคำตอบถูก/ผิดขึ้นเอง</div></div>`;
  }

  const ok=sourceAnswerCorrect(item,selected);
  const correctText=isMcq?(item.options[letters.indexOf(item.key)]||''):String(item.key||'');
  const selectedText=isMcq&&selected?(item.options[letters.indexOf(selected)]||''):String(selected||'');
  const correctInfo=isMcq?(record.options?.[item.key]||{}):{meaning:record.answerThai||'',filled:fillCorrectAnswer(item.q,correctText),thai:''};
  const selectedInfo=isMcq&&selected?(record.options?.[selected]||{}):{};
  const guide=sourceParityGuide(item,set,correctText);
  const correctSentence=correctInfo.filled||fillCorrectAnswer(item.q,correctText);
  const selectedSentence=selectedInfo.filled||fillCorrectAnswer(item.q,selectedText);
  const correctMarkup=sourceParitySentenceMarkup(correctSentence,correctText,'correct-answer');
  const selectedMarkup=sourceParitySentenceMarkup(selectedSentence,selectedText,ok?'correct-answer':'wrong-answer');
  const resultText=!selected?'ไม่ได้ตอบข้อนี้':ok?'ตอบถูก':'ตอบผิด';
  const resultClass=!selected?'unanswered':ok?'good':'bad';
  const sourceText=item.answerSource==='transcript-derived'?'เฉลยนี้อนุมานจาก transcript ในต้นฉบับ ไม่ใช่ Official KEY':'อ้างอิง Official KEY';

  return `<div class="feedback lesson-feedback ${resultClass} source-a1-feedback">
    <div class="feedback-result-row"><span class="result-status ${resultClass}">${resultText}</span><div class="answer-compare"><div><span>คำตอบของคุณ</span><strong class="${selected?(ok?'answer-text-correct':'answer-text-wrong'):''}">${selected?(isMcq?`${selected}. ${escapeHtml(selectedText)}`:escapeHtml(selectedText)):'— ไม่ได้ตอบ —'}</strong>${selectedInfo.meaning?`<small>${escapeHtml(selectedInfo.meaning)}</small>`:''}</div><div><span>เฉลยที่ถูกต้อง</span><strong class="answer-text-correct">${escapeHtml(sourceCorrectDisplay(item))}</strong>${correctInfo.meaning?`<small>${escapeHtml(correctInfo.meaning)}</small>`:''}</div></div></div>
    <div class="lesson-section question-focus"><h4>1. ดูโจทย์และประโยคหลังเติมคำตอบที่ถูก</h4><div class="lesson-question">${sourceParityText(item.q)}</div>${record.qThai?`<div class="source-question-thai">${sourceParityText(record.qThai)}</div>`:''}<div class="correct-translation"><span class="label">ประโยคที่ถูกต้อง + คำแปล</span><div class="en">${correctMarkup}</div>${correctInfo.thai?`<div class="th translation-correct">${sourceParityText(correctInfo.thai)}</div>`:''}</div></div>
    <div class="lesson-section"><h4>2. คำตอบที่ถูกหมายถึงอะไร และทำไมถึงถูก</h4><p><strong>${escapeHtml(sourceCorrectDisplay(item))}</strong>${correctInfo.meaning?` — ${escapeHtml(correctInfo.meaning)}`:''}</p><p style="margin-top:8px!important">${escapeHtml(sourceParityCorrectReason(item,guide,correctText))}</p><p class="beginner-note">สำหรับผู้เริ่มต้น: ให้ดูทั้งความหมายของคำตอบ หน้าที่ของคำ และคำรอบ ๆ ช่องว่างหรือหลักฐานในบทอ่าน/เสียง ไม่เลือกจากคำแปลเดี่ยว ๆ อย่างเดียว</p></div>
    <div class="lesson-grid"><div class="lesson-section"><h4>3. หลักที่ข้อนี้กำลังทดสอบ</h4><strong class="lesson-topic">${escapeHtml(guide.topic)}</strong><p>${escapeHtml(guide.basic)}</p></div><div class="lesson-section pattern-box"><h4>4. รูปประโยคที่ควรจำ</h4><code>${escapeHtml(guide.pattern)}</code><p><strong>วิธีสังเกต:</strong> ${escapeHtml(guide.tip)}</p></div></div>
    ${selected&&!ok?`<div class="lesson-section your-mistake"><h4>5. คำตอบที่คุณเลือกแปลว่าอะไร และผิดตรงไหน</h4><p>คุณเลือก <strong>${isMcq?`${selected}. ${escapeHtml(selectedText)}`:escapeHtml(selectedText)}</strong>${selectedInfo.meaning?` — ความหมายโดยประมาณ: <strong>${escapeHtml(selectedInfo.meaning)}</strong>`:''}</p>${selectedSentence!==item.q?`<div class="option-sentence" style="margin-top:9px"><div class="en"><strong>เมื่อเอาไปเติม:</strong> ${selectedMarkup}</div>${selectedInfo.thai?`<div class="th translation-wrong"><strong>จะได้ความหมายประมาณ:</strong> ${sourceParityText(selectedInfo.thai)}</div>`:''}</div>`:''}<p style="margin-top:9px!important">${escapeHtml(sourceChoiceReason(guide,selectedText,correctText,state.sourceCategory))}</p><p style="margin-top:8px!important">จึงต้องเปลี่ยนเป็น <strong>${escapeHtml(sourceCorrectDisplay(item))}</strong> เพื่อให้ทั้งรูปประโยคและความหมาย/หลักฐานตรงกับโจทย์</p></div>`:`<div class="lesson-section success-review"><h4>5. แม้ตอบถูกก็ต้องจำเหตุผล</h4><p>จำว่าข้อนี้ใช้หลักอะไรและมีคำสัญญาณหรือหลักฐานตรงไหน เพราะข้อสอบจริงอาจเปลี่ยนคำศัพท์แต่ใช้วิธีคิดแบบเดิม</p></div>`}
    ${sourceParityOptionAnalysis(item,selected,record,guide)}
    <div class="memory-tip"><strong>7. ทริกจำสำหรับข้อนี้</strong>${escapeHtml(guide.tip)} อ่านประโยคที่ถูกและคำแปลซ้ำอีกครั้ง แล้วจำเป็นวลี/รูปประโยคแทนการจำตัวอักษรคำตอบ</div>
    ${sourceParitySentenceMap(item,correctText,guide)}
    <small class="source-answer-authority">${escapeHtml(sourceText)}</small>
  </div>`;
};
