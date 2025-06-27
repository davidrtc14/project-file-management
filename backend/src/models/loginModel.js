// src/models/loginModel.js

const validator = require('validator');
const bcrypt = require('bcryptjs');

class Login {
    constructor(body, db) {
        this.body = body;
        this.errors = [];
        this.user = null;
        this.db = db;
    }

    async register() {
        this.valida();
        if (this.errors.length > 0) return;

        try {
            // 1. Verificar se o nome de usuário (coluna 'usuario') já existe
            const [existingUsers] = await this.db.execute('SELECT id FROM usuarios WHERE usuario = ?', [this.body.usuario]);
            if (existingUsers.length > 0) {
                this.errors.push('Nome de usuário já está em uso.');
                return;
            }

            // 2. Hash da senha
            const hashedPassword = bcrypt.hashSync(this.body.password, 10);

            // 3. Inserir usuário na tabela 'usuarios'
            // O campo 'usuario' é o identificador de login (pode ser um email, mas o nome da coluna é 'usuario')
            // O campo 'setor_id' é obrigatório no registro
            const [result] = await this.db.execute(
                'INSERT INTO usuarios (usuario, senha, nome, setor_id) VALUES (?, ?, ?, ?)',
                [this.body.usuario, hashedPassword, this.body.nome || this.body.usuario, this.body.setor_id]
            );

            this.user = { 
                id: result.insertId, 
                usuario: this.body.usuario, 
                nome: this.body.nome || this.body.usuario,
                setor_id: this.body.setor_id // Inclui o setor_id no objeto user
            };

            // 4. Atribuir papel 'funcionario' padrão para novos usuários
            const [roles] = await this.db.execute('SELECT id FROM roles WHERE nome = ?', ['funcionario']); // <-- Busca papel 'funcionario'
            const funcionarioRoleId = roles[0] ? roles[0].id : null;

            if (funcionarioRoleId) {
                await this.db.execute('INSERT INTO usuario_roles (usuario_id, role_id) VALUES (?, ?)', [this.user.id, funcionarioRoleId]);
                console.log(`Usuário ${this.user.usuario} registrado e atribuído ao papel 'funcionario'.`);
            } else {
                console.warn("Aviso: Papel 'funcionario' não encontrado na tabela 'roles'. Novo usuário não terá papel atribuído.");
            }

            // 5. Buscar todos os papéis do usuário para o objeto 'user'
            await this._getRolesForUser();

        } catch (e) {
            console.error('Erro no registro de usuário:', e);
            if (e.code === 'ER_DUP_ENTRY') {
                this.errors.push('Nome de usuário já está em uso.');
            } else if (e.code === 'ER_NO_REFERENCED_ROW_2' || e.message.includes('foreign key constraint fails')) {
                 this.errors.push('ID do setor inválido. Selecione um setor existente.');
            }
            else {
                this.errors.push('Erro interno no servidor ao registrar usuário.');
            }
        }
    }

    async login() {
        this.valida(); // Reutiliza a validação
        if (this.errors.length > 0) return;

        try {
            // A query busca o 'usuario', 'senha', 'nome' e 'setor_id'
            const [users] = await this.db.execute('SELECT id, usuario, senha, nome, setor_id FROM usuarios WHERE usuario = ? LIMIT 1', [this.body.usuario]);
            const user = users[0];

            if (!user) {
                this.errors.push('Nome de usuário não encontrado.');
                return;
            }

            // Comparar senha hasheada
            if (!bcrypt.compareSync(this.body.password, user.senha)) {
                this.errors.push('Credenciais inválidas (senha incorreta).');
                return;
            }

            // Carrega os dados do usuário logado (sem a senha)
            this.user = { 
                id: user.id, 
                usuario: user.usuario, 
                nome: user.nome,
                setor_id: user.setor_id // Inclui o setor_id no objeto user retornado no login
            };
            
            // Buscar todos os papéis do usuário para o objeto 'user'
            await this._getRolesForUser();

        } catch (e) {
            console.error('Erro no login de usuário:', e);
            this.errors.push('Erro interno no servidor ao fazer login.');
        }
    }

    async _getRolesForUser() {
        if (!this.user || !this.user.id) return;

        const [roles] = await this.db.execute(`
            SELECT r.nome
            FROM roles r
            JOIN usuario_roles ur ON r.id = ur.role_id
            WHERE ur.usuario_id = ?
        `, [this.user.id]);

        this.user.roles = roles.map(role => role.nome); // Armazena um array de nomes de papéis (ex: ['funcionario', 'administrador'])
    }

    valida() {
        this.cleanUp();

        // Validação de 'usuario' (não mais necessariamente um email)
        if (!this.body.usuario || typeof this.body.usuario !== 'string' || this.body.usuario.length < 3) {
            this.errors.push('Nome de usuário precisa ter pelo menos 3 caracteres.');
        }

        // Validação de 'nome' (para registro)
        if (this.body.action === 'register' && (!this.body.nome || typeof this.body.nome !== 'string' || this.body.nome.length < 2)) {
            this.errors.push('Nome completo é obrigatório e deve ter pelo menos 2 caracteres para registro.');
        }

        // Validação de 'setor_id' (para registro)
        if (this.body.action === 'register' && (typeof this.body.setor_id !== 'number' || this.body.setor_id <= 0)) {
             this.errors.push('Setor é obrigatório para registro.');
        }

        // Validação de senha
        if (!this.body.password || typeof this.body.password !== 'string' || this.body.password.length < 6 || this.body.password.length > 50) {
            this.errors.push('A senha precisa ter entre 6 e 50 caracteres.');
        }
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] === 'string') {
                this.body[key] = this.body[key].trim();
            }
            if (key === 'setor_id' && typeof this.body[key] === 'string') { // Converte setor_id para número
                this.body[key] = parseInt(this.body[key], 10);
                if (isNaN(this.body[key])) this.body[key] = null;
            }
        }

        this.body = {
            usuario: this.body.usuario || '',
            password: this.body.password || '',
            nome: this.body.nome || '',
            setor_id: this.body.setor_id || null, // Garante que setor_id seja tratado como null se não vier
            action: this.body.action || ''
        };
    }
}

module.exports = Login;