import TelegramBot, { Message } from "node-telegram-bot-api";
import { processMessage } from "./commands";

const token: string = process.env.BOT_TOKEN!;
if (!token) {
  console.error("The BOT_TOKEN environment variable is not set");
  process.exit(1);
}

const bot: TelegramBot = new TelegramBot(token, { polling: true });
bot.on("message", (msg: Message) => processMessage(msg, bot));

export default bot;
