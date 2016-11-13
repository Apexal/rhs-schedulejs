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
        classDays[letter].push({
            title: 'Morning Advisement',
            shortTitle: 'AM Advisement',
            startTime: '08:40 AM',
            endTime: '08:50 AM',
            location: 'Homeroom',
            duration: 10
        });


        // For some reason Assembly is left out of the schedule download
        if (letter == 'A') {
            classDays[letter].push({
                title: 'Assembly',
                shortTitle: 'Assembly',
                startTime: '08:50 AM',
                endTime: '09:50 AM',
                location: 'Assembly',
                duration: 60
            });
        }

        // Get all period lines for this schedule day
        const lines = periodValues.filter((values) => { return values[0] == moment(date).format(DATE_FORMAT); });
        
        for (var i in lines) {
            const values = lines[i];

            classDays[letter].push({
                title: values[3],
                shortTitle: values[3].split(' (')[0],
                startTime: values[1],
                endTime:  values[2],
                location: values[4],
                duration:  moment.duration(moment(values[2], TIME_FORMAT).diff(moment(values[1], TIME_FORMAT))).asMinutes()
            });
        }

        // PM Advisement is not included in the download
        classDays[letter].push({
            title: 'Afternoon Advisement',
            shortTitle: 'PM Advisement',
            startTime: '02:50 PM',
            endTime: '03:00 PM',
            location: 'Homeroom',
            duration: 10
        });

        handledDays.push(letter);
    }

    return { scheduleDays: scheduleDays, classDays: classDays };
};

module.exports = {
    parse: parse
}