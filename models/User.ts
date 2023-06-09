import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./Category";

interface IUser extends Document {
  telegramId: number;
  balance: number;
  monthlyLimit: number;
  reminderEnabled?: boolean; // The '?' indicates that reminderTime can be undefined
  categories: ICategory["_id"][];
  warningSent: boolean;
  warningResetDate: Date;
  timezone: string;
}

const userSchema: Schema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  balance: { type: Number, default: 0 },
  monthlyLimit: { type: Number, default: 0 },
  reminderEnabled: { type: Boolean, default: false },
  categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
  warningResetDate: { type: Date, default: Date.now },
  timezone: { type: String, default: "UTC" },
});

const User = mongoose.model("User", userSchema);

export { IUser };

export default User;
