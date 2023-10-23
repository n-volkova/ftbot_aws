const { Telegraf } = require('telegraf');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { 
    isAllowedUser, 
    getUserName,
    isSupervisor,
    isDeveloper 
} = require('./users');
const { noClient, noPhoto } = require('./replies');
const { getReport } = require('./search');
const { logger } = require('./logger');

const bot = new Telegraf(process.env.BOT_TOKEN);
let userId;

bot.start(ctx => {
    try {
        userId = ctx.from.id;
        if (!isAllowedUser(userId) && !isDeveloper(userId)) {
            ctx.reply('У вас нет доступа к этому боту.');
            return;
        }
        if (isSupervisor(userId)) {
            ctx.reply('Привет, супервайзер!\nТебе доступны следующие команды:\n💎 /report - отчет за прошедший месяц текущего года\n💎 /report{month} - отчет по месяцу текущего года (например, /reportaug, /reportaugust или /report8)\n💎 /report{month} - отчет по месяцу с указанием года (например, /reportoct_2023, /reportoctober_2023 или /report10_2023)');
            return;
        }
        ctx.reply(`Привет, ${ctx.from.first_name}!\nЭтот бот сохраняет отчеты по ФТ.\nНужно написать имя и фамилию члена клуба и прикрепить фото результата InBody.\nДанные тренера указывать не нужно, они определяются автоматически.`);
    } catch (err) {
            logger.error(err);
        }
    });

bot.on('photo', async (ctx) => {
    try {
        if (isSupervisor(userId)) {
            ctx.reply('Неправильный формат сообщения.');
            return;
        }

        if (!ctx.message.caption) {
            noClient(ctx);
            return;
        }

        const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
        ctx.telegram.sendPhoto(process.env.STATS_CHANNEL_ID, fileId, { 
            caption: `Тренер: ${getUserName(ctx.message.from.id)} (id: ${ctx.message.from.id})\nКлиент: ${ctx.message.caption}`
        }).then(() => {
            ctx.reply('Принято 👍');
        }).catch((err) => {
            ctx.reply('Произошла ошибка. Попробуйте еще раз.');
            logger.error(err);
        });
    } catch (err) {
        logger.error(err);
    }
});

bot.on('text', async (ctx) => {
    const reportCommand = /\/report(?<month>[a-z]{3,9}|\d{1,2})?(_)?(?<year>20\d{2})?$/;
    const { month, year } = ctx.message.text.match(reportCommand)?.groups || {};
    const availableArgs = [undefined, 
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
        '01', '02', '03', '04', '05', '06', '07', '08', '09',
        'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    if (month || ctx.message.text === '/report') {
        if (!isSupervisor || !isDeveloper) {
            ctx.reply('У вас нет доступа к этой команде');
            return;
        }
        if (availableArgs.includes(month)) {
            try {
                let report = await getReport(month, parseInt(year));
                if (report) {
                    ctx.reply(report);
                }
            } catch (err) {
                logger.error(err);
            } finally {
                return;
            }
        } else {
            ctx.reply('Ошибка в параметре команды');
            return;
        }
    }
    if (isSupervisor || isDeveloper) {
        ctx.reply('Неправильная команда или формат сообщения.');
        return;
    }
    noPhoto(ctx);
});
    
bot.launch();
