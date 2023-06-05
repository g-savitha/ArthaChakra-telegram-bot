import "./bot";
import "./reminder";
import Category from "../models/Category";

// Add default categories to the DB
async function initCategories(): Promise<void> {
  const defaultCategories = [
    "Food",
    "Rent",
    "Shopping",
    "Salary",
    "Bills",
    "Others",
  ];
  defaultCategories.forEach(async (category) => {
    let categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      categoryDoc = new Category({ name: category });
      await categoryDoc.save();
    }
  });
}

initCategories();
