const db = require('../db/db');

class Solicitacao {
  constructor(body) {
    this.body = body;
    this.errors = [];
  }

  valida() {
    const {
      nome_documento,
      quantidade,
      setor_remetente,
      setor_destinatario,
      requerente,
      responsavel_setor,
      data_transferencia
    } = this.body;

    if (!nome_documento || typeof nome_documento !== 'string') {
      this.errors.push('Nome do documento é obrigatório');
    }
    if (!quantidade || isNaN(quantidade)) {
      this.errors.push('Quantidade é obrigatória e deve ser um número');
    }
    if (!setor_remetente) this.errors.push('Setor remetente é obrigatório');
    if (!setor_destinatario) this.errors.push('Setor destinatário é obrigatório');
    if (!requerente) this.errors.push('Requerente é obrigatório');
    if (!responsavel_setor) this.errors.push('Responsável do setor é obrigatório');
    if (!data_transferencia) this.errors.push('Data da transferência é obrigatória');
  }

  async salvar() {
    this.valida();
    if (this.errors.length > 0) return;

    const sql = `INSERT INTO solicitacoes 
      (nome_documento, descricao, quantidade, setor_remetente, setor_destinatario, requerente, responsavel_setor, data_transferencia, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const valores = [
      this.body.nome_documento,
      this.body.descricao || null,
      this.body.quantidade,
      this.body.setor_remetente,
      this.body.setor_destinatario,
      this.body.requerente,
      this.body.responsavel_setor,
      this.body.data_transferencia,
      this.body.observacoes || null
    ];

    return new Promise((resolve, reject) => {
      db.query(sql, valores, (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  static listarTodos() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM solicitacoes ORDER BY criado_em DESC', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM solicitacoes WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        resolve(results[0]);
      });
    });
  }

  static atualizar(id, dados) {
    return new Promise((resolve, reject) => {
      const sql = `
      UPDATE solicitacoes SET 
        nome_documento = ?, 
        descricao = ?, 
        quantidade = ?, 
        setor_remetente = ?, 
        setor_destinatario = ?, 
        requerente = ?, 
        responsavel_setor = ?, 
        data_transferencia = ?, 
        observacoes = ?
      WHERE id = ?`;

      const valores = [
        dados.nome_documento,
        dados.descricao || null,
        dados.quantidade,
        dados.setor_remetente,
        dados.setor_destinatario,
        dados.requerente,
        dados.responsavel_setor,
        dados.data_transferencia,
        dados.observacoes || null,
        id
      ];

      db.query(sql, valores, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  static excluir(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM solicitacoes WHERE id = ?', [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = Solicitacao;
