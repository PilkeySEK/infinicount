import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { evalMessage } from "../../math";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("calculate")
        .setDescription("Calculate something!")
        .addStringOption(option =>
            option.setName("math").setDescription("An expression").setRequired(true)
        ),
    execute: async (interaction: CommandInteraction) => {
        interaction.reply({content: `\`\`\`${interaction.options.get("math")?.value} = ${evalMessage(interaction.options.get("math")?.value as string)}\`\`\``, flags: MessageFlags.Ephemeral});
    }
}
