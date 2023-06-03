import TelegramBot from "node-telegram-bot-api";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.BOT_TOKEN;
const uri = process.env.MONGODB_URI;
if (!token) {
  console.error("The BOT_TOKEN environment variable is not set");
  process.exit(1);
}
const bot = new TelegramBot(token, { polling: true });

if (!uri) {
  console.error("The MONGODB_URI environment variable is not set.");
  process.exit(1);
}

mongoose
  .connect(uri)
  .catch((error) => console.error("Error connecting to MongoDB:", error));

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true },
  balance: { type: Number, default: 0 },
  monthlyLimit: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // create a new user if not exists
  let user = (await User.findOne({ telegramId: chatId })) as any;
  if (!user) {
    user = new User({
      telegramId: chatId,
      balance: 0,
      monthlyLimit: 0,
    });
    await user.save();
  }

  bot.sendMessage(
    chatId,
    `Welcome to the Coin Keeper!, I'm Penny the bot. I'll help you in managing your expenses`
  );
});

// 'credit' command handler
bot.onText(/\/credit (\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  // Check if the command parameters match the regular expression
  if (match === null) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /credit amount category"
    );
    return;
  }

  const amount = parseInt(match[1]);
  const category = match[2];

  // find the user and update the balance
  const user = await User.findOne({ telegramId: chatId });

  // Check if the user exists
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }

  user.balance += amount;
  await user.save();

  bot.sendMessage(
    chatId,
    `Credited ${amount} to your balance for category: ${category}. Your new balance is ${user.balance}`
  );
});

// 'debit' command handler
bot.onText(/\/debit (\d+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (match === null) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /debit amount category"
    );
    return;
  }
  const amount = parseInt(match[1]);
  const category = match[2];

  // find the user and update the balance
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }

  user.balance -= amount;
  await user.save();

  bot.sendMessage(
    chatId,
    `Debited ${amount} from your balance for category: ${category}. Your new balance is ${user.balance}`
  );
});

// 'get_balance' command handler
bot.onText(/\/get_balance/, async (msg) => {
  const chatId = msg.chat.id;

  // find the user and send the balance
  const user = await User.findOne({ telegramId: chatId });
  if (!user) {
    bot.sendMessage(
      chatId,
      "You need to start the bot first by sending the /start command."
    );
    return;
  }
  bot.sendMessage(chatId, `Your current balance is ${user.balance}`);
});

// 'set_limit' command handler
bot.onText(/\/set_limit (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (match === null) {
    bot.sendMessage(
      chatId,
      "Invalid command format. It should be /set_limit amount"
    );
    return;
  }
  const limit = parseInt(match[1]);

  // find the user and update the limit
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
});
