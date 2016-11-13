const moment = require('moment');

const DATE_FORMAT = 'MM/DD/YY';
const TIME_FORMAT = 'hh:mm a';

function parse(content) {
    let scheduleDays = {};
    let classDays = {};
    
    // Split content into lines
    const lines = content.split("\r");
    let periodValues = [];
    let current;
    for (var i in lines) {
        current = lines[i];

        // Skip if header or empty lines
        if (current.indexOf('Start Date') > -1 || current.trim().length == 0) continue;

        const values = current.split("\t");
        //console.log(values[4]);
        let vital;
        if (values[4].endsWith(' Day')) {
            // Format: 11/18/16
            scheduleDays[moment(values[0], DATE_FORMAT).toDate()] = values[4][0];
        } else {
            // Use only date, start time, end time, class name, and location
            periodValues.push([values[0], values[1], values[3], values[4], values[5]]);
        }
    }

    // Handle period lines
    let handledDays = []; // Stores what schedule days have been parsed
    let letter;
    for (var date in scheduleDays) {
        letter = scheduleDays[date];
        if (handledDays.indexOf(letter) > -1) continue;
        classDays[letter] = [];
        
        // AM Advisement is not included in the download
        classDays[letter].push(Period('Morning Advisement', 'AM Advisement', '08:40 AM', '08:50 AM', 'Homeroom'));

        // For some reason Assembly is left out of the schedule download
        if (letter == 'A') {
            classDays[letter].push(Period('Assembly', 'Assembly', '08:50 AM', '09:50 AM', 'Assembly'));
        }

        // Get all period lines for this schedule day
        const lines = periodValues.filter((values) => { return values[0] == moment(date).format(DATE_FORMAT); });
        
        let lastEndTime = classDays[letter][classDays[letter].length - 1].endTime;
        for (var i in lines) {
            const values = lines[i];
            if (lastEndTime != values[1]) {
                classDays[letter].push(Period('Unstructured Time', 'Free', lastEndTime, values[1], 'Anywhere'));
            }
            classDays[letter].push(Period(values[3], values[3].split(' (')[0], values[1], values[2], values[4]));

            lastEndTime = values[2];
        }

        // Check for end of day free
        if (lastEndTime != '02:50 PM') classDays[letter].push(Period('Unstructured Time', 'Free', lastEndTime, '02:50 PM', 'Anywhere'));

        // PM Advisement is not included in the download
        classDays[letter].push(Period('Afternoon Advisement', 'PM Advisement', '02:50 PM', '03:00 PM', 'Homeroom'));

        handledDays.push(letter);
    }

    return { scheduleDays: scheduleDays, classDays: classDays };
};

function Period(title, shortTitle, startTime, endTime, location) {
    return {
        title: title,
        shortTitle: shortTitle,
        startTime: startTime,
        endTime: endTime,
        location: location,
        duration: moment.duration(moment(endTime, TIME_FORMAT).diff(moment(startTime, TIME_FORMAT))).asMinutes()
    };
}

module.exports = (content) => {
    const parsed = parse(content);
    
    function getScheduleDay(d) {
        const date = moment(d).toDate();
        return parsed.scheduleDays[date];
    }

    return {
        scheduleDays: parsed.scheduleDays,
        classDays: parsed.classDays,
        getScheduleDay: getScheduleDay
    };
}