// worker.ts
import * as amqp from "amqplib";
import connectPromise from "./db";
import dotenv from "dotenv";
import { initCategories } from "../utils/initCategories";
import "./reminder";

dotenv.config();

// Connect to DB
connectPromise
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    initCategories();
    // Start the worker after the database connection is established
    startWorker();
  })
  .catch((error: Error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });

const rabbitmqUrl = "amqp://localhost"; // Replace with your RabbitMQ connection URL
const queueName = "task_queue";

// Create a connection to the database
async function startWorker() {
  // Define the function to process the tasks
  async function processTask(msg: amqp.ConsumeMessage | null) {
    if (msg) {
      const messageText = msg.content.toString();
      // Perform the time-consuming task using the message text
      console.log("Processing task:", messageText);
      // ...

      // Acknowledge the message to remove it from the queue
      channel.ack(msg);
    }
  }

  // Create a RabbitMQ connection and channel
  const connection = await amqp.connect(rabbitmqUrl);
  const channel = await connection.createChannel();
  channel.assertQueue(queueName, { durable: true });
  channel.prefetch(1); // Process only one message at a time

  // Consume messages from the queue
  channel.consume(queueName, (msg) => processTask(msg));
}
