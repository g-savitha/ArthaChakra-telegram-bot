import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri: string = process.env.MONGODB_URI!;
if (!uri) {
  console.error("The MONGODB_URI environment variable is not set.");
  process.exit(1);
}

const connectPromise = mongoose.connect(uri, { socketTimeoutMS: 60000 });

export default connectPromise;
