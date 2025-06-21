// server.js (Este arquivo não precisa mais de alterações)

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');

dotenv.config();

const dbMiddleware = require('./src/middlewares/dbMiddleware'); 
const solicitacaoRoutes = require('./src/routes/solicitacoesRoutes');
const loginRoutes = require('./src/routes/loginRoutes');

const app = express();

app.use(helmet()); 
app.use(cors());   
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/uploads', express.static('uploads'));

app.use(dbMiddleware); 

app.use('/api/solicitacoes', solicitacaoRoutes);
app.use('/api/auth', loginRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});