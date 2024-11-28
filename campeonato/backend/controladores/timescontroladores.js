const bd = require('../modelos/bd');

exports.obterTodosTimes = (req, res) => {
  const consulta = 'SELECT * FROM times'; // Seleciona todos os times na tabela `times`
  bd.query(consulta, (erro, resultados) => {
    if (erro) {
      res.status(500).json({ erro: 'Erro ao buscar os times' });
    } else {
      res.json(resultados);
    }
  });
};

exports.obterResumoTime = (req, res) => {
  const timeId = req.params.id; // ID do time recebido na URL

  const consulta = `
    SELECT 
      t.time_nome,
      COUNT(p.partida_id) AS total_partidas,
      SUM(CASE WHEN (p.time_c_id = ? AND p.time_c_gols > p.time_v_gols) OR 
                   (p.time_v_id = ? AND p.time_v_gols > p.time_c_gols) THEN 1 ELSE 0 END) AS total_vitorias,
      SUM(CASE WHEN p.time_c_gols = p.time_v_gols THEN 1 ELSE 0 END) AS total_empates,
      SUM(CASE WHEN (p.time_c_id = ? AND p.time_c_gols < p.time_v_gols) OR 
                   (p.time_v_id = ? AND p.time_v_gols < p.time_c_gols) THEN 1 ELSE 0 END) AS total_derrotas
    FROM times t
    LEFT JOIN partidas p ON t.time_id = p.time_c_id OR t.time_id = p.time_v_id
    WHERE t.time_id = ?;
  `;

  bd.query(consulta, [timeId, timeId, timeId, timeId, timeId], (erro, resultados) => {
    if (erro) {
      res.status(500).json({ erro: 'Erro ao buscar resumo do time' });
    } else {
      res.json(resultados[0]); // Retorna o primeiro resultado (resumo do time)
    }
  });
};

exports.obterClassificacao = (req, res) => {
  const consulta = `SELECT 
  t.time_id,
  t.time_nome,
  SUM(
      CASE 
          WHEN p.time_c_id = t.time_id AND p.time_c_gols > p.time_v_gols THEN 3 -- Vitória como mandante
          WHEN p.time_v_id = t.time_id AND p.time_v_gols > p.time_c_gols THEN 3 -- Vitória como visitante
          WHEN (p.time_c_id = t.time_id OR p.time_v_id = t.time_id) AND p.time_c_gols = p.time_v_gols THEN 1 -- Empate
          ELSE 0 -- Derrota
      END
  ) AS pontos,
  COUNT(
      CASE 
          WHEN p.time_c_id = t.time_id OR p.time_v_id = t.time_id THEN 1
      END
  ) AS jogos,
  SUM(
      CASE 
          WHEN p.time_c_id = t.time_id THEN p.time_c_gols
          WHEN p.time_v_id = t.time_id THEN p.time_v_gols
          ELSE 0
      END
  ) AS gols_feitos,
  SUM(
      CASE 
          WHEN p.time_c_id = t.time_id THEN p.time_v_gols
          WHEN p.time_v_id = t.time_id THEN p.time_c_gols
          ELSE 0
      END
  ) AS gols_sofridos,
  SUM(
      CASE 
          WHEN p.time_c_id = t.time_id AND p.time_c_gols > p.time_v_gols THEN 1 -- Vitória como mandante
          WHEN p.time_v_id = t.time_id AND p.time_v_gols > p.time_c_gols THEN 1 -- Vitória como visitante
          ELSE 0
      END
  ) AS vitorias,
  SUM(
      CASE 
          WHEN (p.time_c_id = t.time_id OR p.time_v_id = t.time_id) AND p.time_c_gols = p.time_v_gols THEN 1 -- Empate
          ELSE 0
      END
  ) AS empates,
  SUM(
      CASE 
          WHEN p.time_c_id = t.time_id AND p.time_c_gols < p.time_v_gols THEN 1 -- Derrota como mandante
          WHEN p.time_v_id = t.time_id AND p.time_v_gols < p.time_c_gols THEN 1 -- Derrota como visitante
          ELSE 0
      END
  ) AS derrotas
FROM 
  times t
LEFT JOIN 
  partidas p 
ON 
  t.time_id = p.time_c_id OR t.time_id = p.time_v_id
GROUP BY 
  t.time_id, t.time_nome
ORDER BY 
  pontos DESC, vitorias DESC, gols_feitos DESC, gols_sofridos ASC;`;

  bd.query(consulta, (erro, resultados) => {
    if (erro) {
      res.status(500).json({ erro: 'Erro ao obter a classificação' });
    } else {
      res.json(resultados);
    }
  });
};

exports.obterRodadas = (req, res) => {
  const consulta = 'SELECT DISTINCT rodada_id AS rodada FROM partidas ORDER BY rodada_id';
  
  bd.query(consulta, (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar rodadas:', erro); // Log para depuração
      res.status(500).json({ erro: 'Erro ao buscar rodadas' });
    } else {
      res.json(resultados); // Retorna um array de objetos: [{ rodada: 1 }, { rodada: 2 }, ...]
    }
  });
};


exports.obterPartidasPorRodada = (req, res) => {
  const rodada = req.query.rodada;

  const consulta = `
    SELECT 
      p.partida_id,
      p.rodada_id,
      p.time_c_gols,
      p.time_v_gols,
      tc.time_nome AS time_c_nome,
      tv.time_nome AS time_v_nome
    FROM 
      partidas p
    INNER JOIN 
      times tc ON p.time_c_id = tc.time_id
    INNER JOIN 
      times tv ON p.time_v_id = tv.time_id
    ${rodada ? 'WHERE p.rodada_id = ?' : ''}
    ORDER BY p.partida_id ASC
  `;

  const params = rodada ? [rodada] : [];

  bd.query(consulta, params, (erro, resultados) => {
    if (erro) {
      console.error('Erro ao buscar partidas:', erro);
      res.status(500).json({ erro: 'Erro ao buscar partidas' });
    } else {
      res.json(resultados);
    }
  });
};



exports.atualizarGols = (req, res) => {
  const partidaId = req.params.id;
  const { golsTimeC, golsTimeV } = req.body;

  const consulta = `
    UPDATE partidas 
    SET time_c_gols = ?, time_v_gols = ? 
    WHERE partida_id = ?
  `;
  bd.query(consulta, [golsTimeC, golsTimeV, partidaId], (erro) => {
    if (erro) {
      res.status(500).json({ erro: 'Erro ao atualizar gols da partida' });
    } else {
      res.json({ mensagem: 'Partida atualizada com sucesso' });
    }
  });
};


