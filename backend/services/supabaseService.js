import { supabase } from "../dbConfig/supabase.js";

const BUCKET_NAME = 'beat-files-preview';



/**
 * Download a file from Supabase storage
 * @param {string} fileName - Name of the file to download
 * @returns {Promise<{success: boolean, data?: Buffer, error?: string}>}
 */
export const downloadBeatFile = async (fileName) => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(fileName);

        if (error) {
            console.error('Supabase download error:', error);
            return { success: false, error: 'File not found' };
        }

        const buffer = Buffer.from(await data.arrayBuffer());

        return {
            success: true,
            data: buffer
        };
    } catch (error) {
        console.error('Download service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get public URL for a file
 * @param {string} fileName - Name of the file
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export const getBeatFileUrl = async (fileName) => {
    try {
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return {
            success: true,
            data: {
                fileName,
                publicUrl
            }
        };
    } catch (error) {
        console.error('URL retrieval service error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * List all files in the storage bucket
 * @param {number} limit - Maximum number of files to return (default: 100)
 * @param {number} offset - Number of files to skip (default: 0)
 * @returns {Promise<{success: boolean, data?: array, error?: string}>}
 */
export const listBeatFiles = async (limit = 100, offset = 0) => {
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', {
                limit,
                offset,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('Supabase list error:', error);
            return { success: false, error: error.message };
        }

        return {
            success: true,
            data: data
        };
    } catch (error) {
        console.error('List service error:', error);
        return { success: false, error: error.message };
    }
};