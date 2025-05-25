const db = require('../db/db');
const validator = require('validator');
const bcrypt = require('bcrypt');

class Login {
    constructor(body) {
        this.body = body;
        this.errors = [];
        this.user = null;
    }

    async register() {
        this.valida(); // já serve para register
        if (this.errors.length > 0) return;

        try {
            const hashedPassword = await bcrypt.hash(this.body.password, 10);
            const sql = 'INSERT INTO usuarios (email, senha) VALUES (?, ?)';
            const valores = [this.body.email, hashedPassword];

            await new Promise((resolve, reject) => {
                db.query(sql, valores, (err, result) => {
                    if (err) return reject(err);
                    this.user = { id: result.insertId, email: this.body.email };
                    resolve();
                });
            });
        } catch (e) {
            console.error(e);
            this.errors.push('Erro interno no servidor');
        }
    }

    async login() {
        this.valida(); // usa o mesmo método de validação
        if (this.errors.length > 0) return;

        try {
            const sql = 'SELECT * FROM usuarios WHERE email = ? LIMIT 1';
            const result = await new Promise((resolve, reject) => {
                db.query(sql, [this.body.email], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            if (result.length === 0) {
                this.errors.push('Usuário não encontrado');
                return;
            }

            const usuario = result[0];
            const senhaCorreta = await bcrypt.compare(this.body.password, usuario.senha);

            if (!senhaCorreta) {
                this.errors.push('Senha inválida');
                return;
            }

            this.user = { id: usuario.id, email: usuario.email };
        } catch (e) {
            console.error(e);
            this.errors.push('Erro ao fazer login');
        }
    }

    valida() {
        this.cleanUp();

        if (!validator.isEmail(this.body.email)) {
            this.errors.push('Email inválido');
        }

        if (!this.body.password || this.body.password.length < 3 || this.body.password.length > 50) {
            this.errors.push('A senha precisa ter entre 3 e 50 caracteres');
        }
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] !== 'string') {
                this.body[key] = '';
            }
        }

        this.body = {
            email: this.body.email,
            password: this.body.password
        };
    }
}

module.exports = Login;
