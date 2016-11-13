const sc = require('./index');
const util = require('util');

const fs = require('fs');
console.log(process.argv);

fs.readFile(process.argv[2], 'utf8', function (err,data) {
  if (err) throw err;

  const d = sc(data);
  //console.log(util.inspect(d.classDays, false, null));
  
  for (var letter in d.classDays) {
      console.log(letter);
      for (var i in d.classDays[letter]) {
          console.log(d.classDays[letter][i].startTime + " - " + d.classDays[letter][i].endTime + " | " + d.classDays[letter][i].shortTitle);
      }
  }
  

  console.log(d.getScheduleDay('2016-11-14'));
});