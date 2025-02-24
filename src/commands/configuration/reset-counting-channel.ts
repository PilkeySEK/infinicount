import { CommandInteraction, EmbedBuilder, GuildBasedChannel, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { setCountingChannel } from "../../mongo"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("reset-counting-channel")
        .setDescription("Reset the channel used for counting.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    execute: async (interaction: CommandInteraction) => {
        const db_res = await setCountingChannel(interaction.guildId as string, "0");
        if (db_res) interaction.reply({
            flags: MessageFlags.Ephemeral, embeds: [new EmbedBuilder()
                .setColor(0x32a852)
                .setDescription("Reset the counting channel")]
        });
        else interaction.reply({ content: "Oh no! It looks like my database is down :(\nFailed to set the counting channel.", flags: MessageFlags.Ephemeral });
    }
}