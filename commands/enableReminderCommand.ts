import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";

export default async function enableReminderCommand(
  chatId: number,
  params: string[],
  bot: TelegramBot
) {
  if (params.length < 1) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /enable_reminder HH:mm"
    );
    return;
  }
  const time = params[0];
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  if (user.reminderTime) {
    bot.sendMessage(
      chatId,
      "A reminder already exists. Please disable the current reminder first."
    );
    return;
  }
  user.reminderTime = time;
  await user.save();
  bot.sendMessage(chatId, `Daily reminder has been set at ${time}`);
}
