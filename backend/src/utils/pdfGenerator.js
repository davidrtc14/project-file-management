const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra'); 
const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const ExcelJS = require('exceljs');

const TEMP_DIR = path.join(__dirname, '../../temp_docs'); 
const OUTPUT_PDF_DIR = path.join(__dirname, '../../generated_pdfs'); 

try {
    fs.emptyDirSync(TEMP_DIR);
    fs.emptyDirSync(OUTPUT_PDF_DIR);
    fs.ensureDirSync(TEMP_DIR);
    fs.ensureDirSync(OUTPUT_PDF_DIR);
    console.log('Diretórios temporários e de saída limpos e prontos.');
} catch (err) {
    console.error('Erro ao preparar diretórios de documentos:', err.message);
}

async function convertOfficeToPdf(inputFilePath, outputFileName) {
    return new Promise((resolve, reject) => {
        const command = `libreoffice --headless --convert-to pdf --outdir "${OUTPUT_PDF_DIR}" "${inputFilePath}"`;

        exec(command, (error, stdout, stderr) => {
            fs.remove(inputFilePath)
                .catch(rmErr => console.error(`Erro ao remover arquivo temporário: ${rmErr.message}`));

            if (error) {
                console.error(`Erro na conversão PDF: ${error.message}`);
                console.error(`stderr: ${stderr}`);
                return reject(new Error(`Erro ao converter o documento para PDF: ${error.message || stderr}`));
            }
            if (stderr && !stderr.includes('Warning: failed to launch javaldx')) {
                console.warn(`Aviso na conversão PDF: ${stderr}`);
            }
            
            const baseFileName = path.basename(inputFilePath, path.extname(inputFilePath));
            const generatedPdfFileName = `${baseFileName}.pdf`;
            const generatedPdfPath = path.join(OUTPUT_PDF_DIR, generatedPdfFileName);

            if (fs.existsSync(generatedPdfPath)) {
                console.log(`Documento convertido para PDF em: ${generatedPdfPath}`);
                resolve(generatedPdfPath);
            } else {
                const errorMsg = `LibreOffice disse ter convertido, mas o arquivo PDF não foi encontrado em ${generatedPdfPath}.`;
                console.error(errorMsg);
                console.error(`Stdout do LibreOffice: ${stdout}`);
                return reject(new Error(errorMsg));
            }
        });
    });
}

async function generateSolicitacaoPdf(solicitacaoData, templateDocxPath) {
    try {
        const content = await fs.readFile(templateDocxPath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true, 
            linebreaks: true,    
        });

        const dataForTemplate = {
            id: solicitacaoData.id,
            nome_documento: solicitacaoData.nome_documento,
            descricao: solicitacaoData.descricao || 'N/A',
            quantidade: solicitacaoData.quantidade,
            setor_remetente_nome: solicitacaoData.setor_remetente_nome,
            setor_destinatario_nome: solicitacaoData.setor_destinatario_nome,
            requerente_nome: solicitacaoData.requerente_nome,
            responsavel_setor_nome: solicitacaoData.responsavel_setor_nome,
            data_transferencia: solicitacaoData.data_transferencia ? new Date(solicitacaoData.data_transferencia).toLocaleDateString('pt-BR') : 'N/A',
            observacoes: solicitacaoData.observacoes || 'N/A',
            criado_em: solicitacaoData.criado_em ? new Date(solicitacaoData.criado_em).toLocaleString('pt-BR') : 'N/A',
            status: solicitacaoData.status ? solicitacaoData.status.toUpperCase() : 'N/A',
            data_recebimento: solicitacaoData.data_recebimento ? new Date(solicitacaoData.data_recebimento).toLocaleString('pt-BR') : 'Não recebido',
            caminho_arquivo_assinado: solicitacaoData.caminho_arquivo_assinado || 'Não disponível'
        };

        doc.render(dataForTemplate);

        const tempDocxBuffer = doc.getZip().generate({
            type: 'nodebuffer',
            compression: 'DEFLATE', 
        });

        const tempDocxPath = path.join(TEMP_DIR, `solicitacao_${solicitacaoData.id}_${Date.now()}.docx`);
        await fs.writeFile(tempDocxPath, tempDocxBuffer);

        const outputFileName = `recibo_solicitacao_${solicitacaoData.id}.pdf`;
        const pdfPath = await convertOfficeToPdf(tempDocxPath, outputFileName);
        return pdfPath;

    } catch (error) {
        console.error('Erro ao gerar PDF de solicitação:', error);
        throw new Error(`Falha ao gerar relatório de solicitação: ${error.message}`);
    }
}

async function generatePlanilhaPdf(solicitacoes, templateXlsxPath) {
    try {
        const workbook = new ExcelJS.Workbook();
        
        if (templateXlsxPath && fs.existsSync(templateXlsxPath)) {
            await workbook.xlsx.readFile(templateXlsxPath);
        } else {
            workbook.addWorksheet('Relatório de Solicitações'); // Fallback para criar do zero se template não existir
        }
        
        const worksheet = workbook.getWorksheet(1); // Assume a primeira aba

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Documento', key: 'nome_documento', width: 30 },
            { header: 'Remetente', key: 'setor_remetente_nome', width: 20 },
            { header: 'Destinatário', key: 'setor_destinatario_nome', width: 20 },
            { header: 'Requerente', key: 'requerente_nome', width: 20 },
            { header: 'Responsável', key: 'responsavel_setor_nome', width: 20 },
            { header: 'Data Transf.', key: 'data_transferencia', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Criado Em', key: 'criado_em', width: 20 },
            { header: 'Obs.', key: 'observacoes', width: 40 }
        ];

        solicitacoes.forEach(sol => {
            worksheet.addRow({
                id: sol.id,
                nome_documento: sol.nome_documento,
                setor_remetente_nome: sol.setor_remetente_nome,
                setor_destinatario_nome: sol.setor_destinatario_nome,
                requerente_nome: sol.requerente_nome,
                responsavel_setor_nome: sol.responsavel_setor_nome,
                data_transferencia: sol.data_transferencia ? new Date(sol.data_transferencia).toLocaleDateString('pt-BR') : '',
                status: sol.status ? sol.status.toUpperCase() : '',
                criado_em: sol.criado_em ? new Date(sol.criado_em).toLocaleString('pt-BR') : '',
                observacoes: sol.observacoes || ''
            });
        });

        const tempXlsxPath = path.join(TEMP_DIR, `relatorio_solicitacoes_${Date.now()}.xlsx`);
        await workbook.xlsx.writeFile(tempXlsxPath);

        const outputFileName = `planilha_solicitacoes_${Date.now()}.pdf`;
        const pdfPath = await convertOfficeToPdf(tempXlsxPath, outputFileName);
        return pdfPath;

    } catch (error) {
        console.error('Erro ao gerar planilha PDF:', error);
        throw new Error(`Falha ao gerar planilha de solicitações: ${error.message}`);
    }
}

module.exports = {
    generateSolicitacaoPdf,
    generatePlanilhaPdf
};