const Discord = require('discord.js');
const bot = new Discord.Client();
const prefix = "==";

bot.on('ready', () => {
  console.log('I am ready!');
});

bot.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  if (message.content.startsWith(prefix + "ping")) {
    message.channel.sendMessage('pong');
  }
});

bot.login('MjQ3ODgwMzU0Nzk3NDUzMzIy.CwvpcQ.Tm6v8ARVLJUiLyr6FNpZykvVV30');
