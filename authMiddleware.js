// Arquivo: authMiddleware.js (GERADO)
const jwt = require('jsonwebtoken');
const pool = require('./config/db');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware Padrão 'protect' (Geral)
 * Protege rotas e garante que o usuário esteja logado.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // 1. Verificar e decodificar o token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // 2. Busca o usuário (assumindo que a tabela 'users' existe)
            const [rows] = await pool.execute('SELECT id, full_name, email FROM users WHERE id = ? LIMIT 1', [decoded.id]);
            const user = rows[0];

            if (!user) {
                return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
            }

            // 3. Anexa o usuário ao request
            req.user = user; 
            
            next();

        } catch (error) {
            console.error('[AUTH] FALHA: Token inválido ou expirado.', error);
            res.status(401).json({ success: false, message: 'Não autorizado, token inválido ou expirado.' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Não autorizado, token ausente.' });
    }
};

module.exports = { 
    protect
};
