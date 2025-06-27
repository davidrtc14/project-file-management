// src/config/multerConfig.js

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Diretório onde os arquivos assinados serão armazenados
const UPLOADS_DIR = path.join(__dirname, '../../uploads/documentos_assinados');

// Garante que o diretório de uploads exista
fs.ensureDirSync(UPLOADS_DIR);
console.log(`Diretório de uploads para documentos assinados garantido: ${UPLOADS_DIR}`);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR); // Define o diretório de destino
    },
    filename: function (req, file, cb) {
        // Gera um nome de arquivo único para evitar colisões
        // Ex: documento_assinado_123456789.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `documento_assinado_${req.params.id}_${uniqueSuffix}${fileExtension}`); // Usa o ID da solicitação no nome
    }
});

const fileFilter = (req, file, cb) => {
    // Aceita apenas arquivos PDF
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos PDF são permitidos para upload!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por arquivo
});

module.exports = upload;