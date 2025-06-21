// db/db.js

const mysql = require('mysql2/promise');
const dotenv = require('dotenv'); // Garante que dotenv seja importado aqui também
dotenv.config(); // Carrega variáveis de ambiente ANTES de usar dbConfig

const dbConfig = {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'sua_senha_root', // Use a senha correta
    database: process.env.DATABASE_NAME || 'arquivos_db',
    port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 3306, // Garante que a porta seja um número
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;
const MAX_RETRIES = 10; // Número máximo de tentativas de reconexão
const RETRY_INTERVAL = 5000; // Intervalo entre as tentativas em milissegundos (5 segundos)

async function connectWithRetry(retries = 0) {
    try {
        console.log(`Tentando conectar ao MySQL... Tentativa ${retries + 1}`);
        pool = mysql.createPool(dbConfig);
        
        // Testa a conexão para ter certeza que o pool está funcional
        const [rows] = await pool.execute('SELECT 1 + 1 AS solution');
        console.log('Teste de conexão MySQL (pool): ', rows[0].solution);
        console.log('Pool de conexões MySQL criado e testado com sucesso!');
        return pool; // Retorna o pool se a conexão for bem-sucedida
    } catch (error) {
        console.error('Erro ao conectar ou criar pool de conexões com o banco de dados:', error.message);

        if (retries < MAX_RETRIES) {
            console.log(`Nova tentativa em ${RETRY_INTERVAL / 1000} segundos...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
            return connectWithRetry(retries + 1); // Tenta novamente
        } else {
            console.error('Número máximo de tentativas de conexão excedido. Não foi possível conectar ao banco de dados.');
            // Em um ambiente de produção, você pode querer sair do processo aqui
            process.exit(1); 
        }
    }
}

// Inicia o processo de conexão com retry
connectWithRetry();

// Exporta uma função que retorna o pool, garantindo que ele só seja usado depois de conectado
module.exports = {
    getPool: () => {
        if (!pool) {
            // Este caso só deve acontecer se a aplicação tentar usar o pool antes da primeira conexão bem-sucedida
            console.warn('Aviso: O pool de conexão ainda não foi inicializado. Tentando forçar conexão.');
            // Pode-se adicionar uma chamada a connectWithRetry() aqui, mas o ideal é que o
            // processo de inicialização do servidor espere a conexão.
            throw new Error('Pool de conexão não está pronto.');
        }
        return pool;
    }
};