// Arquivo: services/routeGenerator.js

/**
 * Converte a primeira letra de uma string para maiúscula (ex: 'cliente' -> 'Cliente')
 */
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Gera o conteúdo completo de um arquivo de rotas Express (CRUD básico)
 * @param {object} definition - O JSON de definição da entidade.
 * @returns {string} - O código JavaScript do arquivo de rotas.
 */
function generateRoutesFile(definition) {
    const entityName = definition.name;
    const tableName = definition.table_name;
    const singularPath = entityName.toLowerCase(); 
    const isProtected = definition.protection !== 'public';
    const protectFn = isProtected ? definition.protection : 'protect'; // Ex: 'protectSeller'
    
    // 1. Variáveis auxiliares para queries
    const fieldNames = definition.fields.map(f => f.name); // [nome_completo, email, telefone]
    const placeholderList = fieldNames.map(() => '?').join(', '); // ?, ?, ?
    const setList = fieldNames.map(name => `${name} = ?`).join(', '); // nome_completo=?, email=?, telefone=?
    const dbParams = fieldNames.map(name => `req.body.${name}`).join(', '); // req.body.nome_completo, ...

    // 2. Monta o corpo do arquivo (usando Template Strings)
    const code = `
// ! Arquivo gerado pelo seu Backend Generator v1.0.0
const express = require('express');
const router = express.Router();
const pool = require('./config/db'); // Importa o pool de conexão
${isProtected ? `const { ${protectFn} } = require('./${protectFn}Middleware');` : ''}

// Rota 1: CRIAR ${entityName} (POST /api/${singularPath})
router.post('/${singularPath}', ${isProtected ? protectFn + ',' : ''} async (req, res) => {
    // Campos necessários: ${fieldNames.join(', ')}
    const { ${fieldNames.join(', ')} } = req.body; 

    // Validação básica de campos obrigatórios
    if (!${definition.fields.filter(f => f.required).map(f => f.name).join(' || !')}) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO ${tableName} (${fieldNames.join(', ')}) VALUES (${placeholderList})',
            [${dbParams}]
        );

        res.status(201).json({ success: true, message: '${entityName} criado com sucesso.', id: result.insertId });

    } catch (error) {
        // Erro de duplicidade de email (código 1062 para MySQL)
        if (error.errno === 1062 && error.message.includes('email')) {
            return res.status(409).json({ success: false, message: 'Este e-mail já está em uso.' });
        }
        console.error('Erro ao criar ${entityName}:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao salvar ${entityName}: ' + error.message });
    }
});

// Rota 2: LER TODOS ${entityName} (GET /api/${singularPath})
router.get('/${singularPath}', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM ${tableName} ORDER BY created_at DESC');
        res.status(200).json({ success: true, ${singularPath}: rows });
    } catch (error) {
        console.error('Erro ao listar ${entityName}:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao listar ${entityName}.' });
    }
});

// Rota 3: LER ${entityName} por ID (GET /api/${singularPath}/:id)
router.get('/${singularPath}/:id', async (req, res) => {
    const entityId = req.params.id;
    try {
        const [rows] = await pool.execute('SELECT * FROM ${tableName} WHERE id = ? LIMIT 1', [entityId]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: '${entityName} não encontrado.' });
        }
        res.status(200).json({ success: true, ${singularPath}: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar ${entityName}:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao buscar ${entityName}.' });
    }
});

// Rota 4: ATUALIZAR ${entityName} (PUT /api/${singularPath}/:id)
router.put('/${singularPath}/:id', ${isProtected ? protectFn + ',' : ''} async (req, res) => {
    const entityId = req.params.id;
    const { ${fieldNames.join(', ')} } = req.body; 

    // Campos necessários: ${fieldNames.join(', ')}
    if (!${definition.fields.filter(f => f.required).map(f => f.name).join(' || !')}) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE ${tableName} SET ${setList} WHERE id = ?',
            [${dbParams}, entityId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '${entityName} não encontrado.' });
        }

        res.status(200).json({ success: true, message: '${entityName} atualizado com sucesso.' });

    } catch (error) {
        console.error('Erro ao atualizar ${entityName}:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao atualizar ${entityName}.' });
    }
});

// Rota 5: DELETAR ${entityName} (DELETE /api/${singularPath}/:id)
router.delete('/${singularPath}/:id', ${isProtected ? protectFn + ',' : ''} async (req, res) => {
    const entityId = req.params.id;
    try {
        const [result] = await pool.execute('DELETE FROM ${tableName} WHERE id = ?', [entityId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: '${entityName} não encontrado.' });
        }
        
        res.status(200).json({ success: true, message: '${entityName} deletado com sucesso.' });

    } catch (error) {
        console.error('Erro ao deletar ${entityName}:', error);
        res.status(500).json({ success: false, message: 'Erro interno ao deletar ${entityName}.' });
    }
});


module.exports = router;
`;

    return code;
}

module.exports = {
    generateRoutesFile
};
