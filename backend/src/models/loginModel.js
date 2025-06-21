// src/models/loginModel.js

const validator = require('validator');
const bcrypt = require('bcryptjs'); // Use bcryptjs (npm install bcryptjs), é mais leve no Node.js

class Login {
    constructor(body, db) { // <-- Recebe o pool de conexão aqui
        this.body = body;
        this.errors = [];
        this.user = null;
        this.db = db; // Armazena o pool de conexão
    }

    async register() {
        this.valida();
        if (this.errors.length > 0) return;

        try {
            // 1. Verificar se o nome de usuário já existe
            const [existingUsers] = await this.db.execute('SELECT id FROM usuarios WHERE usuario = ?', [this.body.usuario]);
            if (existingUsers.length > 0) {
                this.errors.push('Nome de usuário já está em uso.');
                return;
            }

            // 2. Hash da senha
            const hashedPassword = bcrypt.hashSync(this.body.password, 10); // 10 é o número de rounds de salting

            // 3. Inserir usuário na tabela 'usuarios'
            const [result] = await this.db.execute(
                'INSERT INTO usuarios (usuario, senha, nome) VALUES (?, ?, ?)',
                [this.body.usuario, hashedPassword, this.body.nome || this.body.usuario] // Usa o nome fornecido, ou o usuario como nome
            );

            this.user = { id: result.insertId, usuario: this.body.usuario, nome: this.body.nome || this.body.usuario };

            // 4. Atribuir papel 'requerente' padrão para novos usuários
            const [roles] = await this.db.execute('SELECT id FROM roles WHERE nome = ?', ['requerente']);
            const requerenteRoleId = roles[0] ? roles[0].id : null;

            if (requerenteRoleId) {
                await this.db.execute('INSERT INTO usuario_roles (usuario_id, role_id) VALUES (?, ?)', [this.user.id, requerenteRoleId]);
                console.log(`Usuário ${this.user.usuario} registrado e atribuído ao papel 'requerente'.`);
            } else {
                console.warn("Aviso: Papel 'requerente' não encontrado na tabela 'roles'. Novo usuário não terá papel atribuído.");
            }

            // 5. Buscar todos os papéis do usuário para o objeto 'user'
            await this._getRolesForUser();

        } catch (e) {
            console.error('Erro no registro de usuário:', e);
            // Verifica se o erro é de duplicidade de chave única (mesmo que já tenhamos verificado)
            if (e.code === 'ER_DUP_ENTRY') {
                this.errors.push('Nome de usuário já está em uso.');
            } else {
                this.errors.push('Erro interno no servidor ao registrar usuário.');
            }
        }
    }

    async login() {
        this.valida();
        if (this.errors.length > 0) return;

        try {
            const [users] = await this.db.execute('SELECT id, usuario, senha, nome FROM usuarios WHERE usuario = ? LIMIT 1', [this.body.usuario]);
            const user = users[0];

            if (!user) {
                this.errors.push('Usuário não encontrado.');
                return;
            }

            // Comparar senha hasheada
            const senhaCorreta = bcrypt.compareSync(this.body.password, user.senha);

            if (!senhaCorreta) {
                this.errors.push('Credenciais inválidas (senha incorreta).');
                return;
            }

            // Carrega os dados do usuário logado (sem a senha)
            this.user = { id: user.id, usuario: user.usuario, nome: user.nome };
            
            // Buscar todos os papéis do usuário para o objeto 'user'
            await this._getRolesForUser();

        } catch (e) {
            console.error('Erro no login de usuário:', e);
            this.errors.push('Erro interno no servidor ao fazer login.');
        }
    }

    // Método privado para buscar os papéis do usuário
    async _getRolesForUser() {
        if (!this.user || !this.user.id) return;

        const [roles] = await this.db.execute(`
            SELECT r.nome
            FROM roles r
            JOIN usuario_roles ur ON r.id = ur.role_id
            WHERE ur.usuario_id = ?
        `, [this.user.id]);

        this.user.roles = roles.map(role => role.nome); // Armazena um array de nomes de papéis
    }

    valida() {
        this.cleanUp();

        // Validação de e-mail agora é para 'usuario' se 'usuario' for um e-mail.
        // Se 'usuario' for um nome de usuário genérico, a validação muda.
        // Assumindo que 'usuario' pode ser um e-mail para usar validator.isEmail
        if (!this.body.usuario || !validator.isEmail(this.body.usuario)) {
            this.errors.push('Usuário (email) inválido.');
        }

        // Adicione validação para o nome no registro, se aplicável
        if (this.body.action === 'register' && (!this.body.nome || typeof this.body.nome !== 'string' || this.body.nome.length < 2)) {
            this.errors.push('Nome é obrigatório e deve ter pelo menos 2 caracteres para registro.');
        }

        // Validação de senha
        if (!this.body.password || typeof this.body.password !== 'string' || this.body.password.length < 6 || this.body.password.length > 50) {
            this.errors.push('A senha precisa ter entre 6 e 50 caracteres.');
        }
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string') {
                this.body[key] = '';
            }
        }

        // Garante que apenas os campos relevantes são mantidos e trimados
        this.body = {
            usuario: this.body.usuario ? this.body.usuario.trim() : '',
            password: this.body.password || '', // 'password' é o campo que vem do frontend
            nome: this.body.nome ? this.body.nome.trim() : '', // 'nome' para o campo 'nome' da DB
            action: this.body.action || '' // Usado para validações contextuais (register/login)
        };
    }
}

module.exports = Login;