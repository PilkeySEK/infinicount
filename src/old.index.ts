import { Client, Events, GatewayIntentBits, Message } from 'discord.js';
import { token, mongo_uri, command_prefix } from '../config.json';
import { evalMessage } from './math.js';
import { isComplex } from 'mathjs';
import { Db, MongoClient } from "mongodb";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
const mongo_client = new MongoClient(mongo_uri);

let curr_number: number | null = null;
let last_user_id: string | null = null;

let db: Db;

client.once(Events.ClientReady, async (readyClient) => {
    db = mongo_client.db("infinicount");
    reset_to_1();
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    // mongo stuff
    let server_data = await db.collection("data").findOne({ server_id: message.guildId });
    if (server_data == null) {
        await db.collection("data").insertOne({ server_id: message.guildId, counter: 1, last_user: "0", channel: "0" });
        server_data = await db.collection("data").findOne({ server_id: message.guildId });
    }
    // this will only happen if the mongodb is down
    if (server_data == null) {
        message.reply({ content: "Oh no! It looks like my database is down :(" });
        return;
    }
    const update_options = { upsert: true };

    if (message.content.startsWith(command_prefix)) {
        eval_command(message.content, message);
        return;
    }
    if (message.channelId != server_data.channel) return;
    if (message.author.bot) return;


    const content = message.content;
    console.log(`Message: ${content}`);
    const mathEval = evalMessage(content);
    // message is not a math expression:
    if (mathEval == undefined) return;
    // if number is a complex number, don't count it
    if (isComplex(mathEval)) {
        message.reply({ content: `Complex numbers are not supported with counting, but here's your result: \`${mathEval}\`` });
        return;
    }
    if (message.author.id == last_user_id) {
        message.reply({ content: `<@${message.author.id}> ruined it at ${curr_number}! You can't count two times in a row ...` });
        reset_to_1();
        return;
    }
    if (curr_number == null) {
        if (Math.round(mathEval) == 1) {
            message.react('✅');
            curr_number = 1;
            last_user_id = message.author.id;
            return;
        }
        else {
            message.reply({ content: "Start at 1" });
            return;
        }
    }
    else if (curr_number + 1 == Math.round(mathEval)) {
        message.react('✅');
        curr_number++;
        last_user_id = message.author.id;
        return;
    }
    else {
        message.reply({ content: `<@${message.author.id}> ruined it at ${curr_number}! Back at the beginning ...` });
        reset_to_1();
        return;
    }
});

function reset_to_1() {
    curr_number = null;
    last_user_id = null;
}

async function eval_command(command: string, message: Message) {
    // remove prefix
    command = command.substring(command_prefix.length - 1, command.length);
    switch (command) {
        case "help":
            message.reply({content: "**Commands**\n`setcountingchannel` - Set the counting channel to the current channel.\n`help` - Show this"});
            break;
        case "setcountingchannel":
            // Require Administrator permission
            if(!message.member?.guild.members.me?.permissions.has("Administrator")) return;
            let server_data = await db.collection("data").findOne({ server_id: message.guildId });
            // this will only happen if the mongodb is down
            if (server_data == null) {
                message.reply({ content: "Oh no! It looks like my database is down :(" });
                return;
            }
            const res = await db.collection("data").updateOne({ server_id: message.guildId }, { $set: { channel: message.channelId } }, { upsert: true });
            if (res.acknowledged) {
                message.reply({ content: "Set this channel to the current counting channel!" })
            }
            else {
                message.reply({ content: "Oh noes! Something went wrong :(" });
            }
            break;
        default:
            message.reply({ content: "Command not found" });
            break;
    }
}

client.login(token);
