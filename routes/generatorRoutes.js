// Arquivo: routes/generatorRoutes.js

const express = require('express');
const router = express.Router();

// ! 1. Importa os Módulos Geradores
const { generateSqlSchema } = require('../services/sqlGenerator'); // Gerador SQL (Passo Anterior)
const { generateRoutesFile } = require('../services/routeGenerator'); // Gerador de Rotas JS (Passo Anterior)
const { createZipAndStream } = require('../services/fileZipper'); // Novo Serviço ZIP

// ! 2. Importa o Middleware de Proteção (assumindo que o usuário do Gerador deve estar logado)
const { protect } = require('./authMiddleware'); 

// Rota POST principal para gerar o projeto completo
router.post('/generate', protect, (req, res) => {
    const projectDefinition = req.body.project_definition; // JSON de definição do projeto
    
    // Validação de entrada
    if (!projectDefinition || !projectDefinition.name || !projectDefinition.entities || projectDefinition.entities.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Definição de projeto inválida. É necessário um nome de projeto e pelo menos uma entidade.' 
        });
    }

    const filesToZip = [];

    try {
        // 3. Itera sobre cada entidade para gerar os arquivos
        for (const entity of projectDefinition.entities) {
            
            // a. Gerar Arquivo de Rotas (Ex: clientesRoutes.js)
            const routesContent = generateRoutesFile(entity); 
            const routesFileName = `${entity.table_name}Routes.js`; 
            filesToZip.push({ fileName: routesFileName, content: routesContent });
            
            // b. Gerar Esquema SQL (Ex: clientes_schema.sql)
            const sqlContent = generateSqlSchema(entity); 
            const sqlFileName = `schema/${entity.table_name}_schema.sql`; // Coloca em uma subpasta
            filesToZip.push({ fileName: sqlFileName, content: sqlContent });
        }

        // c. Adicionar um arquivo de instruções (README)
        filesToZip.push({ 
            fileName: 'README.md', 
            content: `# Projeto Gerado: ${projectDefinition.name}\n\nEste backend segue o padrão Node.js/Express/MySQL.\n\n### Próximos Passos:\n1. Configure o seu arquivo .env com as variáveis de ambiente necessárias.\n2. Execute o SQL em 'schema/' para criar as tabelas.\n3. Monte os novos arquivos de rota ('*Routes.js') no seu server.js.` 
        });
        
        // 4. Empacota e envia o ZIP
        createZipAndStream(filesToZip, res);
        
    } catch (error) {
        console.error('[GENERATOR] ERRO CRÍTICO na geração do projeto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno ao gerar o código. Detalhes: ' + error.message,
            error: error.message
        });
    }
});

module.exports = router;
