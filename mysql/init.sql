-- Criação da tabela de usuários (login)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

-- Criação da tabela de transferências
CREATE TABLE IF NOT EXISTS transferencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_arquivo VARCHAR(255) NOT NULL,
  descricao TEXT,
  setor_remetente VARCHAR(100) NOT NULL,
  setor_destinatario VARCHAR(100) NOT NULL,
  responsavel VARCHAR(100) NOT NULL,
  data_transferencia DATE NOT NULL,
  caminho_arquivo VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
