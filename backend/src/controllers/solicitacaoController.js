const Solicitacao = require('../models/solicitacoesModel');
const path = require('path');
const fs = require('fs-extra');

const solicitacaoController = {
    criar: async (req, res) => {
        const db = req.db;
        const requerenteId = req.user ? req.user.id : null; // Pega o ID do usuário autenticado

        // Garante que o requerente_id seja do usuário logado
        const data = { ...req.body, requerente_id: requerenteId };

        try {
            const solicitacao = new Solicitacao(data, db);
            const id = await solicitacao.salvar();

            if (solicitacao.errors.length > 0) {
                return res.status(400).json({ erros: solicitacao.errors });
            }

            return res.status(201).json({ mensagem: 'Solicitação criada com sucesso', id });
        } catch (err) {
            console.error('Erro no servidor ao criar solicitação:', err);
            if (err.message && err.message.includes(';')) {
                return res.status(400).json({ erros: err.message.split('; ').filter(e => e) });
            }
            return res.status(500).json({ erro: 'Erro no servidor ao criar solicitação' });
        }
    },

    // A rota /api/solicitacoes agora será usada para listar POR SETOR ou TODAS (para admin)
    listar: async (req, res) => {
        const db = req.db;
        const { user } = req; // <-- DESESTRUTURAR 'user' AQUI!
        const userRoles = user ? user.roles : [];
        // const userId = user ? user.id : null; // userId já está em user.id

        const setorIdParam = req.query.setorId;

        try {
            let dados;
            if (userRoles.includes('administrador')) {
                if (setorIdParam) {
                    dados = await Solicitacao.listarPorSetor(db, parseInt(setorIdParam));
                } else {
                    dados = await Solicitacao.listarTodos(db);
                }
            } else if (userRoles.includes('funcionario') && user && user.setor_id) {
                dados = await Solicitacao.listarPorSetor(db, user.setor_id); // 'user' agora está disponível
            } else {
                return res.status(403).json({ erro: 'Acesso negado. Permissão insuficiente ou setor não definido.' });
            }

            return res.status(200).json(dados);
        } catch (err) {
            console.error('Erro ao buscar solicitações:', err);
            return res.status(500).json({ erro: 'Erro ao buscar solicitações' });
        }
    },


    buscar: async (req, res) => {
        const db = req.db;
        const { user } = req; // <-- DESESTRUTURAR 'user' AQUI!
        const userRoles = user ? user.roles : [];
        const userId = user ? user.id : null; // userId já está em user.id

        try {
            const id = req.params.id;
            const solicitacao = await Solicitacao.buscarPorId(id, db);

            if (!solicitacao) {
                return res.status(404).json({ erro: 'Solicitação não encontrada' });
            }

            if (!userRoles.includes('administrador') &&
                solicitacao.requerente_id !== userId &&
                solicitacao.setor_remetente_id !== user.setor_id && // 'user' agora está disponível
                solicitacao.setor_destinatario_id !== user.setor_id // 'user' agora está disponível
            ) {
                return res.status(403).json({ erro: 'Acesso negado. Você não tem permissão para ver esta solicitação.' });
            }
            return res.status(200).json(solicitacao);
        } catch (err) {
            console.error('Erro ao buscar solicitação:', err);
            return res.status(500).json({ erro: 'Erro ao buscar solicitação' });
        }
    },

    atualizar: async (req, res) => {
        const db = req.db;
        const userRoles = req.user ? req.user.roles : [];
        const userId = req.user ? req.user.id : null;

        try {
            const id = req.params.id;
            const solicitacaoExistente = await Solicitacao.buscarPorId(id, db);

            if (!solicitacaoExistente) {
                return res.status(404).json({ erro: 'Solicitação não encontrada para atualização' });
            }

            // Autorização para atualizar: Qualquer usuário autenticado pode atualizar.
            // A lógica fina de "quem pode atualizar QUAL solicitação" (ex: só a sua) pode vir aqui.
            // Para "qualquer usuário autenticado pode editar", basta verificar se req.user existe.
            if (!userRoles.includes('administrador') && !userRoles.includes('funcionario')) {
                return res.status(403).json({ erro: 'Acesso negado. Apenas usuários autenticados podem atualizar solicitações.' });
            }

            // Se você quiser que o funcionário só possa atualizar AS SUAS solicitações:
            // if (userRoles.includes('funcionario') && solicitacaoExistente.requerente_id !== userId) {
            //     return res.status(403).json({ erro: 'Acesso negado. Você só pode atualizar suas próprias solicitações.' });
            // }

            await Solicitacao.atualizar(id, req.body, db);
            return res.status(200).json({ mensagem: 'Solicitação atualizada com sucesso' });
        } catch (err) {
            console.error('Erro ao atualizar solicitação:', err);
            if (err.message && err.message.includes(';')) {
                return res.status(400).json({ erros: err.message.split('; ').filter(e => e) });
            }
            return res.status(500).json({ erro: 'Erro ao atualizar solicitação' });
        }
    },

    excluir: async (req, res) => {
        const db = req.db;
        const userRoles = req.user ? req.user.roles : [];
        const userId = req.user ? req.user.id : null;

        try {
            const id = req.params.id;
            const solicitacaoExistente = await Solicitacao.buscarPorId(id, db);

            if (!solicitacaoExistente) {
                return res.status(404).json({ erro: 'Solicitação não encontrada para exclusão' });
            }

            // Autorização para excluir: APENAS ADMINISTRADORES podem excluir.
            if (!userRoles.includes('administrador')) {
                return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem excluir solicitações.' });
            }

            await Solicitacao.excluir(id, db);
            return res.status(200).json({ mensagem: 'Solicitação excluída com sucesso' });
        } catch (err) {
            console.error('Erro ao excluir solicitação:', err);
            return res.status(500).json({ erro: 'Erro ao excluir solicitação', err });
        }
    },

    anexarRelatorioAssinado: async (req, res) => {
        const db = req.db;
        const userRoles = req.user ? req.user.roles : []; // Papéis do usuário logado (array de strings)
        const userId = req.user ? req.user.id : null;
        const solicitacaoId = req.params.id;

        try {
            const solicitacao = await Solicitacao.buscarPorId(solicitacaoId, db);

            if (!solicitacao) {
                return res.status(404).json({ erro: 'Solicitação não encontrada.' });
            }

            // Regra de Autorização:
            // Apenas administradores OU (usuários do setor destinatário E/OU responsável) podem anexar.
            // O problema estava em chamar 'hasRole' no backend. Usamos 'userRoles.includes()' diretamente.
            if (!userRoles.includes('administrador') && // Se NÃO é administrador
                !(user.setor_id === solicitacao.setor_destinatario_id || user.id === solicitacao.responsavel_setor_id) // E não é do setor destinatário NEM o responsável
            ) {
                return res.status(403).json({ erro: 'Acesso negado. Você não tem permissão para anexar o relatório a esta solicitação.' });
            }

            if (!req.file) {
                return res.status(400).json({ erro: 'Nenhum arquivo PDF enviado.' });
            }

            const caminhoArquivo = `/uploads/documentos_assinados/${req.file.filename}`

            const newData = {
                status: 'assinado',
                data_recebimento: new Date().toISOString().slice(0, 19).replace('T', ' '),
                caminho_arquivo_assinado: caminhoArquivo
            };

            await Solicitacao.atualizar(solicitacaoId, newData, db);

            const solicitacaoAtualizada = await Solicitacao.buscarPorId(solicitacaoId, db);

            return res.status(200).json({
                mensagem: 'Relatório assinado anexado com sucesso e status atualizado!',
                solicitacaoAtualizada: solicitacaoAtualizada
            });

        } catch (err) {
            console.error('Erro ao anexar relatório assinado:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ erro: 'Arquivo muito grande. Limite: 5MB.' });
            }
            res.status(500).json({ erro: err.message || 'Erro interno ao anexar o relatório assinado.' });
        }
    },
};

module.exports = solicitacaoController;