import TelegramBot, { Message } from "node-telegram-bot-api";
import User from "../models/User";
import Category, { ICategory } from "../models/Category";
import Transaction from "../models/Transaction";

async function startCommand(chatId: number, bot: TelegramBot): Promise<void> {
  let user = await User.findOne({ telegramId: chatId });
  const defaultCategories = await Category.find({
    name: { $in: ["Food", "Rent", "Shopping", "Salary", "Bills", "Others"] },
  });
  if (!user) {
    user = new User({
      telegramId: chatId,
      balance: 0,
      monthlyLimit: 0,
      reminderTime: "",
      categories: defaultCategories.map((category) => category._id),
    });
    await user.save();
  }
  bot.sendMessage(
    chatId,
    `Welcome to ArthaChakra! I'm Kubera, your personal bot here to assist you in managing and monitoring your expenses effectively.
    
    Here's the list of commands you can use:
    1. /credit
    2. /debit
    3. /get_balance
    4. /list
    5. /category
    6. /set_limit
    7. /enable_reminder
    8. /disable_reminder
    9. /show_all_expenses

    Now, let me explain what each command does:

    1. /credit: This command is used to add credit to your balance. 
       For example, '/credit 100 Food' will add 100 to your balance under the category 'Food'.
    
    2. /debit: This command is used to subtract from your balance. 
       For example, '/debit 50 Rent' will subtract 50 from your balance under the category 'Rent'.
    
    3. /get_balance: Use this command to check your current balance.
    
    4. /list: This command will show you all available categories.
    
    5. /category: This command is used to add a new category. 
       For example, '/category Entertainment' will add a new category named 'Entertainment'.
    
    6. /set_limit: Use this command to set a monthly spending limit. 
       For example, '/set_limit 1000' will set your monthly limit to 1000.
    
    7. /enable_reminder: This command enables a daily reminder at a specific time (in 24-hour format, HH:mm). 
       For example, '/enable_reminder 21:30' will set a reminder at 21:30 or 9:30 PM.
    
    8. /disable_reminder: Use this command to disable the daily reminder.
    
    9. /show_all_expenses: This command displays a summary of your monthly expenses as a percentage, broken down by category. 
    For example, if you've spent 50% of your total expenses on 'Food', 30% on 'Rent', and 20% on 'Bills', this command 
    will present that information to you in an easy-to-understand format. This can help you understand your spending habits 
    better.
 `
  );
}

async function validateCategory(
  category: string,
  chatId: number,
  bot: TelegramBot
): Promise<ICategory | null> {
  const categoryDoc = await Category.findOne<ICategory>({ name: category });
  if (!categoryDoc) {
    const categories = await Category.find({});
    let message = "Available categories:\n";
    categories.forEach((category) => {
      message += `- ${category.name}\n`;
    });
    message += `\nThe category "${category}" doesn't exist. Would you like to create it? Use /category ${category} to create a new category.`;
    bot.sendMessage(chatId, message);
    return null;
  }
  return categoryDoc;
}

async function checkMonthlyLimit(chatId: number, bot: TelegramBot) {
  const user = await User.findOne({ telegramId: chatId });
  if (!user) return;

  // Get current date and check if it's a new month
  const currentDate = new Date();
  if (
    currentDate.getMonth() !== user.warningResetDate.getMonth() ||
    currentDate.getFullYear() !== user.warningResetDate.getFullYear()
  ) {
    // If it's a new month, reset the warning flag and update the warningResetDate
    user.warningSent = false;
    user.warningResetDate = currentDate;
    user.monthlyLimit = 0;
    await user.save();
  }

  const totalExpense = await Transaction.aggregate([
    { $match: { user: user._id, transactionType: "debit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const total = totalExpense[0] ? totalExpense[0].total : 0;

  if (
    total >= 0.9 * user.monthlyLimit &&
    total < user.monthlyLimit &&
    !user.warningSent
  ) {
    bot.sendMessage(
      chatId,
      `Warning: You are about to reach your monthly limit.`
    );
    user.warningSent = true;
    await user.save();
  } else if (
    total >= user.monthlyLimit &&
    total < 1.1 * user.monthlyLimit &&
    !user.warningSent
  ) {
    bot.sendMessage(chatId, `You have reached your monthly limit.`);
    user.warningSent = true;
    await user.save();
  } else if (total >= 1.1 * user.monthlyLimit && !user.warningSent) {
    bot.sendMessage(chatId, `Warning: You have exceeded your monthly limit.`);
    user.warningSent = true;
    await user.save();
  }
}

// All the Commands
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
    transactionType: "debit", // set the transactionType to 'debit'
    amount: amount,
  });

  await transaction.save();
  await checkMonthlyLimit(chatId, bot);
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

async function categoryCommand(
  chatId: number,
  params: string[],
  bot: TelegramBot
) {
  if (params.length < 1) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /category new_category_name"
    );
    return;
  }
  const categoryName = params[0];

  let category = await Category.findOne({ name: categoryName });
  if (!category) {
    category = new Category({ name: categoryName });
    await category.save();
  }

  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command. "
    );
    return;
  }
  //Add category if user doesn't have it already
  if (!user.categories.includes(category._id)) {
    user.categories.push(category._id);
    await user.save();
  }
  bot.sendMessage(chatId, `Category "${categoryName}" has been added.`);
}

// list all the available categories
async function listCategoriesCommand(chatId: number, bot: TelegramBot) {
  const categories = await Category.find({});
  if (!categories || categories.length === 0) {
    bot.sendMessage(chatId, "No categories found.");
    return;
  }
  let message = "Available categories:\n";
  categories.forEach((category) => {
    message += `- ${category.name}\n`;
  });
  bot.sendMessage(chatId, message);
}

async function enableReminderCommand(
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

async function disableReminderCommand(chatId: number, bot: TelegramBot) {
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  if (!user.reminderTime) {
    bot.sendMessage(chatId, "No reminder is set.");
    return;
  }
  user.reminderTime = undefined;
  await user.save();
  bot.sendMessage(chatId, `Your reminder has been disabled.`);
}

// TODO
// 2. Display all expenses according to category (% based)

// async function showAllExpensesCommand(chatId: number, params: string[], bot: TelegramBot){

// }

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
    // case "/show_all_expenses":
    //   await showAllExpensesCommand(chatId,params,bot);
    //   break;
    default:
      await unKnownCommand(chatId, bot);
  }
}
