import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
import { ICategory } from "./Category";

interface ITransaction extends Document {
  user: IUser;
  category: ICategory;
  transactionType: string;
  amount: number;
}

const transactionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  transactionType: { type: String, required: true },
  amount: { type: Number, required: true },
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
export { ITransaction };

export default Transaction;
