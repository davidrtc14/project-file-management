-- init.sql
-- Este arquivo será executado automaticamente pelo container do banco de dados na primeira inicialização.
-- Garante a criação e pré-configuração das tabelas para o sistema de gestão de solicitações.

-- Tabela de Usuários (login)
-- Armazena as informações básicas de login e identificação dos usuários.
-- IMPORTANTE: No backend, SEMPRE HASH A SENHA antes de salvá-la no banco de dados!
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE, -- Pode ser e-mail, nome de usuário, etc. Deve ser único.
    senha VARCHAR(255) NOT NULL, -- Ajuste o tamanho VARCHAR para o hash da sua senha (ex: VARCHAR(60) para bcrypt).
    nome VARCHAR(255) NOT NULL -- Nome completo ou de exibição do usuário.
);

-- --- (Este era o problema!)
-- Substituído por comentários válidos em SQL ou apenas espaços para separação visual.

-- Tabela de Setores
-- Armazena os diferentes departamentos ou áreas da empresa.
CREATE TABLE IF NOT EXISTS setores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE -- Nome único do setor (ex: 'Recursos Humanos', 'Financeiro').
);

-- ---

-- Tabela de Relacionamento Usuário-Setor
-- Vincula um usuário ao seu setor principal. Um usuário pertence a um setor.
CREATE TABLE IF NOT EXISTS usuario_setor (
    usuario_id INT NOT NULL,
    setor_id INT NOT NULL,
    PRIMARY KEY (usuario_id, setor_id), -- Garante que um usuário só pode ter uma entrada para um setor específico.
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, -- Se o usuário for deletado, a associação ao setor também é.
    FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE RESTRICT -- Impede a exclusão de um setor se houver usuários associados a ele.
);

-- ---

-- Tabela de Papéis (Roles)
-- Define os diferentes níveis de acesso e permissões no sistema (RBAC).
-- Mantido simples com 'administrador' e 'requerente'.
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE -- Nome único do papel (ex: 'administrador', 'requerente').
);

-- ---

-- Tabela de Relacionamento Usuário-Papel
-- Conecta os usuários aos papéis que eles possuem, permitindo que um usuário tenha um ou mais papéis.
CREATE TABLE IF NOT EXISTS usuario_roles (
    usuario_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (usuario_id, role_id), -- Chave primária composta para garantir unicidade da atribuição.
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, -- Se o usuário for deletado, suas atribuições de papel também são.
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE -- Se um papel for deletado, as atribuições de papel associadas também são.
);

-- ---

-- Tabela de Solicitações (Documentos/Transferências)
-- Registra todas as solicitações de documentos ou transferências entre setores.
CREATE TABLE IF NOT EXISTS solicitacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_documento VARCHAR(255) NOT NULL,
    descricao TEXT,
    quantidade INT NOT NULL, -- Quantidade de itens/documentos.
    setor_remetente_id INT NOT NULL, -- ID do setor que originou a solicitação.
    setor_destinatario_id INT NOT NULL, -- ID do setor para onde a solicitação foi enviada.
    requerente_id INT NOT NULL, -- ID do usuário que fez a solicitação.
    responsavel_setor_id INT NOT NULL, -- ID do usuário responsável pela aprovação/execução no setor de destino.
    data_transferencia DATE NOT NULL, -- Data em que a transferência efetiva ocorreu ou está prevista.
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Data e hora de criação do registro da solicitação.
    
    -- Campos para rastrear o status e o documento final
    status ENUM('pendente', 'recebido', 'assinado', 'recusado') DEFAULT 'pendente', -- Status atual da solicitação.
    data_recebimento DATETIME DEFAULT NULL, -- Carimbo de data/hora quando o status muda para 'recebido'.
    caminho_arquivo_assinado VARCHAR(255) DEFAULT NULL, -- Caminho ou nome do arquivo PDF assinado (localmente no servidor).
    
    -- Chaves Estrangeiras para garantir a integridade referencial
    FOREIGN KEY (setor_remetente_id) REFERENCES setores(id),
    FOREIGN KEY (setor_destinatario_id) REFERENCES setores(id),
    FOREIGN KEY (requerente_id) REFERENCES usuarios(id),
    FOREIGN KEY (responsavel_setor_id) REFERENCES usuarios(id)
);

-- ---

-- INSERÇÕES INICIAIS (Opcional, mas útil para testes rápidos e para popular dados mestres)

-- Popula a tabela 'setores' com alguns setores comuns.
INSERT INTO setores (nome) VALUES
('Administração'),
('Recursos Humanos'),
('Financeiro'),
('TI'),
('Compras');

-- Popula a tabela 'roles' com os papéis definidos.
INSERT INTO roles (nome) VALUES
('administrador'),
('requerente');