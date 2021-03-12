// TODO útfæra proxy virkni
import express from 'express';
import { getCachedEarth } from './cache.js';
import { timerStart, timerEnd } from './time.js';

const API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

export const router = express.Router();

router.get('/', async (req, res) => {
  const { period, type } = req.query;
  const url = `${API_URL}${type}_${period}.geojson`;
  // const url = new URL(`${period}_${type}.geojson`, API_URL);

  const timer = timerStart();
  const answer = await getCachedEarth(url);
  const elapsed = timerEnd(timer);

  const { data, cached } = answer;

  const info = {
    cached,
    elapsed,
  };
  const result = {
    data,
    info,
  };
  res.json(result);
});
