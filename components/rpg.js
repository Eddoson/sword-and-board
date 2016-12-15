//this script is in charge of rpg logic and managing the database

const Redis = require('redis');
const charClasses = require('./compConfig/charClasses.json');
const Main = require('../app.js');
const Helper = require('./helpers.js');
const redisClient = Redis.createClient();

redisClient.on('connect', function() {
  console.log('Redis ready!');
});

exports.characterToString = function characterToString(charName, messageObj) {
    var characterString = "";
    let status = redisClient.hgetall(charName, function getCharacterCallback(err, characterObject) {
      messageObj.channel.sendMessage(JSON.stringify(characterObject, null, 4));
      console.log(PrintCharacterFormat.name);
    });

    console.log(`status ${status}`);
};

exports.createCharacter = function createCharacter(charName, charClass, owner) {
    var characterObject = charClasses[charClass];
    characterObject.name = charName;
    characterObject.owner = owner;
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
};
