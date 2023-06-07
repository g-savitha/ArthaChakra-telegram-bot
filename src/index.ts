import dotenv from "dotenv";
import connectPromise from "./db";
import { initCategories } from "../utils/initCategories";
import "./reminder";

dotenv.config();

// Connect to DB
connectPromise
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    initCategories();
  })
  .catch((error: Error) =>
    console.error("Error connecting to MongoDB:", error)
  );
