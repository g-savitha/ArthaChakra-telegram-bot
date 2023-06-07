import TelegramBot from "node-telegram-bot-api";
import Category, { ICategory } from "../models/Category";

export default async function validateCategory(
  category: string,
  chatId: number,
  bot: TelegramBot
): Promise<ICategory | null> {
  const categoryDoc = await Category.findOne<ICategory>({ name: category });
  if (!categoryDoc) {
    const categories = await Category.find({});
    let message = "Available categories:\n";
    categories.forEach((category) => {
      message += `- ${category.name}\n`;
    });
    message += `\nThe category "${category}" doesn't exist. Would you like to create it? Use /category ${category} to create a new category.`;
    bot.sendMessage(chatId, message);
    return null;
  }
  return categoryDoc;
}
