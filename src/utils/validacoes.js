async function validarNomeUsuario(nome) {
    if (!nome) return "O Nome do usuário é uma informação obrigatória.";
    if (!nome.trim()) return "O Nome do usuário deve conter caracteres válidos.";
    if (typeof nome !== "string") return "Inserção de caracteres inválidas."
}

async function validarNomeLojaUsuario(nome_loja) {
    if (!nome_loja) return "O Nome da Loja é uma informação obrigatória.";
    if (!nome_loja.trim()) return "O Nome da Loja deve conter caracteres válidos.";
    if (typeof nome_loja !== "string") return "Inserção de caracteres inválidas."
}

async function validarEmailUsuario(email) {
    if (!email) return "Email do usuário é uma informação obrigatória.";
    if (!email.trim()) return "Email do usuário deve conter caracteres válidos.";
    if (typeof email !== "string") return "Inserção de caracteres inválidas."
}

async function validarSenhaUsuario(senha) {
    if (!senha) return "Senha é uma informação obrigatória.";
    if (!senha.trim()) return "Senha do usuário deve conter caracteres válidos.";
    if (typeof senha !== "string") return "Inserção de caracteres inválidas."
}

async function validarNomeProduto(nome) {
    if (!nome) return "Nome do produto é uma informação obrigatória.";
    if (!nome.trim()) return "Nome do produto deve conter caracteres válidos.";
    if (typeof nome !== "string") return "Inserção de caracteres inválidas."
}

async function validarQuantidadeProduto(quantidade) {
    if (!quantidade) return "Quantidade do produto é uma informação obrigatória.";
    if (typeof Number(quantidade) !== "number") return "Quantidade do produto deve ser um valor numérico.";
    if (typeof quantidade !== "number") return "Quantidade do produto deve ser um valor numérico.";
    if (quantidade % 1 !== 0) return "Quantidade do produto deve ser um número inteiro.";
    if (quantidade <= 0) return "Quantidade do produto deve ser maior que 0.";
}

async function validarPrecoProduto(preco) {
    if (preco < 0) return "Preço do produto não pode ser um valor negativo.";
    if (!preco) return "Preço do produto é uma informação obrigatória.";
    if (typeof Number(preco) !== "number") return "Preço do produto deve ser um valor numérico.";
    if (typeof preco !== "number") return "Preço do produto deve ser um valor numérico.";
    if (preco % 1 !== 0) return "Preço do produto deve ser um número inteiro.";
}

async function validarDescricaoProduto(descricao) {
    if (!descricao) return "Descrição do produto é uma informação obrigatória.";
    if (!descricao.trim()) return "Descrição do produto deve conter caracteres válidos.";
    if (typeof descricao !== "string") return "Inserção de caracteres inválidas."
}

async function validarDadosUsuario(nome, nome_loja, email, senha) {
    let response;

    response = await validarNomeUsuario(nome);
    if (response) return response;

    response = await validarNomeLojaUsuario(nome_loja);
    if (response) return response;

    response = await validarEmailUsuario(email);
    if (response) return response;

    response = await validarSenhaUsuario(senha);
    if (response) return response;
}

async function validarLoginUsuario(email, senha) {
    let response;

    response = await validarEmailUsuario(email);
    if (response) return response;

    response = await validarSenhaUsuario(senha);
    if (response) return response;
}

async function validarDadosProduto(nome, quantidade, preco, descricao) {
    let response;

    response = await validarNomeProduto(nome);
    if (response) return response;

    response = await validarQuantidadeProduto(quantidade);
    if (response) return response;

    response = await validarPrecoProduto(preco);
    if (response) return response;

    response = await validarDescricaoProduto(descricao);
    if (response) return response;
}

module.exports = { validarDadosUsuario, validarLoginUsuario, validarDadosProduto }