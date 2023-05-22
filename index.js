require('dotenv').config();
const music = require('./utils/music');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const playerList = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  switch (interaction.commandName) {
    case 'ping':
      await interaction.reply('ping三小!!');
      break;
    case '1加1':
      await interaction.reply('=5');
      break;

    case '觀眾場加加':
      await cutsomEntryGame(interaction);
      break;

    case '打完ㄌ':
      await cutsomRemoveGame(interaction);
      break;

    case '早安':
      await interaction.reply('早安就早安，誰他ㄇ敢說早上好 。 ┬─┬ノ( º _ ºノ)');
      break;

    case 'play':
      await music.play(interaction);
      break;
    default:
      break;
  }
});

async function cutsomEntryGame(interaction) {
  playerList.push(interaction.user.username);
  await interaction.reply(`${interaction.user.username}已加入等待名單!!!\n目前等待人數:${playerList.length}\n目前等待名單:${playerList.join(',')}`);
}

async function cutsomRemoveGame(interaction) {
  let removeIndox = playerList.indexOf(interaction.user.username)
  playerList.splice(removeIndox, 1)
  await interaction.reply(`${interaction.user.username}他打完ㄌ 欠拔\n目前等待人數:${playerList.length}\n目前等待名單:${playerList.join(',')}`);
}
client.login(process.env.DC_TOKEN);