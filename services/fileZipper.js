// Arquivo: services/fileZipper.js

const archiver = require('archiver');
const stream = require('stream');

/**
 * Cria um arquivo ZIP contendo os arquivos fornecidos e o envia como um stream para a resposta HTTP.
 * @param {Array<object>} files - Lista de objetos de arquivo, ex: [{ fileName: 'routes.js', content: '// codigo' }]
 * @param {object} res - Objeto de resposta HTTP do Express.
 */
function createZipAndStream(files, res) {
    const archive = archiver('zip', {
        zlib: { level: 9 } // Melhor compressão
    });

    // Configura cabeçalhos de resposta HTTP para download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="backend_gerado.zip"');

    // Conecta o arquivador à resposta HTTP
    archive.pipe(res);

    // Adiciona cada arquivo ao ZIP
    for (const file of files) {
        // Cria um stream a partir do conteúdo do arquivo
        const bufferStream = new new stream.PassThrough();
        bufferStream.end(file.content);
        
        // Anexa o stream ao arquivo no ZIP
        archive.append(bufferStream, { name: file.fileName });
    }

    // Finaliza o arquivamento (inicia o download)
    archive.finalize();
}

module.exports = {
    createZipAndStream
};
