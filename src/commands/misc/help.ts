import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get help!"),
    execute: async (interaction: CommandInteraction) => {
        interaction.reply({embeds: [new EmbedBuilder()
            .setAuthor({name: "InfiniCount", iconURL: "https://cdn.discordapp.com/avatars/1343143906816167976/c824edd9f96df055458169e44ef24f85.png?size=1024"})
            .setColor(0x00a2d4)
            .setTitle("Help")
            .setThumbnail("https://cdn.discordapp.com/avatars/1343143906816167976/c824edd9f96df055458169e44ef24f85.png?size=1024")
            .setDescription("You can count using math (e.g. `5*5` for 25) or normal numbers. Below are the commands that you can use. (`<argument>` is required and `[argument]` is optional)")
            .addFields(
                {name: "/help", value: "Show this dialogue."},
                {name: "/set-counting-channel [channel]", value: "Set the counting channel to the current channel (if no arguments are specified) or the one provided.\n__Required Permission:__ Manage Server"},
                {name: "/calculate <math>", value: "Calculate an expression"}
            )
        ]})
    }
}
