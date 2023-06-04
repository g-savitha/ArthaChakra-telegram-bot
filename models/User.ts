import mongoose from "../src/db";

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  monthlyLimit: { type: Number, default: 0 },
  reminderTime: { type: Number },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
});

export default mongoose.model("User", userSchema);
