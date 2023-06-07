import TelegramBot from "node-telegram-bot-api";
import introMessage from "../utils/introMessage";

export default async function unKnownCommand(chatId: number, bot: TelegramBot) {
  bot.sendMessage(chatId, "Unknown command.");
  await introMessage(chatId, bot);
}
