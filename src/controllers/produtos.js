const conexao = require('../conexao');
const { validarDadosProduto } = require('../utils/validacoes');

async function listarProdutos(req, res) {
    const { id } = req.usuario;
    const categoria = req.query.categoria && req.query.categoria;

    if (!id) {
        return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    try {

        if (categoria) {
            
            const { rows: validarCategoria, rowCount: ocorrenciaCategoria } = await conexao.query("SELECT * FROM produtos WHERE categoria ILIKE $1", [`%${categoria}%`]);

            if (validarCategoria.length === 0 || ocorrenciaCategoria === 0) {
                return res.status(404)
                    .json({ mensagem: "Categoria não encontrada" });
            }

            const { rows: buscaCategoria, rowCount: ocorrenciaBuscaCategoria } = await conexao.query('SELECT * FROM produtos WHERE categoria ILIKE $1 AND usuario_id = $2', [`%${categoria}%`, id]);

            if (buscaCategoria.length === 0 || ocorrenciaBuscaCategoria === 0) {
                return res.status(403)
                    .json({ mensagem: "Usuário não possui categorias que correspondam aos resultados da busca!" });
            }

            return res.status(200)
                .json(buscaCategoria);
        }

        const { rows: produtos } = await conexao.query('SELECT * FROM produtos WHERE usuario_id = $1', [id]);

        if (!produtos) {
            return res.status(400)
                .json({ mensagem: "Não foi possível consultar a lista de produtos." });
        }

        return res.status(200)
            .json(produtos);
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function detalharProduto(req, res) {
    const { id: usuarioId } = req.usuario;
    const { id: idProduto } = req.params;

    if (!usuarioId) {
        return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    if (isNaN(Number(idProduto)) || Number(idProduto) % 1 !== 0) {
        return res.status(400)
            .json({ mensagem: 'O valor do parâmetro ID deve ser um número inteiro.' });
    }

    try {
        const { rowCount: ocorrenciaProdutosValidados } = await conexao.query('SELECT * FROM produtos WHERE id = $1', [idProduto]);
        
        if (!ocorrenciaProdutosValidados) {
            return res.status(404)
                .json({ mensagem: `Não existe produto cadastrado com ID ${idProduto}.` })
        }

        const { rows: produtos, rowCount: ocorrenciaProdutos } = await conexao.query('SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2', [idProduto, usuarioId]);

        if (!ocorrenciaProdutos) {
            return res.status(403)
                .json({ mensagem: "O usuário logado não tem permissão para acessar este produto." })
        }

        return res.status(200)
            .json(produtos[0]);
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message })
    }
}

async function cadastrarProduto(req, res) {
    const { id: usuarioId } = req.usuario;
    const { nome, quantidade, categoria, preco, descricao, imagem } = req.body;

    if (!usuarioId) {
        return res.status(401).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." });
    }

    const erro = await validarDadosProduto(nome, quantidade, preco, descricao);

    if (erro) {
        return res.status(400)
            .json({ mensagem: erro });
    }

    try {
        const { rows: validarUsuario, rowCount: ocorrenciaUsuario } = await conexao.query('SELECT id, nome, nome_loja, email FROM usuarios WHERE id = $1', [usuarioId]);

        if (validarUsuario.length !== 1 || ocorrenciaUsuario !== 1) {
            return res.status(404)
                .json({ mensagem: "Não foi possivel localizar os dados do usuário." });
        }

        const { rowCount: ocorrenciaProduto } = await conexao.query(`
        INSERT INTO produtos (usuario_id, nome, quantidade, categoria, preco, descricao, imagem) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`, [usuarioId, nome, quantidade, categoria, preco, descricao, imagem]);

        if (ocorrenciaProduto !== 1) {
            return res.status(400)
                .json({ mensagem: "Não foi possivel efetuar o cadastro." });
        }

        return res.status(201)
            .send();
    } catch (error) {
        return res.status(500)
            .json({ mensagem: "Ocorreu um erro inesperado. - " + error.message });
    }
}

async function atualizarProduto(req, res) {
    const idProduto = req.params.id && Number(req.params.id);

    if (!idProduto || typeof idProduto !== "number") {
        return res.status(400).json({ mensagem: "Falha ao informar ID do produto" })
    }

    const { id: usuarioId } = req.usuario;
    const { id: novoId, nome: novoNome, quantidade: novaQuantidade, categoria: novaCategoria, preco: novoPreco, descricao: novaDescricao, imagem: novaImagem } = req.body;

    if (novoId) {
        return res.status(403)
            .json({ mensagem: "Alteração de ID não é permitida!" });
    }

    const erro = await validarDadosProduto(novoNome, novaQuantidade, novoPreco, novaDescricao);

    if (erro) {
        return res.status(400)
            .json({ mensagem: erro });
    }

    try {
        const { rows: validarUsuario, rowCount: ocorrenciaUsuario } = await conexao.query('SELECT id, nome, nome_loja, email FROM usuarios WHERE id = $1', [usuarioId]);

        if (validarUsuario.length !== 1 || ocorrenciaUsuario !== 1) {
            return res.status(400)
                .json({ mensagem: "Não foi possivel localizar os dados do usuário." });
        }

        const { rowCount: ocorrenciaProdutosValidados } = await conexao.query('SELECT * FROM produtos WHERE id = $1', [idProduto]);

        if (!ocorrenciaProdutosValidados) {
            return res.status(404).json({ mensagem: `Não existe produto cadastrado com ID ${idProduto}.` });
        }

        const { rowCount: ocorrenciaProdutos } = await conexao.query('SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2', [idProduto, usuarioId]);

        if (!ocorrenciaProdutos) {
            return res.status(403).json({ mensagem: "O usuário logado não tem permissão para acessar este produto." });
        }

        const { rowCount: ocorrenciasNovosDados } = await conexao.query(`
        UPDATE produtos 
        SET nome = $1, quantidade = $2, categoria = $3, preco = $4, descricao = $5, imagem = $6 
        WHERE id = $7 AND usuario_id = $8`, [novoNome, novaQuantidade, novaCategoria, novoPreco, novaDescricao, novaImagem, idProduto, usuarioId]);

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

async function excluirProduto(req, res) {
    const idProduto = req.params.id && Number(req.params.id);

    if (!idProduto || typeof idProduto !== "number") {
        return res.status(400).json({ mensagem: "Falha ao informar ID do produto" });
    }

    const { id: usuarioId } = req.usuario;

    try {
        const { rows: validarUsuario, rowCount: ocorrenciaUsuario } = await conexao.query('SELECT id, nome, nome_loja, email FROM usuarios WHERE id = $1', [usuarioId]);

        if (validarUsuario.length !== 1 || ocorrenciaUsuario !== 1) {
            return res.status(400)
                .json({ mensagem: "Não foi possivel localizar os dados do usuário." });
        }

        const { rowCount: ocorrenciaProdutosValidados } = await conexao.query('SELECT * FROM produtos WHERE id = $1', [idProduto]);

        if (!ocorrenciaProdutosValidados) {
            return res.status(404).json({ mensagem: `Não existe produto cadastrado com ID ${idProduto}.` });
        }

        const { rowCount: ocorrenciaProdutos } = await conexao.query('SELECT * FROM produtos WHERE id = $1 AND usuario_id = $2', [idProduto, usuarioId]);

        if (!ocorrenciaProdutos) {
            return res.status(403).json({ mensagem: "O usuário logado não tem permissão para acessar este produto." });
        }

        const { rowCount: ocorrenciasExclusao } = await conexao.query(`
        DELETE FROM produtos
        WHERE id = $1 AND usuario_id = $2`, [idProduto, usuarioId]);

        if (ocorrenciasExclusao !== 1) {
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

module.exports = { listarProdutos, detalharProduto, cadastrarProduto, atualizarProduto, excluirProduto }