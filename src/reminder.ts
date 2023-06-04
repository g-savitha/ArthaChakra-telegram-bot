import cron from "node-cron";
import bot from "./bot";
import User from "../models/User";

// Code for sending reminder
cron.schedule("0 21 * * *", async () => {
  // Find all users
  const users = await User.find({});
  for (let user of users) {
    // Send a message to each user
    bot.sendMessage(
      user.telegramId,
      "Don't forget to add your expenses for today!"
    );
  }
});

export default cron;
