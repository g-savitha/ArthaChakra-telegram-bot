import Category from "../models/Category";

export async function initCategories(): Promise<void> {
  const defaultCategories = [
    "Food",
    "Rent",
    "Shopping",
    "Salary",
    "Bills",
    "Others",
  ];

  for (const category of defaultCategories) {
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = new Category({ name: category });
      await categoryDoc.save();
    }
  }
}
