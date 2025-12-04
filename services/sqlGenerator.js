// Arquivo: services/sqlGenerator.js

/**
 * Gera a query CREATE TABLE SQL para uma entidade específica.
 * @param {object} definition - O JSON de definição da entidade.
 * @returns {string} - A query SQL completa.
 */
function generateSqlSchema(definition) {
    const tableName = definition.table_name;
    const fields = definition.fields;

    // 1. Inicializa a lista de colunas
    const columns = [];
    
    // 2. Adiciona campos de auditoria padrão (essenciais em seu projeto base)
    // O id, created_at e updated_at são comuns em todas as suas tabelas.
    columns.push("    id INT AUTO_INCREMENT PRIMARY KEY");
    
    // 3. Processa os campos definidos pelo usuário
    for (const field of fields) {
        let line = `    ${field.name} ${field.db_type}`;
        
        // Adiciona restrição NOT NULL se for obrigatório
        if (field.required) {
            line += " NOT NULL";
        }
        
        // Adiciona restrição UNIQUE se for única (ex: email)
        if (field.unique) {
            line += " UNIQUE";
        }

        columns.push(line);
    }

    // 4. Adiciona campos de timestamp padrão (se usados, como visto em seus logs/modelo)
    columns.push("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    columns.push("    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    
    // 5. Monta a query final
    const sqlQuery = `
-- Arquivo gerado pelo seu Backend Generator v1.0.0
-- Entidade: ${definition.name}

CREATE TABLE IF NOT EXISTS ${tableName} (
${columns.join(',\n')}
);
`;

    return sqlQuery;
}

module.exports = {
    generateSqlSchema
};
