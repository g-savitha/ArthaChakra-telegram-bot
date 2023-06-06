import mongoose, { Document, Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  // other fields as necessary
}

const categorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
});

const Category = mongoose.model("Category", categorySchema);

export { ICategory };
export default Category;
