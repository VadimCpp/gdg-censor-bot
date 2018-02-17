

var token = process.env.BOT_ACCESS_TOKEN;

var Bot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

/**
 * @param {object} msg - Объект message телеграм.
 */
function handleStart(msg) {
  /**
   * @type {number}
   */
  var chatId = msg.chat.id;

  bot.sendMessage(chatId, "Добрый день! Можете написать грубость?");
}


bot.onText(/^/, function (msg) {
  /**
   * @type {string}
   */
  var text = msg.text;

  /**
   * @type {Array}
   */
  var args = text.split(" ");

  var veryBadArray = [
    { 
      word: 'жопа',
      replacement: 'ягодицы'
    },
    { 
      word: 'дурак',
      replacement: 'глупый человек'
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
      word: 'пизда',
      replacement: 'п***а'
    }
  ];

  if (args[0] === '/start') {
    handleStart(msg, args);
  } else {

    /**
     * @type {string}
     */
    var source = msg.text;

    /**
     * @type {string}
     */
    var dest = source;

    for (var i = 0; i < veryBadArray.length; i++) {
      /**
       * @type {number}
       */
      var obj = veryBadArray[i];

      dest = dest.replace(new RegExp(obj.word, 'g'), obj.replacement);
    }
    
    if (dest != source) {
      bot.sendMessage(msg.chat.id, dest);
    }
  }; 

});


module.exports = bot;
