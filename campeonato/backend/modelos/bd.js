const mysql = require('mysql');

const bd = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'campeonato',
});

bd.connect((erro) => {
  if (erro) {
    console.error('Erro ao conectar ao MySQL:', erro);
  } else {
    console.log('Conectado ao banco de dados MySQL.');
  }
});

module.exports = bd;