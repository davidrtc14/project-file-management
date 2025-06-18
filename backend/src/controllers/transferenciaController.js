const Solicitacao = require('../models/solicitacoesModel');

const solicitacaoController = {
  criar: async (req, res) => {
    try {
      const solicitacao = new Solicitacao(req.body);
      const id = await solicitacao.salvar();

      if (solicitacao.errors.length > 0) {
        return res.status(400).json({ erros: solicitacao.errors });
      }

      return res.status(201).json({ mensagem: 'Solicitação criada com sucesso', id });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro no servidor' });
    }
  },

  listar: async (req, res) => {
    try {
      const dados = await Solicitacao.listarTodos();
      return res.status(200).json(dados);
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao buscar solicitações' });
    }
  },

  buscar: async (req, res) => {
    try {
      const id = req.params.id;
      const solicitacao = await Solicitacao.buscarPorId(id);

      if (!solicitacao) {
        return res.status(404).json({ erro: 'Solicitação não encontrada' });
      }

      return res.status(200).json(solicitacao);
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
    }
  },

  atualizar: async (req, res) => {
    try {
      const id = req.params.id;
      await Solicitacao.atualizar(id, req.body);
      return res.status(200).json({ mensagem: 'Solicitação atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar solicitação:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar solicitação' });
    }
  },

  excluir: async (req, res) => {
    try {
      const id = req.params.id;
      await Solicitacao.excluir(id);
      return res.status(200).json({ mensagem: 'Solicitação excluída com sucesso' });
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao excluir solicitação', err });
    }
  }
};

module.exports = solicitacaoController;
