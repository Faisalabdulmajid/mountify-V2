const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function createSettingsTable() {
  try {
    console.log('🔧 Creating settings table...');
    
    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(50) PRIMARY KEY,
          value VARCHAR(255) NOT NULL
      );
    `);
    
    console.log('✅ Settings table created successfully');
    
    // Insert default values
    await pool.query(`
      INSERT INTO settings (key, value)
      VALUES ('tarif_per_km', '2000')
      ON CONFLICT (key) DO NOTHING;
    `);
    
    console.log('✅ Default tarif_per_km inserted');
    
    // Verify the data
    const result = await pool.query('SELECT * FROM settings');
    console.log('📊 Current settings:', result.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    pool.end();
  }
}

createSettingsTable();



