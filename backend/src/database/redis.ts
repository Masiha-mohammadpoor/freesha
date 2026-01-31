import redis, { RedisClientType } from "redis";

import { customLog, isNone } from "../helpers/utils.js";
import { RedisValue } from "../helpers/types.js";

let redisClient: RedisClientType<any, any, any, any, any>;

export async function connectRedis() {
  if (isNone(process.env.REDIS_URL)) {
    customLog("redis", "Redis URL is empty, check the .env file");
    customLog("server", "Exiting due to no redis connection");
    process.exit(1);
  }

  if (process.env.IS_IN_DOCKER) {
    process.env.REDIS_URL = "redis://redis";
  }

  const redisUrl = process.env.REDIS_URL;

  redisClient = await redis
    .createClient({ url: redisUrl })
    .on("connect", () => customLog("redis", "Connected"))
    .on("error", (err) =>
      customLog("redis", `An error occurred while trying to connect: ${err}`)
    )
    .connect();
}

export async function redisSet(key: string, value: RedisValue, expiration = 0) {
  if (expiration <= 0) {
    customLog(
      "redis",
      `Refused to set (${key}/${value}) pair because an expiration was not provided`
    );
    return;
  }

  if (value === null) {
    value = 0;
  }

  try {
    await redisClient.set(key, value, { EX: expiration });
  } catch (error) {
    customLog(
      "redis",
      `An error occurred while setting (${key}/${value}) pair:`
    );
    customLog("redis", (error as Error).message);
  }
}

export async function redisGet(key: string) {
  try {
    const value = await redisClient.get(key);
    return value;
  } catch (error) {
    customLog("redis", `An error occurred while getting (${key}):`);
    customLog("redis", (error as Error).message);
    return false;
  }
}

export async function redisTtl(key: string): Promise<number> {
  try {
    let value = await redisClient.ttl(key);
    if (typeof value !== "number") value = parseInt(value);
    return value;
  } catch (error) {
    customLog("redis", `An error occurred while getting TTL of (${key}):`);
    customLog("redis", (error as Error).message);
    return 0;
  }
}

export async function redisDel(key: string) {
  try {
    await redisClient.del(key);
  } catch (error) {
    customLog("redis", `An error occurred while deleting (${key}):`);
    customLog("redis", (error as Error).message);
  }
}

export async function redisFlushDb() {
  try {
    await redisClient.flushDb();
  } catch (err) {
    customLog("redis", `An error occurred while flushing database:`);
    customLog("redis", (err as Error).message);
  }
}
