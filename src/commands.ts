import TelegramBot, { Message } from "node-telegram-bot-api";
import startCommand from "../commands/startCommand";
import creditCommand from "../commands/creditCommand";
import debitCommand from "../commands/debitCommand";
import setLimitCommand from "../commands/setLimitCommand";
import getBalanceCommand from "../commands/getBalanceCommand";
import categoryCommand from "../commands/categoryCommand";
import enableReminderCommand from "../commands/enableReminderCommand";
import disableReminderCommand from "../commands/disableReminderCommand";
import listCategoriesCommand from "../commands/listCategoriesCommand";
import unKnownCommand from "../commands/unknownCommand";

export async function processMessage(
  msg: Message,
  bot: TelegramBot
): Promise<void> {
  const chatId = msg.chat.id;
  if (!msg.text) return;
  const command = msg.text.split(" ")[0];
  const params = msg.text.split(" ").slice(1);

  switch (command) {
    case "/start":
      await startCommand(chatId, bot);
      break;
    case "/credit":
      await creditCommand(chatId, params, bot);
      break;
    case "/debit":
      await debitCommand(chatId, params, bot);
      break;
    case "/set_limit":
      await setLimitCommand(chatId, params, bot);
      break;
    case "/get_balance":
      await getBalanceCommand(chatId, bot);
      break;
    case "/category":
      await categoryCommand(chatId, params, bot);
      break;
    case "/list":
      await listCategoriesCommand(chatId, bot);
      break;
    case "/enable_reminder":
      await enableReminderCommand(chatId, params, bot);
      break;
    case "/disable_reminder":
      await disableReminderCommand(chatId, bot);
      break;
    default:
      await unKnownCommand(chatId, bot);
  }
}
