import { neon } from '@neondatabase/serverless';

export interface UserQueryUsage {
  allowed: boolean;
  queriesUsed: number;
  queriesLimit: number;
  error?: string;
}

const getDatabaseUrl = (): string | null => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
};

export const getDb = () => {
  const url = getDatabaseUrl();
  if (!url) {
    return null;
  }
  return neon(url);
};

/**
 * Ensures the users table exists according to user schema:
 * CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY, email TEXT NOT NULL, queries INT);
 */
export const ensureTableExists = async () => {
  const sql = getDb();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      queries INT
    );
  `;
};

/**
 * Ensures user is registered in the database with their email.
 */
export const registerUserEmail = async (email: string) => {
  const sql = getDb();
  if (!sql || !email) return;

  try {
    await ensureTableExists();
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1;
    `;

    if (existing.length === 0) {
      await sql`
        INSERT INTO users (email, queries)
        VALUES (${email}, 0);
      `;
    }
  } catch (error) {
    console.error('Error registering user email in Neon db:', error);
  }
};

/**
 * Checks if user is eligible to execute another prompt (limit: 5 prompts).
 * If eligible, increments queries by 1.
 */
export const checkAndIncrementQuery = async (
  email: string,
  limit = 5
): Promise<UserQueryUsage> => {
  const sql = getDb();
  if (!sql) {
    return {
      allowed: false,
      queriesUsed: 0,
      queriesLimit: limit,
      error:
        'DATABASE_URL is not configured. Please add your Neon connection string to the .env file.',
    };
  }

  try {
    await ensureTableExists();

    // Check existing record for email
    const rows = await sql`
      SELECT id, email, queries FROM users WHERE email = ${email} ORDER BY id ASC LIMIT 1;
    `;

    if (rows.length === 0) {
      // First query for this user -> insert with queries = 1
      const insertResult = await sql`
        INSERT INTO users (email, queries)
        VALUES (${email}, 1)
        RETURNING queries;
      `;
      const queriesUsed = insertResult[0]?.queries ?? 1;
      return {
        allowed: true,
        queriesUsed,
        queriesLimit: limit,
      };
    }

    const currentRecord = rows[0];
    const currentQueries =
      typeof currentRecord.queries === 'number' ? currentRecord.queries : 0;

    // Check if limit of 5 is already reached
    if (currentQueries >= limit) {
      return {
        allowed: false,
        queriesUsed: currentQueries,
        queriesLimit: limit,
        error: `You have reached your limit of ${limit} prompts.`,
      };
    }

    // Increment prompt count
    const updateResult = await sql`
      UPDATE users
      SET queries = queries + 1
      WHERE id = ${currentRecord.id}
      RETURNING queries;
    `;

    const updatedQueries = updateResult[0]?.queries ?? currentQueries + 1;
    return {
      allowed: true,
      queriesUsed: updatedQueries,
      queriesLimit: limit,
    };
  } catch (error: any) {
    console.error('Database query error:', error);
    return {
      allowed: false,
      queriesUsed: 0,
      queriesLimit: limit,
      error: `Database error: ${error?.message || 'Unable to verify query quota.'}`,
    };
  }
};

/**
 * Gets the current prompt count for a user
 */
export const getUserUsage = async (
  email: string,
  limit = 5
): Promise<{ queriesUsed: number; queriesLimit: number; remaining: number }> => {
  const sql = getDb();
  if (!sql || !email) {
    return { queriesUsed: 0, queriesLimit: limit, remaining: limit };
  }

  try {
    await ensureTableExists();
    const rows = await sql`
      SELECT queries FROM users WHERE email = ${email} ORDER BY id ASC LIMIT 1;
    `;

    const queriesUsed =
      rows.length > 0 && typeof rows[0].queries === 'number'
        ? rows[0].queries
        : 0;

    return {
      queriesUsed,
      queriesLimit: limit,
      remaining: Math.max(0, limit - queriesUsed),
    };
  } catch (error) {
    console.error('Failed to get user usage:', error);
    return { queriesUsed: 0, queriesLimit: limit, remaining: limit };
  }
};

