
async function loadJSON(path){
  const url = path + (path.includes('?')?'&':'?') + 'v=' + Date.now();
  const res = await fetch(url, {cache:'no-store'});
  if(!res.ok) throw new Error('No se pudo cargar '+path+' ('+res.status+')');
  return res.json();
}
function computeTable(teams, matches){
  const t={}; teams.forEach(x=>t[x.name]={team:x.name,PJ:0,G:0,E:0,P:0,GF:0,GC:0,DG:0,PTS:0});
  matches.forEach(m=>{
    if(m.goals_home==null || m.goals_away==null) return;
    const a=t[m.home], b=t[m.away];
    a.PJ++; b.PJ++; a.GF+=m.goals_home; a.GC+=m.goals_away; b.GF+=m.goals_away; b.GC+=m.goals_home;
    if(m.goals_home>m.goals_away){a.G++; a.PTS+=3; b.P++;}
    else if(m.goals_home<m.goals_away){b.G++; b.PTS+=3; a.P++;}
    else {a.E++; b.E++; a.PTS++; b.PTS++;}
  });
  Object.values(t).forEach(r=>r.DG=r.GF-r.GC);
  return Object.values(t).sort((a,b)=> b.PTS-a.PTS || b.DG-a.DG || b.GF-a.GF || a.team.localeCompare(b.team));
}
async function initTable(){ const teams=await loadJSON('data/equipos.json'); const matches=await loadJSON('data/partidos.json'); const mount=document.getElementById('tabla-mount'); if(mount) mount.innerHTML=''; if(mount) renderTable(computeTable(teams,matches), mount); }
function renderTable(rows, el){
  const thead=`<thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>PTS</th></tr></thead>`;
  const tbody=rows.map((r,i)=>`<tr><td>${i+1}</td><td>${r.team}</td><td>${r.PJ}</td><td>${r.G}</td><td>${r.E}</td><td>${r.P}</td><td>${r.GF}</td><td>${r.GC}</td><td>${r.DG}</td><td><b>${r.PTS}</b></td></tr>`).join('');
  el.innerHTML = `<table class="table">${thead}<tbody>${tbody}</tbody></table>`;
}
async function renderFixtures(){
  const matches = await loadJSON('data/partidos.json');
  const byDate = matches.reduce((acc,m)=>{const d=m.date||'Sin fecha'; (acc[d]=acc[d]||[]).push(m); return acc;},{});
  const c=document.getElementById('fixtures-mount'); if(!c) return;
  let html=''; Object.keys(byDate).sort().forEach(d=>{
    html+=`<h3>${d}</h3><div class="card">`;
    html+='<table class="table"><thead><tr><th>Hora</th><th>Local</th><th></th><th>Visitante</th><th>Sede</th></tr></thead><tbody>';
    byDate[d].forEach(m=>{ const s=(m.goals_home==null||m.goals_away==null)?'vs':`${m.goals_home} - ${m.goals_away}`;
      html+=`<tr><td>${m.time||''}</td><td>${m.home}</td><td><b>${s}</b></td><td>${m.away}</td><td>${m.venue||''}</td></tr>`; });
    html+='</tbody></table></div>';
  }); c.innerHTML=html;
}
