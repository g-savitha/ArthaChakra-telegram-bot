import TelegramBot from "node-telegram-bot-api";
import Category from "../models/Category";

// list all the available categories
export default async function listCategoriesCommand(
  chatId: number,
  bot: TelegramBot
) {
  const categories = await Category.find({});
  if (!categories || categories.length === 0) {
    bot.sendMessage(chatId, "No categories found.");
    return;
  }
  let message = "Available categories:\n";
  categories.forEach((category) => {
    message += `- ${category.name}\n`;
  });
  bot.sendMessage(chatId, message);
}
