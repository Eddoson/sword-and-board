//main file app.js

const Discord = require('discord.js');
const RPG = require('./components/rpg.js')
const Config = require('./config/config.json');
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

  if (command === 'createCharacter') {
    let incorrectSyntax = args.length === 0;
    if (incorrectSyntax){
      message.channel.sendMessage(Help[createCharacter]);
      return;
    }

    let charName = args[0];
    let charClass = args[1];
    let success = RPG.createCharacter(charName, charClass, message.author.username);
    if (success){
      message.channel.sendMessage(`The world welcomes its newest ${charClass} called ${charName}.`);
      RPG.characterToString(charName, message);
    }
  }
});

bot.login(Config.token);
