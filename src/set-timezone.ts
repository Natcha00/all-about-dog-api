/**
 * ตั้ง timezone เป็น Asia/Bangkok (UTC+7) ให้ทั้ง app และการรัน seed
 * ต้อง import ไฟล์นี้เป็นอันดับแรกใน main.ts และใน seed script
 */
process.env.TZ = process.env.TZ || 'Asia/Bangkok';
