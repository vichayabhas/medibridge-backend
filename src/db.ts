import mongoose from "mongoose";
import dns from "dns";
import { isMongo } from "./moduleSupport/configTypes";

// Force Node.js to use Google DNS instead of your ISP
dns.setServers(["8.8.8.8", "8.8.4.4"]);
export default async function connectDB() {
  if (!isMongo) {
    return;
  }
  // console.log(process.env.MONGO_URI)
  const conn = await mongoose.connect(process.env.MONGO_URI || "");
  console.log(`MongoDB Connected: ${conn.connection.host}`);
}
