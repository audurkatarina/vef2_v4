const API_URL = 'http://localhost:3001';
// const API_URL = 'https://vef2-v4-a.herokuapp.com';

export async function fetchEarthquakes(type, period) {
  // TODO sækja gögn frá proxy þjónustu
  const url = `${API_URL}/proxy?period=${period}&type=${type}`;
  let result;
  try {
    result = await fetch(url);
  } catch (e) {
    console.error('Villa við að sækja', e);
    return null;
  }

  if (!result.ok) {
    console.error('Ekki 200 svar', await result.text());
    return null;
  }

  const data = await result.json();

  return data;
}
