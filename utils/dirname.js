import { fileURLToPath } from 'url';
import path from 'path';

// Function to get the directory name (__dirname equivalent in ESM)
export const getDirname = (metaUrl) => {
    const __filename = fileURLToPath(metaUrl);
    return path.dirname(__filename);
};