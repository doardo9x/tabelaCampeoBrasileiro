const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const timesRotas = require('./rotas/timesRotas');

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api', timesRotas);

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
