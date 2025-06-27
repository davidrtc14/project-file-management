-- init.sql
-- Este arquivo será executado automaticamente pelo container do banco de dados na primeira inicialização.

-- Tabela de Setores (CRIADA PRIMEIRO)
CREATE TABLE IF NOT EXISTS setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- Garanta que isso está aqui!

/* --- */

-- Tabela de Papéis (Roles)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- Garanta que isso está aqui!

/* --- */

-- Tabela de Usuários (login) (AGORA REFERENCIA 'setores')
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    setor_id INT NOT NULL, -- <-- ESTA LINHA É CRÍTICA!
    FOREIGN KEY (setor_id) REFERENCES setores(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- Garanta que isso está aqui!

/* --- */

-- Tabela de Relacionamento Usuário-Papel
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (usuario_id, role_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- Garanta que isso está aqui!

/* --- */

-- Tabela de Solicitações (Documentos/Transferências)
CREATE TABLE IF NOT EXISTS solicitacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_documento VARCHAR(255) NOT NULL,
    descricao TEXT,
    quantidade INT NOT NULL,
    setor_remetente_id INT NOT NULL,
    setor_destinatario_id INT NOT NULL,
    requerente_id INT NOT NULL,
    responsavel_setor_id INT NOT NULL, -- <-- ESTA LINHA DEVE SER 'INT NOT NULL' (SEM DUPLICAÇÃO)
    data_transferencia DATE NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'recebido', 'assinado', 'recusado') DEFAULT 'pendente',
    data_recebimento DATETIME DEFAULT NULL,
    caminho_arquivo_assinado VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (setor_remetente_id) REFERENCES setores(id),
    FOREIGN KEY (setor_destinatario_id) REFERENCES setores(id),
    FOREIGN KEY (requerente_id) REFERENCES usuarios(id),
    FOREIGN KEY (responsavel_setor_id) REFERENCES usuarios(id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; -- Garanta que isso está aqui!

/* --- */

-- INSERÇÕES INICIAIS
INSERT INTO setores (nome) VALUES
('Administração'),
('Recursos Humanos'),
('Financeiro'),
('TI'),
('Compras');

INSERT INTO roles (nome) VALUES
('administrador'),
('funcionario');