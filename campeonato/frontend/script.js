// script.js

// Função para buscar times na API e renderizar na página
async function carregarTimes() {
  try {
    const resposta = await fetch('http://localhost:3000/api/times');
    const times = await resposta.json();

    const grid = document.getElementById('teams-grid');

    times.forEach(time => {
      const card = document.createElement('div');
      card.classList.add('team-card');

      // Link que engloba o emblema e o nome
      const link = document.createElement('a');
      link.href = `detalhes.html?id=${time.time_id}`; // Redireciona para a página de detalhes
      link.style.textDecoration = 'none'; // Remove o sublinhado do link

      // Emblema do time
      const emblema = document.createElement('img');
      emblema.src = `img/${time.time_id}.png`;
      emblema.alt = `Emblema do ${time.time_nome}`;

      // Nome do time
      const nome = document.createElement('p');
      nome.classList.add('team-name');
      nome.textContent = time.time_nome;

      // Adiciona emblema e nome ao link
      link.appendChild(emblema);
      link.appendChild(nome);

      // Adiciona o link ao card
      card.appendChild(link);

      // Adiciona o card ao grid
      grid.appendChild(card);
    });
  } catch (erro) {
    console.error('Erro ao carregar os times:', erro);
  }
}

// Função para carregar os detalhes do time
async function carregarResumoTime() {
  const params = new URLSearchParams(window.location.search);
  const timeId = params.get('id'); // Obtém o ID do time a partir da URL

  try {
    const resposta = await fetch(`http://localhost:3000/api/times/${timeId}`);
    const resumo = await resposta.json();

    const container = document.getElementById('team-summary');

    // Renderiza os dados do time
    container.innerHTML = `
      <div class="team-details">
        <img src="img/${timeId}.png" alt="Emblema do ${resumo.time_nome}">
        <h1>${resumo.time_nome}</h1>
        <p>Total de Partidas: ${resumo.total_partidas}</p>
        <p>Total de Vitórias: ${resumo.total_vitorias}</p>
        <p>Total de Empates: ${resumo.total_empates}</p>
        <p>Total de Derrotas: ${resumo.total_derrotas}</p>
      </div>
    `;
  } catch (erro) {
    console.error('Erro ao carregar o resumo do time:', erro);
  }
}

async function carregarClassificacao() {
  try {
    const resposta = await fetch('http://localhost:3000/api/classificacao');
    let classificacao = await resposta.json();

    if (!Array.isArray(classificacao)) {
      console.error('Erro: Classificação não é um array', classificacao);
      return;
    }

    const tabela = document.getElementById('classificacao').querySelector('tbody');
    tabela.innerHTML = ''; // Limpa a tabela antes de preencher

    classificacao.forEach((time, index) => {
      const linha = document.createElement('tr');

      // Adiciona uma classe especial para os últimos 4 times
      if (index >= classificacao.length - 4) {
        linha.classList.add('zona-rebaixamento');
      }

      linha.innerHTML = `
        <td>${index + 1}</td>
        <td><img src="img/${time.time_id}.png" alt="Emblema de ${time.time_nome}" class="emblema"></td>
        <td>${time.time_nome}</td>
        <td>${time.pontos}</td>
        <td>${time.jogos}</td>
        <td>${time.vitorias}</td>
        <td>${time.empates}</td>
        <td>${time.derrotas}</td>
        <td>${time.gols_feitos}</td>
        <td>${time.gols_sofridos}</td>
      `;

      tabela.appendChild(linha);
    });
  } catch (erro) {
    console.error('Erro ao carregar a classificação:', erro);
  }
}

async function carregarRodadas() {
  try {
    const resposta = await fetch('http://localhost:3000/api/rodadas');
    const rodadas = await resposta.json();

    if (!Array.isArray(rodadas)) {
      console.error('Erro: Resposta de rodadas não é um array', rodadas);
      return;
    }

    const selectRodadas = document.getElementById('rodadas');
    selectRodadas.innerHTML = `<option value="">Todas as Rodadas</option>`; // Reseta o dropdown

    rodadas.forEach(rodada => {
      const option = document.createElement('option');
      option.value = rodada.rodada; // Usa o campo "rodada" retornado pelo backend
      option.textContent = `Rodada ${rodada.rodada}`; // Texto exibido no dropdown
      selectRodadas.appendChild(option);
    });

    // Adiciona evento para carregar partidas ao mudar a rodada
    selectRodadas.addEventListener('change', carregarPartidas);

    // Carrega todas as partidas inicialmente
    carregarPartidas();
  } catch (erro) {
    console.error('Erro ao carregar rodadas:', erro);
  }
}

async function carregarPartidas() {
  try {
    const rodada = document.getElementById('rodadas').value;
    const resposta = await fetch(`http://localhost:3000/api/partidas?rodada=${rodada}`);
    const partidas = await resposta.json();

    const tabela = document.getElementById('partidas-tabela').querySelector('tbody');
    tabela.innerHTML = ''; // Limpa os dados da tabela

    if (!Array.isArray(partidas) || partidas.length === 0) {
      tabela.innerHTML = `<tr><td colspan="5">Nenhuma partida encontrada para esta rodada.</td></tr>`;
      return;
    }

    partidas.forEach((partida) => {
      const linha = document.createElement('tr');
      linha.innerHTML = `
        <td>${partida.time_c_nome}</td>
        <td><input type="number" value="${partida.time_c_gols}" data-id="${partida.partida_id}" data-time="c"></td>
        <td>${partida.time_v_nome}</td>
        <td><input type="number" value="${partida.time_v_gols}" data-id="${partida.partida_id}" data-time="v"></td>
        <td><button onclick="atualizarPartida(${partida.partida_id})">Atualizar</button></td>
      `;
      tabela.appendChild(linha);
    });
  } catch (erro) {
    console.error('Erro ao carregar partidas:', erro);
  }
}


async function atualizarPartida(partidaId) {
  try {
    const linha = [...document.querySelectorAll(`[data-id="${partidaId}"]`)];
    const golsTimeC = linha.find(input => input.dataset.time === 'c').value;
    const golsTimeV = linha.find(input => input.dataset.time === 'v').value;

    await fetch(`http://localhost:3000/api/partidas/${partidaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ golsTimeC, golsTimeV }),
    });

    alert('Partida atualizada com sucesso!');
    carregarPartidas(); // Recarrega as partidas
  } catch (erro) {
    console.error('Erro ao atualizar partida:', erro);
  }
}


if (window.location.pathname.endsWith('detalhes.html')) {
  document.addEventListener('DOMContentLoaded', carregarResumoTime);
} else if (window.location.pathname.endsWith('classificacao.html')) {
  document.addEventListener('DOMContentLoaded', carregarClassificacao);
} else if (window.location.pathname.endsWith('partidas.html')) {
  document.addEventListener('DOMContentLoaded', carregarRodadas);
} else {
  document.addEventListener('DOMContentLoaded', carregarTimes);
}
