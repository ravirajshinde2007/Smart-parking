const express=require('express');
const pool=require('../db');
const {requireAuth}=require('../middleware/auth');
const router=express.Router();
router.get('/',requireAuth,async(req,res)=>{
  const [rows]=await pool.query('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50',[req.user.id]);
  res.json(rows);
});
router.post('/:id/read',requireAuth,async(req,res)=>{
  try {
    await pool.query('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    res.json({ok:true});
  } catch (e) {
    res.status(500).json({message: 'Failed to update notification'});
  }
});
router.post('/read-all',requireAuth,async(req,res)=>{
  try {
    await pool.query('UPDATE notifications SET is_read=1 WHERE user_id=?',[req.user.id]);
    res.json({ok:true});
  } catch (e) {
    res.status(500).json({message: 'Failed to mark all notifications as read'});
  }
});
router.delete('/clear',requireAuth,async(req,res)=>{
  try {
    await pool.query('DELETE FROM notifications WHERE user_id=?',[req.user.id]);
    res.json({ok:true});
  } catch (e) {
    res.status(500).json({message: 'Failed to clear notifications'});
  }
});
module.exports=router;
