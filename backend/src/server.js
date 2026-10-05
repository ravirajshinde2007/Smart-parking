require('dotenv').config();
const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const morgan=require('morgan');
const path=require('path');
const fs=require('fs');
const pool=require('./db');

const app=express();
const PORT=Number(process.env.PORT||5000);
const clientOrigin=process.env.CLIENT_ORIGIN||`http://localhost:${PORT}`;

app.use(helmet({
  crossOriginResourcePolicy:{policy:'cross-origin'},
  contentSecurityPolicy:{
    directives:{
      defaultSrc:["'self'"],
      scriptSrc:["'self'","https://unpkg.com"],
      scriptSrcAttr:["'unsafe-inline'"],
      styleSrc:["'self'","'unsafe-inline'","https://unpkg.com","https://fonts.googleapis.com"],
      imgSrc:["'self'","data:","blob:","https://unpkg.com","https://*.tile.openstreetmap.org","https://server.arcgisonline.com"],
      connectSrc:["'self'","https://unpkg.com","https://fonts.googleapis.com","https://fonts.gstatic.com","https://nominatim.openstreetmap.org","https://*.tile.openstreetmap.org","https://server.arcgisonline.com"],
      fontSrc:["'self'","data:","https://unpkg.com","https://fonts.gstatic.com"],
      objectSrc:["'none'"],
      baseUri:["'self'"]
    }
  }
}));
app.use(cors({origin:clientOrigin,credentials:false}));
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'));

const authLimiter=rateLimit({windowMs:15*60*1000,max:100,standardHeaders:true,legacyHeaders:false});
app.use('/api/auth',authLimiter);

app.get('/api/health',async(req,res)=>{
  try{await pool.query('SELECT 1');res.json({ok:true,service:'ParkSmart API',database:true});}
  catch(e){
    console.error('Database health check failed:',e.code,e.message);
    res.status(503).json({ok:false,service:'ParkSmart API',database:false,message:'Database unavailable',error:e.code||e.message});
  }
});

app.use('/api/auth',require('./routes/auth'));
const {requireAuth}=require('./middleware/auth');
app.use('/api/parking',require('./routes/parking'));
app.use('/api/bookings',require('./routes/bookings'));
app.use('/api/access',require('./routes/access'));
app.use('/api/payments',require('./routes/payments'));
app.use('/api/notifications',require('./routes/notifications'));

const frontend=path.resolve(__dirname,'../../frontend');
app.use(express.static(frontend));
app.get('*',(req,res)=>{
  if(req.path.startsWith('/api/')) return res.status(404).json({message:'API route not found'});
  res.sendFile(path.join(frontend,'index.html'));
});

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(err.status||500).json({message:err.message||'Server error'});
});

fs.mkdirSync(path.resolve(process.env.UPLOAD_DIR||'./uploads'),{recursive:true});
async function start(){
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connection: OK');
    app.listen(PORT,()=>console.log(`ParkSmart running on http://localhost:${PORT}`));
  } catch (e) {
    console.error('\nParkSmart could not connect to MySQL.\n');
    console.error('Error:', e.code || e.message);
    console.error('Check that MySQL80 is running and backend/.env has the correct DB_PASSWORD.');
    process.exit(1);
  }
}

start();
