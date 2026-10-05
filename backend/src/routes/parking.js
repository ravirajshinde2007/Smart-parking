const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const baseSelect = `
SELECT p.id,p.name,p.state,p.city,p.area,p.locality,
       p.latitude AS lat,p.longitude AS lng,p.capacity,p.rate_per_hour AS rate,
       SUM(s.slot_status='VACANT') AS available
FROM parking_lots p
LEFT JOIN parking_slots s ON s.parking_lot_id=p.id
WHERE p.active=1
`;

router.get('/search', requireAuth, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json([]);
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `${baseSelect} AND (p.name LIKE ? OR p.area LIKE ? OR p.locality LIKE ? OR p.city LIKE ? OR p.state LIKE ?)
       GROUP BY p.id ORDER BY available DESC, p.name`,
      [like,like,like,like,like]
    );
    res.json(rows);
  } catch (e) {
    console.error(e); res.status(500).json({message:'Unable to search parking.'});
  }
});

router.get('/nearby', requireAuth, async (req,res)=>{
  try {
    const lat=Number(req.query.lat), lng=Number(req.query.lng), radius=Number(req.query.radiusKm||15);
    if (!Number.isFinite(lat)||!Number.isFinite(lng)) return res.status(400).json({message:'Valid latitude and longitude are required.'});
    const [rows] = await pool.query(
      `${baseSelect}
       GROUP BY p.id
       HAVING (6371 * ACOS(LEAST(1, GREATEST(-1,
         COS(RADIANS(?))*COS(RADIANS(p.latitude))*COS(RADIANS(p.longitude)-RADIANS(?))
         +SIN(RADIANS(?))*SIN(RADIANS(p.latitude))
       )))) <= ?
       ORDER BY (6371 * ACOS(LEAST(1, GREATEST(-1,
         COS(RADIANS(?))*COS(RADIANS(p.latitude))*COS(RADIANS(p.longitude)-RADIANS(?))
         +SIN(RADIANS(?))*SIN(RADIANS(p.latitude))
       ))))`,
      [lat,lng,lat,radius,lat,lng,lat]
    );
    res.json(rows);
  } catch(e){ console.error(e); res.status(500).json({message:'Unable to find nearby parking.'}); }
});

router.get('/:id/slots', requireAuth, async (req,res)=>{
  try {
    const [rows] = await pool.query(
      `SELECT s.id,s.slot_code AS id,s.slot_status AS status
       FROM parking_slots s WHERE s.parking_lot_id=? ORDER BY s.id`,
      [req.params.id]
    );
    res.json(rows.map(x=>({...x,status:x.status.toLowerCase()})));
  } catch(e){ console.error(e); res.status(500).json({message:'Unable to load slots.'}); }
});

module.exports = router;
