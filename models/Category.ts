import mongoose, { Document, Schema, Model } from "mongoose";

interface ICategory extends Document {
  name: string;
  // other fields as necessary
}

const categorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

const Category = mongoose.model("Category", categorySchema);

export { ICategory, Category };
