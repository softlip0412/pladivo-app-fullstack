import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) cached = global.mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME || "pladivo-app",
    }).then(m => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
