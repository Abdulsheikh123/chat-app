import { redis } from "../config/redis";

const testRedis = async () => {
  await redis.set("name", "abdul");

  const data = await redis.get("name");

  console.log(data);
};

testRedis();