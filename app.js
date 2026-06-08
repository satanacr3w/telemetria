const SUPABASE_URL='https://nawpanccwslcdbtmfsgn.supabase.co/rest/v1/telemetria';
const API_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hd3BhbmNjd3NsY2RidG1mc2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Mzg4NDcsImV4cCI6MjA5NjExNDg0N30.YEu0hyuKEQuwp9KPT33B8VE9wdTvqlF7qvNvk8ujPE4';

let graficoTemp;
let graficoAmb;

async function carregarDados(){
 const resposta=await fetch(
 `${SUPABASE_URL}/rest/v1/telemetria?select=*&order=created_at.desc&limit=100`,
 {
   headers:{
     apikey:API_KEY,
     Authorization:`Bearer ${API_KEY}`
   }
 });
 const dados=await resposta.json();
 if(!dados.length) return;

 const sensor331=dados.filter(x=>x.carro==331);

 if(sensor331.length){
   document.getElementById('tempAtual').innerText=sensor331[0].temperatura+' °C';
   document.getElementById('umidAtual').innerText=sensor331[0].umidade+' °C';
   document.getElementById('ultimaAtualizacao').innerText=
      new Date(sensor331[0].created_at).toLocaleString('pt-BR');
 }

 atualizarGraficos(sensor331);
 atualizarTabela(dados);
}

function atualizarGraficos(sensor331){
 const dadosOrdenados=[...sensor331].reverse();
 const labels=dadosOrdenados.map(x=>new Date(x.created_at).toLocaleTimeString('pt-BR'));
 const temperaturas=dadosOrdenados.map(x=>x.temperatura);
 const ambiente=dadosOrdenados.map(x=>x.umidade);

 if(graficoTemp) graficoTemp.destroy();
 graficoTemp=new Chart(document.getElementById('graficoTemperatura'),{
   type:'line',
   data:{labels,datasets:[{label:'Temperatura',data:temperaturas}]}
 });

 if(graficoAmb) graficoAmb.destroy();
 graficoAmb=new Chart(document.getElementById('graficoUmidade'),{
   type:'line',
   data:{labels,datasets:[{label:'Ambiente',data:ambiente}]}
 });
}

function atualizarTabela(dados){
 let html='';
 dados.slice(0,20).forEach(item=>{
   html+=`<tr>
   <td>${new Date(item.created_at).toLocaleString('pt-BR')}</td>
   <td>${item.carro}</td>
   <td>${item.temperatura}</td>
   <td>${item.umidade}</td>
   </tr>`;
 });
 document.getElementById('tabelaDados').innerHTML=html;
}

carregarDados();
setInterval(carregarDados,5000);
