import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./Category";

interface IUser extends Document {
  telegramId: number;
  balance: number;
  monthlyLimit: number;
  reminderTime?: string; // The '?' indicates that reminderTime can be undefined
  categories: ICategory["_id"][];
}

const userSchema: Schema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  balance: { type: Number, default: 0 },
  monthlyLimit: { type: Number, default: 0 },
  reminderTime: { type: String, default: "" },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

const User = mongoose.model("User", userSchema);

export { IUser, User };
