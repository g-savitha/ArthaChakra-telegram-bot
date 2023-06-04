import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../models/User";
import Category from "../models/Category";
import Transaction from "../models/Transaction";

async function startCommand(chatId: number, bot: TelegramBot): Promise<void> {
  let user = await User.findOne({ telegramId: chatId });
  if (!user) {
    user = new User({
      telegramId: chatId,
      balance: 0,
      monthlyLimit: 0,
      reminderTime: 0,
      categories: [],
    });
    await user.save();
  }
  bot.sendMessage(
    chatId,
    `Welcome to the Coin Keeper! I'm Penny the bot. Here's what you can do:
    
    - Add credit: /credit amount category (example: /credit 100 Food)
    - Add debit: /debit amount category (example: /debit 50 Rent)
    - Get balance: /get_balance
    - List categories: /list
    - Add category: /category new_category (example: /category Entertainment)
    - Set monthly limit: /set_limit amount (example: /set_limit 1000)
    - Enable reminder: /enable_reminder time_in_24hrs (example: /enable_reminder 21)
    - Disable reminder: /disable_reminder
    - Show all expenses: /show_all_expenses
    `
  );
}

async function creditCommand(
  chatId: number,
  params: string[],
  bot: TelegramBot
): Promise<void> {
  // Check if the command parameters are provided
  if (params.length < 2) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /credit amount category"
    );
    return;
  }
  const amount = parseInt(params[0]);
  const category = params.slice(1).join(" ");
  const user = await User.findOne({ telegramId: chatId });
  const categoryD = await Category.findOne({ name: category });

  // Check if the user exists
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  // Check if the category exists
  if (!categoryD) {
    bot.sendMessage(
      chatId,
      `The category "${category}" doesn't exist. Create it with /category ${category}.`
    );
    return;
  }
  // Create a new transaction
  const transaction = new Transaction({
    user: user._id,
    category: categoryD._id,
    transactionType: "credit", // set the transactionType to 'credit'
    amount: amount,
  });

  await transaction.save();

  user.balance += amount;
  await user.save();

  bot.sendMessage(
    chatId,
    `Credited ${amount} to your balance for category: ${category}. Your new balance is ${user.balance}`
  );
}

async function debitCommand(
  chatId: number,
  params: string[],
  bot: TelegramBot
): Promise<void> {
  if (params.length < 2) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /debit amount category"
    );
    return;
  }
  const amount = parseInt(params[0]);
  const category = params.slice(1).join(" ");

  const user = await User.findOne({ telegramId: chatId });
  const categoryD = await Category.findOne({ name: category });

  // Check if the user exists
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  // Check if the category exists
  if (!categoryD) {
    bot.sendMessage(
      chatId,
      `The category "${category}" doesn't exist. Create it with /category ${category}.`
    );
    return;
  }
  // Create a new transaction
  const transaction = new Transaction({
    user: user._id,
    category: categoryD._id,
    transactionType: "debit", // set the transactionType to 'debit'
    amount: amount,
  });

  await transaction.save();

  user.balance -= amount;
  await user.save();

  bot.sendMessage(
    chatId,
    `Debited ${amount} to your balance for category: ${category}. Your new balance is ${user.balance}`
  );
}

async function setLimitCommand(
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
  const limit = parseInt(params[1]);
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  user.monthlyLimit = limit;
  await user.save();

  bot.sendMessage(chatId, `Your monthly limit has been set to ${limit}`);
}

async function getBalanceCommand(chatId: number, bot: TelegramBot) {
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
async function unKnownCommand(chatId: number, bot: TelegramBot) {
  bot.sendMessage(chatId, "Unknown command.");
}
// Export the processing function
export async function processMessage(msg: Message, bot: TelegramBot) {
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
    default:
      await unKnownCommand(chatId, bot);
  }
}
