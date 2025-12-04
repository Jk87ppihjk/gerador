// Arquivo: server.js (GERADO)
// --- PONTO DE ENTRADA DO PROJETO ---

const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO DE MIDDLEWARES ---
// Permite o acesso de qualquer origem (CORS)
app.use(cors({ origin: '*' }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


// --- Importação das Rotas Geradas ---
const db = require('./config/db');
const { protect } = require('./authMiddleware');

// ! BLOCO DE INSERÇÃO AUTOMÁTICA DE ROTAS GERADAS (pelo Gerador)
// Exemplo: 
// const clientesRoutes = require('./clientesRoutes');
// const produtosRoutes = require('./produtosRoutes');


// --- Uso e Montagem das Rotas (Tudo sob /api) ---

// Rotas de utilidade (Ex: Login/Registro, etc., que podem ser adicionadas depois)
// app.use('/api/auth', authRoutes);

// ! BLOCO DE MONTAGEM AUTOMÁTICA DE ROTAS GERADAS (pelo Gerador)
// Exemplo: 
// app.use('/api', clientesRoutes); 
// app.use('/api', produtosRoutes); 


// Rota "raiz"
app.get('/', (req, res) => {
    res.send('Backend Gerado está operacional.');
});

// --- TRATAMENTO DE ERRO 404 ---
app.use((req, res, next) => {
    res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada.' 
    });
});

// Iniciar o Servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
