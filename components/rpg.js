//this script is in charge of rpg logic and managing the database

const Redis = require('redis');
const CharClasses = require('./compConfig/charClasses.json');
const Enemies = require('./compConfig/enemies.json');
const Main = require('../app.js');
const Helper = require('./helpers.js');
const PrintableTemplates = require('./compConfig/printableTemplates.json')
const redisClient = Redis.createClient();

//global strings
const PANE_TYPE_INVENTORY = "inventory";
const PANE_TYPE_CHARACTER_SHEET = "charSheet";

//export constants that need to be exposed
exports.PANE_TYPE_INVENTORY = PANE_TYPE_INVENTORY;
exports.PANE_TYPE_CHARACTER_SHEET = PANE_TYPE_CHARACTER_SHEET;


redisClient.on('connect', function() {
  console.log('Redis ready!');
});

//print something about a character depending on the paneType
//i.e. paneType = PANE_TYPE_INVENTORY then we will print information about
//     the character's inventory
exports.printCharacterByPaneType = function characterToString(owner, messageObj, paneType) {
    let status = redisClient.hgetall(owner.id, function getCharacterCallback(err, characterObject) {
      if (err){
        console.error(err);
        messageObj.channel.sendMessage(`ERROR Retrieving character information for ${owner}`);
        return;
      }

      //successful
      console.log(`Successfully retrieved character\n${JSON.stringify(characterObject, null, 4)}`);
      let characterString = ""
      //use the paneType the template to print, replace tokens with useful info
      characterString = replaceTokensInTemplate(paneType, characterObject);
      if (characterString == null){
        return;
      }
      messageObj.channel.sendMessage(characterString);
    });

    return status;
};

//create a character by hashing the owner's id to the database to store info
exports.createCharacter = function createCharacter(owner, charName, charClass) {
    var characterObject = CharClasses[charClass];

    //add a few extra entries to this object before committing to db
    characterObject.name = charName;
    characterObject.ownerId = owner.id;
    characterObject.ownerName = owner.username;

    let result = redisClient.hmset(owner.id, characterObject, function callBack(err, reply) {
      if(err){
        console.error(`FAILED creating character: ${charName} - class: ${charClass}`);
        return false;
      }
      console.log(`SUCCESS creating character: ${charName} - class: ${charClass}`);
      return true;
    });

    return result;
};

//TODO: for now, fight a random monster to test combat mechanics. later we need
//      to flesh this out to exploration and random encounters, etc
exports.fight = function fight(owner) {
  redisClient.hgetall(owner.id, function getCharacterCallback(err, characterObject) {
    if (err){
      console.error(err);
      messageObj.channel.sendMessage(`ERROR Retrieving character information for ${owner}`);
      return;
    }

    //Successfully retrieved character information
    //FIXME: ONLY GOBLIN APPEARS!
  });
}

//replace any tokens from within a template file
//i.e. This is a template for: @@aVariable@@
//     will become:
//     This is a template for: some value replaced
function replaceTokensInTemplate(paneType, characterObject) {
  let token = PrintableTemplates.token
  let tokenKey = ""
  let characterString = PrintableTemplates[paneType];
  if (characterString == null){
    console.error(`Attempted to replace paneType ${paneType}
      with characterString: ${characterString}
      in characterObject ${JSON.stringify(characterObject, null, 4)}`);
    return null;
  }

  for (var key in characterObject) {
    tokenKey = token + key + token;
    if (characterObject.hasOwnProperty(key) && characterString.indexOf(tokenKey) >= 0) {
      characterString = characterString.replace(tokenKey, characterObject[key]);
    }
  }
  return characterString;
}
