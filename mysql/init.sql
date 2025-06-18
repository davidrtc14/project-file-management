CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS solicitacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_documento VARCHAR(255) NOT NULL,
  descricao TEXT,
  quantidade INT NOT NULL,
  setor_remetente VARCHAR(100) NOT NULL,
  setor_destinatario VARCHAR(100) NOT NULL,
  requerente VARCHAR(100) NOT NULL,
  responsavel_setor VARCHAR(100) NOT NULL,
  data_transferencia DATE NOT NULL,
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
