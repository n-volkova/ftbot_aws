const moment = require('moment');

const getPeriod = (month, year) => {
    let minDate, 
        maxDate, 
        reportPeriod;

    year = year || moment().year();
    month = isNaN(parseInt(month))? month : Number(month) - 1;

    if (!month) {
        let prevMonth = moment(Date.now()).subtract(1, 'months');
        minDate = prevMonth.startOf('month').unix();
        maxDate = prevMonth.endOf('month').unix();
        reportPeriod = prevMonth.startOf('month').locale('ru').format('MMMM YYYY');
    } else {
        let monthYear = moment().month(month).year(year);
        minDate = monthYear.startOf('month').unix();
        maxDate = monthYear.endOf('month').unix();
        reportPeriod = monthYear.startOf('month').locale('ru').format('MMMM YYYY');
    }

    return { minDate, maxDate, reportPeriod };
};

module.exports = { getPeriod };
