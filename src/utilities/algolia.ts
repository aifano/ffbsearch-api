import { algoliasearch } from "algoliasearch";
import { ALGOLIA_API_KEY, ALGOLIA_APPLICATION_ID } from './config';

export const algolia = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);
