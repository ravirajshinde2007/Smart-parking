const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireRole('ADMIN', 'OPERATOR'));

router.get('/summary', async (req, res) => {
  try {
    const [[users]] = await pool.query(`SELECT COUNT(*) AS total FROM users WHERE role='USER'`);
    const [[lots]] = await pool.query(`SELECT COUNT(*) AS total FROM parking_lots`);
    const [[slots]] = await pool.query(`SELECT COUNT(*) AS total FROM parking_slots`);
    const [[vacant]] = await pool.query(`SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status='VACANT'`);
    const [[occupied]] = await pool.query(`SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status='OCCUPIED'`);
    const [[reserved]] = await pool.query(`SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status='RESERVED'`);
    const [[maintenance]] = await pool.query(`SELECT COUNT(*) AS total FROM parking_slots WHERE slot_status='MAINTENANCE'`);
    const [[bookings]] = await pool.query(`SELECT COUNT(*) AS total FROM bookings`);
    const [[activeBookings]] = await pool.query(`SELECT COUNT(*) AS total FROM bookings WHERE status IN ('RESERVED','PARKED','ENTRY_REVIEW','EXIT_REVIEW')`);
    const [[completed]] = await pool.query(`SELECT COUNT(*) AS total FROM bookings WHERE status='COMPLETED'`);
    const [[revenue]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='PAID'`);
    const [[pendingPayments]] = await pool.query(`SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status='PENDING'`);
    res.json({users:users.total,lots:lots.total,slots:slots.total,vacant:vacant.total,occupied:occupied.total,reserved:reserved.total,maintenance:maintenance.total,bookings:bookings.total,activeBookings:activeBookings.total,completed:completed.total,revenue:Number(revenue.total),pendingPayments:Number(pendingPayments.total)});
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load admin summary.'}); }
});

router.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id,first_name AS firstName,last_name AS lastName,email,phone,role,created_at AS createdAt FROM users ORDER BY created_at DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load users.'}); }
});

router.get('/parking', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id,p.name,p.state,p.city,p.area,p.locality,p.capacity,p.rate_per_hour AS rate,p.active,p.created_at AS createdAt,
             COUNT(s.id) AS slotCount,
             SUM(s.slot_status='VACANT') AS vacant,
             SUM(s.slot_status='RESERVED') AS reserved,
             SUM(s.slot_status='OCCUPIED') AS occupied,
             SUM(s.slot_status='MAINTENANCE') AS maintenance
      FROM parking_lots p LEFT JOIN parking_slots s ON s.parking_lot_id=p.id
      GROUP BY p.id ORDER BY p.created_at DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load parking locations.'}); }
});

router.get('/slots', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT s.id,s.slot_code AS slotCode,s.slot_status AS status,s.vehicle_type AS vehicleType,s.updated_at AS updatedAt,p.id AS parkingId,p.name AS parkingName,p.city,p.area FROM parking_slots s JOIN parking_lots p ON p.id=s.parking_lot_id ORDER BY p.name,s.id`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load slots.'}); }
});

router.get('/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.id,b.booking_code AS bookingCode,b.status,b.vehicle_type AS vehicleType,b.car_type AS carType,b.car_number AS carNumber,
             b.duration_hours AS hours,b.start_time AS startTime,b.end_time AS endTime,b.amount,b.created_at AS createdAt,
             u.first_name AS firstName,u.last_name AS lastName,u.email,u.phone,
             p.name AS parkingName,p.city,p.area,s.slot_code AS slotCode,
             py.method AS paymentMethod,py.transaction_id AS transactionId,py.status AS paymentStatus,py.paid_at AS paidAt
      FROM bookings b JOIN users u ON u.id=b.user_id JOIN parking_lots p ON p.id=b.parking_lot_id JOIN parking_slots s ON s.id=b.parking_slot_id
      LEFT JOIN payments py ON py.booking_id=b.id ORDER BY b.created_at DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load bookings.'}); }
});

router.get('/payments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT py.id,py.amount,py.method,py.transaction_id AS transactionId,py.status,py.paid_at AS paidAt,py.created_at AS createdAt,
             b.booking_code AS bookingCode,u.first_name AS firstName,u.last_name AS lastName,u.email,
             p.name AS parkingName,s.slot_code AS slotCode
      FROM payments py JOIN bookings b ON b.id=py.booking_id JOIN users u ON u.id=b.user_id
      JOIN parking_lots p ON p.id=b.parking_lot_id JOIN parking_slots s ON s.id=b.parking_slot_id
      ORDER BY py.created_at DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load payments.'}); }
});

router.get('/access-logs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id,a.event_type AS eventType,a.event_time AS eventTime,a.detected_plate AS detectedPlate,a.expected_plate AS expectedPlate,
             a.plate_match AS plateMatch,a.ocr_confidence AS ocrConfidence,a.notes,
             b.booking_code AS bookingCode,b.car_number AS carNumber,u.first_name AS firstName,u.last_name AS lastName,
             p.name AS parkingName,s.slot_code AS slotCode
      FROM access_logs a JOIN bookings b ON b.id=a.booking_id JOIN users u ON u.id=b.user_id
      JOIN parking_lots p ON p.id=b.parking_lot_id JOIN parking_slots s ON s.id=b.parking_slot_id
      ORDER BY a.event_time DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({message:'Unable to load access logs.'}); }
});

module.exports = router;
