// reminder.ts
import cron from "node-cron";
import bot from "./bot";
import User from "../models/User";

// Code for sending reminder at specified time
cron.schedule("0 21 * * *", async () => {
  const users = await User.find({ reminderEnabled: true });

  for (let user of users) {
    // Send a reminder to each user who has enabled the reminder
    bot.sendMessage(
      user.telegramId,
      "Don't forget to add your expenses for today!"
    );
  }
});

export default cron;
