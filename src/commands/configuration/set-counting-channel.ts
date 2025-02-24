import { CommandInteraction, EmbedBuilder, GuildBasedChannel, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { setCountingChannel } from "../../mongo"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("set-counting-channel")
        .setDescription("Set the channel used for counting.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(option => option
            .setName("channel")
            .setDescription("The channel, don't specify this to set it to the channel that you are in right now.")
            .setRequired(false)),
    execute: async (interaction: CommandInteraction) => {
        let channel = interaction.options.get("channel", false)?.channel;
        // If option was not specified, set it to the current channel
        if (channel == null || channel == undefined) channel = interaction.channel as GuildBasedChannel;
        const db_res = await setCountingChannel(interaction.guildId as string, interaction.channelId);
        if (db_res) interaction.reply({
            flags: MessageFlags.Ephemeral, embeds: [new EmbedBuilder()
                .setColor(0x32a852)
                .setDescription(`Set the counting channel to ${channel}`)]
        });
        else interaction.reply({ content: "Oh no! It looks like my database is down :(\nFailed to set the counting channel.", flags: MessageFlags.Ephemeral });
    }
}