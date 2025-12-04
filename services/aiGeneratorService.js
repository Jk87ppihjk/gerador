// Arquivo: services/aiGeneratorService.js (GERADO - CONCEITUAL)
// Este serviço lida com a comunicação com a API do Gemini.
const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Inicializa a conexão com a API
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 

/**
 * Converte a descrição em linguagem natural do usuário em uma estrutura JSON para o Gerador.
 * @param {string} naturalLanguageDescription - Ex: "Eu quero um blog com posts e comentários. Posts têm título e corpo, e comentários têm autor e conteúdo."
 * @returns {object} - O JSON de definição de entidades para os outros geradores.
 */
async function generateProjectDefinition(naturalLanguageDescription) {
    if (!GEMINI_API_KEY) {
        throw new Error('A chave GEMINI_API_KEY não está configurada no ambiente.');
    }

    // O PROMPT é a instrução que diz ao Gemini o que fazer
    const prompt = `
    A seguir, o usuário descreverá um projeto de software em linguagem natural.
    Sua tarefa é converter essa descrição na estrutura JSON estrita a seguir.
    Assegure-se de que cada campo tenha um 'name', 'db_type' (use VARCHAR(255) ou INT), e as propriedades 'required' e 'unique'.

    Modelo JSON Esperado:
    {
      "name": "Nome da Entidade (Ex: Post)",
      "table_name": "nome_da_tabela",
      "protection": "protect", // Use 'protect', 'protectSeller' ou 'public'
      "fields": [
        {"name": "field_name", "db_type": "VARCHAR(255)", "required": true, "unique": false},
        // ... outros campos
      ]
    }

    Descrição do Usuário: "${naturalLanguageDescription}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
            },
        });

        // O texto gerado será um JSON string, que deve ser parsado
        return JSON.parse(response.text);

    } catch (error) {
        console.error("Erro na chamada da API do Gemini:", error);
        throw new Error("Falha na geração de código por IA. Verifique sua chave de API.");
    }
}

module.exports = {
    generateProjectDefinition
};
