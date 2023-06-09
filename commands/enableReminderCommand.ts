import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";

export default async function enableReminderCommand(
  chatId: number,
  _params: string[],
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

  if (user.reminderEnabled) {
    bot.sendMessage(
      chatId,
      "A reminder is already enabled. Please disable the current reminder first if you want to change the status."
    );
    return;
  }

  user.reminderEnabled = true;
  await user.save();
  bot.sendMessage(
    chatId,
    "Daily reminder has been enabled. You will receive a reminder at 9 PM UTC every day."
  );
}
