




const { Client, GatewayIntentBits } = require('discord.js');
const db = require("./db");


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const TOKEN = process.env.BOT_TOKEN;
//const TARGET_CHANNEL = process.env.TARGET_CHANNEL;
//const ROLE_ID = process.env.ROLE_ID;
const processing = new Set();

if (!TOKEN) {
  console.error("BOT_TOKEN が設定されていません");
  process.exit(1);
}

//if (!TARGET_CHANNEL) {
//  console.error("TARGET_CHANNEL が設定されていません");
//  process.exit(1);
//}

//if (!ROLE_ID) {
//  console.error("ROLE_ID が設定されていません");
//  process.exit(1);
//}


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});


const { PermissionsBitField } = require("discord.js");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "setup") return;

  if (
    !interaction.member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  ) {
    return interaction.reply({
      content: "管理者のみ実行できます",
      ephemeral: true,
    });
  }

  const channel = interaction.options.getChannel("channel");
  const role = interaction.options.getRole("role");
  const mode = interaction.options.getString("mode") ?? "add"; // ★追加

//  db.prepare(`
//    INSERT INTO guild_settings (guild_id, channel_id, role_id)
//    VALUES (?, ?, ?)
//    ON CONFLICT(guild_id)
//    DO UPDATE SET
//      channel_id = excluded.channel_id,
//      role_id = excluded.role_id
//  `).run(interaction.guild.id, channel.id, role.id);


//  await interaction.reply({
//    content: `設定完了！\n自己紹介チャンネル: ${channel}\n付与ロール: ${role}`,
//    ephemeral: true,
//  });
//});


  db.prepare(`
    INSERT INTO guild_settings (guild_id, channel_id, role_id, mode)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(guild_id)
    DO UPDATE SET
      channel_id = excluded.channel_id,
      role_id = excluded.role_id,
      mode = excluded.mode
  `).run(
    interaction.guild.id,
    channel.id,
    role.id,
    mode
  );

  await interaction.reply({
    content:
      `設定完了！\n` +
      `監視チャンネル: ${channel}\n` +
      `対象ロール: ${role}\n` +
      `動作モード: ${mode === "add" ? "付与" : "剥奪"}`,
    ephemeral: true,
  });
});


client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.guild) return;

//  const settings = db
//    .prepare(
//      "SELECT channel_id, role_id FROM guild_settings WHERE guild_id = ?"
//    )
//    .get(msg.guild.id);

const settings = db
  .prepare(
    "SELECT channel_id, role_id, mode FROM guild_settings WHERE guild_id = ?"
  )
  .get(msg.guild.id);


  // まだ /setup されていないサーバー
  if (!settings) return;

  if (msg.channel.id !== settings.channel_id) return;

  const key = `${msg.guild.id}-${msg.author.id}`;
  if (processing.has(key)) return;
  processing.add(key);

  try {
    const member = await msg.guild.members.fetch(msg.author.id);

//    if (member.roles.cache.has(settings.role_id)) return;

//    await member.roles.add(settings.role_id);
//    await msg.reply("自己紹介ありがとう！ロールを付与しました 🎉");

//    console.log(`Role added to ${msg.author.tag}`);

if (settings.mode === "add") {
  if (member.roles.cache.has(settings.role_id)) return;

  await member.roles.add(settings.role_id);
  await msg.reply("自己紹介ありがとう！ロールを付与しました 🎉");

  console.log(`Role added to ${msg.author.id}`);
} else {
  if (!member.roles.cache.has(settings.role_id)) return;

  await member.roles.remove(settings.role_id);
  await msg.reply("自己紹介ありがとう！ロールを解除しました 👍");

  console.log(`Role removed from ${msg.author.id}`);
}

  } catch (err) {
    console.error(err);
  } finally {
    setTimeout(() => processing.delete(key), 5000);
  }
});

client.login(TOKEN);