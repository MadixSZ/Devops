// scripts.js

// Função principal para buscar dados da API
async function buscarDadosClima(latitude, longitude) {
  try {
    const resposta = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`
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
    const climaInfo = document.getElementById("clima-info"); // ID corrigido (sem "-")
    
    // Exemplo: temperatura atual
    const temperaturaAtual = dados.current_weather.temperature;
    climaInfo.innerHTML = `
      <p>Temperatura atual: ${temperaturaAtual}°C</p>
    `;
  }
  
  // Função para obter a localização do usuário (geolocalização, isso importa?)
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
  
  // Função para previsão dos próximos 7 dias
  function processarPrevisao7Dias(dados) {
    return dados.daily.time.map((dia, index) => ({
      data: new Date(dia).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
      tempMax: dados.daily.temperature_2m_max[index],
      tempMin: dados.daily.temperature_2m_min[index],
      weathercode: dados.daily.weathercode[index],
    }));
  }

  // Função para previsão das próximas 24 horas
  function processarProximas24Horas(dados) {
    const agora = new Date();
    const horas = dados.hourly.time
      .map((hora, index) => ({
        hora: new Date(hora).toLocaleTimeString("pt-BR", { hour: "2-digit" }),
        temperatura: dados.hourly.temperature_2m[index],
      }))
      .filter((item) => new Date(item.hora) >= agora) // Filtra horas futuras
      .slice(0, 24); // Pega as próximas 24h
  
    return horas;
  }

  // Inicialização do app
  async function init() {
    try {
      const localizacao = await obterLocalizacao();
      const dadosClima = await buscarDadosClima(localizacao.latitude, localizacao.longitude);
      
      if (dadosClima) {
        atualizarUI(dadosClima);
      }
    } catch (erro) {
      console.error(erro);
      // Exibir mensagem de erro no HTML (ex: "Ative a geolocalização!")
    }
  }
  
  // Executa o app quando a página carregar
  document.addEventListener("DOMContentLoaded", init);