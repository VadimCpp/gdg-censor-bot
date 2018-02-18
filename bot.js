const Bot = require('node-telegram-bot-api');
const BadWords = require('./data/badWords.json');
const WordsBefore = require('./data/wordsBefore.json');
const WordsAfter = require('./data/wordsAfter.json');
const Smiles = require('./data/smiles.json');

const token = process.env.BOT_ACCESS_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

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

  bot.sendMessage(chatId, "Добрый день!");
}

/**
 * @param {object} msg - Объект message телеграм.
 * @param {!string} word
 */
const handleTest = (msg, word) => {
  /**
   * @const {number|string}
   */
  const chatId = msg.chat.id;

  if (BadWords.indexOf(word.toLowerCase().trim()) > -1) {
    bot.sendMessage(chatId, "Слово найдено 😎: " + word);  
  } else {
    bot.sendMessage(chatId, "Не найдено 😐: " + word);  
  }
}



const getTextBefore = () => {
  return WordsBefore[Math.floor(Math.random() * WordsBefore.length)];
}

const getTextAfter = () => {
  return WordsAfter[Math.floor(Math.random() * WordsAfter.length)];
}

const getSmile = () => {
  return Smiles[Math.floor(Math.random() * Smiles.length)];
}

const getName = (msg) => {
  let name = 'Без имени 👤';

  if (msg.from.first_name || msg.from.last_name) {
    name = msg.from.first_name + ' ' + msg.from.last_name;
  } else if (msg.from.username) {
    name = msg.from.username;
  }

  return name;
}

const getCensoredText = (msg) => {

  /**
   * @type {string}
   */
  let censored = msg.text;

  /**
   * @type {!Array}
   */
  let words = msg.text.split(" ");
  if (words.length) {
    for (let i = words.length - 1; i >= 0; i--) {
      let original = words[i];
      let word = removePunctuation(words[i].toLowerCase().trim());

      console.log('i = ' + i + ': ' + word);
      if (BadWords.indexOf(word) > -1) {
        censored = censored.replace(original, '...');
      }
    }
  }

  return censored; 
}

const removePunctuation = (text) => {
  let result = text;

  const punctuation = [
    ',',
    '.',
    ';',
    '?',
    '!',
    '"',
    '&',
    '%',
    '#'   
  ]

  for (let i = punctuation.length - 1; i >= 0; i--) {
    result = result.replace(new RegExp('\\' + punctuation[i], 'g'), '');
  }

  return result;
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {

  console.log('\n📰  Received message:');
  console.log('  ', msg.text || '(no text)');

  if (msg.text) {

    /**
     * @type {string}
     */
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
    } else if (args[0] === '/t' && args[1]) {
      handleTest(msg, args[1]);
    } else {

      let censored = getCensoredText(msg);

      if (censored != msg.text) {
        let result = getTextBefore()
          + ' ' + getName(msg)
          + ' ' + getTextAfter()
          + ' ' + getSmile()
          + ' :\n' + censored;

        bot.deleteMessage(msg.chat.id, msg.message_id);
        bot.sendMessage(msg.chat.id, result);

        console.log(result);
      }
    }
  }
});

module.exports = bot;
