const express = require('express');
const roteador = express.Router();
const timesControlador = require('../controladores/timesControladores');

roteador.get('/times', timesControlador.obterTodosTimes);

roteador.get('/times/:id', timesControlador.obterResumoTime);

roteador.get('/classificacao', timesControlador.obterClassificacao);

roteador.get('/rodadas', timesControlador.obterRodadas);

roteador.get('/partidas', timesControlador.obterPartidasPorRodada);

roteador.put('/partidas/:id', timesControlador.atualizarGols);

module.exports = roteador;