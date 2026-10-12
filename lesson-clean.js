// Final clean lesson presentation: keep only the correct answer, meaning, completed sentence,
// translation and a short reason. Existing source/KEY authority is unchanged.

function lcA1ExampleHtml(item,lesson){
  const correctLabel=item.options[letters.indexOf(item.key)]||'';
  const record=learningData?.[item.set]?.[item.q-1]||{};
  const info=record.options?.[item.key]||{};
  const guide=lessonGuide(item.explanation||'',item.question,correctLabel);
  const sentence=info.filled||fillCorrectAnswer(item.question,correctLabel);
  return `<article class="lesson-example lesson-clean-answer">
    <div class="lesson-example-source">Set ${item.set} · ข้อ ${item.q}</div>
    <div class="lesson-example-question">${escapeHtml(item.question)}</div>
    <div class="clean-answer-row"><span>คำตอบ</span><strong>${item.key}. ${escapeHtml(correctLabel)}</strong>${info.meaning?`<small>แปล: ${escapeHtml(info.meaning)}</small>`:''}</div>
    <div class="clean-sentence"><div class="en">${fillAnswerMarkup(item.question,correctLabel,'correct-answer')}</div>${info.thai?`<div class="th">${escapeHtml(info.thai)}</div>`:''}</div>
    <p class="clean-reason"><b>ทำไม:</b> ${escapeHtml(ltShortReason(item.explanation||guide.basic,190))}</p>
    <details class="clean-more"><summary>ดูหลักเพิ่ม</summary><div><p><b>Pattern:</b> ${escapeHtml(guide.pattern)}</p><p><b>ทริก:</b> ${escapeHtml(guide.tip)}</p></div></details>
  </article>`;
}

function lcSourceExampleHtml(entry,lesson,category){
  const item=entry.item;
  const record=ltSourceRecord(entry);
  const scorable=sourceItemScorable(item);
  const correctLabel=scorable?(item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'')):'';
  const info=scorable&&item.options?.length?(record.options?.[item.key]||{}):{};
  const guide=ltSourceGuide(entry,lesson,category);
  const reason=scorable?ltSourceChoiceReason(entry,lesson,item.key,correctLabel,correctLabel,category):'ชุดนี้ไม่มี KEY ทางการ จึงคงคำแปลและแนวทางอ่านโจทย์ไว้ แต่ไม่สร้างเฉลยขึ้นเอง';
  const status=item.answerSource==='transcript-derived'?'Transcript-derived':item.answerSource==='official-key'?'Official KEY':'ไม่มี KEY';
  const context=findSourceContext(entry.set,item);
  return `<article class="lesson-example lesson-clean-answer">
    <div class="lesson-example-source">${escapeHtml(entry.set.title)} · ข้อ ${item.sourceNo} · ${status}</div>
    <div class="lesson-example-question">${category==='reading'?ltReadingDialogueHtml(item.q):escapeHtml(item.q)}</div>
    ${record.qThai?`<div class="lesson-example-thai clean-thai">${category==='reading'?ltReadingDialogueHtml(record.qThai):escapeHtml(record.qThai)}</div>`:''}
    ${context.audio?.audio||item.audio?`<div class="clean-audio"><audio controls preload="none" src="${escapeHtml(context.audio?.audio||item.audio)}"></audio></div>`:''}
    ${scorable?`<div class="clean-answer-row"><span>คำตอบ</span><strong>${escapeHtml(sourceCorrectDisplay(item))}</strong>${info.meaning?`<small>แปล: ${escapeHtml(info.meaning)}</small>`:''}</div>`:`<div class="clean-answer-row neutral"><span>สถานะ</span><strong>ไม่มี KEY ทางการ</strong></div>`}
    ${scorable&&info.filled?`<div class="clean-sentence"><div class="en">${category==='reading'?ltReadingDialogueHtml(info.filled):escapeHtml(info.filled)}</div>${info.thai?`<div class="th">${category==='reading'?ltReadingDialogueHtml(info.thai):escapeHtml(info.thai)}</div>`:''}</div>`:''}
    <p class="clean-reason"><b>${scorable?'ทำไม:':'วิธีทำ:'}</b> ${escapeHtml(ltShortReason(reason,190))}</p>
    <details class="clean-more"><summary>ดูหลักเพิ่ม</summary><div><p><b>Pattern:</b> ${escapeHtml(guide.pattern||lesson.guide.pattern)}</p><p><b>ทริก:</b> ${escapeHtml(lesson.guide.tip)}</p>${ltSourceContextHtml(entry,category)}</div></details>
  </article>`;
}

ltA1ExampleHtml=lcA1ExampleHtml;
lessonExampleHtml=function(item,lesson){return lcA1ExampleHtml(item,lesson);};
ltSourceExampleHtml=lcSourceExampleHtml;
sourceLessonExample=function(entry,lesson,category=state.sourceCategory){return lcSourceExampleHtml(entry,lesson,category);};

ltA1QuizReview=function(item,selected,lesson){
  const label=item.options[letters.indexOf(item.key)]||'';
  const record=learningData?.[item.set]?.[item.q-1]||{};
  const info=record.options?.[item.key]||{};
  const guide=lessonGuide(item.explanation||'',item.question,label);
  return `<div class="lesson-quiz-clean-review"><div class="clean-answer-row"><span>คำตอบที่ถูก</span><strong>${escapeHtml(label)}</strong>${info.meaning?`<small>แปล: ${escapeHtml(info.meaning)}</small>`:''}</div>${info.filled?`<div class="clean-sentence"><div class="en">${escapeHtml(info.filled)}</div>${info.thai?`<div class="th">${escapeHtml(info.thai)}</div>`:''}</div>`:''}<p class="clean-reason"><b>ทำไม:</b> ${escapeHtml(item.explanation||guide.basic)}</p></div>`;
};

ltSourceQuizReview=function(entry,lesson,selected,category){
  const item=entry.item;
  const record=ltSourceRecord(entry);
  const label=item.options?.length?item.options[letters.indexOf(item.key)]||'':String(item.key||'');
  const info=item.options?.length?(record.options?.[item.key]||{}):{};
  return `<div class="lesson-quiz-clean-review"><div class="clean-answer-row"><span>คำตอบที่ถูก</span><strong>${escapeHtml(label)}</strong>${info.meaning?`<small>แปล: ${escapeHtml(info.meaning)}</small>`:''}</div>${record.qThai?`<p class="clean-question-translation"><b>แปลโจทย์:</b> ${category==='reading'?ltReadingDialogueHtml(record.qThai):escapeHtml(record.qThai)}</p>`:''}${info.filled?`<div class="clean-sentence"><div class="en">${category==='reading'?ltReadingDialogueHtml(info.filled):escapeHtml(info.filled)}</div>${info.thai?`<div class="th">${category==='reading'?ltReadingDialogueHtml(info.thai):escapeHtml(info.thai)}</div>`:''}</div>`:''}<p class="clean-reason"><b>ทำไม:</b> ${escapeHtml(ltSourceChoiceReason(entry,lesson,item.key,label,label,category))}</p></div>`;
};

// Keep reading conversations split into speaker lines after every lesson render.
const lcOpenSourceLesson=openSourceLesson;
openSourceLesson=function(category,index){lcOpenSourceLesson(category,index);if(category==='reading')ltFormatReadingNodes($('#sourceLessonDetailPanel'));};
