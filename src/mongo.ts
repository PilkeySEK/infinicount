import { Db, MongoClient } from "mongodb"
import { mongo_uri } from "../config.json"

const mongo_client = new MongoClient(mongo_uri);
const db: Db = mongo_client.db("infinicount");

export function getDb(): Db {
    return db;
}

// Returns true if successful, false if not
export async function setCountingChannel(guild_id: string, channel_id: string): Promise<boolean> {
    await addGuildIfNotExist(guild_id);
    const db_res = await db.collection("guilds").updateOne({ guild_id: guild_id }, { $set: { channel: channel_id } });
    return db_res.acknowledged;
}

export async function addGuildIfNotExist(guild_id: string) {
    const guild = await db.collection("guilds").findOne({ guild_id: guild_id });
    if (guild != null) return;
    await db.collection("guilds").insertOne({ guild_id: guild_id, channel: "0", last_counted_id: "0", current_count: 0 });
}

export async function getCountingChannel(guild_id: string): Promise<string | null> {
    const guild = await db.collection("guilds").findOne({ guild_id: guild_id });
    if (guild == null) return null;
    return guild.channel;
}

// Returns true if successful, false if not
export async function updateCount(guild_id: string, new_count: number): Promise<boolean> {
    await addGuildIfNotExist(guild_id);
    const db_res = await db.collection("guilds").updateOne({ guild_id: guild_id }, { $set: { current_count: new_count } });
    return db_res.acknowledged;
}

export async function getCount(guild_id: string): Promise<number> {
    addGuildIfNotExist(guild_id);
    const guild = await db.collection("guilds").findOne({ guild_id: guild_id });
    if(guild == null) return 0;
    return guild.current_count;
}

export async function getGuild(guild_id: string): Promise<{guild_id: string, channel: string, last_counted_id: string, current_count: number}> {
    addGuildIfNotExist(guild_id);
    const guild = await db.collection("guilds").findOne({ guild_id: guild_id });
    if(guild == null) throw Error("Database did not return anything. Is it down?");
    return {guild_id: guild.guild_id, channel: guild.channel, last_counted_id: guild.last_counted_id, current_count: guild.current_count};
}

export async function setLastCountedId(guild_id: string, last_counted_id: string): Promise<boolean> {
    await addGuildIfNotExist(guild_id);
    const db_res = await db.collection("guilds").updateOne({ guild_id: guild_id }, { $set: { last_counted_id: last_counted_id } });
    return db_res.acknowledged;
}