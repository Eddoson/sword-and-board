//this script is in charge of rpg logic and managing the database

const Redis = require('redis');
const charClasses = require('./compConfig/charClasses.json');
const redisClient = Redis.createClient();

redisClient.on('connect', function() {
  console.log('Redis ready!');
});

module.exports = {
  // TODO: The callback for this needs to call a callback from app.js to finish
  //       need to figure out how to call app.js method to print to channel when
  //       finished
  // characterToString: function characterToString(charName, message) {
  //   var characterString = "";
  //   let status = redisClient.hgetall(charName, function callBack(err, charObject) {
  //     if (err) {
  //       console.error();
  //       return;
  //     }
  //     console.log(JSON.stringify(charObject));
  //     charObject.characterName = charName;
  //     for (key in charObject){
  //       console.log(`\n${key}: ${charObject[key]}\n`);
  //       characterString.concat(`\n${key}: ${charObject[key]}\n`);
  //     }
  //   });
  // },
  createCharacter: function createCharacter(charName, charClass) {
    var characterObject = charClasses[charClass];
    console.log(`Creating ${charClass}, found ${characterObject}`);
    let result = redisClient.hmset(charName, characterObject, function callBack(err, reply) {
      if(err){
        console.error(`FAILED creating character: ${charName} - class: ${charClass}`);
        return false;
      }
      console.log(`SUCCESS creating character: ${charName} - class: ${charClass}`);
      return true;
    });

    return result;
  }
};
