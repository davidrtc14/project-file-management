const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'sua_senha_root',
    database: process.env.DATABASE_NAME || 'arquivos_db',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 5000;

async function connectWithRetry(retries = 0) {
    try {
        console.log(`Tentando conectar ao MySQL... Tentativa ${retries + 1}`);
        pool = mysql.createPool(dbConfig);
        
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        console.log('Teste de conexão MySQL (pool): ', rows[0].solution);
        console.log('Pool de conexões MySQL criado e testado com sucesso!');
        return pool;
    } catch (error) {
        console.error('Erro ao conectar ou criar pool de conexões com o banco de dados:', error.message);

        if (retries < MAX_RETRIES) {
            console.log(`Nova tentativa em ${RETRY_INTERVAL / 1000} segundos...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            return connectWithRetry(retries + 1);
        } else {
            console.error('Número máximo de tentativas de conexão excedido. Não foi possível conectar ao banco de dados.');
            process.exit(1); 
        }
    }
}

connectWithRetry();

module.exports = {
    getPool: () => {
        if (!pool) {
            console.warn('Aviso: O pool de conexão ainda não foi inicializado. Tentando forçar conexão.');
            throw new Error('Pool de conexão não está pronto.');
        }
        return pool;
    }
};