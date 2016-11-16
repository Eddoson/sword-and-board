const Discord = require('discord.js');
const config = require('./config.json')
const bot = new Discord.Client();


bot.on('ready', () => {
  console.log('I am ready!');
});

bot.on('message', message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;

  let command = message.content.split(' ')[0];
  command = command.slice(config.prefix.length);
  console.log(command);

  let args = message.content.split(' ').slice(1);
  console.log(args);

  if (command === 'ping') {
    message.channel.sendMessage('pong');
  }
  else if (command === 'bae') {
    message.channel.sendMessage('life');
  }
  else if (command === 'say') {
    message.channel.sendMessage(args.join(' '));
  }
  else if (command === 'tip') {
    let percent = args[0] * .01;
    let checkAmount = args[1];
    let totalTip = checkAmount * percent;
    message.channel.sendMessage('Tip for $' + checkAmount + ' @ ' + args[0] + '% is $' + totalTip.toFixed(2));
  }
});

bot.login(config.token);
