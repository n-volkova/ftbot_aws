const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram/tl');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { getPeriod, getDate } = require('./utils');
const { logger } = require('./logger');
const { getUserName } = require('./users');

const apiId = +process.env.API_ID;
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.TG_TOKEN);
let client;

const auth = async () => {
  try {
    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      maxConcurrentDownloads: 1,
    });

    await client.connect();
    if (!await client.checkAuthorization()){
      await client.signIn();
    }
  } catch (err) {
    logger.error(err);
  }
};

const getMessages = async (minDate, maxDate) => {
  let postCount = 0;
  let messages = [];
  let offset = 0;

  while (!offset || offset <= postCount - 100) {
    let { messages: messagesChunk, pts } = await client.invoke(
      new Api.messages.Search({
        peer: process.env.STATS_CHANNEL_ID,
        q: '',
        filter: new Api.InputMessagesFilterPhotos({}),
        minDate,
        maxDate,
        limit: 9999,
        addOffset: offset
      })
    );

    if (!postCount) {
      postCount = pts;
    } 

    messages = [...messages, ...messagesChunk];
    offset += 100;
  };

  return messages;
};

const getReport = async (month, year) => {
  try {
    if (!client) {
      await auth();
    }
    
    const { minDate, maxDate, reportPeriod } = getPeriod(month, year); 
    let messages = await getMessages(minDate, maxDate);

    console.log('firstDate', getDate(messages[0].date));
    console.log('lastDate', getDate(messages[messages.length - 1].date));

    const result = {};

    if (!messages.length) {
      return `За ${reportPeriod} ничего не найдено.`;
    }

    messages.forEach((message) => {
      const name = getUserName(Number(message.fromId.userId));
      if (name in result) {
        result[name]++;
      } else {
        result[name] = 1;
      }
    });

    let sorted = Object.entries(result).sort((a, b) => b[1] - a[1]).reduce((acc, item) => acc + '\n' + item.join(': '), '');
    return `Отчет за ${reportPeriod}:\n${sorted}`;
  } catch (err) {
    logger.error(err);
  }
};

module.exports = { getReport };
