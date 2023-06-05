import mongoose from "../src/db";
import { Document } from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

interface ICategory extends Document {
  name: string;
  // other fields as necessary
}
export { ICategory };
export default mongoose.model("Category", categorySchema);
