
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const allowedUsers = JSON.parse(process.env.ALLOWED_USERS);
const allowedUsersIds = allowedUsers.map(user => user.id);
const isAllowedUser = (userId) => allowedUsersIds.includes(userId);
const getUserName = (userId) => {
    const user = allowedUsers.find(user => user.id === userId);
    return `${user.surname} ${user.name}`;
};

const isSupervisor = (userId) => userId === Number(process.env.SUPERVISOR_ID);
const isDeveloper = (userId) => userId === Number(process.env.DEVELOPER_ID);

module.exports = { 
    allowedUsers, 
    allowedUsersIds, 
    isAllowedUser, 
    getUserName,
    isSupervisor,
    isDeveloper
 };
