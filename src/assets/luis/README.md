# Luis Asset Staging

โฟลเดอร์นี้ใช้เก็บ asset สำหรับระบบ `LUIS presence / progress / summon / pre-fight chaos`

## โครงสร้าง

- `images/`
  ภาพนิ่งหลักของ Luis และภาพสำหรับ reveal / intrusion
- `audio/`
  เสียงกระซิบ, glitch sting, hum, one-shot cue
- `video/`
  cut-in สั้น, intrusion clip, pre-fight reveal clip
- `fx/`
  scanline, noise, sigil, overlay texture, SVG effect
- `ui/`
  asset UI พิเศษ เช่น badge, protocol mark, corrupted card artwork

## Reference Asset ที่มีแล้ว

- `images/luis-main.png`
- `images/luis-shadow.png`

## Asset ที่แนะนำสำหรับ V1

### Images

- `luis-main.png`
- `luis-shadow.png`
- `luis-sigil.svg`
- `signal-noise.svg` หรือ `signal-noise.png`
- `arena-corruption-backdrop.webp` หรือทำเป็น CSS only

จำนวนแนะนำ:

- 4-6 ชิ้น

### Audio

- `whisper-01.ogg`
- `whisper-02.ogg`
- `whisper-03.ogg`
- `glitch-sting.ogg`
- `signal-hum.ogg`

จำนวนแนะนำ:

- 3-5 ไฟล์

### Video

- `pre-fight-intrusion.webm`
- `shadow-flash.webm`

จำนวนแนะนำ:

- 0-2 ไฟล์

หมายเหตุ:

- ถ้าไม่มีวิดีโอ V1 ก็ยังทำได้ดี
- ถ้าจะใช้ภาพเคลื่อนไหว ให้ prefer `webm/mp4` มากกว่า `gif`

## Reality Check

### 90%+ realistic

- static portrait reveal
- shadow flash
- CSS glitch / scanline / noise
- theme color hijack
- panel corruption
- framer-motion cut-in
- short audio stingers

### 75-90% realistic

- short video cut-in
- whisper TTS พร้อม subtitle fallback
- multi-page anomaly variants

### ต่ำกว่า 60% สำหรับ V1

- live distortion ของ YouTube/SoundCloud audio
- cutscene sync กับ external players แบบเป๊ะ
- FMV หลายกิ่ง
- GIF-heavy pipeline

## แนะนำสำหรับการผลิต

1. ทำ V1 ด้วย `image + CSS/fx + short audio`
2. เพิ่ม `video` เฉพาะจุด reveal สำคัญ
3. อย่าพึ่งทำระบบ cinematic ใหญ่เกินก่อน presence/progress จะนิ่ง
