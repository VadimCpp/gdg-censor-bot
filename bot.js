const Bot = require('node-telegram-bot-api');
const token = process.env.BOT_ACCESS_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';
// @TODO: Вынести в отдельный файл
const veryBadArray = [
  { 
    word: 'дурак',
    replacement: 'глупый человек'
  },
  { 
    word: 'жопа',
    replacement: 'ягодицы'
  },
  { 
    word: 'ебло',
    replacement: 'е**о'
  },
  { 
    word: 'хуй',
    replacement: 'х*й'
  },
  { 
    word: 'хуи',
    replacement: 'х*и'
  },
  { 
    word: 'хуем',
    replacement: 'х**м'
  },
  { 
    word: 'хуярить',
    replacement: 'х****ь'
  },
  { 
    word: 'сосет',
    replacement: 'делает минет'
  },    
  { 
    word: 'сука',
    replacement: 'с*к*'
  },    
  { 
    word: 'cуки',
    replacement: 'с*к*'
  },     
  { 
    word: 'заебись',
    replacement: 'з****сь'
  },       
  { 
    word: 'пизда',
    replacement: 'п***а'
  }
];

let bot;

if (isProduction) {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

/**
 * @param {object} msg - Объект message телеграм.
 */
const handleStart = (msg) => {
  /**
   * @type {number}
   */
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Добрый день! Можете написать грубость?");
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {

  // console.log(JSON.stringify(msg));

  console.log('\n📰  Received message:');
  console.log('  ', msg.text || '(no text)');

  if (msg.text) {
    const chatId = msg.chat.id;

    /**
     * @type {string}
     */
    const text = msg.text;

    /**
     * @type {Array}
     */
    const args = text.split(" ");

    if (args[0] === '/start') {
      handleStart(msg, args);
    } else {

      /**
       * @type {string}
       */
      const source = msg.text;

      /**
       * @type {string}
       */
      const dest = source;

      for (var i = 0; i < veryBadArray.length; i++) {
        /**
         * @type {number}
         */
        const obj = veryBadArray[i];

        dest = dest.replace(new RegExp(obj.word, 'g'), obj.replacement);
      }
      
      if (dest != source) {


        /**
         * @type {string}
         */
        let name = (msg.from.first_name && msg.from.last_name) ? 
                    msg.from.first_name + ' ' + msg.from.last_name :
                    msg.from.username;

        dest = name + ' спизданул: \n' + dest;

        bot.deleteMessage(msg.chat.id, msg.message_id);
        bot.sendMessage(msg.chat.id, dest);
        console.log('  ', dest);
      }
    };
  }
});

module.exports = bot;
