const { Pool } = require('pg');


const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'TeamLink',
    password: process.env.DB_PASSWORD || 'aminethelord',
    port: process.env.DB_PORT || 5432,
});

// Connect to the PostgreSQL database
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database');
    }
    release(); // release the client back to the pool
    // Do not call pool.end() here
});

module.exports = pool;