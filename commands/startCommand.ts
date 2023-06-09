import TelegramBot from "node-telegram-bot-api";
import Category from "../models/Category";
import User from "../models/User";
import introMessage from "../utils/introMessage";

export default async function startCommand(
  chatId: number,
  bot: TelegramBot
): Promise<void> {
  let user = await User.findOne({ telegramId: chatId });
  const defaultCategories = await Category.find({
    name: { $in: ["Food", "Rent", "Shopping", "Salary", "Bills", "Others"] },
  });
  if (!user) {
    user = new User({
      telegramId: chatId,
      balance: 0,
      monthlyLimit: 0,
      reminderEnabled: false,
      categories: defaultCategories.map((category) => category._id),
    });
    await user.save();
  }
  bot.sendMessage(
    chatId,
    `Welcome to ArthaChakra! I'm Kubera, your personal bot here to assist you in managing and monitoring your expenses effectively.`
  );
  await introMessage(chatId, bot);
}
