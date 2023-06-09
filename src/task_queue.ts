import * as amqp from "amqplib";
import { Message } from "node-telegram-bot-api";
import bot from "./bot";
const rabbitmqUrl = "amqp://localhost"; // Replace with your RabbitMQ connection URL
const queueName = "task_queue";

// Create a RabbitMQ connection
const connectPromise = amqp.connect(rabbitmqUrl);

bot.on("message", async (msg: Message) => {
  // Enqueue the message text to RabbitMQ for background processing
  if (msg.text) {
    const channel = await (await connectPromise).createChannel();
    channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(msg.text), { persistent: true });
  }
});
