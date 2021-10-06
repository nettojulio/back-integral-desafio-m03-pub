const conexao = require('../conexao');
const bcrypt = require('bcrypt');
const { validarDadosUsuario } = require('../utils/validacoes');

async function cadastrarUsuario(req, res) {
    const { nome, nome_loja, email, senha } = req.body;
    const erro = await validarDadosUsuario(nome, nome_loja, email, senha);

    if (erro) {
        return res.status(400)
            .json({ mensagem: erro });
    }

    try {
        const { rowCount } = await conexao.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (rowCount !== 0) {
            return res.status(400)
                .json({ mensagem: "Já existe usuário cadastrado com o e-mail informado." });
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { rows: cadastroUsuario, rowCount: ocorrenciaCadastroUsuario } = await conexao.query(`
        INSERT INTO usuarios (nome, nome_loja, email, senha) 
        VALUES ($1, $2, $3, $4)`, [nome, nome_loja, email, senhaCriptografada]);

        if (cadastroUsuario.length !== 0 || ocorrenciaCadastroUsuario !== 1) {
            return res.status(400).json({ mensagem: "Falha ao criar usuário. Tente novamente." })
        }

        return res.status(201)
            .send();
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function detalharUsuario(req, res) {
    const { id } = req.usuario;

    if (!id) {
        return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    try {

        const { rows, rowCount } = await conexao.query(`
        SELECT id, nome, email, nome_loja FROM usuarios 
        WHERE id = $1`, [id]);

        if (rowCount !== 1 || rows.length !== 1) {
            return res.status(400)
                .json({ mensagem: "Não foi possivel localizar os dados do usuário." });
        }

        res.status(200)
            .json(rows[0]);
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function atualizarUsuario(req, res) {
    const { id } = req.usuario;
    const { id: novoId, nome: novoNome, email: novoEmail, nome_loja: novoNomeLoja, senha: novaSenha } = req.body;

    if (!id) {
        return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    if (novoId) {
        return res.status(403)
            .json({ mensagem: "Alteração de ID não é permitida!" });
    }

    const erro = await validarDadosUsuario(novoNome, novoNomeLoja, novoEmail, novaSenha);

    if (erro) {
        return res.status(400)
            .json({ mensagem: erro });
    }

    try {

        const { rows: validarNovoEmail, rowCount: ocorrenciasNovoEmail } = await conexao.query(`
        SELECT id, nome, email, nome_loja FROM usuarios 
        WHERE id <> $1 AND email = $2`, [id, novoEmail]);

        if (ocorrenciasNovoEmail !== 0 || validarNovoEmail.length !== 0) {
            return res.status(400)
                .json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." });
        }

        const { rows, rowCount } = await conexao.query(`
        SELECT id, nome, email, nome_loja FROM usuarios 
        WHERE id = $1`, [id]);

        if (rowCount !== 1 || rows.length !== 1) {
            return res.status(400)
                .json({ mensagem: "Não foi possivel localizar os dados do usuário." });
        }

        const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

        const { rowCount: ocorrenciasNovosDados } = await conexao.query(`
        UPDATE usuarios 
        SET nome = $1, email = $2, senha = $3, nome_loja = $4 
        WHERE id = $5`, [novoNome, novoEmail, novaSenhaCriptografada, novoNomeLoja, id]);

        if (ocorrenciasNovosDados !== 1) {
            return res.status(400)
                .json({ mensagem: "Ocorreu um erro ao atualizar os dados." });
        }

        return res.status(204)
            .send();
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

module.exports = { cadastrarUsuario, detalharUsuario, atualizarUsuario }