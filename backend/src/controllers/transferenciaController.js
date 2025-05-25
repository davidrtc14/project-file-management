const Transferencia = require('../models/transferenciaModel');

const transferenciaController = {
  criar: async (req, res) => {
    try {
      const transferencia = new Transferencia(req.body);
      const id = await transferencia.salvar();

      if (transferencia.errors.length > 0) {
        return res.status(400).json({ erros: transferencia.errors });
      }

      return res.status(201).json({ mensagem: 'Transferência criada com sucesso', id });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro no servidor' });
    }
  },

  listar: async (req, res) => {
    try {
      const dados = await Transferencia.listarTodos();
      return res.status(200).json(dados);
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao buscar transferências' });
    }
  },

  buscar: async (req, res) => {
    try {
      const id = req.params.id;
      const transferencia = await Transferencia.buscarPorId(id);

      if (!transferencia) {
        return res.status(404).json({ erro: 'Transferência não encontrada' });
      }

      return res.status(200).json(transferencia);
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao buscar transferência' });
    }
  },

  atualizar: async (req, res) => {
    try {
      const id = req.params.id;
      await Transferencia.atualizar(id, req.body);
      return res.status(200).json({ mensagem: 'Transferência atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar transferência:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar transferência' });
    }
  },

  excluir: async (req, res) => {
    try {
      const id = req.params.id;
      await Transferencia.excluir(id);
      return res.status(200).json({ mensagem: 'Transferência excluída com sucesso' });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao excluir transferência', err});
    }
  }
};

module.exports = transferenciaController;
