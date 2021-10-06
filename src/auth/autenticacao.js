const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const tokenHash = require('../token/tokenHash');

async function validarToken(req, res, next) {
    const token = req.headers.authorization && req.headers.authorization.slice(7);

    if (!token) {
        return res.status(401)
            .json({ mensagem: "Para acessar este recurso é necessário estar autenticado e fornecer token válido." });
    }

    try {
        const { id } = jwt.verify(token, tokenHash);
        const { rowCount, rows } = await conexao.query('SELECT * FROM usuarios WHERE id = $1', [id]);

        if (rowCount !== 1 || !id) {
            return res.status(404)
                .json({ mensagem: "Usuário não encontrado." });
        }

        const { senha, ...usuario } = rows[0];
        
        req.usuario = usuario;
        return next();
    } catch (error) {
        return res.status(401)
            .json({ mensagem: "Para acessar este recurso é necessário estar autenticado e fornecer token válido." });
    }
}

module.exports = { validarToken }