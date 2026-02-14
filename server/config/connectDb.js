import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("❌ Please provide MONGODB_URI in the .env file");
}

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  try {
    console.log("🔗 Connecting to MongoDB...");
    // optional debug (password hide kar dena baad me)
    console.log("URI loaded:", !!process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw new Error("MongoDB connection failed");
  }
}

export default connectDB;
