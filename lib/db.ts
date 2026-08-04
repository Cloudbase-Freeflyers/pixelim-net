import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

export async function getDb() {
  await connectDB();
  if (!mongoose.connection.db) {
    throw new Error("Database not connected");
  }
  return mongoose.connection.db;
}
