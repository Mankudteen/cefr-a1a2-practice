# CEFR Practice Hub

เว็บฝึกภาษาอังกฤษที่รวมแบบฝึกจากชุดเอกสาร CEFR ใน Google Drive แยกเป็น A1–A2, B1–B2, Reading, Listening และ Level Up

## เนื้อหาในเว็บ

- **A1–A2** — 20 Sets รวม 300 ข้อ พร้อมเฉลยละเอียด คำแปล Sentence Map คำศัพท์ และ Learning Path
- **B1–B2** — 9 Sets รวม 134 ข้อจากไฟล์ Practice; Set 4 ในต้นฉบับและ KEY ข้ามหมายเลขข้อ 4 จึงคงตามเอกสาร
- **Reading** — 119 ข้อ/กิจกรรม จาก Reading Test 1–3
  - Test 1 และ Test 2 ตรวจด้วย Official KEY
  - Test 3 ไม่มี KEY ในโฟลเดอร์ จึงทำและบันทึกคำตอบได้ แต่ไม่เดาเฉลย
- **Listening** — 35 ข้อ พร้อมไฟล์เสียงต้นฉบับจาก Listening 1/2 PPTX
  - Listening 1 ไม่มี Official KEY ในโฟลเดอร์ จึงไม่ตัดสินถูก/ผิด
  - Listening 2 แยกป้ายเฉลยที่อนุมานจาก transcript ออกจาก Official KEY
  - CEFR Listening Practice PDF มีเพียงลิงก์ FlexiQuiz จึงแสดงเป็นแหล่งฝึกเพิ่มเติม
- **Level Up** — 120 ข้อ/ช่อง จาก Focus on Form, Focus on Meaning และ Focus on Form and Meaning พร้อม KEY ที่พบในโฟลเดอร์ CEFR LEVEL UP

> จำนวนรวมบนหมวดต่าง ๆ นับตามการปรากฏในแต่ละเอกสาร จึงตั้งใจเก็บโจทย์ที่ซ้ำกันไว้เมื่อโจทย์เดียวกันปรากฏในคนละชุดเอกสาร

## ฟีเจอร์

- เลือกหมวดและชุดข้อสอบแยกกัน
- ตรวจคำตอบเฉพาะชุดที่มี KEY หรือมีสถานะ transcript-derived ชัดเจน
- รองรับคำถาม Multiple Choice และ Fill in the blanks
- เล่นไฟล์เสียง Listening จากหน้าเว็บ
- A1–A2 มีเฉลยภาษาไทยแบบละเอียด, S/V/O Sentence Map, คลังคำศัพท์ และระบบบทเรียน
- แบบทดสอบท้ายบท A1–A2 เกณฑ์ผ่าน 80%
- บันทึกคำตอบและความคืบหน้าใน `localStorage` ของ browser แต่ละคน
- รองรับมือถือและเดสก์ท็อป

## โจทย์เสริมบทเรียน

คลังโจทย์เสริมยังเก็บไว้ใน `lesson-extra-questions.js` แต่ปัจจุบันปิดการใช้งานด้วย `LESSON_EXTRA_ENABLED = false` และไม่แสดงในบทเรียนหรือแบบทดสอบท้ายบท

## การรันในเครื่อง

```bash
python3 -m http.server 8000
```

เปิด `http://127.0.0.1:8000/`

## Public site

https://mankudteen.github.io/cefr-a1a2-practice/
