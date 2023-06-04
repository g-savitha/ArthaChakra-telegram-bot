import mongoose from "../src/db";

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  transactionType: { type: String, required: true },
  amount: { type: Number, required: true },
  created: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
