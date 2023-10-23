const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { Api } = require('telegram/tl');
const path = require('path');
const input = require('input');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { getPeriod } = require('./utils');
const { logger } = require('./logger');

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

const getReport = async (month, year) => {
    try {
        if (!client) {
            await auth();
        }

        const { minDate, maxDate, reportPeriod } = getPeriod(month, year); 

        const messages = (await client.invoke(
            new Api.messages.Search({
                peer: process.env.STATS_CHANNEL_ID,
                q: 'Тренер',
                filter: new Api.InputMessagesFilterEmpty({}),
                minDate,
                maxDate,
                limit: 9999
            })
        )).messages;

        const result = {};

        if (!messages.length) {
            return `За ${reportPeriod} ничего не найдено.`;
        }

        messages.forEach((message) => {
            const { name } = message.message.match(/Тренер: (?<name>[А-Яа-яA-Za-z ]*) \(id:/).groups;
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
