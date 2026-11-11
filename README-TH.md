# THE CELESTIAL PROJECT — คู่มือเริ่มต้น

เว็บไซต์ Idol Survival / คอมมูร้อง / ใช้เสียงจริง / ไอดอล / Fan Club / Role-Play  
Frontend: React + Vite · Database/Auth: Supabase · Hosting: GitHub Pages

## ก่อนเริ่ม: เรื่องความปลอดภัยสำคัญมาก
- อย่าใส่รหัสผ่านทีมงานลงในโค้ด, GitHub, SQL หรือไฟล์ `.env` ที่อัปโหลดขึ้น GitHub
- รหัสทีมงานที่พิมพ์ไว้ในแชตถือว่าเปิดเผยแล้ว ควรเปลี่ยนรหัสก่อนใช้งานจริง
- ตัวอย่างนี้ไม่ได้ฝังรหัสทีมงานไว้ในเว็บ ต้องสร้างบัญชีผ่านหน้า Sign in แล้วให้ผู้ดูแลเปลี่ยน role เป็น `staff` ใน Supabase
- ใช้เฉพาะ `anon/publishable key` ในหน้าเว็บ ห้ามใช้ `service_role/secret key` เด็ดขาด
- แนะนำเปิด 2FA ให้บัญชี Supabase และ GitHub

## 1) สร้าง Supabase
1. เข้า https://supabase.com/ แล้วสร้าง Organization และ New project
2. ตั้งชื่อ `the-celestial-project` เลือก Region Singapore (ถ้ามี) และตั้ง Database Password ที่คาดเดายาก
3. รอโปรเจกต์พร้อม แล้วเข้า **Project Settings → API**
4. คัดลอก Project URL และ anon/publishable key
5. ไปที่ **SQL Editor → New query** เปิดไฟล์ `supabase/schema.sql` แล้วคัดลอกทั้งหมดไป Run
6. ไปที่ **Authentication → Providers → Email** เปิด Email provider
7. สำหรับระบบสมัครด้วย Username (ไม่ใช่อีเมลจริง) ให้ปิด Confirm email ในช่วงเริ่มทดสอบ หรือปรับขั้นตอนยืนยันตัวตนให้เหมาะกับการใช้งานจริงก่อนเปิดสาธารณะ
8. ใน **Authentication → URL Configuration** ใส่ Site URL เป็น URL เว็บไซต์ GitHub Pages หลัง deploy และเพิ่ม URL เดียวกันใน Redirect URLs

### Username + Password ทำงานอย่างไร
หน้าสมัครให้กรอก Username/Password เท่านั้น ระบบสร้างตัวระบุอีเมลภายในรูปแบบ `username@members.celestial.invalid` เพื่อใช้ Supabase Auth โดยไม่ให้ผู้ใช้ต้องกรอกอีเมลจริง นี่เป็นวิธีทำให้ UI ใช้ username/password ได้ แต่ยังคงใช้ระบบ session และ password hashing ของ Supabase Auth

ข้อจำกัด: ผู้ใช้จะกู้รหัสผ่านด้วยอีเมลไม่ได้ เพราะไม่มีอีเมลจริง ต้องออกแบบขั้นตอนกู้บัญชีโดยทีมงาน หรือเพิ่มช่องทางยืนยันตัวตนก่อนเปิดจริง ห้ามใช้วิธีนี้แทนระบบยืนยันตัวตนที่ต้องตรวจสอบอายุ/ตัวบุคคล

## 2) ตั้งค่าโปรเจกต์บนเครื่อง
1. ติดตั้ง Node.js รุ่น LTS จาก https://nodejs.org/
2. ดาวน์โหลด ZIP และแตกไฟล์
3. เปิด Terminal ในโฟลเดอร์โปรเจกต์
4. ติดตั้งแพ็กเกจ:
   ```bash
   npm install
   ```
5. คัดลอก `.env.example` เป็น `.env` แล้วใส่ URL และ anon key จาก Supabase:
   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. รันเว็บในเครื่อง:
   ```bash
   npm run dev
   ```
7. เปิด URL ที่ Terminal แจ้ง เช่น `http://localhost:5173`

## 3) สร้างบัญชีทีมงาน 8 คน
1. สมัครบัญชีทีมงานแต่ละคนจากหน้าเว็บไซต์ด้วย Username ของตนเองและรหัสผ่านที่ไม่ซ้ำกัน
2. ไป Supabase → Table Editor → `profiles`
3. ค้นหา username ของทีมงาน แล้วเปลี่ยน `role` จาก `fan` เป็น `staff`
4. ทำซ้ำให้ครบ 8 บัญชี
5. ทีมงานจะเห็นปุ่ม `STAFF CONTROL ROOM` หลังเข้าสู่ระบบ
6. หากต้องถอนสิทธิ์ ให้เปลี่ยน role กลับเป็น `fan`

**สำคัญ:** บัญชีทีมงานทั้ง 8 คนควรมีบัญชีแยกกัน ไม่ใช้ username/password เดียวร่วมกัน เพื่อดูประวัติและเพิกถอนสิทธิ์เป็นรายคนได้

## 4) Deploy ผ่าน GitHub Pages
1. สร้าง GitHub repository ชื่อ `the-celestial-project` (Public)
2. อัปโหลดไฟล์ทั้งหมดใน ZIP เข้า repository (อย่าอัปโหลด `.env`)
3. ไป Settings → Secrets and variables → Actions → New repository secret
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. ไป Settings → Pages → Build and deployment เลือก GitHub Actions
5. เพิ่มไฟล์ `.github/workflows/deploy.yml` ตามคู่มือนี้ (มีให้ในโฟลเดอร์โปรเจกต์)
6. Push/Commit แล้วรอ Actions ทำงาน จากนั้นเปิด URL GitHub Pages
7. กลับไป Supabase → Authentication → URL Configuration ตั้ง Site URL และ Redirect URLs ให้ตรงกับ URL จริง

## 5) วิธีใช้งานหลังบ้าน
- `TRAINEES`: เพิ่มเด็กฝึก, แก้ลำดับ Rank, เปลี่ยน Status, ใส่รูปด้วย Image URL
- `CONTENT`: ประกาศข่าวหน้า Home และเพิ่ม Banner
- `CALENDAR`: เพิ่มกำหนดการ
- `UNIFORM`: เพิ่มภาพชุดและคำอธิบาย
- `OVERVIEW`: ดูจำนวนเด็กฝึกและสถานะระบบ
- ข้อมูลที่บันทึกจะอยู่ใน Supabase ไม่ได้อยู่แค่ในเครื่องผู้ใช้

## 6) ปฏิทิน พ.ย. 2570 – มี.ค. 2571
หน้า Schedule มีตัวเปลี่ยนเดือนและอ่านข้อมูลจาก `calendar_events` ใน Supabase ตัวอย่างวันที่เริ่มต้นเป็นข้อมูลเดโม สามารถลบ/แก้ใน Table Editor หรือเพิ่มผ่านหลังบ้านได้

## 7) โลโก้
ไฟล์ `public/celestial-logo.svg` เป็น SVG แบบ self-contained โดยฝังภาพโลโก้ที่ตัดพื้นหลังดำออกไว้ภายใน SVG เพื่อให้เรียกใช้งานผ่าน `<img>` ได้โดยไม่ต้องแยกไฟล์ภาพต้นฉบับ หากต้องการเวกเตอร์แท้สำหรับพิมพ์ขนาดใหญ่ ควรวาดเส้นใหม่ใน Illustrator/Inkscape เพราะการฝัง PNG ใน SVG ไม่ได้ทำให้พิกเซลกลายเป็นเวกเตอร์

## 8) สิ่งที่ควรทำก่อนเปิดใช้งานจริง
- เพิ่มระบบ upload รูปผ่าน Supabase Storage แทนการใส่ URL รูปเอง
- เพิ่มหน้ารายละเอียดเด็กฝึก, คอมเมนต์/ชุมชน, ส่งเสียง audition และระบบ moderation
- ทำระบบนับคะแนนโหวตฝั่งฐานข้อมูล/Edge Function เพื่อป้องกันการแก้คะแนนจาก client
- เพิ่มระบบ audit log ว่า staff คนใดแก้ไขอะไร เมื่อใด
- เพิ่ม CAPTCHA / rate limit / นโยบายข้อมูลส่วนบุคคล / เงื่อนไขผู้เยาว์
- เพิ่มระบบ reset password หรือขั้นตอนยืนยันตัวตนก่อนใช้งานจริง
- ตรวจสอบ RLS ทุกตารางก่อนเปิด public

## ขอบเขตของ Starter นี้
นี่คือเว็บต้นแบบที่รันได้และเชื่อม Supabase ได้: Home, Trainees, Schedule, Vote, Fan Club Card, Rule, Uniform และ Staff Control Room เบื้องต้น ส่วน direct chat, ระบบส่งไฟล์เสียง, community feed, notification แบบ realtime, ระบบตัดสิน/นับคะแนนขั้นสูง และระบบจัดการสิทธิ์ละเอียด ยังต้องพัฒนาต่อก่อนเปิดใช้งานจริง
