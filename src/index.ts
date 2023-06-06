import dotenv from "dotenv";
dotenv.config();

import "./bot";
import "./reminder";
import connectPromise from "./db";
import Category from "../models/Category";

// Add default categories to the DB
async function initCategories(): Promise<void> {
  const defaultCategories = [
    "Food",
    "Rent",
    "Shopping",
    "Salary",
    "Bills",
    "Others",
  ];
  // for..of is compatible with async/await
  for (const category of defaultCategories) {
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = new Category({ name: category });
      await categoryDoc.save();
    }
  }
}

connectPromise
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    initCategories();
  })
  .catch((error: Error) =>
    console.error("Error connecting to MongoDB:", error)
  );
