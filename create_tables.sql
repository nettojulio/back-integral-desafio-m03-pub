DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nome_loja VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha TEXT NOT NULL
);

DROP TABLE IF EXISTS produtos CASCADE;

CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    categoria VARCHAR(150),
    preco INTEGER NOT NULL CHECK (preco >= 0),
    descricao TEXT NOT NULL,
    imagem TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);