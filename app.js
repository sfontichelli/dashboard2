const API_URL = https://script.google.com/macros/s/AKfycbwe_t0huKzW-i1ftqml6ILthOwCgXIKwwoKtyT2KVNyo9i-qjdpaTzYthq89KtYENeb/exec;
const STORAGE_KEY="aliafor-dashboard-pro-v5";
const fmt=new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0});
const MONTHS=["Jul 25","Ago 25","Sep 25","Oct 25","Nov 25","Dic 25","Ene 26","Feb 26","Mar 26","Abr 26","May 26","Jun 26"];
const BASE_DATA=[
{area:"Online",cat:"Marketing digital",budget:18933500,m:{"Jul 25":1255000,"Ago 25":1323500,"Sep 25":1465000,"Oct 25":1485000,"Nov 25":1545000,"Dic 25":1590000}},
{area:"Online",cat:"Contenidos",budget:24532500,m:{"Jul 25":0,"Ago 25":0,"Sep 25":2197500,"Oct 25":2227500,"Nov 25":2317500,"Dic 25":2385000}},
{area:"Online",cat:"Online",budget:422468,m:{"Jul 25":28003,"Ago 25":29532,"Sep 25":32689,"Oct 25":33135,"Nov 25":34474,"Dic 25":35478}},
{area:"Online",cat:"Agencia",budget:14570917,m:{"Jul 25":878500,"Ago 25":941548,"Sep 25":1059483,"Oct 25":1091424,"Nov 25":1154153,"Dic 25":1207942}},
{area:"Online",cat:"Ecommerce",budget:2714987,m:{"Jul 25":179962,"Ago 25":189785,"Sep 25":210075,"Oct 25":212943,"Nov 25":221547,"Dic 25":228000}},
{area:"Otros",cat:"Expos",budget:36961700,m:{"Jul 25":11471976,"Ago 25":12098135,"Sep 25":13391589,"Oct 25":0,"Nov 25":0,"Dic 25":0}},
{area:"Otros",cat:"Diseño – equipo",budget:32757084,m:{"Jul 25":2171291,"Ago 25":2289804,"Sep 25":2534615,"Oct 25":2569217,"Nov 25":2673024,"Dic 25":2750879}},
{area:"Otros",cat:"Revistas",budget:9987858,m:{"Jul 25":662041,"Ago 25":698177,"Sep 25":772821,"Oct 25":783372,"Nov 25":815023,"Dic 25":838762}},
{area:"Punto de Venta",cat:"Ploteos",budget:41457831,m:{"Jul 25":2748017,"Ago 25":2898008,"Sep 25":3207844,"Oct 25":3251638,"Nov 25":3383017,"Dic 25":3481551}},
{area:"Punto de Venta",cat:"Exhibidores",budget:113358586,m:{"Jul 25":0,"Ago 25":0,"Sep 25":0,"Oct 25":0,"Nov 25":0,"Dic 25":0}},
{area:"Punto de Venta",cat:"Impresiones",budget:35629437,m:{"Jul 25":2361684,"Ago 25":2490589,"Sep 25":2756866,"Oct 25":2794503,"Nov 25":2907412,"Dic 25":2992094}},
{area:"Punto de Venta",cat:"Regalos fin de año",budget:19359593,m:{"Jul 25":6008728,"Ago 25":6336694,"Sep 25":7014172,"Oct 25":0,"Nov 25":0,"Dic 25":0}},
{area:"Punto de Venta",cat:"Almanaques",budget:10372197,m:{"Jul 25":3219267,"Ago 25":3394980,"Sep 25":3757950,"Oct 25":0,"Nov 25":0,"Dic 25":0}},
{area:"Punto de Venta",cat:"Cartapacios",budget:38087435,m:{"Jul 25":2524611,"Ago 25":2662409,"Sep 25":2947056,"Oct 25":2987289,"Nov 25":3107988,"Dic 25":3198512}},
{area:"Punto de Venta",cat:"Merchandising",budget:62940010,m:{"Jul 25":4171955,"Ago 25":4399667,"Sep 25":4870051,"Oct 25":4936537,"Nov 25":5135993,"Dic 25":5285585}}
];
function withAllMonths(row){const m={};MONTHS.forEach(month=>m[month]=Number((row.m||{})[month]||0));return {...row,m,note:row.note||""};}
let DATA=loadData();
function loadData(){const saved=localStorage.getItem(STORAGE_KEY);if(saved){try{return JSON.parse(saved).map(withAllMonths);}catch(e){}}return BASE_DATA.map(withAllMonths);}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(DATA));}
function ytd(m){return MONTHS.reduce((acc,month)=>acc+Number(m[month]||0),0);}
function lastLoadedMonthIndex(){let idx=-1;DATA.forEach(r=>MONTHS.forEach((month,i)=>{if(Number(r.m[month]||0)>0 && i>idx) idx=i;}));return idx;}
function forecast(m){
  const y=ytd(m);
  const cutoff=Math.max(0,lastLoadedMonthIndex()+1);
  const monthsElapsed=cutoff===0?1:cutoff;
  const monthsRemaining=Math.max(0,12-monthsElapsed);
  return Math.round(y + ((y/monthsElapsed)*monthsRemaining));
}
function pct(y,b){return b?(y/b)*100:0;}
function money(n){return fmt.format(Number(n||0));}
function trafficClass(v){if(v<50) return 'bad'; if(v<75) return 'warn'; return 'ok';}
function trafficLabel(v){const cls=trafficClass(v);return cls==='bad'?'Rojo':cls==='warn'?'Amarillo':'Verde';}
function trafficChip(v){
  const cls=trafficClass(v);
  return '<span class="traffic-chip '+cls+'"><span class="dot"></span>'+v.toFixed(1)+' %</span>';
}
function groups(){const g={};DATA.forEach(r=>{if(!g[r.area])g[r.area]=[];g[r.area].push(r);});return g;}
function renderCards(){
  const budget=DATA.reduce((a,r)=>a+r.budget,0);
  const totalYTD=DATA.reduce((a,r)=>a+ytd(r.m),0);
  const totalForecast=DATA.reduce((a,r)=>a+forecast(r.m),0);
  const totalPct=pct(totalYTD,budget);
  const pctCls=trafficClass(totalPct);
  document.getElementById("cards").innerHTML=[
    {label:"Budget anual",value:money(budget),sub:"Presupuesto total cargado",cls:""},
    {label:"Gastado YTD",value:money(totalYTD),sub:"Acumulado ejecutado",cls:""},
    {label:"Disponible",value:money(budget-totalYTD),sub:"Saldo presupuestario",cls:""},
    {label:"% cumplimiento",value:totalPct.toFixed(1)+"%",sub:trafficLabel(totalPct),cls:pctCls},
    {label:"Forecast*",value:money(totalForecast),sub:(totalForecast-budget>=0?"+":"")+money(totalForecast-budget)+" vs budget",cls:""}
  ].map(c=>'<div class="card"><div class="label">'+c.label+'</div><div class="value '+(c.cls||'')+'">'+c.value+'</div><div class="sub">'+c.sub+'</div></div>').join("");
  document.getElementById("meterBudget").textContent=money(budget);
  document.getElementById("meterForecast").textContent=money(totalForecast);
  document.getElementById("meterForecastFill").style.width=Math.min(100,budget?(totalForecast/budget)*100:0)+"%";
  document.getElementById("miniStats").innerHTML='<div class="mini"><div class="k">Diferencia</div><div class="v">'+((totalForecast-budget>=0?"+":"")+money(totalForecast-budget))+'</div></div><div class="mini"><div class="k">Proyección</div><div class="v">'+(budget?(((totalForecast/budget)-1)*100).toFixed(1):"0.0")+'%</div></div><div class="mini"><div class="k">Estado</div><div class="v">'+trafficLabel(totalPct)+'</div></div>';
}
function tdMonth(value){return '<td class="month-col">'+money(value)+'</td>';}
function renderTable(){
  const tbody=document.querySelector("#budgetTable tbody");let html="";const g=groups();
  Object.keys(g).forEach(area=>{
    const rows=g[area];
    const areaMonths={};MONTHS.forEach(month=>areaMonths[month]=rows.reduce((a,r)=>a+Number(r.m[month]||0),0));
    const areaYTD=rows.reduce((a,r)=>a+ytd(r.m),0);
    const areaBudget=rows.reduce((a,r)=>a+r.budget,0);
    const areaForecast=rows.reduce((a,r)=>a+forecast(r.m),0);
    const areaPct=pct(areaYTD,areaBudget);
    html+='<tr class="area-row"><td class="sticky-left left-area">'+area+'</td><td class="sticky-left left-cat muted">Resumen del área</td>'+MONTHS.map(month=>tdMonth(areaMonths[month])).join("")+'<td class="right-ytd">'+money(areaYTD)+'</td><td class="right-budget">'+money(areaBudget)+'</td><td class="right-pct">'+trafficChip(areaPct)+'</td><td class="right-forecast">'+money(areaForecast)+'</td></tr>';
    rows.forEach((r,idx)=>{
      const rowYTD=ytd(r.m);const rowPct=pct(rowYTD,r.budget);const rowForecast=forecast(r.m);
      html+='<tr><td class="sticky-left left-area">'+(idx===0?area:"")+'</td><td class="sticky-left left-cat">'+r.cat+'</td>'+MONTHS.map(month=>tdMonth(r.m[month])).join("")+'<td class="right-ytd">'+money(rowYTD)+'</td><td class="right-budget">'+money(r.budget)+'</td><td class="right-pct">'+trafficChip(rowPct)+'</td><td class="right-forecast">'+money(rowForecast)+'</td></tr>';
    });
    html+='<tr class="subtotal-row"><td class="sticky-left left-area">'+area+'</td><td class="sticky-left left-cat">Subtotal '+area+'</td>'+MONTHS.map(month=>tdMonth(areaMonths[month])).join("")+'<td class="right-ytd">'+money(areaYTD)+'</td><td class="right-budget">'+money(areaBudget)+'</td><td class="right-pct">'+trafficChip(areaPct)+'</td><td class="right-forecast">'+money(areaForecast)+'</td></tr><tr class="group-gap"><td colspan="18"></td></tr>';
  });
  const totalBudget=DATA.reduce((a,r)=>a+r.budget,0);
  const totalYTD=DATA.reduce((a,r)=>a+ytd(r.m),0);
  const totalForecast=DATA.reduce((a,r)=>a+forecast(r.m),0);
  const totalPct=pct(totalYTD,totalBudget);
  const totalMonths={};MONTHS.forEach(month=>totalMonths[month]=DATA.reduce((a,r)=>a+Number(r.m[month]||0),0));
  html+='<tr class="total-row"><td class="sticky-left left-area">Total</td><td class="sticky-left left-cat">General</td>'+MONTHS.map(month=>tdMonth(totalMonths[month])).join("")+'<td class="right-ytd">'+money(totalYTD)+'</td><td class="right-budget">'+money(totalBudget)+'</td><td class="right-pct">'+trafficChip(totalPct)+'</td><td class="right-forecast">'+money(totalForecast)+'</td></tr>';
  tbody.innerHTML=html;
  applyMonthVisibility();
}
function renderRankings(){
  const deviation=DATA.map(r=>{
    const p=pct(ytd(r.m), r.budget);
    let severity=0;
    if(p>100) severity=p-100;
    else if(p<20) severity=20-p;
    return {name:r.cat,pctExec:p,severity};
  }).filter(r=>r.severity>0).sort((a,b)=>b.severity-a.severity).slice(0,5);

  document.getElementById("rankingSpend").innerHTML=[...DATA].map(r=>({name:r.cat,value:ytd(r.m)})).sort((a,b)=>b.value-a.value).slice(0,5).map((item,i)=>'<div class="rank-item"><div class="rank-left"><div class="rank-num">'+(i+1)+'</div><div class="rank-name">'+item.name+'</div></div><div class="rank-value">'+money(item.value)+'</div></div>').join("");

  document.getElementById("rankingDeviation").innerHTML=deviation.length
    ? deviation.map((item,i)=>'<div class="rank-item"><div class="rank-left"><div class="rank-num">'+(i+1)+'</div><div class="rank-name">'+item.name+'</div></div><div class="rank-value">'+item.pctExec.toFixed(1)+'%</div></div>').join("")
    : '<div class="rank-item"><div class="rank-left"><div class="rank-name">Sin desvíos relevantes</div></div><div class="rank-value">OK</div></div>';
}
function renderAreaTraffic(){
  const g=groups();
  const items=Object.keys(g).map(area=>{
    const rows=g[area];
    const areaYTD=rows.reduce((a,r)=>a+ytd(r.m),0);
    const areaBudget=rows.reduce((a,r)=>a+r.budget,0);
    const areaPct=pct(areaYTD,areaBudget);
    return {area,pct:areaPct,cls:trafficClass(areaPct)};
  });
  document.getElementById("areaTraffic").innerHTML=items.map(item=>'<div class="traffic-item"><div class="traffic-left"><div class="traffic-dot '+item.cls+'"></div><div class="traffic-name">'+item.area+'</div></div><div class="traffic-value">'+item.pct.toFixed(1)+'%</div></div>').join("");
}
function renderMonthlyChart(){
  const svg=document.getElementById("monthlyChart");
  if(!svg) return;
  const width=760, height=260, left=46, right=16, top=14, bottom=34;
  const chartW=width-left-right, chartH=height-top-bottom;
  const totals=MONTHS.map(month=>DATA.reduce((a,r)=>a+Number(r.m[month]||0),0));
  const max=Math.max.apply(null, totals.concat([1]));
  const step=chartW/totals.length;
  let out='';
  [0,0.25,0.5,0.75,1].forEach(p=>{
    const y=top + chartH*(1-p);
    out+='<line class="chart-grid" x1="'+left+'" y1="'+y+'" x2="'+(left+chartW)+'" y2="'+y+'"></line>';
    const val=Math.round((max*p)/1000000);
    out+='<text class="chart-axis" x="2" y="'+(y+4)+'">'+val+'M</text>';
  });
  totals.forEach((v,i)=>{
    const bw=step*0.62;
    const x=left + i*step + (step-bw)/2;
    const h=(v/max)*chartH;
    const y=top + chartH - h;
    out+='<rect class="chart-bar'+(i%2?' alt':'')+'" x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="6"></rect>';
    out+='<text class="chart-axis" x="'+(x+bw/2)+'" y="'+(height-10)+'" text-anchor="middle">'+MONTHS[i].split(' ')[0]+'</text>';
  });
  svg.innerHTML=out;
}
function exportCSV(){
  const header=["Área","Categoría"].concat(MONTHS).concat(["YTD","Budget","%","Forecast"]);
  const rows=DATA.map(r=>{
    const yy=ytd(r.m);
    return [r.area,r.cat].concat(MONTHS.map(month=>r.m[month])).concat([yy,r.budget,pct(yy,r.budget).toFixed(1)+"%",forecast(r.m)]);
  });
  const csv=[header].concat(rows).map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="aliafor_dashboard_budget.csv";a.click();
  URL.revokeObjectURL(url);
}
function populateModal(){
  document.getElementById("monthSelect").innerHTML=MONTHS.map(month=>'<option value="'+month+'">'+month+'</option>').join("");
  document.getElementById("catSelect").innerHTML=DATA.map(row=>'<option value="'+row.cat+'">'+row.cat+'</option>').join("");
}
function openModal(){document.getElementById("modal").classList.remove("hidden");}
function closeModal(){document.getElementById("modal").classList.add("hidden");}
function saveInput(){
  const month=document.getElementById("monthSelect").value;
  const cat=document.getElementById("catSelect").value;
  const amount=Number(document.getElementById("amountInput").value||0);
  const note=document.getElementById("noteInput").value||"";
  const row=DATA.find(r=>r.cat===cat);
  if(row){row.m[month]=amount;row.note=note;persist();renderAll();}
  document.getElementById("amountInput").value="";
  document.getElementById("noteInput").value="";
  closeModal();
}
function applyMonthVisibility(){
  const checked=document.getElementById("toggleMonths").checked;
  document.body.classList.toggle("hide-months", !checked);
}
function renderAll(){renderCards();renderTable();renderRankings();renderAreaTraffic();renderMonthlyChart();}
document.getElementById("btnExport").addEventListener("click",exportCSV);
document.getElementById("btnAdd").addEventListener("click",openModal);
document.getElementById("btnCancel").addEventListener("click",closeModal);
document.getElementById("btnSave").addEventListener("click",saveInput);
document.getElementById("toggleMonths").addEventListener("change",applyMonthVisibility);
populateModal();renderAll();
