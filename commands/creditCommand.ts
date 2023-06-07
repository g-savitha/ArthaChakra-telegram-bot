import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";
import Transaction from "../models/Transaction";
import validateCategory from "../utils/validateCategory";

export default async function creditCommand(
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

  // Check if the user exists
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  // Check if the category exists
  const categoryDoc = await validateCategory(category, chatId, bot);
  if (!categoryDoc) {
    return;
  }
  // Create a new transaction
  const transaction = new Transaction({
    user: user._id,
    category: categoryDoc._id,
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
