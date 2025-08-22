// Node.js script to set up the database connection and run migrations
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import pg from "pg"

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "rating_system",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
})

async function setupDatabase() {
  const client = await pool.connect()

  try {
    console.log("Setting up database schema...")

    // Read and execute schema creation script
    const schemaSQL = readFileSync(join(__dirname, "01_create_database_schema.sql"), "utf8")
    await client.query(schemaSQL)
    console.log("✅ Database schema created successfully")

    // Read and execute seed data script
    const seedSQL = readFileSync(join(__dirname, "02_seed_initial_data.sql"), "utf8")
    await client.query(seedSQL)
    console.log("✅ Initial data seeded successfully")

    console.log("🎉 Database setup completed!")
  } catch (error) {
    console.error("❌ Error setting up database:", error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the setup
setupDatabase().catch(console.error)
