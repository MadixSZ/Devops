// Função principal para buscar dados da API
async function buscarDadosClima(latitude, longitude) {
  try {
    const resposta = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
    );
  
    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }
  
    const dadosClima = await resposta.json();
    return dadosClima;
  
  } catch (erro) {
    console.error("Falha ao buscar dados:", erro);
    return null;
  }
}

// Função para atualizar a interface com os dados
function atualizarUI(dados) {
  console.log("Dados completos da API:", dados);
  
  const climaAtual = document.getElementById("clima-atual");
  const horasContainer = document.getElementById("horas-container");
  const diasContainer = document.getElementById("dias-container");

  // Temperatura Atual
  climaAtual.innerHTML = `
    <div class="temperatura-atual">
      <p>${dados.current_weather.temperature}°C</p>
      <span class="weather-icon">${getWeatherIcon(dados.current_weather.weathercode)}</span>
    </div>
  `;

  // Próximas 24 Horas
  const proximas24Horas = processarProximas24Horas(dados);
  console.log("Próximas 24h processadas:", proximas24Horas);
  
  horasContainer.innerHTML = proximas24Horas
    .map((hora) => `
      <div class="hora-item">
        <p>${hora.horaFormatada}</p>
        <span class="weather-icon">${getWeatherIcon(hora.weathercode)}</span>
        <p>${hora.temperatura}°C</p>
      </div>
    `)
    .join("");

  // Previsão 7 Dias
  const previsao7Dias = processarPrevisao7Dias(dados);
  diasContainer.innerHTML = previsao7Dias
    .map((dia) => `
      <div class="dia-item">
        <p>${dia.data}</p>
        <span class="weather-icon">${getWeatherIcon(dia.weathercode)}</span>
        <p>${dia.tempMax}°C ↑</p>
        <p>${dia.tempMin}°C ↓</p>
      </div>
    `)
    .join("");
}

// Função para mapear weathercodes para ícones
function getWeatherIcon(weathercode) {
  const icons = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌧️', 53: '🌧️', 55: '🌧️',
    56: '🌧️', 57: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    66: '🌧️', 67: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️',
    77: '❄️',
    80: '🌦️', 81: '🌦️', 82: '🌦️',
    85: '❄️', 86: '❄️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };
  return icons[weathercode] || '🌈';
}

// Função para processar as próximas 24 horas (versão reforçada)
function processarProximas24Horas(dados) {
  if (!dados.hourly || !dados.hourly.time) {
    console.warn("Dados horários não encontrados na API");
    return [];
  }

  const agora = new Date();
  const agoraISO = agora.toISOString();
  
  // Encontra o índice da hora atual ou próxima
  const indiceAtual = dados.hourly.time.findIndex(hora => hora >= agoraISO);
  
  if (indiceAtual === -1) {
    console.warn("Não foi possível encontrar horários futuros nos dados");
    return [];
  }
  
  // Pega as próximas 24 horas a partir do índice atual
  return dados.hourly.time
    .slice(indiceAtual, indiceAtual + 24)
    .map((hora, i) => ({
      horaFormatada: new Date(hora).toLocaleTimeString("pt-BR", { hour: "2-digit" }),
      temperatura: dados.hourly.temperature_2m[indiceAtual + i],
      weathercode: dados.hourly.weathercode[indiceAtual + i]
    }));
}

// Função para processar previsão de 7 dias
function processarPrevisao7Dias(dados) {
  return dados.daily.time.map((dia, index) => ({
    data: new Date(dia).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
    tempMax: dados.daily.temperature_2m_max[index],
    tempMin: dados.daily.temperature_2m_min[index],
    weathercode: dados.daily.weathercode[index]
  }));
}

// Função para obter a localização do usuário
function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocalização não suportada pelo navegador.");
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        resolve({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        });
      },
      (erro) => {
        reject(`Erro ao obter localização: ${erro.message}`);
      }
    );
  });
}

// Inicialização do app
async function init() {
  try {
    // Para testes, pode usar coordenadas fixas:
    // const dadosClima = await buscarDadosClima(-23.55, -46.64); // São Paulo
    
    const localizacao = await obterLocalizacao();
    const dadosClima = await buscarDadosClima(localizacao.latitude, localizacao.longitude);
    
    if (dadosClima) {
      atualizarUI(dadosClima);
    }
  } catch (erro) {
    console.error(erro);
    document.getElementById("clima-info").innerHTML = `
      <div class="erro">
        <p>Ative a geolocalização para ver a previsão</p>
        <button onclick="window.location.reload()">Tentar novamente</button>
      </div>
    `;
  }
}

// Executa o app quando a página carregar
document.addEventListener("DOMContentLoaded", init);