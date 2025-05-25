const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const transferenciaRoutes = require('./src/routes/transferenciaRoutes');
const loginRoutes = require('./src/routes/loginRoutes');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/transferencias', transferenciaRoutes);
app.use('/api/auth', loginRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta: ${PORT}`);
});