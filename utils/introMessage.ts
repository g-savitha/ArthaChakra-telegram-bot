import TelegramBot from "node-telegram-bot-api";

export default async function introMessage(chatId: number, bot: TelegramBot) {
  console.log("intro");
  bot.sendMessage(
    chatId,
    `
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
 `
  );
}

// TODO:
// 9. /show_all_expenses: This command displays a summary of your monthly expenses as a percentage, broken down by category.
// For example, if you've spent 50% of your total expenses on 'Food', 30% on 'Rent', and 20% on 'Bills', this command
// will present that information to you in an easy-to-understand format. This can help you understand your spending habits
// better.
