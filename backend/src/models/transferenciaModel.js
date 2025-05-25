const db = require('../db/db');

class Transferencia {
  constructor(body) {
    this.body = body;
    this.errors = [];
  }

  valida() {
    const { nome_arquivo, setor_remetente, setor_destinatario, responsavel, data_transferencia } = this.body;

    if (!nome_arquivo || typeof nome_arquivo !== 'string') {
      this.errors.push('Nome do arquivo é obrigatório');
    }
    if (!setor_remetente) this.errors.push('Setor remetente é obrigatório');
    if (!setor_destinatario) this.errors.push('Setor destinatário é obrigatório');
    if (!responsavel) this.errors.push('Responsável é obrigatório');
    if (!data_transferencia) this.errors.push('Data da transferência é obrigatória');
  }

  async salvar() {
    this.valida();
    if (this.errors.length > 0) return;

    const sql = `INSERT INTO transferencias 
        (nome_arquivo, descricao, setor_remetente, setor_destinatario, responsavel, data_transferencia, caminho_arquivo) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const valores = [
      this.body.nome_arquivo,
      this.body.descricao || null,
      this.body.setor_remetente,
      this.body.setor_destinatario,
      this.body.responsavel,
      this.body.data_transferencia,
      this.body.caminho_arquivo || null
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
      db.query('SELECT * FROM transferencias ORDER BY criado_em DESC', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  static buscarPorId(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM transferencias WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        resolve(results[0]);
      });
    });
  }

  static atualizar(id, dados) {
    return new Promise((resolve, reject) => {
      const sql = `
      UPDATE transferencias SET 
        nome_arquivo = ?, 
        descricao = ?, 
        setor_remetente = ?, 
        setor_destinatario = ?, 
        responsavel = ?, 
        data_transferencia = ?, 
        caminho_arquivo = ?
      WHERE id = ?
    `;
      const valores = [
        dados.nome_arquivo,
        dados.descricao,
        dados.setor_remetente,
        dados.setor_destinatario,
        dados.responsavel,
        dados.data_transferencia,
        dados.caminho_arquivo || null,
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
      db.query('DELETE FROM transferencias WHERE id = ?', [id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = Transferencia;
