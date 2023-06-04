import mongoose from "../src/db";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model("Category", categorySchema);
