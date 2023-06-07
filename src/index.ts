import dotenv from "dotenv";
import { Message } from "node-telegram-bot-api";

import connectPromise from "./db";
import { initCategories } from "../utils/initCategories";
import { processMessage } from "./commands";
import bot from "./bot";
import "./reminder";

dotenv.config();

// Connect to DB
connectPromise
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    initCategories();
    // Setting up a listener for incoming messages
    bot.on("message", (msg: Message) => {
      processMessage(msg, bot);
    });
  })
  .catch((error: Error) =>
    console.error("Error connecting to MongoDB:", error)
  );
