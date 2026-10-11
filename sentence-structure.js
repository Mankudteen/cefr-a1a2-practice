/* Educational sentence-structure analyzer for the CEFR A1–A2 practice bank.
   It is intentionally deterministic and beginner-oriented: phrase roles (S/V/O/C/etc.)
   plus word classes are inferred from the completed correct sentence. */
const sentenceStructureAnalyzer = (() => {
  const ROLE_INFO = {
    S:     {en:'Subject', th:'ประธาน', desc:'ผู้ทำกริยา หรือสิ่งที่ประโยคกำลังพูดถึง'},
    V:     {en:'Main verb', th:'กริยาหลัก', desc:'คำที่บอกการกระทำ สภาพ หรือเหตุการณ์หลัก'},
    O:     {en:'Object', th:'กรรม', desc:'คนหรือสิ่งที่ได้รับผลจากกริยา'},
    C:     {en:'Complement', th:'ส่วนเติมเต็ม', desc:'ส่วนที่บอกว่า “ประธาน/กรรม เป็นหรือมีลักษณะอย่างไร”'},
    QW:    {en:'Question word', th:'คำแสดงคำถาม', desc:'บอกว่าคำถามต้องการข้อมูลชนิดใด เช่น อะไร ที่ไหน อย่างไร'},
    Aux:   {en:'Auxiliary verb', th:'กริยาช่วย', desc:'ช่วยสร้าง tense คำถาม ปฏิเสธ หรือความหมายแบบ can/will/may'},
    V1:    {en:'Bare infinitive', th:'กริยารูปพื้นฐาน', desc:'กริยารูปไม่เติม to/-s/-ed เช่น think, go, work'},
    Inf:   {en:'To-infinitive', th:'to + กริยารูปพื้นฐาน', desc:'กลุ่ม to + V1 เช่น to go, to talk'},
    Ger:   {en:'Gerund / -ing form', th:'V-ing', desc:'กริยาเติม -ing ที่ทำหน้าที่ตามโครงสร้างของประโยค'},
    Adj:   {en:'Adjective', th:'คำคุณศัพท์', desc:'คำบอกลักษณะของคำนามหรือประธาน'},
    Adv:   {en:'Adverb / Adverbial', th:'คำวิเศษณ์/ส่วนขยาย', desc:'ขยายกริยา คุณศัพท์ หรือบอกเวลา วิธี สถานที่ ความถี่'},
    PrepP: {en:'Prepositional phrase', th:'วลีบุพบท', desc:'วลีที่ขึ้นต้นด้วย in/on/at/to/of/with ฯลฯ และทำหน้าที่ขยาย'},
    Conj:  {en:'Conjunction', th:'คำเชื่อม', desc:'เชื่อมคำ วลี หรืออนุประโยคเข้าด้วยกัน'},
    N:     {en:'Noun phrase', th:'นาม/นามวลี', desc:'คน สิ่งของ สถานที่ หรือแนวคิด'},
    Det:   {en:'Determiner', th:'คำกำหนดนาม', desc:'คำที่ชี้/กำหนดคำนาม เช่น a, the, this, my'},
    Pron:  {en:'Pronoun', th:'คำสรรพนาม', desc:'คำแทนคำนาม เช่น I, you, him, them'},
    Num:   {en:'Number / Quantifier', th:'จำนวน/คำบอกปริมาณ', desc:'คำบอกจำนวนหรือปริมาณ'},
    Part:  {en:'Particle', th:'คำประกอบกริยา', desc:'คำสั้นที่รวมกับกริยาเป็น phrasal verb เช่น wake up, turn on'},
    Clause:{en:'Clause', th:'อนุประโยค', desc:'กลุ่มคำที่มีใจความเป็นประโยคย่อย'},
    Frag:  {en:'Fragment / Ellipsis', th:'วลี/ประโยคละคำ', desc:'คำตอบสั้นหรือวลีที่ละ S/V บางส่วนเพราะเข้าใจได้จากบริบท'},
    Other: {en:'Other', th:'คำประกอบอื่น', desc:'คำที่ช่วยประกอบความหมายของประโยค'}
  };

  const QWORDS = new Set(['what','where','when','why','who','whom','whose','which','how']);
  const AUX = new Set(["am","is","are","was","were","be","been","being","do","does","did","have","has","had","will","would","shall","should","can","could","may","might","must"]);
  const MODALS = new Set(['will','would','shall','should','can','could','may','might','must']);
  const SUBJECT_PRON = new Set(['i','you','he','she','it','we','they']);
  const OBJECT_PRON = new Set(['me','you','him','her','it','us','them']);
  const POSSESSIVE_DET = new Set(['my','your','his','her','its','our','their']);
  const POSSESSIVE_PRON = new Set(['mine','yours','his','hers','ours','theirs']);
  const DETS = new Set(['a','an','the','this','that','these','those','some','any','no','each','every','either','neither','another','other','all','both','most','many','much','few','little','several','enough']);
  const PREPS = new Set(['about','above','after','against','along','among','around','at','before','behind','below','between','by','during','for','from','in','into','near','of','off','on','onto','opposite','over','through','to','under','until','with','without']);
  const CONJS = new Set(['and','but','or','so','because','although','though','while','if','unless','until','when','that','than','as','since']);
  const COMMON_ADVS = new Set(['very','quite','too','more','most','less','least','not','never','always','often','usually','gradually','finally','almost','still','yet','now','again','here','together','away','abroad','well','hard','fast','slowly','quickly','carefully','frankly','certainly','rather','even','only','please']);
  const COMMON_ADJS = new Set(['sad','new','interesting','small','black','proud','skillful','long','absorbed','spoilt','dear','miserable','jealous','successful','similar','late','old','good','different','careful','financial','healthy','dead','big','biggest','national','useful','right','own','equal','full','foolish','expensive','short','taller','ugly','hard','dark','best','favorite','favourite','limited','excited','pretty','patient','tall','sharp','informative','cold','valuable','extra','intelligent','beautiful','naked','brand','honest','whole','fine']);
  const VERBS = new Set([
    'get','got','make','made','let','think','thought','play','read','went','go','stay','stayed','arrive','began','begin','have','has','had','like','sank','sink','sell','selling','spend','bring','give','work','working','speak','remember','remembered','forget','forgot','become','became','know','write','writing','believe','believes','want','eat','mend','repair','correct','restore','wish','wishes','admire','buy','bought','borrow','close','closed','stick','stuck','strike','ask','live','decide','decided','take','taken','need','receive','compose','paint','spin','see','tell','come','submit','refer','distinguish','confuse','notice','try','talk','swim','wake','listen','hear','heard','send','adopt','say','book','win','won','watch','wear','rent','drink','leave','fail','owe','return','turn','finish','travel','insist','open','fall','fell','visit','smoke','rain','call','limit','find','prefer','frighten','frightens','share','desire','write','arrange','look','meet','adjust','dislike','hit','knock','beat','build','waste','warn','put','repair','study','effect','sharpen','do','learn','drive','sentence','discover','invent','wash','hold','help','rush','talked','telephoned','telephone'
  ]);
  const LINKING = new Set(['am','is','are','was','were','be','been','being','become','became','feel','felt','look','seem','get','got']);
  const PHRASAL_PARTICLES = new Set(['up','down','out','off','on','back','away','through','over']);
  const IRREGULAR_V2V3 = new Set(['made','got','gone','went','seen','saw','known','knew','thought','bought','brought','taken','took','spoken','spoke','written','wrote','given','gave','found','felt','fell','heard','fallen','left','lost','sent','built','caught','taught','sold','told','won','sank','sunk','stuck','stood','held','read']);

  const word = t => String(t||'').toLowerCase().replace(/[’]/g,"'").replace(/^[^a-z0-9']+|[^a-z0-9']+$/g,'').replace(/^'+|'+$/g,'');
  const isPunct = t => /^[,.;:!?—–-]+$/.test(t);

  function tokenize(text){
    return String(text||'')
      .replace(/([,.;:!?()])/g,' $1 ')
      .replace(/([—–])/g,' $1 ')
      .replace(/\s+/g,' ')
      .trim().split(' ').filter(Boolean)
      .map((text,index)=>({text,index,lower:word(text),pos:'Other',role:null}));
  }

  function fillAnswer(question, answer){
    let q=String(question||'').trim();
    let a=String(answer||'').trim();
    const blanks=(q.match(/_{2,}/g)||[]).length;
    if(!blanks) return q;
    if(a==='—'||a==='-') a='';
    let parts=a.includes('/')?a.split(/\s*\/\s*/):[a];
    for(let i=0;i<blanks;i++) q=q.replace(/_{2,}/, parts[Math.min(i,parts.length-1)]||'');
    return q.replace(/\s+([?.!,;:])/g,'$1').replace(/\s{2,}/g,' ').trim();
  }

  function expandContractions(text){
    let x=String(text||'');
    const pairs=[
      [/\bI'm\b/gi,'I am'],[/\byou're\b/gi,'you are'],[/\bhe's\b/gi,'he is'],[/\bshe's\b/gi,'she is'],[/\bit's\b/gi,'it is'],[/\bwe're\b/gi,'we are'],[/\bthey're\b/gi,'they are'],
      [/\bI've\b/gi,'I have'],[/\byou've\b/gi,'you have'],[/\bwe've\b/gi,'we have'],[/\bthey've\b/gi,'they have'],[/\bI'll\b/gi,'I will'],[/\byou'll\b/gi,'you will'],[/\bhe'll\b/gi,'he will'],[/\bshe'll\b/gi,'she will'],[/\bwe'll\b/gi,'we will'],[/\bthey'll\b/gi,'they will'],
      [/\bI'd\b/gi,'I would'],[/\byou'd\b/gi,'you would'],[/\bhe'd\b/gi,'he would'],[/\bshe'd\b/gi,'she would'],[/\bwe'd\b/gi,'we would'],[/\bthey'd\b/gi,'they would'],
      [/\bcan't\b/gi,'can not'],[/\bcannot\b/gi,'can not'],[/\bdon't\b/gi,'do not'],[/\bdoesn't\b/gi,'does not'],[/\bdidn't\b/gi,'did not'],[/\bisn't\b/gi,'is not'],[/\baren't\b/gi,'are not'],[/\bwasn't\b/gi,'was not'],[/\bweren't\b/gi,'were not'],[/\bhaven't\b/gi,'have not'],[/\bhasn't\b/gi,'has not'],[/\bhadn't\b/gi,'had not'],[/\bwon't\b/gi,'will not'],[/\bwouldn't\b/gi,'would not'],[/\bcouldn't\b/gi,'could not'],[/\bshouldn't\b/gi,'should not'],[/\bmustn't\b/gi,'must not'],
      [/\bthere's\b/gi,'there is'],[/\bwhat's\b/gi,'what is'],[/\bwhere's\b/gi,'where is'],[/\bwho's\b/gi,'who is'],[/\bhow's\b/gi,'how is']
    ];
    pairs.forEach(([re,to])=>x=x.replace(re,to));
    return x;
  }

  function fillMarked(question, answer){
    let q=String(question||'').trim();
    let a=String(answer||'').trim();
    const blanks=(q.match(/_{2,}/g)||[]).length;
    if(!blanks) return q;
    if(a==='—'||a==='-') a='';
    const parts=a.includes('/')?a.split(/\s*\/\s*/):[a];
    for(let i=0;i<blanks;i++){
      const val=parts[Math.min(i,parts.length-1)]||'';
      q=q.replace(/_{2,}/,`§ANS§${val}§END§`);
    }
    return q;
  }

  function targetText(question, answer, guide={}){
    const q0=String(question||'');
    // When the item explicitly asks for an equivalent full sentence, analyze that answer sentence itself.
    if(/=\s*_{2,}/.test(q0) && String(answer||'').trim().split(/\s+/).length>=3) return expandContractions(String(answer).trim());
    const marked=fillMarked(question,answer);
    // Separate speaker turns and completed sentences first.
    let pieces=marked
      .replace(/\b(?:Man|Woman|A|B)\s*:/g,'¦')
      .split(/¦|(?<=[.!?])\s+|\s+[—–]\s+|;/)
      .map(x=>x.trim()).filter(Boolean);
    let hit=pieces.find(p=>p.includes('§ANS§')) || marked;
    // For most items a comma separates clauses; use the clause that actually contains the blank.
    if(!/tag/i.test(String(guide?.topic||'')) && hit.includes(',') && !/^[—–-]?\s*§ANS§/.test(hit.trim())){
      const commaParts=hit.split(',').map(x=>x.trim()).filter(Boolean);
      const ch=commaParts.find(p=>p.includes('§ANS§'));
      if(ch && ch.split(/\s+/).length>=2) hit=ch;
    }
    hit=hit.replace(/§ANS§|§END§/g,'').trim().replace(/^[—–-]\s*/,'');
    hit=hit.replace(/^(?:Yes|No|Right|Sorry)\b\s*,?\s*/i,'').replace(/^Of course\s+/i,'');
    return expandContractions(hit);
  }

  function looksVerb(w){
    if(!w) return false;
    if(VERBS.has(w)||IRREGULAR_V2V3.has(w)) return true;
    const tries=[];
    if(/ies$/.test(w)) tries.push(w.slice(0,-3)+'y');
    if(/es$/.test(w)) tries.push(w.slice(0,-2),w.slice(0,-1));
    if(/s$/.test(w)) tries.push(w.slice(0,-1));
    if(/ied$/.test(w)) tries.push(w.slice(0,-3)+'y');
    if(/ed$/.test(w)) tries.push(w.slice(0,-2),w.slice(0,-1));
    if(/ing$/.test(w)) tries.push(w.slice(0,-3),w.slice(0,-3)+'e');
    return tries.some(x=>VERBS.has(x));
  }

  function assignPos(tokens){
    tokens.forEach((t,i)=>{
      const w=t.lower;
      if(!w || isPunct(t.text)){t.pos='Punct';return;}
      if(QWORDS.has(w)){t.pos='QW';return;}
      if(AUX.has(w) || /^(don't|doesn't|didn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|won't|wouldn't|can't|couldn't|shouldn't|mustn't)$/.test(w)){t.pos='Aux';return;}
      if(POSSESSIVE_DET.has(w)){
        const next=word(tokens[i+1]?.text);
        const nextLooksNominal=next && !PREPS.has(next) && !CONJS.has(next) && !AUX.has(next) && !looksVerb(next) && !isPunct(tokens[i+1]?.text||'');
        if(nextLooksNominal){t.pos='Det';return;}
      }
      if(SUBJECT_PRON.has(w)||OBJECT_PRON.has(w)||POSSESSIVE_PRON.has(w)){t.pos='Pron';return;}
      if(POSSESSIVE_DET.has(w)||DETS.has(w)){t.pos='Det';return;}
      if(PREPS.has(w)){t.pos='Prep';return;}
      if(CONJS.has(w)){t.pos='Conj';return;}
      if(/^\d+$/.test(w)||['one','two','three','four','five','six','seven','eight','nine','ten','first','second','third','half'].includes(w)){t.pos='Num';return;}
      if(COMMON_ADVS.has(w)||/ly$/.test(w)){t.pos='Adv';return;}
      if(COMMON_ADJS.has(w)||/(ous|ful|less|ive|able|ible|al|ic|ish)$/.test(w)){t.pos='Adj';return;}
      if(/ing$/.test(w) && ['Det','Adj','Num'].includes(tokens[i-1]?.pos)){t.pos='N';return;}
      if(looksVerb(w)||/(ed|ing)$/.test(w)){t.pos='V';return;}
      if(PHRASAL_PARTICLES.has(w)){t.pos='Part';return;}
      if(/('s|s')$/.test(w)){t.pos='Det';return;}
      t.pos='N';
    });
    return tokens;
  }

  function nextContent(tokens,i){
    for(let j=i;j<tokens.length;j++) if(tokens[j].pos!=='Punct') return j;
    return -1;
  }
  function prevContent(tokens,i){
    for(let j=i;j>=0;j--) if(tokens[j].pos!=='Punct') return j;
    return -1;
  }

  function isQuestion(tokens,text){
    const first=tokens.find(t=>t.pos!=='Punct');
    return /\?\s*$/.test(text)||first?.pos==='QW'||first?.pos==='Aux';
  }

  function verbIndices(tokens){
    return tokens.map((t,i)=>(t.pos==='V'||(t.pos!=='Aux'&&looksVerb(t.lower)))?i:-1).filter(i=>i>=0);
  }

  function findMainVerb(tokens,text){
    const vis=verbIndices(tokens);
    const aux=tokens.map((t,i)=>t.pos==='Aux'?i:-1).filter(i=>i>=0);
    const question=isQuestion(tokens,text);
    // Any lexical verb normally carries the main action; choose first one after the first auxiliary in questions/tense chains.
    if(vis.length){
      if(aux.length){
        const aw=tokens[aux[0]].lower;
        const after=vis.find(i=>i>aux[0]);
        if(after!==undefined){
          // With BE, only an -ing/past-participle immediately associated with BE is a lexical verb.
          // This prevents nouns such as "books" or adjective "left" being misread as a verb later in the sentence.
          if(['am','is','are','was','were','be','been'].includes(aw)){
            const cand=tokens[after].lower;
            if(/(ing|ed)$/.test(cand)||IRREGULAR_V2V3.has(cand)) return after;
            return aux[0];
          }
          return after;
        }
      }
      // Do not treat an initial -ing subject as main verb when a later linking be exists.
      if(vis[0]===0 && /ing$/i.test(tokens[0].lower)){
        const beIdx=aux.find(i=>i>0&&['am','is','are','was','were'].includes(tokens[i].lower));
        if(beIdx!==undefined) return beIdx;
      }
      return vis[0];
    }
    // If there is no lexical verb, a form of BE/HAVE may be the main/linking verb.
    const link=aux.find(i=>['am','is','are','was','were','be','have','has','had'].includes(tokens[i].lower));
    return link===undefined?-1:link;
  }

  function firstAuxBefore(tokens,verbIdx){
    for(let i=0;i<verbIdx;i++) if(tokens[i].pos==='Aux') return i;
    return -1;
  }

  function subjectRange(tokens,verbIdx,text){
    if(verbIdx<0) return null;
    const question=isQuestion(tokens,text);
    const first=tokens.findIndex(t=>t.pos!=='Punct');
    const firstAux=tokens.findIndex(t=>t.pos==='Aux');
    // Question inversion: QW? + Aux + Subject + (more Aux) + main V
    if(question && firstAux>=0 && firstAux<=verbIdx){
      if(verbIdx===firstAux && ['am','is','are','was','were'].includes(tokens[verbIdx].lower)){
        let st=nextContent(tokens,verbIdx+1), en=st;
        if(st<0) return null;
        for(let i=st+1;i<tokens.length;i++){
          if(tokens[i].pos==='Punct'||tokens[i].pos==='Prep'||tokens[i].pos==='Adv'||tokens[i].pos==='Conj') break;
          en=i;
        }
        return [st,en];
      }
      let st=nextContent(tokens,firstAux+1);
      if(st<0) return null;
      // skip "not" only when it follows an auxiliary in an imperative-like construction
      while(st<verbIdx && tokens[st].lower==='not') st=nextContent(tokens,st+1);
      let en=st;
      for(let i=st+1;i<verbIdx;i++){
        if(tokens[i].pos==='Aux'||tokens[i].lower==='not') break;
        en=i;
      }
      return st<=en?[st,en]:null;
    }
    // Declarative auxiliary chain: subject is before the first auxiliary, not between aux and lexical verb.
    const finiteStart=firstAux>=0&&firstAux<verbIdx?firstAux:verbIdx;
    let st=first;
    if(firstAux>=0 && firstAux<verbIdx && ['since','after','although','while','when','before'].includes(tokens[first]?.lower)) {
      let candidate=-1;
      for(let i=firstAux-1;i>first;i--) if(['Det','Pron'].includes(tokens[i].pos)){candidate=i;break;}
      if(candidate>=0) st=candidate;
    }
    while(st<finiteStart && (tokens[st].pos==='Adv'||tokens[st].pos==='Conj'||tokens[st].pos==='Punct')) st++;
    // introductory prepositional phrase: skip through comma
    if(tokens[st]?.pos==='Prep'){
      const comma=tokens.findIndex((t,i)=>i>st&&i<finiteStart&&t.text===',');
      if(comma>=0) st=nextContent(tokens,comma+1);
    }
    const en=prevContent(tokens,finiteStart-1);
    return st>=0&&en>=st?[st,en]:null;
  }

  function makeSegment(tokens,start,end,tag,note){
    if(start<0||end<start) return null;
    const clean=tokens.slice(start,end+1).filter(t=>t.pos!=='Punct');
    if(!clean.length) return null;
    const text=clean.map(t=>t.text).join(' ').replace(/\s+([,.;!?])/g,'$1');
    const info=ROLE_INFO[tag]||ROLE_INFO.Other;
    clean.forEach(t=>{ if(!t.role) t.role=tag; });
    return {text,tag,role:info.en,thai:info.th,note:note||info.desc,start,end};
  }

  const PHRASAL_PAIRS = new Set(['wake up','take off','turn on','turn off','get off','take up','put on','go back','close up','make up','fall down','fell down','fallen down']);

  function analyzeClause(text, guide){
    const tokens=assignPos(tokenize(text));
    if(!tokens.length) return {text,pattern:'Clause',segments:[],tokens:[]};
    const segments=[];

    // Existential there: There is/are ... ("there" is a dummy subject used to introduce existence).
    if(tokens[0]?.lower==='there' && ['is','are','was','were'].includes(tokens[1]?.lower)) {
      segments.push(makeSegment(tokens,0,0,'S','There เป็น dummy subject: ไม่ได้แปลว่า “ที่นั่น” ในโครงสร้าง There is/are'));
      segments.push(makeSegment(tokens,1,1,'V','verb to be บอกว่ามี/มีอยู่'));
      let prep=tokens.findIndex((t,i)=>i>1&&t.pos==='Prep');
      let end=prep>0?prevContent(tokens,prep-1):prevContent(tokens,tokens.length-1);
      if(end>=2) segments.push(makeSegment(tokens,2,end,'C','สิ่งที่มีอยู่หรือถูกกล่าวถึง'));
      if(prep>0){
        let pe=prevContent(tokens,tokens.length-1);
        segments.push(makeSegment(tokens,prep,pe,'PrepP'));
      }
      const pattern='S + V + C' + (prep>0?' + PrepP':'');
      return {text,pattern,segments,tokens};
    }

    // Question word / multiword question phrase.
    if(tokens[0]?.pos==='QW'){
      let qEnd=0;
      const firstAux=tokens.findIndex(t=>t.pos==='Aux');
      if(firstAux>0) qEnd=prevContent(tokens,firstAux-1);
      else if(tokens[0].lower==='how' && ['often','much','many','long','far'].includes(tokens[1]?.lower)) qEnd=1;
      segments.push(makeSegment(tokens,0,Math.max(0,qEnd),'QW'));
    }

    const verbIdx=findMainVerb(tokens,text);
    let subj=subjectRange(tokens,verbIdx,text);

    // Auxiliary segment (outside subject and main verb).
    const auxIndices=tokens.map((t,i)=>t.pos==='Aux'?i:-1).filter(i=>i>=0&&i!==verbIdx&&i<verbIdx);
    if(auxIndices.length){
      // In questions, the first auxiliary is separated from the subject; in declaratives, show the tense chain.
      if(isQuestion(tokens,text)){
        segments.push(makeSegment(tokens,auxIndices[0],auxIndices[0],'Aux'));
        for(const ai of auxIndices.slice(1)) segments.push(makeSegment(tokens,ai,ai,'Aux'));
      }else{
        let first=auxIndices[0], last=first;
        for(const i of auxIndices.slice(1)){ if(i===last+1 || (i===last+2&&tokens[last+1]?.lower==='not')) last=i; else break; }
        segments.push(makeSegment(tokens,first,last,'Aux'));
      }
    }

    if(subj) segments.push(makeSegment(tokens,subj[0],subj[1],'S'));
    else if(verbIdx>=0 && (verbIdx===0 || tokens[0]?.lower==='please' || tokens.slice(0,verbIdx).every(t=>['Adv','Conj','Punct'].includes(t.pos)||t.lower==='please'))){
      segments.push({text:'(you)',tag:'S',role:'Subject',thai:'ประธานที่ละไว้',note:'ประโยคคำสั่งมักละประธาน you ไว้',start:-1,end:-1});
    }

    if(verbIdx>=0){
      const vw=tokens[verbIdx].lower;
      let verbEnd=verbIdx;
      if(tokens[verbIdx+1] && PHRASAL_PAIRS.has(`${vw} ${tokens[verbIdx+1].lower}`)){ tokens[verbIdx+1].pos='Part'; verbEnd=verbIdx+1; }
      segments.push(makeSegment(tokens,verbIdx,verbEnd,'V', LINKING.has(vw)?'กริยาหลัก/กริยาเชื่อมของประโยค':'กริยาหลักของประโยค'));

      // Causative make/have/let: V + O + V1.
      if(['make','made','let'].includes(vw) || (['have','had','has'].includes(vw) && /causative/i.test(guide?.topic||''))){
        const oStart=nextContent(tokens,verbIdx+1);
        let v1=-1;
        for(let i=oStart+1;i<tokens.length;i++) if(tokens[i].pos==='V'||VERBS.has(tokens[i].lower)){v1=i;break;}
        if(oStart>=0 && v1>oStart){
          segments.push(makeSegment(tokens,oStart,v1-1,'O'));
          segments.push(makeSegment(tokens,v1,v1,'V1','กริยารูปพื้นฐานที่ตามหลังโครงสร้าง causative'));
        }
      }

      const existingEnds=new Set(segments.flatMap(s=>Array.from({length:s.end-s.start+1},(_,k)=>s.start+k)));
      // Prepositional phrases, each starts at Prep and runs to comma/conjunction/next Prep.
      for(let i=0;i<tokens.length;i++){
        if(tokens[i].pos!=='Prep'||existingEnds.has(i)) continue;
        if(['put','take','turn'].includes(vw) && ['on','off'].includes(tokens[i].lower) && i>verbIdx+1){
          tokens[i].pos='Part'; segments.push(makeSegment(tokens,i,i,'Part','คำประกอบของ phrasal verb ที่แยกจากกริยาได้')); continue;
        }
        let end=i;
        for(let j=i+1;j<tokens.length;j++){
          if(tokens[j].pos==='Punct' || tokens[j].pos==='Conj' || existingEnds.has(j) || (tokens[j].pos==='Prep'&&j>i+1)) break;
          end=j;
        }
        segments.push(makeSegment(tokens,i,end,'PrepP'));
        i=end;
      }

      // Remaining material after verb becomes O / C / Adv based on verb and POS.
      const occupied=new Set(segments.flatMap(s=>Array.from({length:s.end-s.start+1},(_,k)=>s.start+k)));
      let restStart=nextContent(tokens,verbIdx+1);
      while(restStart>=0 && occupied.has(restStart)) restStart=nextContent(tokens,restStart+1);
      if(restStart>=0){
        let restEnd=restStart;
        for(let j=restStart+1;j<tokens.length;j++){
          if(tokens[j].pos==='Punct'||tokens[j].pos==='Conj'||occupied.has(j)||tokens[j].pos==='Prep') break;
          restEnd=j;
        }
        const span=tokens.slice(restStart,restEnd+1);
        const isLink=LINKING.has(vw);
        const hasAdj=span.some(t=>t.pos==='Adj');
        const hasAdv=span.every(t=>['Adv','Num'].includes(t.pos));
        let tag=isLink?'C':hasAdv?'Adv':'O';
        if(isLink&&hasAdj) tag='C';
        segments.push(makeSegment(tokens,restStart,restEnd,tag));
      }
    }

    // Add conjunctions and unclaimed adverb chunks for learning visibility.
    const covered=new Set(segments.flatMap(s=>Array.from({length:s.end-s.start+1},(_,k)=>s.start+k)));
    tokens.forEach((t,i)=>{
      if(covered.has(i)||t.pos==='Punct') return;
      if(t.pos==='Conj') segments.push(makeSegment(tokens,i,i,'Conj'));
      else if(t.pos==='Adv') segments.push(makeSegment(tokens,i,i,'Adv'));
    });

    // Elliptical short answers / question tags can contain an auxiliary but omit the repeated main verb: "shall we?", "Yes, I do."
    if(verbIdx<0){
      const ai=tokens.findIndex(t=>t.pos==='Aux');
      if(ai>=0){
        segments.push(makeSegment(tokens,ai,ai,'Aux'));
        let ss=-1,se=-1;
        if(ai===0 || ['so','neither','nor'].includes(tokens[0]?.lower)){ ss=nextContent(tokens,ai+1); while(ss>=0&&tokens[ss].lower==='not') ss=nextContent(tokens,ss+1); se=ss; }
        else { ss=nextContent(tokens,0); se=prevContent(tokens,ai-1); }
        if(ss>=0&&se>=ss) segments.push(makeSegment(tokens,ss,se,'S'));
        segments.push({text:'(กริยาหลักละไว้)',tag:'V',role:'Main verb',thai:'กริยาที่เข้าใจจากบริบท',note:'คำตอบสั้น/question tag มักละกริยาหลักที่กล่าวไปแล้ว',start:(se>=0?se+.5:ai+.5),end:(se>=0?se+.5:ai+.5)});
      }
    }
    // If parser could not find S/V because the correct answer is intentionally only a phrase, label it honestly as a fragment.
    if(!segments.length) segments.push(makeSegment(tokens,0,tokens.length-1,'Frag','วลี/คำตอบสั้นที่ไม่ได้มี S + V ครบในตัวเอง'));

    // sort, remove duplicate exact spans; phrase map is left-to-right.
    const unique=[]; const seen=new Set();
    segments.sort((a,b)=>a.start-b.start||a.end-b.end).forEach(s=>{
      if(!s) return; const k=`${s.start}:${s.end}:${s.tag}`; if(!seen.has(k)){seen.add(k);unique.push(s);}
    });

    // Token-level POS refinement from phrase roles.
    tokens.forEach((t,i)=>{
      if(t.pos==='N' && t.role==='S') t.detail='Noun in subject';
      if(t.pos==='N' && t.role==='O') t.detail='Noun in object';
      if(t.pos==='Pron' && t.role==='S') t.detail='Subject pronoun';
      if(t.pos==='Pron' && t.role==='O') t.detail='Object pronoun';
      if(t.pos==='V' && t.role==='V1') t.detail='Bare infinitive';
    });

    const order=unique.filter(s=>['QW','Aux','S','V','O','C','V1','Inf','Ger','PrepP','Part','Adv','Conj','Frag'].includes(s.tag));
    const pattern=(order.length?order.map(s=>s.tag).join(' + '):(guide?.pattern||'Clause'));
    return {text,pattern,segments:unique,tokens};
  }

  function tokenInfo(t){
    const pos=t.pos;
    if(pos==='Punct') return null;
    const map={
      QW:['QW','Question word','คำแสดงคำถาม'], Aux:['Aux','Auxiliary verb','กริยาช่วย'], Pron:['Pron','Pronoun','คำสรรพนาม'],
      Det:['Det','Determiner','คำกำหนดนาม/คำแสดงความเป็นเจ้าของ'], Prep:['Prep','Preposition','คำบุพบท'], Conj:['Conj','Conjunction','คำเชื่อม'],
      Adv:['Adv','Adverb','คำวิเศษณ์'], Adj:['Adj','Adjective','คำคุณศัพท์'], V:['V','Verb','คำกริยา'], N:['N','Noun','คำนาม/ส่วนของนามวลี'],
      Num:['Num','Number/quantifier','คำบอกจำนวน/ปริมาณ'], Part:['Part','Particle','คำประกอบ phrasal verb'], Other:['—','Other','คำประกอบอื่น']
    };
    const m=map[pos]||map.Other;
    let note='';
    if(t.detail==='Subject pronoun') note='รูปสรรพนามที่ทำหน้าที่เป็นประธาน';
    else if(t.detail==='Object pronoun') note='รูปสรรพนามที่ทำหน้าที่เป็นกรรม';
    else if(t.role && ROLE_INFO[t.role]) note=`อยู่ในส่วน ${t.role} (${ROLE_INFO[t.role].th}) ของประโยค`;
    else note=m[2];
    return {text:t.text,tag:m[0],role:m[1],thai:m[2],note};
  }

  function analyze(question, correctAnswer, guide={}){
    const full=fillAnswer(question,correctAnswer);
    const focus=targetText(question,correctAnswer,guide);
    // Keep clauses manageable; semicolon and dialogue markers can introduce another clause.
    const rawClauses=focus.split(/\s*;\s*|(?<=\?)\s+(?=[A-Z])|(?<=\.)\s+(?=[A-Z])/).map(s=>s.trim()).filter(Boolean);
    const clauses=(rawClauses.length?rawClauses:[focus]).slice(0,3).map(c=>analyzeClause(c,guide));
    return {fullSentence:full,focusSentence:focus,clauses,legend:ROLE_INFO};
  }

  return {analyze,fillAnswer,roles:ROLE_INFO,tokenInfo};
})();
