// TODO útfæra proxy virkni
import express from 'express';
// import fetch from 'node-fetch';
import { getCachedEarth } from './cache.js';
import { timerStart, timerEnd } from './time.js';

const API_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';

export const router = express.Router();

router.get('/', async (req, res) => {
  const { period, type } = req.query;
  const url = `${API_URL}${type}_${period}.geojson`;

  const timer = timerStart();
  const { data, cached } = await getCachedEarth(url);
  const elapsed = timerEnd(timer);

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
