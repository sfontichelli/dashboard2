const STORAGE_KEY="aliafor-dashboard-cloud-v7";
const fmt=new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0});
const MONTHS=["Jul 25","Ago 25","Sep 25","Oct 25","Nov 25","Dic 25","Ene 26","Feb 26","Mar 26","Abr 26","May 26","Jun 26"];
const MONTH_MAP={"07-25":"Jul 25","08-25":"Ago 25","09-25":"Sep 25","10-25":"Oct 25","11-25":"Nov 25","12-25":"Dic 25","01-26":"Ene 26","02-26":"Feb 26","03-26":"Mar 26","04-26":"Abr 26","05-26":"May 26","06-26":"Jun 26"};
const BASE_DATA=[
{area:"Online",cat:"Marketing digital",budget:18933500,m:{}},
{area:"Online",cat:"Contenidos",budget:24532500,m:{}},
{area:"Online",cat:"Online",budget:422468,m:{}},
{area:"Online",cat:"Agencia",budget:14570917,m:{}},
{area:"Online",cat:"Ecommerce",budget:2714987,m:{}},
{area:"Otros",cat:"Expos",budget:36961700,m:{}},
{area:"Otros",cat:"Diseño – equipo",budget:32757084,m:{}},
{area:"Otros",cat:"Revistas",budget:9987858,m:{}},
{area:"Punto de Venta",cat:"Ploteos",budget:41457831,m:{}},
{area:"Punto de Venta",cat:"Exhibidores",budget:113358586,m:{}},
{area:"Punto de Venta",cat:"Impresiones",budget:35629437,m:{}},
{area:"Punto de Venta",cat:"Regalos fin de año",budget:19359593,m:{}},
{area:"Punto de Venta",cat:"Almanaques",budget:10372197,m:{}},
{area:"Punto de Venta",cat:"Cartapacios",budget:38087435,m:{}},
{area:"Punto de Venta",cat:"Merchandising",budget:62940010,m:{}}
];
function withAllMonths(row){const m={};MONTHS.forEach(month=>m[month]=Number((row.m||{})[month]||0));return {...row,m,note:row.note||""};}
let DATA=BASE_DATA.map(withAllMonths);
function getApiUrl(){return window.APP_CONFIG && window.APP_CONFIG.API_URL && !window.APP_CONFIG.API_URL.includes("PEGAR_AQUI") ? window.APP_CONFIG.API_URL : "";}
function setCloudStatus(text){const el=document.getElementById("cloudStatus"); if(el) el.textContent=text;}
function ytd(m){return MONTHS.reduce((acc,month)=>acc+Number(m[month]||0),0);}
function lastLoadedMonthIndex(){let idx=-1;DATA.forEach(r=>MONTHS.forEach((month,i)=>{if(Number(r.m[month]||0)>0 && i>idx) idx=i;}));return idx;}
function pct(y,b){return b?(y/b)*100:0;}
function money(n){return fmt.format(Number(n||0));}
function trafficClass(v){if(v<50) return 'bad'; if(v<75) return 'warn'; return 'ok';}
function trafficLabel(v){const cls=trafficClass(v);return cls==='bad'?'Rojo':cls==='warn'?'Amarillo':'Verde';}
function trafficChip(v){const cls=trafficClass(v);return '<span class="traffic-chip '+cls+'"><span class="dot"></span>'+v.toFixed(1)+' %</span>';}
function forecast(row){
  const y=ytd(row.m);
  if(y >= row.budget) return y;
  const cutoff=Math.max(0,lastLoadedMonthIndex()+1);
  const monthsElapsed=cutoff===0?1:cutoff;
  const monthsRemaining=Math.max(0,12-monthsElapsed);
  return Math.round(y + ((y/monthsElapsed)*monthsRemaining));
}
function forecastHtml(row){const y=ytd(row.m);const f=forecast(row);return '<span class="'+(y>=row.budget?'forecast-stop':'')+'">'+money(f)+'</span>';}
function groups(){const g={};DATA.forEach(r=>{if(!g[r.area])g[r.area]=[];g[r.area].push(r);});return g;}
function normalizeSheetMonth(raw){
  if(raw === null || raw === undefined) return "";
  const s=String(raw).trim();
  if(MONTHS.includes(s)) return s;
  let match=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(match){
    const yyyy=match[1], mm=match[2], yy=yyyy.slice(2);
    return MONTH_MAP[mm+"-"+yy] || "";
  }
  const d=new Date(s);
  if(!isNaN(d.getTime())){
    const mm=String(d.getMonth()+1).padStart(2,"0");
    const yy=String(d.getFullYear()).slice(2);
    return MONTH_MAP[mm+"-"+yy] || "";
  }
  return "";
}
async function loadCloudData(){
  const api=getApiUrl();
  if(!api){ setCloudStatus("Modo local"); return false; }
  try{
    const res=await fetch(api,{method:"GET"});
    const payload=await res.json();
    const budgetRows=(payload.budget||[]).slice(1);
    const movRows=(payload.movimientos||[]).slice(1);
    let fresh=BASE_DATA.map(withAllMonths);

    if(budgetRows.length){
      budgetRows.forEach(r=>{
        const area=(r[0]||"").toString().trim();
        const cat=(r[1]||"").toString().trim();
        const budget=Number(r[2]||0);
        const existing=fresh.find(x=>x.cat===cat);
        if(existing){
          existing.area=area||existing.area;
          existing.budget=budget||existing.budget;
        }
      });
    }

    movRows.forEach(r=>{
      const mes=normalizeSheetMonth(r[0]);
      const area=(r[1]||"").toString().trim();
      const cat=(r[2]||"").toString().trim();
      const monto=Number(r[3]||0);
      const obs=(r[4]||"").toString();
      const existing=fresh.find(x=>x.cat===cat);
      if(existing && MONTHS.includes(mes)){
        existing.area=area||existing.area;
        existing.m[mes]=(existing.m[mes] || 0) + monto;
        existing.note=obs||existing.note;
      }
    });

    DATA=fresh.map(withAllMonths);
    setCloudStatus("Google Sheets conectado");
    return true;
  }catch(e){
    console.error("GET cloud error", e);
    setCloudStatus("Error de conexión");
    return false;
  }
}
function saveLocal(){localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));}
function loadLocalFallback(){
  const saved=localStorage.getItem(STORAGE_KEY);
  if(saved){ try{ DATA=JSON.parse(saved).map(withAllMonths); setCloudStatus("Modo local"); return true; }catch(e){} }
  DATA=BASE_DATA.map(withAllMonths); setCloudStatus("Modo local"); return true;
}
function renderCards(){
  const budget=DATA.reduce((a,r)=>a+r.budget,0);
  const totalYTD=DATA.reduce((a,r)=>a+ytd(r.m),0);
  const totalForecast=DATA.reduce((a,r)=>a+forecast(r),0);
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
    const areaForecast=rows.reduce((a,r)=>a+forecast(r),0);
    const areaPct=pct(areaYTD,areaBudget);
    html+='<tr class="area-row"><td class="sticky-left left-area">'+area+'</td><td class="sticky-left left-cat muted">Resumen del área</td>'+MONTHS.map(month=>tdMonth(areaMonths[month])).join("")+'<td class="right-ytd">'+money(areaYTD)+'</td><td class="right-budget">'+money(areaBudget)+'</td><td class="right-pct">'+trafficChip(areaPct)+'</td><td class="right-forecast">'+money(areaForecast)+'</td></tr>';
    rows.forEach((r,idx)=>{
      const rowYTD=ytd(r.m);const rowPct=pct(rowYTD,r.budget);
      html+='<tr><td class="sticky-left left-area">'+(idx===0?area:"")+'</td><td class="sticky-left left-cat">'+r.cat+'</td>'+MONTHS.map(month=>tdMonth(r.m[month])).join("")+'<td class="right-ytd">'+money(rowYTD)+'</td><td class="right-budget">'+money(r.budget)+'</td><td class="right-pct">'+trafficChip(rowPct)+'</td><td class="right-forecast">'+forecastHtml(r)+'</td></tr>';
    });
    html+='<tr class="subtotal-row"><td class="sticky-left left-area">'+area+'</td><td class="sticky-left left-cat">Subtotal '+area+'</td>'+MONTHS.map(month=>tdMonth(areaMonths[month])).join("")+'<td class="right-ytd">'+money(areaYTD)+'</td><td class="right-budget">'+money(areaBudget)+'</td><td class="right-pct">'+trafficChip(areaPct)+'</td><td class="right-forecast">'+money(areaForecast)+'</td></tr><tr class="group-gap"><td colspan="18"></td></tr>';
  });
  const totalBudget=DATA.reduce((a,r)=>a+r.budget,0);
  const totalYTD=DATA.reduce((a,r)=>a+ytd(r.m),0);
  const totalForecast=DATA.reduce((a,r)=>a+forecast(r),0);
  const totalPct=pct(totalYTD,totalBudget);
  const totalMonths={};MONTHS.forEach(month=>totalMonths[month]=DATA.reduce((a,r)=>a+Number(r.m[month]||0),0));
  html+='<tr class="total-row"><td class="sticky-left left-area">Total</td><td class="sticky-left left-cat">General</td>'+MONTHS.map(month=>tdMonth(totalMonths[month])).join("")+'<td class="right-ytd">'+money(totalYTD)+'</td><td class="right-budget">'+money(totalBudget)+'</td><td class="right-pct">'+trafficChip(totalPct)+'</td><td class="right-forecast">'+money(totalForecast)+'</td></tr>';
  tbody.innerHTML=html;
  applyMonthVisibility();
}
function renderRankings(){
  const deviation=DATA.map(r=>{
    const p=pct(ytd(r.m), r.budget); let severity=0;
    if(p>100) severity=p-100; else if(p<20) severity=20-p;
    return {name:r.cat,pctExec:p,severity};
  }).filter(r=>r.severity>0).sort((a,b)=>b.severity-a.severity).slice(0,5);
  document.getElementById("rankingSpend").innerHTML=[...DATA].map(r=>({name:r.cat,value:ytd(r.m)})).sort((a,b)=>b.value-a.value).slice(0,5).map((item,i)=>'<div class="rank-item"><div class="rank-left"><div class="rank-num">'+(i+1)+'</div><div class="rank-name">'+item.name+'</div></div><div class="rank-value">'+money(item.value)+'</div></div>').join("");
  document.getElementById("rankingDeviation").innerHTML=deviation.length ? deviation.map((item,i)=>'<div class="rank-item"><div class="rank-left"><div class="rank-num">'+(i+1)+'</div><div class="rank-name">'+item.name+'</div></div><div class="rank-value">'+item.pctExec.toFixed(1)+'%</div></div>').join("") : '<div class="rank-item"><div class="rank-left"><div class="rank-name">Sin desvíos relevantes</div></div><div class="rank-value">OK</div></div>';
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
  document.getElementById("areaTraffic").innerHTML=items.map(item=>'<div class="traffic-item"><div class="traffic-left"><div class="traffic-dot '+item.cls+'"></div><div class="traffic-name">'+item.area+'</div></div><div class="traffic-value">'+trafficLabel(item.pct)+' · '+item.pct.toFixed(1)+'%</div></div>').join("");
}
function renderMonthlyChart(){
  const svg=document.getElementById("monthlyChart"); if(!svg) return;
  const width=760, height=260, left=46, right=16, top=14, bottom=34;
  const chartW=width-left-right, chartH=height-top-bottom;
  const totals=MONTHS.map(month=>DATA.reduce((a,r)=>a+Number(r.m[month]||0),0));
  const max=Math.max.apply(null, totals.concat([1])); const step=chartW/totals.length; let out='';
  [0,0.25,0.5,0.75,1].forEach(p=>{ const y=top + chartH*(1-p); out+='<line class="chart-grid" x1="'+left+'" y1="'+y+'" x2="'+(left+chartW)+'" y2="'+y+'"></line>'; const val=Math.round((max*p)/1000000); out+='<text class="chart-axis" x="2" y="'+(y+4)+'">'+val+'M</text>'; });
  totals.forEach((v,i)=>{ const bw=step*0.62; const x=left + i*step + (step-bw)/2; const h=(v/max)*chartH; const y=top + chartH - h; out+='<rect class="chart-bar'+(i%2?' alt':'')+'" x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="6"></rect>'; out+='<text class="chart-axis" x="'+(x+bw/2)+'" y="'+(height-10)+'" text-anchor="middle">'+MONTHS[i].split(' ')[0]+'</text>'; });
  svg.innerHTML=out;
}
function exportCSV(){
  const header=["Área","Categoría"].concat(MONTHS).concat(["YTD","Budget","%","Forecast"]);
  const rows=DATA.map(r=>{ const yy=ytd(r.m); return [r.area,r.cat].concat(MONTHS.map(month=>r.m[month])).concat([yy,r.budget,pct(yy,r.budget).toFixed(1)+"%",forecast(r)]); });
  const csv=[header].concat(rows).map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url;a.download="aliafor_dashboard_budget.csv";a.click(); URL.revokeObjectURL(url);
}
function exportPdf(){window.print();}
function populateModal(){ document.getElementById("monthSelect").innerHTML=MONTHS.map(month=>'<option value="'+month+'">'+month+'</option>').join(""); document.getElementById("catSelect").innerHTML=DATA.map(row=>'<option value="'+row.cat+'">'+row.cat+'</option>').join(""); }
function openModal(){document.getElementById("modal").classList.remove("hidden");}
function closeModal(){document.getElementById("modal").classList.add("hidden");}
async function saveInput(){
  const month=document.getElementById("monthSelect").value;
  const cat=document.getElementById("catSelect").value;
  const amount=Number(document.getElementById("amountInput").value||0);
  const note=document.getElementById("noteInput").value||"";
  const row=DATA.find(r=>r.cat===cat);
  if(row){
    row.m[month]=amount; row.note=note;
    const api=getApiUrl();
    if(api){
      try{
        const res=await fetch(api,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({mes:month,area:row.area,categoria:cat,monto:amount,observacion:note}),redirect:"follow"});
        const txt=await res.text();
        console.log("POST response:", txt);
        setCloudStatus("Google Sheets conectado");
      }catch(e){
        console.error("POST cloud error", e); saveLocal(); setCloudStatus("Error de conexión");
      }
    }else{ saveLocal(); }
    renderAll();
  }
  document.getElementById("amountInput").value=""; document.getElementById("noteInput").value=""; closeModal();
}
function applyMonthVisibility(){ const checked=document.getElementById("toggleMonths").checked; document.body.classList.toggle("hide-months", !checked); }
function renderAll(){ renderCards(); renderTable(); renderRankings(); renderAreaTraffic(); renderMonthlyChart(); }
document.getElementById("btnExport").addEventListener("click",exportCSV);
document.getElementById("btnPdf").addEventListener("click",exportPdf);
document.getElementById("btnAdd").addEventListener("click",openModal);
document.getElementById("btnCancel").addEventListener("click",closeModal);
document.getElementById("btnSave").addEventListener("click",saveInput);
document.getElementById("toggleMonths").addEventListener("change",applyMonthVisibility);
populateModal();
(async function init(){ const cloud=await loadCloudData(); if(!cloud) loadLocalFallback(); renderAll(); })();
