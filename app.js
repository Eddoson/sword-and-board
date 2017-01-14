//main file app.js

const Discord = require('discord.js');
const RPG = require('./components/rpg.js')
const Config = require('./config/config.json');

//TODO: help.json has hardcoded prefixes in the strings. change to be @@prefix@@
//      and replace later with the actual prefix from Config.prefix
const Help = require('./config/help.json');
const bot = new Discord.Client();

var printToChannel = function printToChannel(strMessage, messageObj) {
  messageObj.channel.printToChannel(strMessage);
};

bot.on('ready', () => {
  console.log('Discord Bot is ready!');
});

bot.on('error', e => {
  console.error(e);
});

bot.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(Config.prefix)) return;

  let command = message.content.split(' ')[0];
  command = command.slice(Config.prefix.length);
  console.log(command);

  let args = message.content.split(' ').slice(1);
  console.log(args);

  let author = message.author;
  console.log(author);

  if (!isSyntaxCorrectForCommand(message, args, command)){
    return;
  }
  if (command === "createCharacter") {
    //create a character
    let charName = args[0];
    let charClass = args[1];
    let success = RPG.createCharacter(author, charName, charClass );
    if (success){
      message.channel.sendMessage(`The world welcomes its newest ${charClass} called ${charName}.`);
    }
  }
  else if (command === "inventory") {
    //print the inventory
    RPG.printCharacterByPaneType(author, message, RPG.PANE_TYPE_INVENTORY);
  }
  else if (command === "characterSheet") {
    //print the character sheet
    RPG.printCharacterByPaneType(author, message, RPG.PANE_TYPE_CHARACTER_SHEET);
  }
  else if (command === "fight") {
    //fight!
    RPG.fight(author, message);
  }
  else if (command === "help") {
    //print help
    let helpString = "";

    //loop through all the keys in the help json and print out all the help messages
    for (var helpKey in Help) {
      if (Help.hasOwnProperty(helpKey) && helpKey != "unknownCommand" && helpKey != "help") {
        helpString += `\n${Help[helpKey].helpMessage}`;
      }
      helpString += "\n";
    }
    message.channel.sendMessage(helpString);
  }
  else if (command === "mememe"){
    //this is just a fun command to play with. it doesn't relate to the RPG
    //elements of this bot. basically convert letters into emoji letters
    let memeMessage = translateToMeme(message.content.split(`${Config.prefix}${command}`)[1]);
    message.delete();
    message.channel.sendMessage(`${message.author.username}:`);
    message.channel.sendMessage(memeMessage);
  }
});

//check the help file if this is the correct number of arguments for this command
//if there are not, print the help string located in the help file
function isSyntaxCorrectForCommand(message, args, command) {
  let helpObject = Help[command];
  let incorrectSyntax = true;
  if (typeof helpObject === 'undefined'){
    message.channel.sendMessage(Help["unknownCommand"].helpMessage);
    return false;
  }

  if (helpObject.numArgs === "-2"){
    //-2 is unlimited args for this command
    incorrectSyntax = false;
  }
  else {
    incorrectSyntax = args.length !== parseInt(helpObject.numArgs);
  }

  if (incorrectSyntax){
    message.channel.sendMessage(helpObject.helpMessage);
    return false;
  }
  else {
    return true;
  }
}

function translateToMeme(message){
  var memeMessage = "";
  message.split("").map(function(elem){
      if (/[a-zA-Z]/.test(elem)){
        memeMessage += ':regional_indicator_' + elem.toLowerCase() + ':';
      }
      else{
        memeMessage += elem;
      }
      memeMessage += " ";
  })
  return memeMessage;
}

bot.login(Config.token);
