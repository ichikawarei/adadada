const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("自己紹介Botの設定")
    .addChannelOption(option =>
      option.setName("channel")
            .setDescription("自己紹介チャンネル")
            .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role")
            .setDescription("付与するロール")
            .setRequired(true)
    )
    .toJSON()
];

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log("Slash Command を登録中...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("Slash Command 登録完了！");
  } catch (error) {
    console.error(error);
  }
})();
