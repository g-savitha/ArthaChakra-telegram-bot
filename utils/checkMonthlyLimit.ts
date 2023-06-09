import TelegramBot from "node-telegram-bot-api";
import User from "../models/User";
import Transaction from "../models/Transaction";

export default async function checkMonthlyLimit(
  chatId: number,
  bot: TelegramBot
) {
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return;
  // Get current date and check if it's a new month
  const currentDate = new Date();
  if (
    currentDate.getMonth() !== user.warningResetDate.getMonth() ||
    currentDate.getFullYear() !== user.warningResetDate.getFullYear()
  ) {
    // If it's a new month, reset the warning flag and update the warningResetDate
    user.warningResetDate = currentDate;
    await user.save();
  }

  const totalExpense = await Transaction.aggregate([
    { $match: { user: user._id, transactionType: "debit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const total = totalExpense[0] ? Number(totalExpense[0].total) : 0;
  if (total >= 0.9 * user.monthlyLimit && total < user.monthlyLimit) {
    bot.sendMessage(
      chatId,
      `Warning: You are about to reach your monthly limit.`
    );
    await user.save();
  } else if (total >= user.monthlyLimit && total < 1.1 * user.monthlyLimit) {
    bot.sendMessage(chatId, `You have reached your monthly limit.`);
    await user.save();
  } else if (total >= 1.1 * user.monthlyLimit) {
    bot.sendMessage(chatId, `Warning: You have exceeded your monthly limit.`);
    await user.save();
  }
}
