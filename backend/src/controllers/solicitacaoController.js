const Solicitacao = require('../models/solicitacoesModel');

const solicitacaoController = {
    criar: async (req, res) => {
        const db = req.db; // Acesse o pool de conexão
        // req.user estará disponível aqui se você tiver um middleware de autenticação antes
        const requerenteId = req.user ? req.user.id : null; // Pega o ID do usuário autenticado
        
        // Garante que o requerente_id seja do usuário logado
        const data = { ...req.body, requerente_id: requerenteId };

        try {
            const solicitacao = new Solicitacao(data, db); // Passa o db para o model
            const id = await solicitacao.salvar();

            if (solicitacao.errors.length > 0) {
                return res.status(400).json({ erros: solicitacao.errors });
            }

            return res.status(201).json({ mensagem: 'Solicitação criada com sucesso', id });
        } catch (err) {
            console.error('Erro no servidor ao criar solicitação:', err);
            return res.status(500).json({ erro: 'Erro no servidor ao criar solicitação' });
        }
    },

    listar: async (req, res) => {
        const db = req.db; // Acesse o pool de conexão
        const userRoles = req.user ? req.user.roles : []; // Pega os papéis do usuário autenticado
        const userId = req.user ? req.user.id : null;

        try {
            let dados;
            // Lógica de autorização: Administradores veem tudo, requerentes veem só as suas.
            if (userRoles.includes('administrador')) {
                dados = await Solicitacao.listarTodos(db); // Passa o db para o model
            } else if (userRoles.includes('requerente') && userId) {
                dados = await Solicitacao.listarPorRequerente(db, userId); // Novo método no model
            } else {
                return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente.' });
            }
            
            return res.status(200).json(dados);
        } catch (err) {
            console.error('Erro ao buscar solicitações:', err);
            return res.status(500).json({ erro: 'Erro ao buscar solicitações' });
        }
    },

    buscar: async (req, res) => {
        const db = req.db; // Acesse o pool de conexão
        const userRoles = req.user ? req.user.roles : [];
        const userId = req.user ? req.user.id : null;

        try {
            const id = req.params.id;
            const solicitacao = await Solicitacao.buscarPorId(id, db); // Passa o db para o model

            if (!solicitacao) {
                return res.status(404).json({ erro: 'Solicitação não encontrada' });
            }

            // Lógica de autorização: Administradores veem qualquer solicitação.
            // Requerentes veem apenas suas próprias solicitações.
            if (!userRoles.includes('administrador') && solicitacao.requerente_id !== userId) {
                return res.status(403).json({ erro: 'Acesso negado. Você não tem permissão para ver esta solicitação.' });
            }

            return res.status(200).json(solicitacao);
        } catch (err) {
            console.error('Erro ao buscar solicitação:', err);
            return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
        }
    },

    atualizar: async (req, res) => {
        const db = req.db; // Acesse o pool de conexão
        const userRoles = req.user ? req.user.roles : [];
        const userId = req.user ? req.user.id : null;

        try {
            const id = req.params.id;
            const solicitacaoExistente = await Solicitacao.buscarPorId(id, db);

            if (!solicitacaoExistente) {
                return res.status(404).json({ erro: 'Solicitação não encontrada para atualização' });
            }

            // Autorização para atualizar: Apenas administradores ou o requerente original podem atualizar
            if (!userRoles.includes('administrador') && solicitacaoExistente.requerente_id !== userId) {
                 return res.status(403).json({ erro: 'Acesso negado. Você não tem permissão para atualizar esta solicitação.' });
            }

            await Solicitacao.atualizar(id, req.body, db); // Passa o db para o model
            return res.status(200).json({ mensagem: 'Solicitação atualizada com sucesso' });
        } catch (err) {
            console.error('Erro ao atualizar solicitação:', err);
            return res.status(500).json({ erro: 'Erro ao atualizar solicitação' });
        }
    },

    excluir: async (req, res) => {
        const db = req.db; // Acesse o pool de conexão
        const userRoles = req.user ? req.user.roles : [];
        const userId = req.user ? req.user.id : null;

        try {
            const id = req.params.id;
            const solicitacaoExistente = await Solicitacao.buscarPorId(id, db);

            if (!solicitacaoExistente) {
                return res.status(404).json({ erro: 'Solicitação não encontrada para exclusão' });
            }

            // Autorização para excluir: Apenas administradores ou o requerente original podem excluir (se o status permitir)
            if (!userRoles.includes('administrador') && solicitacaoExistente.requerente_id !== userId) {
                 return res.status(403).json({ erro: 'Acesso negado. Você não tem permissão para excluir esta solicitação.' });
            }
            
            await Solicitacao.excluir(id, db); // Passa o db para o model
            return res.status(200).json({ mensagem: 'Solicitação excluída com sucesso' });
        } catch (err) {
            console.error('Erro ao excluir solicitação:', err);
            return res.status(500).json({ erro: 'Erro ao excluir solicitação', err });
        }
    }
};

module.exports = solicitacaoController;