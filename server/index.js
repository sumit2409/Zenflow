const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const mongoose = require('mongoose')

const JWT_SECRET = process.env.ZENFLOW_SECRET || 'dev-secret'
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zenflow'

// Fallback to file storage if MongoDB is not available
const DATA_FILE = require('path').join(__dirname, 'data.json')
let useFileStorage = false

// Mongoose models (defined but used only when connected)
const userSchema = new mongoose.Schema({ username: {type:String, unique:true}, password: String, created: Number })
const logSchema = new mongoose.Schema({ user: String, date: String, type: String, value: Number })
const metaSchema = new mongoose.Schema({ user: String, meta: mongoose.Schema.Types.Mixed })

let User, Log, Meta

async function connectDb(){
  try{
    await mongoose.connect(MONGODB_URI, {useNewUrlParser:true, useUnifiedTopology:true})
    User = mongoose.model('User', userSchema)
    Log = mongoose.model('Log', logSchema)
    Meta = mongoose.model('Meta', metaSchema)
    console.log('Connected to MongoDB')
    useFileStorage = false
  }catch(err){
    console.warn('MongoDB connection failed, falling back to file storage:', err.message)
    useFileStorage = true
    // ensure data file exists
    try{ if (!require('fs').existsSync(DATA_FILE)) require('fs').writeFileSync(DATA_FILE, JSON.stringify({users:{},logs:{},meta:{}},null,2)) }catch(e){console.error('Failed to create data file', e)}
  }
}

connectDb()

const app = express()
app.use(cors())
app.use(bodyParser.json())

function genToken(username){ return jwt.sign({username}, JWT_SECRET, {expiresIn: '7d'}) }

function authMiddleware(req,res,next){
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({error:'missing auth'})
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({error:'bad auth'})
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload.username
    next()
  } catch(e){ return res.status(401).json({error:'invalid token'}) }
}

app.post('/api/register', async (req,res) => {
  const {username, password} = req.body||{}
  if (!username || !password) return res.status(400).json({error:'username and password required'})
  try{
    if (useFileStorage) {
      const fs = require('fs')
      const data = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
      if (data.users[username]) return res.status(409).json({error:'user exists'})
      const hash = bcrypt.hashSync(password, 8)
      data.users[username] = {password: hash, created: Date.now()}
      fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2),'utf8')
      const token = genToken(username)
      return res.json({username, token})
    }
    const exists = await User.findOne({username}).exec()
    if (exists) return res.status(409).json({error:'user exists'})
    const hash = bcrypt.hashSync(password, 8)
    const u = new User({username, password: hash, created: Date.now()})
    await u.save()
    const token = genToken(username)
    res.json({username, token})
  }catch(e){ console.error(e); res.status(500).json({error:'server error'}) }
})

app.post('/api/login', async (req,res) => {
  const {username, password} = req.body||{}
  if (!username || !password) return res.status(400).json({error:'username and password required'})
  try{
    if (useFileStorage) {
      const fs = require('fs')
      const data = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
      const user = data.users[username]
      if (!user) return res.status(401).json({error:'invalid credentials'})
      const ok = bcrypt.compareSync(password, user.password)
      if (!ok) return res.status(401).json({error:'invalid credentials'})
      const token = genToken(username)
      return res.json({username, token})
    }
    const user = await User.findOne({username}).exec()
    if (!user) return res.status(401).json({error:'invalid credentials'})
    const ok = bcrypt.compareSync(password, user.password)
    if (!ok) return res.status(401).json({error:'invalid credentials'})
    const token = genToken(username)
    res.json({username, token})
  }catch(e){ console.error(e); res.status(500).json({error:'server error'}) }
})

app.get('/api/me', authMiddleware, (req,res)=>{
  res.json({username: req.user})
})

app.get('/api/logs', authMiddleware, async (req,res)=>{
  try{
    if (useFileStorage) {
      const fs = require('fs')
      const data = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
      // file logs stored by user/date type mapping; convert to array
      const arr = []
      const userLogs = data.logs[req.user] || {}
      Object.entries(userLogs).forEach(([date,types])=>{
        Object.entries(types).forEach(([type,val])=>{
          arr.push({date,type,value:val})
        })
      })
      return res.json({logs: arr})
    }
    const docs = await Log.find({user: req.user}).exec()
    // return as array
    const arr = docs.map(d=>({date:d.date,type:d.type,value:d.value}))
    res.json({logs: arr})
  }catch(e){ console.error(e); res.status(500).json({error:'server error'}) }
})

app.post('/api/logs', authMiddleware, async (req,res)=>{
  const {date, type, value} = req.body||{}
  if (!date || !type) return res.status(400).json({error:'date and type required'})
  try{
    if (useFileStorage) {
      const fs = require('fs')
      const data = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
      data.logs[req.user] = data.logs[req.user] || {}
      data.logs[req.user][date] = data.logs[req.user][date] || {}
      data.logs[req.user][date][type] = Number(value) || 0
      fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2),'utf8')
      return res.json({ok:true})
    }
    await Log.findOneAndUpdate({user: req.user, date, type}, {value: Number(value)||0}, {upsert:true}).exec()
    res.json({ok:true})
  }catch(e){ console.error(e); res.status(500).json({error:'server error'}) }
})

app.get('/api/meta', authMiddleware, async (req,res)=>{
  try{
    if (useFileStorage) {
      const fs = require('fs')
      const data = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
      return res.json({meta: data.meta[req.user] || {}})
    }
    const m = await Meta.findOne({user: req.user}).exec()
    res.json({meta: m ? m.meta : {}})
  }catch(e){ console.error(e); res.status(500).json({error:'server error'}) }
})

app.post('/api/meta', authMiddleware, async (req,res)=>{
  const {meta} = req.body||{}
  try{
    if (useFileStorage) {
      const fs = require('fs')
      const data = JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))
      data.meta[req.user] = meta || {}
      fs.writeFileSync(DATA_FILE, JSON.stringify(data,null,2),'utf8')
      return res.json({ok:true})
    }
    await Meta.findOneAndUpdate({user: req.user}, {meta: meta||{}}, {upsert:true}).exec()
    res.json({ok:true})
  }catch(e){ console.error(e); res.status(500).json({error:'server error'}) }
})

// serve frontend build when available
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const buildDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(buildDir));
  // respond to any other routes with index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildDir, 'index.html'));
  });
}

const port = process.env.PORT || 4000
app.listen(port, ()=> console.log('Zenflow server running on', port))
