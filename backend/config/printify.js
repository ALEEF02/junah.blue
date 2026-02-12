import axios from 'axios';
import { env, hasPrintifyConfigured } from './env.js';

export const printifyClient = hasPrintifyConfigured
  ? axios.create({
      baseURL: 'https://api.printify.com/v1',
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    })
  : null;
