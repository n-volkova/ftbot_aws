const { DateTime } = require('luxon');

const dt = DateTime.now();
const getPeriod = (month, year) => {
  let minDate, 
    maxDate, 
    reportPeriod;

  year = year || dt.year;
  month = isNaN(parseInt(month)) ? month : Number(month);

  if (!month) {
    let prevMonth = dt.minus({ months: 1 });
    minDate = prevMonth.startOf('month').toUnixInteger();
    maxDate = prevMonth.endOf('month').toUnixInteger();
    reportPeriod = prevMonth.setLocale('ru').toFormat('LLLL yyyy');
  } else {
    let monthYear = dt.set({ month, year });
    minDate = monthYear.startOf('month').toUnixInteger();
    maxDate = monthYear.endOf('month').toUnixInteger();
    reportPeriod = monthYear.setLocale('ru').toFormat('LLLL yyyy');
  }
  console.log('startOfMonth', DateTime.fromSeconds(minDate).toISO());
  return { minDate, maxDate, reportPeriod };
};

const getDate = (timestamp) => {
  return DateTime.fromSeconds(timestamp).toISO();
};

module.exports = { getPeriod, getDate };
