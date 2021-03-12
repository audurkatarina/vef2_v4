// TODO útfæra redis cache
import redis from 'redis';
import util from 'util';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const {
  REDIS_URL: redisUrl = 'redis://127.0.0.1:6379/0',
} = process.env;

let client;
let asyncGet;
let asyncSet;
if (redisUrl) {
  client = redis.createClient(redisUrl);
  asyncGet = util.promisify(client.get).bind(client);
  asyncSet = util.promisify(client.set).bind(client);
}

/**
 * Returns cached data or null if not cached.
 * @param {string} cacheKey Cache key to for data for
 * @returns {object} Data as the cached object, otherwise null
 */
async function get(cacheKey) {
  // Slökkt á cache
  if (!client || !asyncGet) {
    return null;
  }

  let cached;

  try {
    cached = await asyncGet(cacheKey);
  } catch (e) {
    console.warn(`unable to get from cache, ${cacheKey}, ${e.message}`);
    return null;
  }

  if (!cached) {
    return null;
  }

  let result;

  try {
    result = JSON.parse(cached);
  } catch (e) {
    console.warn(`unable to parse cached data, ${cacheKey}, ${e.message}`);
    return null;
  }

  return result;
}

/**
 * Cache data for a specific time under a cacheKey.
 *
 * @param {string} cacheKey Cache key to cache data under
 * @param {object} data Data to cache
 * @param {number} ttl Time-to-live of cache
 * @returns {Promise<boolean>} true if data cached, otherwise false
 */
export async function set(cacheKey, data, ttl) {
  if (!client || !asyncSet) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    await asyncSet(cacheKey, serialized, 'EX', ttl);
  } catch (e) {
    console.warn('unable to set cache for ', cacheKey);
    return false;
  }

  return true;
}

export async function getCachedEarth(key) {
  const cachedData = await get(key);
  if (cachedData) {
    const data = cachedData;
    const cached = true;
    const result = {
      data,
      cached,
    };
    return result;
  }
  const response = await fetch(key);
  const responseJSON = await response.json();
  const data = responseJSON;
  const cached = false;

  const result = {
    data,
    cached,
  };
  await set(key, responseJSON, 1000);
  return result;

  // client.quit();
}

getCachedEarth().catch((err) => { console.error(err); });
