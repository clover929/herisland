import candidates from './candidates.json';
import {parseWomen,publicWomen,directoryWomen} from './schema';
// Internal research queue. Never import this module into a client component.
export const internalWomen = parseWomen(candidates);
export const publishedWomen = publicWomen(candidates);
export const womenDirectory = directoryWomen(candidates);
