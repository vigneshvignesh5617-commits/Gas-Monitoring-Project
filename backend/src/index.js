import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import authRoutes from './routes/authRoutes.js'; // Import routes

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// USE ROUTES
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Simple request logger for debugging tunnel connectivity
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.originalUrl, req.ip);
  next();
});

// Catch server errors and log (helps diagnose EADDRINUSE etc.)
server.on('error', (err) => {
  console.error('Server error:', err && err.code ? err.code : err);
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// Route for phone app to call and broadcast weight
app.get('/update-gas', (req, res) => {
  const w = parseFloat(req.query.weight);
  if (Number.isNaN(w)) return res.status(400).json({ error: 'invalid weight' });
  // broadcast to all connected clients
  io.emit('update-weight', { weight: w });
  return res.json({ success: true, weight: w });
});

// Simulate leak endpoint that broadcasts a leak event
app.get('/simulate-leak', (req, res) => {
  io.emit('leak', { detected: true, time: Date.now() });
  return res.json({ success: true, leak: true });
});

// Bind explicitly to 0.0.0.0 so tunnels can reach the service on all interfaces
server.listen(PORT, '0.0.0.0', () => console.log(`Server & Socket.io running on port ${PORT} (0.0.0.0)`));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));