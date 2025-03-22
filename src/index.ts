import * as fs from "node:fs";
import * as path from "node:path";
import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits, MessageFlags, SlashCommandBuilder } from "discord.js";
import { token } from "../config.json";
import { Command } from "./util";
import { getCount, getCountingChannel, getGuild, setLastCountedId, updateCount } from "./mongo";
import { evalMessage } from "./math";
import { isComplex } from "mathjs";


// Using the CommandClient that is a interface with a commands field extending the normal Client
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

let commands: Collection<string, Command> = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command: { data: SlashCommandBuilder, execute: (interaction: any) => Promise<void> } = require(filePath);
        commands.set(command.data.name, new Command(command.data, command.execute));
    }
}

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    let guild: { guild_id: string, channel: string, last_counted_id: string, current_count: number };
    try {
        guild = await getGuild(message.guildId as string);
    }
    catch (e) {
        console.error(e);
        message.reply({content: "Something went wrong :( please try again"});
        return;
    }
    // ignore if it's not the right channel
    if (guild.channel == null || guild.channel != message.channelId) return;
    const message_eval = evalMessage(message.content);
    if (message_eval == undefined) return;
    if (isComplex(message_eval)) {
        message.reply({ content: `Complex numbers are not supported for counting, but here's your result: \`${message_eval}\`` });
        return;
    }
    if (guild.current_count + 1 == message_eval) {
        if (message.author.id == guild.last_counted_id && guild.current_count != 0) {
            message.react("❌");
            message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setDescription(`${message.author} **ruined it** at \`${guild.current_count}\`!!! Starting over at 1... (You can't count two times in a row)`)]
            });
            await updateCount(message.guildId as string, 0);
            return;
        }
        await updateCount(message.guildId as string, message_eval);
        await setLastCountedId(message.guildId as string, message.author.id);
        message.react("✅");
        return;
    }
    else {
        message.react("❌");
        message.reply({
            embeds: [new EmbedBuilder()
                .setColor(0xFF0000)
                .setDescription(`${message.author} ruined it at \`${guild.current_count}\`!!! Starting over at 1...`)]
        });
        await updateCount(message.guildId as string, 0);
        return;
    }
});

client.on(Events.MessageDelete, async (message) => {
    console.log(`Detected MessageDelete: ${message}`);
    if(message.author == null) return;
    if (message.author.bot) return;
    let guild: { guild_id: string, channel: string, last_counted_id: string, current_count: number };
    try {
        guild = await getGuild(message.guildId as string);
    }
    catch (e) {
        console.error(e);
        message.reply({content: "Something went wrong :( please try again"});
        return;
    }
    // ignore if it's not the right channel
    if (guild.channel == null || guild.channel != message.channelId) return;
    if(message.content == null) return;
    const message_eval = evalMessage(message.content);
    if (message_eval == undefined) return;
    if(isComplex(message_eval)) return;
    if(message_eval == guild.current_count) {
        message.channel.send({content: `**Warning!**\n${message.author} deleted their message: \`${message.content}\`.\nThe next number is \`${guild.current_count+1}\`.`});
    }
});

client.login(token);