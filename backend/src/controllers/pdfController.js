const path = require('path');
const fs = require('fs-extra'); // Para verificação de arquivo e remoção
const Solicitacao = require('../models/solicitacoesModel'); // pdfController também precisa de SolicitacaoModel
const { generateSolicitacaoPdf, generatePlanilhaPdf } = require('../utils/pdfGenerator'); // Funções de geração de PDF

// Caminho absoluto para a pasta de templates
const TEMPLATES_DIR = path.join(__dirname, '../../templates');

exports.gerarRecibo = async (req, res) => {
    const db = req.db; // Acesse o pool de conexão do objeto 'req'
    const userRoles = req.user ? req.user.roles : [];
    const userId = req.user ? req.user.id : null;
    const solicitacaoId = req.params.id;

    try {
        const solicitacao = await Solicitacao.buscarPorId(solicitacaoId, db);

        if (!solicitacao) {
            return res.status(404).json({ erro: 'Solicitação não encontrada.' });
        }

        // Lógica de autorização: Administradores podem gerar de qualquer um.
        // Funcionários podem gerar apenas dos seus próprios.
        if (!userRoles.includes('administrador') && solicitacao.requerente_id !== userId) {
            return res.status(403).json({ erro: 'Acesso negado. Você não tem permissão para gerar este relatório.' });
        }

        const templateDocxPath = path.join(TEMPLATES_DIR, 'recibo_solicitacao_template.docx');
        
        if (!fs.existsSync(templateDocxPath)) {
            console.error(`Template DOCX não encontrado em: ${templateDocxPath}`);
            return res.status(500).json({ erro: 'Template de relatório não encontrado no servidor.' });
        }

        const pdfPath = await generateSolicitacaoPdf(solicitacao, templateDocxPath);

        res.download(pdfPath, `recibo_solicitacao_${solicitacaoId}.pdf`, (err) => {
            if (err) {
                console.error('Erro ao enviar o PDF para download:', err);
                // Em caso de erro de envio, o arquivo pode não ser removido automaticamente.
            }
            fs.remove(pdfPath)
              .then(() => console.log(`Arquivo PDF temporário removido: ${pdfPath}`))
              .catch(rmErr => console.error(`Erro ao remover PDF gerado: ${rmErr.message}`));
        });

    } catch (err) {
        console.error('Erro ao gerar recibo PDF:', err);
        // O 'err.message' pode conter a mensagem de erro detalhada do docxtemplater/libreoffice
        res.status(500).json({ erro: err.message || 'Erro interno ao gerar o recibo PDF.' });
    }
};

exports.gerarPlanilhaGeral = async (req, res) => {
    const db = req.db;
    const userRoles = req.user ? req.user.roles : [];

    if (!userRoles.includes('administrador')) {
        return res.status(403).json({ erro: 'Acesso negado. Apenas administradores podem gerar a planilha geral.' });
    }

    try {
        const todasSolicitacoes = await Solicitacao.listarTodos(db);
        // Se estiver usando um modelo físico para a planilha:
        const templateXlsxPath = path.join(TEMPLATES_DIR, 'relatorio_geral_template.xlsx'); 
        
        // A função generatePlanilhaPdf foi atualizada para lidar com templateXlsxPath opcional
        const pdfPath = await generatePlanilhaPdf(todasSolicitacoes, fs.existsSync(templateXlsxPath) ? templateXlsxPath : null);

        res.download(pdfPath, `planilha_geral_solicitacoes.pdf`, (err) => {
            if (err) {
                console.error('Erro ao enviar a planilha PDF:', err);
            }
            fs.remove(pdfPath)
              .then(() => console.log(`Arquivo PDF temporário removido: ${pdfPath}`))
              .catch(rmErr => console.error(`Erro ao remover PDF gerado: ${rmErr.message}`));
        });

    } catch (err) {
        console.error('Erro ao gerar planilha geral:', err);
        res.status(500).json({ erro: err.message || 'Erro ao gerar planilha geral.' });
    }
};