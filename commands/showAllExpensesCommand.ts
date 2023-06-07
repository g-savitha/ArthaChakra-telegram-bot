import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";
import Transaction from "../models/Transaction";
import { ICategory } from "../models/Category";
import { ObjectId } from "mongoose";

export default async function showAllExpensesCommand(
  chatId: number,
  bot: TelegramBot
): Promise<void> {
  const user = await User.findOne({ telegramId: chatId });

  // Check if the user exists
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }

  // Get the start and end dates of the current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const startOfMonth = new Date(currentYear, currentMonth, 1);
  const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Get all transactions for the current month
  const transactions = await Transaction.find({
    user: user._id,
    createdAt: {
      $gte: startOfMonth,
      $lte: endOfMonth,
    },
  }).populate("category");

  // Calculate total expenses for the month
  const totalExpenses = transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0
  );

  if (totalExpenses === 0) {
    bot.sendMessage(chatId, "No expenses recorded for this month.");
    return;
  }

  // Calculate percentage expenses by category
  const categoryExpenses = new Map<string, number>();
  transactions.forEach((transaction) => {
    const categoryName = (transaction.category as ICategory).name;
    const amount = transaction.amount;

    if (categoryExpenses.has(categoryName)) {
      categoryExpenses.set(
        categoryName,
        categoryExpenses.get(categoryName)! + amount
      );
    } else {
      categoryExpenses.set(categoryName, amount);
    }
  });

  // Calculate and format the percentage expenses
  const categoryPercentageExpenses = Array.from(categoryExpenses.entries()).map(
    ([categoryName, amount]) => ({
      category: categoryName,
      percentage: ((amount / totalExpenses) * 100).toFixed(2),
    })
  );

  // Prepare the summary message
  let summaryMessage = "Monthly Expenses Summary:\n\n";
  categoryPercentageExpenses.forEach(({ category, percentage }) => {
    summaryMessage += `${category}: ${percentage}%\n`;
  });

  bot.sendMessage(chatId, summaryMessage);
}
