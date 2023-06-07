import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";
export default async function setLimitCommand(
  chatId: number,
  params: string[],
  bot: TelegramBot
) {
  if (params.length < 1) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /set_limit amount"
    );
    return;
  }
  const limit = parseInt(params[0]);
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  user.monthlyLimit = limit;
  user.warningSent = false;
  await user.save();

  bot.sendMessage(chatId, `Your monthly limit has been set to ${limit}`);
}
