import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";

export default async function getBalanceCommand(
  chatId: number,
  bot: TelegramBot
) {
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  bot.sendMessage(chatId, `Your current balance is ${user.balance}`);
}
