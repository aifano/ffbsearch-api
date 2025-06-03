import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const ALGOLIA_APPLICATION_ID = process.env.ALGOLIA_APPLICATION_ID || "";
export const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY || "";
export const INDEX_NAME = "ffbsearch-test";
