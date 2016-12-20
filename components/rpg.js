//this script is in charge of rpg logic and managing the database

const Redis = require('redis');
const CharClasses = require('./compConfig/charClasses.json');
const Items = require('./compConfig/items.json');
const Enemies = require('./compConfig/enemies.json');
const Main = require('../app.js');
const Help = require('../config/help.json');
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
      else if (characterObject === null) {
        messageObj.channel.sendMessage(`Character not found! (Have you died?)`);
        messageObj.channel.sendMessage(Help.createCharacter.helpMessage);
        return;
      }

      //successful
      console.log(`Successfully retrieved character\n${characterObject}`);
      let characterString = ""
      //use the paneType the template to print, replace tokens with useful info
      characterString = replaceTokensInTemplate(paneType, characterObject);
      if (characterString === null){
        console.error(`characterString was null in printCharacterByPaneType`);
        return;
      }
      messageObj.channel.sendMessage(characterString);
    });

    return status;
};

//update prexisting character with new data. if character has <= 0 hp, delete it. :)
exports.updateCharacter = function updateCharacter(owner, newCharacterObject) {
  updateCharacter(owner, newCharacterObject);
}

//create a character by hashing the owner's id to the database to store info
exports.createCharacter = function createCharacter(owner, charName, charClass) {
    var characterObject = CharClasses[charClass];

    //add a few extra entries to this object before committing to db
    characterObject.name = charName;
    characterObject.ownerId = owner.id;
    characterObject.ownerName = owner.username;

    let result = redisClient.hmset(owner.id, characterObject, function callBack(err, reply) {
      if(err){
        console.error(`FAILED creating character: ${charName} - class: ${charClass}\n${err}`);
      }
      console.log(`SUCCESS creating character: ${charName} - class: ${charClass}`);
    });

    return result;
};

//TODO: for now, fight a random monster to test combat mechanics. later we need
//      to flesh this out to exploration and random encounters, etc
exports.fight = function fight(owner, messageObj) {
  redisClient.hgetall(owner.id, function getCharacterCallback(err, characterObject) {
    if (err){
      console.error(err);
      messageObj.channel.sendMessage(`ERROR Retrieving character information for ${owner}`);
      return;
    }

    //Successfully retrieved character information
    //FIXME: ONLY GOBLIN APPEARS!
    let enemyObject = Enemies.goblin;
    console.log("enemy" + JSON.stringify(enemyObject));
    let fightResult = doBattle(owner, characterObject, enemyObject);
    messageObj.channel.sendMessage(fightResult);
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
  if (characterString === null){
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

function doBattle(owner, characterObj, enemyObj) {
  let fightResult = "";
  let characterWeapon = Items[characterObj.weapon];
  let enemyWeapon = Items[enemyObj.weapon];

  //fight while someone has hp left
  while (characterObj.hp > 0 && enemyObj.hp > 0){
    //character turn
    let charDamage = Math.floor((Math.random() * characterWeapon.damageMax) + characterWeapon.damageMin);
    enemyObj.hp -= charDamage;
    fightResult += `\nYou struck the ${enemyObj.name} with your ${characterObj.weapon} for ${charDamage} damage! The ${enemyObj.name} has ${enemyObj.hp} HP left!`;
    if (enemyObj.hp <= 0){
      fightResult += `\nThe ${enemyObj.name} has died.`;
      fightResult += `\nYOU have ${characterObj.hp} HP left.`;
      break;
    }

    //enemy turn
    let enemyDamage = Math.floor((Math.random() * enemyWeapon.damageMax) + enemyWeapon.damageMin);
    characterObj.hp -= enemyDamage;
    fightResult += `\nThe ${enemyObj.name} struck you with its ${enemyObj.weapon} for ${enemyDamage} damage! YOU have ${characterObj.hp} HP left!`;
    if (characterObj.hp <= 0){
      fightResult += `\nYOU have died. The ${enemyObj.name} has killed you with its ${enemyObj.weapon}`;
      break;
    }
  }

  enemyObj.hp = enemyObj.hpMax;
  updateCharacter(owner, characterObj);
  return fightResult;
}

function updateCharacter(owner, newCharacterObject) {
  if (newCharacterObject.hp <= 0){
    //delete character if it has <= 0 hp
    redisClient.del(owner.id, function deleteCharacter(err, reply) {
      if(err){
        console.error(`FAILED deleting character ${err}`);
      }

      console.log(`SUCCESS deleting character`);
    });
  }
  else {
    //otherwise update it
    redisClient.hmset(owner.id, newCharacterObject, function callBack(err, reply) {
      if(err){
        console.error(`FAILED updating character ${err}`);
      }

      console.log(`SUCCESS updating character`);
    });
  }
}
