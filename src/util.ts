import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export class Command {
    constructor(data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>) {
        this.data = data;
        this.execute = execute;
    }
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}