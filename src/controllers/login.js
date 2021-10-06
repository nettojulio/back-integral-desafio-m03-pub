const conexao = require('../conexao');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tokenHash = require('../token/tokenHash');
const { validarLoginUsuario } = require('../utils/validacoes');

async function login(req, res) {
    const { email, senha } = req.body;
    const erro = await validarLoginUsuario(email, senha);

    if (erro) {
        return res.status(400)
            .json({ mensagem: erro });
    }

    try {
        const { rowCount, rows } = await conexao.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (rowCount !== 1) {
            return res.status(400)
                .json({ mensagem: "Usuário e/ou senha inválido(s)." });
        }

        const usuario = rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(400)
                .json({ mensagem: "Usuário e/ou senha inválido(s)." });
        }

        const token = jwt.sign(
            { id: usuario.id },
            tokenHash,
            { expiresIn: '1h' }
        );

        if (!token) {
            return res.status(400).json({ mensagem: "Erro ao gerar autenticação do usuário." })
        }

        return res.status(201)
            .json({ token });
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

module.exports = { login }