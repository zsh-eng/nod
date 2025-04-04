import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const expo = openDatabaseSync('nod.db');
const db = drizzle(expo, { schema });

export default db;
