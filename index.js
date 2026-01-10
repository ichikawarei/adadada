const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.BOT_TOKEN;
const TARGET_CHANNEL = process.env.TARGET_CHANNEL;
const ROLE_ID = process.env.ROLE_ID;

if (!TOKEN) {
  console.error("BOT_TOKEN が設定されていません");
  process.exit(1);
}


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.channel.id === TARGET_CHANNEL && !msg.author.bot) {
    // 簡単な条件：1文字以上なら付与
    try {
      const member = await msg.guild.members.fetch(msg.author.id);
      member.roles.add(ROLE_ID);
      console.log(`Role added to ${msg.author.tag}`);
    } catch (err) {
      console.error(err);
    }
  }
});

client.login(TOKEN);