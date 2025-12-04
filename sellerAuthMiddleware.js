// Arquivo: sellerAuthMiddleware.js (GERADO)
const jwt = require('jsonwebtoken');
const pool = require('./config/db'); 

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware para proteger rotas e garantir que APENAS usuários com flag is_seller tenham acesso.
 */
const protectSeller = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Busca o perfil completo (incluindo o flag is_seller)
            const [rows] = await pool.execute('SELECT id, is_seller FROM users WHERE id = ? LIMIT 1', [decoded.id]);
            const user = rows[0];

            if (!user) {
                return res.status(401).json({ success: false, message: 'Usuário não encontrado.' });
            }

            // Verifica a permissão de lojista
            // Nota: Se a tabela 'users' no projeto gerado não tiver is_seller, isso falhará.
            if (!user.is_seller) {
                return res.status(403).json({ success: false, message: 'Acesso negado. Apenas usuários com o papel de vendedor podem realizar esta ação.' });
            }

            req.user = user; 
            next();

        } catch (error) {
            console.error('[AUTH/ROLE] FALHA: Token inválido ou erro de servidor.', error);
            res.status(401).json({ success: false, message: 'Não autorizado, token inválido ou erro de servidor.' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Não autorizado, token ausente.' });
    }
};

module.exports = { protectSeller };
