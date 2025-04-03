const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORTA = 3000;
const CHAVE_SECRETA = "Secreto";

app.use(cors());
app.use(express.json());

const usuarios = [
{ email: "admin@example.com", senha: "123456" },
{ email: "usuario@example.com", senha: "senha123" }
];

app.post('/login', (req, res) => {
const { email, senha } = req.body;

const usuarioEncontrado = usuarios.find(
    usuario => usuario.email === email && usuario.senha === senha
);

if (!usuarioEncontrado) {
    return res.status(401).json({ mensagem: "E-mail ou senha incorretos. tente novamente!" });
}

const token = jwt.sign(
    { email: usuarioEncontrado.email },
    CHAVE_SECRETA,
    { expiresIn: "1h" }
);
res.json({ mensagem: "Login realizado com sucesso! Aqui está o token:", token });
});

const autenticar = (req, res, next) => {
const cabecalhoAutorizacao = req.headers['authorization']?.split(" ")[1];
if (!cabecalhoAutorizacao) {
return res.status(403).json({ mensagem: "Token é obrigatório para acessar este recurso." });
}

jwt.verify(cabecalhoAutorizacao, CHAVE_SECRETA, (erro, usuario) => {
    if (erro) {
        return res.status(403).json({ mensagem: "Token inválido ou expirado. Por favor, faça login novamente." });
    }
    req.usuario = usuario;
    next();
});
};

app.get('/perfil', autenticar, (req, res) => {
res.json({
mensagem: "Bem-vindo ao seu perfil!",
usuario: req.usuario
});
});

app.listen(PORTA, () => {
console.log(Servidor está ativo e rodando em http://localhost:${PORT});
})