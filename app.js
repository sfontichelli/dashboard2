
const fmt = new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0});

const DATA=[
{area:"Online",cat:"Marketing digital",budget:18933500,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
{area:"Online",cat:"Contenidos",budget:24532500,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
{area:"Online",cat:"Agencia",budget:14570917,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
{area:"Online",cat:"Ecommerce",budget:2714987,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
{area:"Otros",cat:"Expos",budget:36961700,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
{area:"Otros",cat:"Diseño – equipo",budget:32757084,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
{area:"Otros",cat:"Revistas",budget:9987858,m:{Jul:0,Ago:0,Sep:0,Oct:0,Nov:0,Dic:0}},
];

function ytd(m){
return Object.values(m).reduce((a,b)=>a+(Number(b)||0),0);
}

function forecast(m){
const y=ytd(m);
const months=Object.values(m).filter(v=>v>0).length;
return months?Math.round((y/months)*12):0;
}

function render(){

const tbody=document.querySelector("#budgetTable tbody");
tbody.innerHTML="";

let totalBudget=0;
let totalYTD=0;
let totalForecast=0;

DATA.forEach(r=>{

const y=ytd(r.m);
const f=forecast(r.m);
const pct=r.budget?(y/r.budget)*100:0;

totalBudget+=r.budget;
totalYTD+=y;
totalForecast+=f;

const tr=document.createElement("tr");

tr.innerHTML=`
<td>${r.area}</td>
<td>${r.cat}</td>
<td>${fmt.format(r.m.Jul)}</td>
<td>${fmt.format(r.m.Ago)}</td>
<td>${fmt.format(r.m.Sep)}</td>
<td>${fmt.format(r.m.Oct)}</td>
<td>${fmt.format(r.m.Nov)}</td>
<td>${fmt.format(r.m.Dic)}</td>
<td>${fmt.format(y)}</td>
<td>${fmt.format(r.budget)}</td>
<td>${pct.toFixed(1)}%</td>
<td>${fmt.format(f)}</td>
`;

tbody.appendChild(tr);

});

document.getElementById("budgetTotal").textContent=fmt.format(totalBudget);
document.getElementById("ytdTotal").textContent=fmt.format(totalYTD);
document.getElementById("availableTotal").textContent=fmt.format(totalBudget-totalYTD);
document.getElementById("pctTotal").textContent=((totalYTD/totalBudget)*100).toFixed(1)+"%";
document.getElementById("forecastTotal").textContent=fmt.format(totalForecast);

}

render();
