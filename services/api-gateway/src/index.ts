import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/database.js';

const app = express();

await connectDB();

app.listen(process.env.PORT, () => {
  console.log(`🚀 API escuchando en http://localhost:${process.env.PORT}`);
});