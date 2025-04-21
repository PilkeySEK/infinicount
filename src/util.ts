import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export class Command {
    constructor(data: SlashCommandBuilder, execute: (interaction: CommandInteraction) => Promise<void>) {
        this.data = data;
        this.execute = execute;
    }
    data: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}

export function sanitizeMessage(message: string): string {
    let newString = message;
    newString = newString.split("@everyone").join("");
    newString = newString.split("@here").join("");
    newString = newString.split("`").join("");
    newString = newString.split("\\").join("");
    newString = newString.substring(0, 100);
    return newString;
}