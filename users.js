const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const isSupervisor = (userId) => userId === Number(process.env.SUPERVISOR_ID);
const isDeveloper = (userId) => userId === Number(process.env.DEVELOPER_ID);

const allowedUsers = JSON.parse(new Buffer.from(process.env.ALLOWED_USERS_BASE64, 'base64').toString());
const allowedUsersIds = allowedUsers.map(user => user.id);

const sortedTrainers = allowedUsers.reduce((acc, user) => {
  if (!isDeveloper(user.id)) {
    acc.push(`${user.surname} ${user.name}`);
  }
  return acc;
}, []).sort((a, b) => {
  if(a < b) { return -1; }
  if(a > b) { return 1; }
  return 0;
});

const getUserName = (userId) => {
  const user = allowedUsers.find(user => user.id === userId);
  return `${user.surname} ${user.name}`;
};

const checkAccess = (ctx) => {
  if (!isSupervisor(ctx.from.id) && !isDeveloper(ctx.from.id)) {
    ctx.reply('У вас нет доступа к этому боту.');
    return false;
  } else {
    return true;
  }
};

module.exports = { 
  allowedUsers, 
  allowedUsersIds, 
  sortedTrainers,
  getUserName,
  isSupervisor,
  isDeveloper,
  checkAccess
};
