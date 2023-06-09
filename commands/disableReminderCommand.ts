import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";

export default async function disbleReminderCommand(
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
  if (!user.reminderEnabled) {
    bot.sendMessage(chatId, "No reminder is set.");
    return;
  }
  user.reminderEnabled = false;
  await user.save();
  bot.sendMessage(chatId, `Your reminder has been disabled.`);
}
