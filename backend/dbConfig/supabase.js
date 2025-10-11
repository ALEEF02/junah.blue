import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const testConnection = async () => {
    try {
        const { error } = await supabase
            .from('test')
            .select('count')
            .limit(1);

        if (error) {
            console.log('Supabase connection test - table may not exist yet:', error.message);
        } else {
            console.log('Connected to Supabase successfully');
        }
    } catch (err) {
        console.error('Supabase connection error:', err.message);
    }
};

export default supabase;