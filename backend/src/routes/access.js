const express=require('express');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const multer=require('multer');
const pool=require('../db');
const {requireAuth}=require('../middleware/auth');
const {readPlateFromImage}=require('../utils/ocr');
const {normalizePlate,plateMatches}=require('../utils/plate');

const router=express.Router();
const defaultUploadDir = process.env.VERCEL ? '/tmp/uploads' : './uploads';
const uploadRoot = path.resolve(process.env.UPLOAD_DIR || defaultUploadDir);
try { fs.mkdirSync(uploadRoot, { recursive: true }); } catch (e) { console.warn('Upload directory warning:', e.message); }
const upload=multer({
  dest:uploadRoot,
  limits:{fileSize:Number(process.env.MAX_UPLOAD_MB||8)*1024*1024},
  fileFilter:(req,file,cb)=>cb(null,file.mimetype.startsWith('image/'))
});

async function processEvent(req,res,eventType){
  const conn=await pool.getConnection();
  let filePath=null;
  try{
    const {id}=req.params;
    const [rows]=await conn.query(`
      SELECT b.*,s.id slot_id,s.slot_status,p.rate_per_hour
      FROM bookings b JOIN parking_slots s ON s.id=b.parking_slot_id
      JOIN parking_lots p ON p.id=b.parking_lot_id
      WHERE b.id=? AND b.user_id=? FOR UPDATE`,[id,req.user.id]);
    const b=rows[0];
    if(!b) return res.status(404).json({message:'Booking not found.'});
    if(eventType==='ENTRY' && b.status!=='RESERVED') return res.status(400).json({message:'This booking is not waiting for entry.'});
    if(eventType==='EXIT' && b.status!=='PARKED') return res.status(400).json({message:'This booking is not currently parked.'});
    if(!req.file) return res.status(400).json({message:'Camera photo is required.'});

    filePath=req.file.path;
    const ocr=await readPlateFromImage(filePath);
    const expected=normalizePlate(b.car_number);
    const detected=normalizePlate(ocr.candidate);
    const match=plateMatches(expected,detected);

    if(!match && String(process.env.ALLOW_MANUAL_PLATE).toLowerCase()!=='true'){
      await conn.beginTransaction();
      const sha=crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
      const [log]=await conn.query(
        `INSERT INTO access_logs(booking_id,event_type,detected_plate,expected_plate,plate_match,ocr_confidence,notes)
         VALUES(?,?,?,?,?,?,?)`,
        [b.id,eventType,detected||null,expected,0,ocr.confidence,'Plate mismatch - manual review required']
      );
      const [photo]=await conn.query(
        `INSERT INTO vehicle_photos(booking_id,access_log_id,event_type,file_name,file_path,mime_type,sha256,ocr_text,ocr_confidence)
         VALUES(?,?,?,?,?,?,?,?,?)`,
        [b.id,log.insertId,eventType,req.file.filename,filePath,req.file.mimetype,sha,ocr.text,ocr.confidence]
      );
      await conn.query(`UPDATE access_logs SET photo_id=? WHERE id=?`,[photo.insertId,log.insertId]);
      await conn.query(`UPDATE bookings SET status=? WHERE id=?`,[eventType==='ENTRY'?'ENTRY_REVIEW':'EXIT_REVIEW',b.id]);
      await conn.commit();
      return res.status(409).json({matched:false,reviewRequired:true,message:'Vehicle plate did not match the booking. The photo was saved for review.',detectedPlate:detected,expectedPlate:expected});
    }

    await conn.beginTransaction();
    const sha=crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
    const [log]=await conn.query(
      `INSERT INTO access_logs(booking_id,event_type,detected_plate,expected_plate,plate_match,ocr_confidence,notes)
       VALUES(?,?,?,?,?,?,?)`,
      [b.id,eventType,detected||null,expected,1,ocr.confidence, eventType==='ENTRY'?'Entry verified':'Exit verified']
    );
    const [photo]=await conn.query(
      `INSERT INTO vehicle_photos(booking_id,access_log_id,event_type,file_name,file_path,mime_type,sha256,ocr_text,ocr_confidence)
       VALUES(?,?,?,?,?,?,?,?,?)`,
      [b.id,log.insertId,eventType,req.file.filename,filePath,req.file.mimetype,sha,ocr.text,ocr.confidence]
    );
    await conn.query(`UPDATE access_logs SET photo_id=? WHERE id=?`,[photo.insertId,log.insertId]);

    if(eventType==='ENTRY'){
      await conn.query(`UPDATE bookings SET status='PARKED' WHERE id=?`,[b.id]);
      await conn.query(`UPDATE parking_slots SET slot_status='OCCUPIED' WHERE id=?`,[b.slot_id]);
    } else {
      const [entry]=await conn.query(`SELECT event_time FROM access_logs WHERE booking_id=? AND event_type='ENTRY' AND plate_match=1 ORDER BY event_time DESC LIMIT 1`,[b.id]);
      const entryTime=entry[0]?.event_time ? new Date(entry[0].event_time) : new Date(b.start_time);
      const exitTime=new Date();
      const hours=Math.max(1,Math.ceil((exitTime-entryTime)/3600000));
      const finalAmount=Number(b.rate_per_hour)*hours;
      const extra=Math.max(0,finalAmount-Number(b.amount));
      await conn.query(`UPDATE bookings SET status='COMPLETED',end_time=? WHERE id=?`,[exitTime,b.id]);
      await conn.query(`UPDATE parking_slots SET slot_status='VACANT' WHERE id=?`,[b.slot_id]);
      if(extra>0){
        await conn.query(`INSERT INTO payments(booking_id,amount,method,transaction_id,status) VALUES(?,?,?,?, 'PENDING')`,
          [b.id,extra,'Cash','EXTRA'+Date.now()+b.id]);
      }
    }

    await conn.commit();
    res.json({matched:true,reviewRequired:false,detectedPlate:detected,expectedPlate:expected,ocrConfidence:ocr.confidence});
  }catch(e){
    await conn.rollback().catch(()=>{});
    if(filePath) console.error(e);
    console.error(e);
    res.status(500).json({message:'Entry/exit processing failed.'});
  }finally{conn.release();}
}

router.post('/:id/entry',requireAuth,upload.single('photo'),(req,res)=>processEvent(req,res,'ENTRY'));
router.post('/:id/exit',requireAuth,upload.single('photo'),(req,res)=>processEvent(req,res,'EXIT'));

router.get('/:id/logs',requireAuth,async(req,res)=>{
  try{
    const [rows]=await pool.query(
      `SELECT a.id,a.event_type AS eventType,a.event_time AS time,a.detected_plate AS plate,a.expected_plate AS expectedPlate,
              a.plate_match AS match,a.ocr_confidence AS ocrConfidence,vp.id AS photoId
       FROM access_logs a LEFT JOIN vehicle_photos vp ON vp.id=a.photo_id
       JOIN bookings b ON b.id=a.booking_id
       WHERE a.booking_id=? AND b.user_id=? ORDER BY a.event_time`,[req.params.id,req.user.id]);
    res.json(rows);
  }catch(e){console.error(e);res.status(500).json({message:'Unable to load access logs.'});}
});

router.get('/photo/:photoId',requireAuth,async(req,res)=>{
  try{
    const [rows]=await pool.query(
      `SELECT vp.file_path FROM vehicle_photos vp JOIN bookings b ON b.id=vp.booking_id
       WHERE vp.id=? AND b.user_id=?`,[req.params.photoId,req.user.id]);
    if(!rows[0]) return res.status(404).end();
    res.sendFile(path.resolve(rows[0].file_path));
  }catch(e){res.status(500).end();}
});

module.exports=router;
