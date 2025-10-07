import axios from 'axios';

// Base URL for the API. React-scripts will proxy requests to the backend
// defined in package.json when running in development mode.
const API_BASE = process.env.REACT_APP_API_BASE || '';

/**
 * Fetch the biography object from the backend.
 * Returns a Promise resolving to an object with `name` and `biography`.
 */
export async function getBiography() {
  const response = await axios.get(`${API_BASE}/api/biography`);
  return response.data;
}

/**
 * Fetch the list of beats from the backend.
 * Returns a Promise resolving to an array of beat objects.
 */
export async function getBeats() {
  const response = await axios.get(`${API_BASE}/api/beats`);
  return response.data;
}