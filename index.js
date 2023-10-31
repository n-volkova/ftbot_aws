const { Telegraf, Markup } = require('telegraf');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { 
  checkAccess,
  sortedTrainers
} = require('./users');
const { getReport } = require('./search');
const { logger } = require('./logger');

const bot = new Telegraf(process.env.BOT_TOKEN);
let userId;

bot.start(ctx => {
  userId = ctx.from.id;
  if (!checkAccess(ctx)) return;

  try {
    ctx.reply('Привет, супервайзер!\nТебе доступны следующие команды:\n💎 /report - отчет за прошедший месяц текущего года\n💎 /report{month} - отчет по месяцу текущего года (например, /reportaug, /reportaugust или /report8)\n💎 /report{month} - отчет по месяцу с указанием года (например, /reportoct_2023, /reportoctober_2023 или /report10_2023)\n💎79999999999 - отправь номер клиента, чтобы выбрать для него тренера');
  } catch (err) {
    logger.error(err);
  }
});

bot.hears(/\d{11}/, async (ctx) => {
  if (!checkAccess(ctx)) return;

  const phone = ctx.match[0];
  const keyboardTrainers = sortedTrainers.map(trainer => {
    return Markup.button.callback(trainer, `${phone}${trainer}`); 
  });
  
  return ctx.reply('Выбери тренера:', Markup
    .inlineKeyboard(keyboardTrainers, {
      columns: 3
    })
    .oneTime()
    .resize()
  );
});

bot.action(/(?<client>\d{11})(?<trainer>[А-Яа-я]* [А-Яа-я]*)/, async (ctx) => {
  if (!checkAccess(ctx)) return;

  const { client, trainer } = ctx.match.groups;
  ctx.deleteMessage();
  return ctx.reply(`Клиент: ${client}\nТренер: ${trainer}`);
});

const reportCommand = /\/report(?<month>[a-z]{3,9}|\d{1,2})?(_)?(?<year>20\d{2})?$/;
bot.hears(reportCommand, async (ctx) => {
  if (!checkAccess(ctx)) return;

  const { month, year } = ctx.match.groups;
  const availableArgs = [undefined, 
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
    '01', '02', '03', '04', '05', '06', '07', '08', '09',
    'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

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
  };
});
    
bot.launch();
