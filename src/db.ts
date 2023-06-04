import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri: string = process.env.MONGODB_URI!;
if (!uri) {
  console.error("The MONGODB_URI environment variable is not set.");
  process.exit(1);
}

mongoose
  .connect(uri)
  .catch((error: Error) =>
    console.error("Error connecting to MongoDB:", error)
  );

export default mongoose;
