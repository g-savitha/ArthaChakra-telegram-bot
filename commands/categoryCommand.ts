import TelegramBot from "node-telegram-bot-api";
import Category from "../models/Category";
import User from "../models/User";

// creates a new category on user's request
export default async function categoryCommand(
  chatId: number,
  params: string[],
  bot: TelegramBot
) {
  if (params.length < 1) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /category new_category_name"
    );
    return;
  }
  const categoryName = params[0];

  let category = await Category.findOne({ name: categoryName });
  if (!category) {
    category = new Category({ name: categoryName });
    await category.save();
  }

  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command. "
    );
    return;
  }
  //Add category if user doesn't have it already

  if (!user.categories.includes(category._id)) {
    user.categories.push(category._id);
    await user.save();
  }
  bot.sendMessage(chatId, `Category "${categoryName}" has been added.`);
}
