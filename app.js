const SUPABASE_URL='https://nawpanccwslcdbtmfsgn.supabase.co';
const API_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hd3BhbmNjd3NsY2RidG1mc2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Mzg4NDcsImV4cCI6MjA5NjExNDg0N30.YEu0hyuKEQuwp9KPT33B8VE9wdTvqlF7qvNvk8ujPE4';

let graficoTemp;
let graficoAmb;
let carroSelecionado = 331;

async function carregarDados(){

 const resposta = await fetch(
 `${SUPABASE_URL}/rest/v1/telemetria?select=*&order=created_at.desc&limit=500`,
 {
   headers:{
     apikey: API_KEY,
     Authorization: `Bearer ${API_KEY}`
   }
 });

 const dados = await resposta.json();

 if(!dados.length) return;

 preencherListaCarros(dados);

 const dadosCarro =
   dados.filter(
     x => x.carro == carroSelecionado
   );

 if(dadosCarro.length){

   document.getElementById('tempAtual').innerText =
     Number(dadosCarro[0].temperatura).toFixed(1) + ' °C';

   document.getElementById('umidAtual').innerText =
     Number(dadosCarro[0].umidade).toFixed(1) + ' °C';

   document.getElementById('ultimaAtualizacao').innerText =
     new Date(
       dadosCarro[0].created_at
     ).toLocaleString('pt-BR');
 }

 atualizarGraficos(dadosCarro);
 atualizarTabela(dados);
}

function preencherListaCarros(dados){

 const select = document.getElementById('filtroCarro');

 if(!select) {
   console.error("Select filtroCarro não encontrado");
   return;
 }

 const carros =
   [...new Set(dados.map(item => Number(item.carro)))]
   .filter(c => !isNaN(c))
   .sort((a,b)=>a-b);

 console.log("Carros:", carros);

 select.innerHTML = '';

 carros.forEach(carro => {

   const option = document.createElement('option');

   option.value = carro;
   option.textContent = `Carro ${carro}`;

   if(carro === carroSelecionado)
      option.selected = true;

   select.appendChild(option);
 });

 select.onchange = function(){
   carroSelecionado = Number(this.value);
   carregarDados();
 };
}

function atualizarGraficos(dadosCarro){

 const dadosOrdenados =
   [...dadosCarro].reverse();

 const labels =
   dadosOrdenados.map(
     x => new Date(
       x.created_at
     ).toLocaleTimeString('pt-BR')
   );

 const temperaturas =
   dadosOrdenados.map(
     x => x.temperatura
   );

 const ambiente =
   dadosOrdenados.map(
     x => x.umidade
   );

 if(graficoTemp)
   graficoTemp.destroy();

 graficoTemp =
   new Chart(
     document.getElementById(
       'graficoTemperatura'
     ),
     {
       type:'line',

       data:{
         labels,

         datasets:[
         {
           label:
           `Carro ${carroSelecionado}`,

           data:
           temperaturas
         }]
       }
     }
   );

 if(graficoAmb)
   graficoAmb.destroy();

 graficoAmb =
   new Chart(
     document.getElementById(
       'graficoUmidade'
     ),
     {
       type:'line',

       data:{
         labels,

         datasets:[
         {
           label:
           'Temperatura Ambiente',

           data:
           ambiente
         }]
       }
     }
   );
}

function atualizarTabela(dados){

 let html='';

 dados.slice(0,20).forEach(item=>{

   html += `
   <tr>
   <td>${new Date(item.created_at).toLocaleString('pt-BR')}</td>
   <td>${item.carro}</td>
   <td>${item.temperatura}</td>
   <td>${item.umidade}</td>
   </tr>
   `;
 });

 document.getElementById(
   'tabelaDados'
 ).innerHTML = html;
}

carregarDados();

setInterval(
  carregarDados,
  5000
);
