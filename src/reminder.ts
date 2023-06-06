import cron from "node-cron";
import bot from "./bot";
import User from "../models/User";

// Code for sending reminder at specified time
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const currentTime = now.toISOString().slice(11, 16);
  const users = await User.find({ reminderTime: currentTime });
  for (let user of users) {
    // Send a message to each user
    bot.sendMessage(
      user.telegramId,
      "Don't forget to add your expenses for today!"
    );
  }
});

export default cron;
