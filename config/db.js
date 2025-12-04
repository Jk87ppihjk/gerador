// Arquivo: config/db.js (GERADO)
const mysql = require('mysql2/promise');

// Configuração do Banco de Dados usando variáveis de ambiente
const dbConfig = { 
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}; 

// Criação do Pool ÚNICO de Conexão
const pool = mysql.createPool(dbConfig);

// Exporta o pool
module.exports = pool;
