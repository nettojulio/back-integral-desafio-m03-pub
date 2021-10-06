const express = require('express');
const { login } = require('./controllers/login');
const { validarToken } = require('./auth/autenticacao');
const { cadastrarUsuario, detalharUsuario, atualizarUsuario } = require('./controllers/usuario');
const { listarProdutos, detalharProduto, cadastrarProduto, atualizarProduto, excluirProduto } = require('./controllers/produtos');


const rotas = express();

rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', login);

rotas.use(validarToken);

rotas.get('/usuario', detalharUsuario);
rotas.put('/usuario', atualizarUsuario);

rotas.get('/produtos', listarProdutos);
rotas.get('/produtos/:id', detalharProduto);
rotas.post('/produtos', cadastrarProduto);
rotas.put('/produtos/:id', atualizarProduto);
rotas.delete('/produtos/:id', excluirProduto);

module.exports = rotas;