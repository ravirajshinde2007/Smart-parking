const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/', requireAuth, async (req,res)=>{
  try {
    const [rows] = await pool.query(`
      SELECT b.id,b.booking_code AS bookingCode,b.parking_lot_id AS parkingId,
             p.name AS parkingName,p.area AS parkingArea,p.city AS parkingCity,
             s.slot_code AS slotId,b.status,b.created_at AS createdAt,
             b.vehicle_type AS vehicleType,b.car_type AS carType,b.car_number AS carNumber,
             b.duration_hours AS hours,b.start_time AS startTime,b.end_time AS endTime,
             b.amount,
             py.method AS paymentMethod,py.transaction_id AS txnId,py.paid_at AS paidAt,py.status AS paymentStatus
      FROM bookings b
      JOIN parking_lots p ON p.id=b.parking_lot_id
      JOIN parking_slots s ON s.id=b.parking_slot_id
      LEFT JOIN payments py ON py.booking_id=b.id
      WHERE b.user_id=? ORDER BY b.created_at DESC`, [req.user.id]);
    res.json(rows);
  } catch(e){ console.error(e); res.status(500).json({message:'Unable to load bookings.'}); }
});

router.post('/', requireAuth, async (req,res)=>{
  const conn=await pool.getConnection();
  try {
    const { parkingId, slotId, vehicleType, carType, carNumber, hours, payment }=req.body;
    if(!parkingId||!slotId||!vehicleType||!carType||!carNumber||!hours||!payment?.method)
      return res.status(400).json({message:'Booking and payment details are required.'});

    await conn.beginTransaction();

    const [slots]=await conn.query(
      `SELECT s.id,s.slot_status,p.rate_per_hour,p.name,p.area,p.city
       FROM parking_slots s JOIN parking_lots p ON p.id=s.parking_lot_id
       WHERE s.parking_lot_id=? AND s.slot_code=? FOR UPDATE`,
      [parkingId,slotId]
    );
    const slot=slots[0];
    if(!slot || slot.slot_status!=='VACANT'){
      await conn.rollback();
      return res.status(409).json({message:'This slot is no longer available.'});
    }

    const h=Math.max(1,Math.min(24,Number(hours)));
    const amount=Number(slot.rate_per_hour)*h;
    const bookingCode='PS'+Date.now().toString().slice(-8)+Math.floor(Math.random()*90+10);
    const startTime=new Date();

    const [b]=await conn.query(
      `INSERT INTO bookings(booking_code,user_id,parking_lot_id,parking_slot_id,vehicle_type,car_type,car_number,duration_hours,start_time,amount,status)
       VALUES(?,?,?,?,?,?,?,?,?,?, 'RESERVED')`,
      [bookingCode,req.user.id,parkingId,slot.id,vehicleType,carType,String(carNumber).toUpperCase().trim(),h,startTime,amount]
    );

    const txn=payment.txnId || ('PS'+Date.now()+Math.floor(Math.random()*1000));
    await conn.query(
      `INSERT INTO payments(booking_id,amount,method,transaction_id,status,paid_at) VALUES(?,?,?,?, 'PAID', NOW())`,
      [b.insertId,amount,payment.method,txn]
    );

    await conn.query(`UPDATE parking_slots SET slot_status='RESERVED' WHERE id=?`,[slot.id]);
    await conn.query(`INSERT INTO notifications(user_id,title,message) VALUES(?,?,?)`,
      [req.user.id,'Booking confirmed',`Booking ${bookingCode} confirmed for slot ${slotId}.`]);

    await conn.commit();
    res.status(201).json({bookingId:b.insertId,bookingCode,amount,transactionId:txn});
  } catch(e){
    await conn.rollback(); console.error(e); res.status(500).json({message:'Booking failed.'});
  } finally { conn.release(); }
});

router.post('/:id/cancel', requireAuth, async (req,res)=>{
  const conn=await pool.getConnection();
  try{
    await conn.beginTransaction();
    const [rows]=await conn.query(`SELECT * FROM bookings WHERE id=? AND user_id=? FOR UPDATE`,[req.params.id,req.user.id]);
    const b=rows[0];
    if(!b) return res.status(404).json({message:'Booking not found.'});
    if(b.status!=='RESERVED') return res.status(400).json({message:'Only reserved bookings can be cancelled.'});
    await conn.query(`UPDATE bookings SET status='CANCELLED' WHERE id=?`,[b.id]);
    await conn.query(`UPDATE parking_slots SET slot_status='VACANT' WHERE id=?`,[b.parking_slot_id]);
    await conn.commit();
    res.json({message:'Reservation cancelled.'});
  }catch(e){await conn.rollback();console.error(e);res.status(500).json({message:'Cancellation failed.'});}
  finally{conn.release();}
});

module.exports=router;
