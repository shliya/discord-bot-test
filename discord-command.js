const { REST, Routes, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!'
  }, {
    name: '1加1',
    description: '數學奇蹟'
  }, {
    name: '觀眾場加加',
    description: '排隊'
  }, {
    name: '打完ㄌ',
    description: '老師，他打完了!!!'
  }, {
    name: '早安',
    description: '打招呼'
  }, {
    name: 'play',
    description: "測試播放",
    options: [{
      name: "url",
      description: "網址",
      type: ApplicationCommandOptionType.String
    }]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DC_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();