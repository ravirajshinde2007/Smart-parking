const express=require('express');
const pool=require('../db');
const {requireAuth}=require('../middleware/auth');
const router=express.Router();

router.get('/',requireAuth,async(req,res)=>{
  try{
    const [rows]=await pool.query(`
      SELECT py.id,py.booking_id AS bookingId,py.amount,py.method,py.transaction_id AS txnId,
             py.status,py.paid_at AS paidAt,b.booking_code AS bookingCode,
             p.name AS parkingName,b.duration_hours AS duration,b.vehicle_type AS vehicleType,
             b.car_type AS carType,b.car_number AS carNumber,s.slot_code AS slotId
      FROM payments py JOIN bookings b ON b.id=py.booking_id
      JOIN parking_lots p ON p.id=b.parking_lot_id JOIN parking_slots s ON s.id=b.parking_slot_id
      WHERE b.user_id=? ORDER BY py.created_at DESC`,[req.user.id]);
    res.json(rows);
  }catch(e){console.error(e);res.status(500).json({message:'Unable to load payments.'});}
});
module.exports=router;
