// scripts.js

// Função principal para buscar dados da API
async function buscarDadosClima(latitude, longitude) {
    try {
      // Chamada à API (ajustar os parâmetros depois)
      const resposta = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m&daily=weathercode,temperature_2m_max&current_weather=true&timezone=auto`
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