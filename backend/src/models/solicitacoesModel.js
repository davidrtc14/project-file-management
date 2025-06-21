// src/models/solicitacoesModel.js

class Solicitacao {
    constructor(body, db) {
        this.body = body;
        this.errors = [];
        this.db = db;
    }

    valida(isUpdate = false) {
        this.cleanUp();

        if (!isUpdate) {
            if (!this.body.nome_documento) this.errors.push('Nome do documento é obrigatório.');
            if (typeof this.body.quantidade !== 'number' || !Number.isInteger(this.body.quantidade) || this.body.quantidade <= 0) {
                this.errors.push('Quantidade é obrigatória e deve ser um número inteiro positivo.');
            }
            if (!this.body.setor_remetente_id) this.errors.push('ID do setor remetente é obrigatório.');
            if (!this.body.setor_destinatario_id) this.errors.push('ID do setor destinatário é obrigatório.');
            if (!this.body.requerente_id) this.errors.push('ID do requerente é obrigatório.');
            if (!this.body.responsavel_setor_id) this.errors.push('ID do responsável do setor é obrigatório.');
            if (!this.body.data_transferencia) this.errors.push('Data da transferência é obrigatória.');
        } else {
            if (this.body.nome_documento !== undefined && typeof this.body.nome_documento !== 'string') {
                this.errors.push('Nome do documento inválido.');
            }
            if (this.body.quantidade !== undefined && (typeof this.body.quantidade !== 'number' || !Number.isInteger(this.body.quantidade) || this.body.quantidade <= 0)) {
                this.errors.push('Quantidade inválida (deve ser um número inteiro positivo).');
            }
        }

        if (this.body.data_transferencia && !/^\d{4}-\d{2}-\d{2}$/.test(this.body.data_transferencia)) {
            this.errors.push('Formato de data da transferência inválido (YYYY-MM-DD esperado).');
        }

        const validStatuses = ['pendente', 'recebido', 'assinado', 'recusado'];
        if (this.body.status && !validStatuses.includes(this.body.status)) {
            this.errors.push('Status inválido. Valores permitidos: pendente, recebido, assinado, recusado.');
        }
    }

    cleanUp() {
        for (const key in this.body) {
            if (typeof this.body[key] === 'string') {
                this.body[key] = this.body[key].trim();
            }
            if (key.endsWith('_id') && typeof this.body[key] === 'string') {
                this.body[key] = parseInt(this.body[key], 10);
                if (isNaN(this.body[key])) this.body[key] = null;
            }
        }

        this.body.quantidade = parseInt(this.body.quantidade, 10) || 0;
        this.body.descricao = this.body.descricao || null;
        this.body.observacoes = this.body.observacoes || null;
        this.body.status = this.body.status || 'pendente'; 
        this.body.data_recebimento = this.body.data_recebimento || null;
        this.body.caminho_arquivo_assinado = this.body.caminho_arquivo_assinado || null;
    }

    async salvar() {
        this.valida();
        if (this.errors.length > 0) return null;

        await this._checkForeignKeys();
        if (this.errors.length > 0) return null;

        const [result] = await this.db.execute(
            `INSERT INTO solicitacoes (nome_documento, descricao, quantidade, setor_remetente_id,
                                        setor_destinatario_id, requerente_id, responsavel_setor_id,
                                        data_transferencia, observacoes, status, data_recebimento,
                                        caminho_arquivo_assinado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                this.body.nome_documento,
                this.body.descricao,
                this.body.quantidade,
                this.body.setor_remetente_id,
                this.body.setor_destinatario_id,
                this.body.requerente_id,
                this.body.responsavel_setor_id,
                this.body.data_transferencia,
                this.body.observacoes,
                this.body.status,
                this.body.data_recebimento,
                this.body.caminho_arquivo_assinado
            ]
        );
        return result.insertId;
    }

    async _checkForeignKeys() {
        const checkPromises = [];

        if (this.body.setor_remetente_id) {
            checkPromises.push(this.db.execute('SELECT id FROM setores WHERE id = ?', [this.body.setor_remetente_id])
                .then(([rows]) => { if (rows.length === 0) this.errors.push('Setor remetente não encontrado.'); }));
        }
        if (this.body.setor_destinatario_id) {
            checkPromises.push(this.db.execute('SELECT id FROM setores WHERE id = ?', [this.body.setor_destinatario_id])
                .then(([rows]) => { if (rows.length === 0) this.errors.push('Setor destinatário não encontrado.'); }));
        }
        if (this.body.requerente_id) {
            checkPromises.push(this.db.execute('SELECT id FROM usuarios WHERE id = ?', [this.body.requerente_id])
                .then(([rows]) => { if (rows.length === 0) this.errors.push('Requerente (usuário) não encontrado.'); }));
        }
        if (this.body.responsavel_setor_id) {
            checkPromises.push(this.db.execute('SELECT id FROM usuarios WHERE id = ?', [this.body.responsavel_setor_id])
                .then(([rows]) => { if (rows.length === 0) this.errors.push('Responsável pelo setor (usuário) não encontrado.'); }));
        }

        await Promise.all(checkPromises);
    }

    static async listarTodos(db) {
        const [rows] = await db.execute(`
            SELECT
                s.*,
                sr.nome AS setor_remetente_nome,
                sd.nome AS setor_destinatario_nome,
                u_req.nome AS requerente_nome,
                u_resp.nome AS responsavel_setor_nome
            FROM solicitacoes s
            JOIN setores sr ON s.setor_remetente_id = sr.id
            JOIN setores sd ON s.setor_destinatario_id = sd.id
            JOIN usuarios u_req ON s.requerente_id = u_req.id
            JOIN usuarios u_resp ON s.responsavel_setor_id = u_resp.id
            ORDER BY s.criado_em DESC
        `);
        return rows;
    }

    static async listarPorRequerente(db, requerenteId) {
        const [rows] = await db.execute(`
            SELECT
                s.*,
                sr.nome AS setor_remetente_nome,
                sd.nome AS setor_destinatario_nome,
                u_req.nome AS requerente_nome,
                u_resp.nome AS responsavel_setor_nome
            FROM solicitacoes s
            JOIN setores sr ON s.setor_remetente_id = sr.id
            JOIN setores sd ON s.setor_destinatario_id = sd.id
            JOIN usuarios u_req ON s.requerente_id = u_req.id
            JOIN usuarios u_resp ON s.responsavel_setor_id = u_resp.id
            WHERE s.requerente_id = ?
            ORDER BY s.criado_em DESC
        `, [requerenteId]);
        return rows;
    }

    static async buscarPorId(id, db) {
        const [rows] = await db.execute(`
            SELECT
                s.*,
                sr.nome AS setor_remetente_nome,
                sd.nome AS setor_destinatario_nome,
                u_req.nome AS requerente_nome,
                u_resp.nome AS responsavel_setor_nome
            FROM solicitacoes s
            JOIN setores sr ON s.setor_remetente_id = sr.id
            JOIN setores sd ON s.setor_destinatario_id = sd.id
            JOIN usuarios u_req ON s.requerente_id = u_req.id
            JOIN usuarios u_resp ON s.responsavel_setor_id = u_resp.id
            WHERE s.id = ?
        `, [id]);
        return rows[0];
    }

    static async atualizar(id, newData, db) {
        const solicitacaoInstance = new Solicitacao(newData, db);
        solicitacaoInstance.valida(true); 
        if (solicitacaoInstance.errors.length > 0) {
            throw new Error(solicitacaoInstance.errors.join('; ')); 
        }

        const fkCheckPromises = [];
        if (solicitacaoInstance.body.setor_remetente_id !== null && solicitacaoInstance.body.setor_remetente_id !== undefined) {
             fkCheckPromises.push(db.execute('SELECT id FROM setores WHERE id = ?', [solicitacaoInstance.body.setor_remetente_id])
                .then(([rows]) => { if (rows.length === 0) solicitacaoInstance.errors.push('Setor remetente não encontrado.'); }));
        }
        if (solicitacaoInstance.body.setor_destinatario_id !== null && solicitacaoInstance.body.setor_destinatario_id !== undefined) {
             fkCheckPromises.push(db.execute('SELECT id FROM setores WHERE id = ?', [solicitacaoInstance.body.setor_destinatario_id])
                .then(([rows]) => { if (rows.length === 0) solicitacaoInstance.errors.push('Setor destinatário não encontrado.'); }));
        }
        if (solicitacaoInstance.body.responsavel_setor_id !== null && solicitacaoInstance.body.responsavel_setor_id !== undefined) {
             fkCheckPromises.push(db.execute('SELECT id FROM usuarios WHERE id = ?', [solicitacaoInstance.body.responsavel_setor_id])
                .then(([rows]) => { if (rows.length === 0) solicitacaoInstance.errors.push('Responsável pelo setor não encontrado.'); }));
        }
        await Promise.all(fkCheckPromises);
        if (solicitacaoInstance.errors.length > 0) {
            throw new Error(solicitacaoInstance.errors.join('; '));
        }

        const updateFields = [];
        const updateValues = [];

        const fieldMapping = {
            nome_documento: 'nome_documento',
            descricao: 'descricao',
            quantidade: 'quantidade',
            setor_remetente_id: 'setor_remetente_id', 
            setor_destinatario_id: 'setor_destinatario_id',
            responsavel_setor_id: 'responsavel_setor_id',
            data_transferencia: 'data_transferencia',
            observacoes: 'observacoes',
            status: 'status',
            data_recebimento: 'data_recebimento',
            caminho_arquivo_assinado: 'caminho_arquivo_assinado'
        };

        for (const key in solicitacaoInstance.body) {
            if (fieldMapping[key] && key !== 'id' && key !== 'criado_em' && key !== 'requerente_id') { 
                updateFields.push(`${fieldMapping[key]} = ?`);
                updateValues.push(solicitacaoInstance.body[key]); 
            }
        }

        if (updateFields.length === 0) {
            return; 
        }

        const sql = `UPDATE solicitacoes SET ${updateFields.join(', ')} WHERE id = ?`;
        updateValues.push(id);

        await db.execute(sql, updateValues);
    }

    static async excluir(id, db) {
        await db.execute('DELETE FROM solicitacoes WHERE id = ?', [id]);
    }
}

module.exports = Solicitacao;