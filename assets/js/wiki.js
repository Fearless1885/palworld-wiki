/* Palworld Wiki logic. Data lives in /data/skills.js and /data/pals.js */

/* ---------- Tabs ---------- */
(function(){
  const btns = [document.getElementById('tabBtnSkills'), document.getElementById('tabBtnPals')];
  const panels = [document.getElementById('panelSkills'), document.getElementById('panelPals')];
  btns.forEach((btn,i)=>btn.addEventListener('click',()=>{
    btns.forEach((b,j)=>{
      b.classList.toggle('active', j===i);
      b.setAttribute('aria-selected', j===i);
      panels[j].classList.toggle('active', j===i);
    });
    window.scrollTo({top:0,behavior:'smooth'});
  }));
})();

/* ---------- Tab 1: Passive Skills ---------- */
(function(){
const CAT_NAMES = {
  combat:"Combat", work:"Work & Base", movement:"Movement", upkeep:"Hunger & Sanity",
  mount:"Mount Stamina", player:"Player Buff", "elem-atk":"Element ATK",
  "elem-def":"Element Resist", trade:"Trade & Breeding", exclusive:"Exclusive"
};
const TIER_ORDER = {"W":0,"R":1,"3":2,"2":3,"1":4,"-1":5,"-2":6,"-3":7};

const grid = document.getElementById('skillGrid');
const q = document.getElementById('skillQ');
const shownEl = document.getElementById('skillShown');
const totalEl = document.getElementById('skillTotal');
totalEl.textContent = SKILLS.length;

let activeTiers = new Set();
let activeCats = new Set();

function tierBadge(t){
  if(t==="W") return `<span class="tier-badge wt">❋ World Tree</span>`;
  if(t==="R") return `<span class="tier-badge rb">✦ Rainbow</span>`;
  const num = parseInt(t,10);
  const cls = num>0 ? "pos" : "neg";
  const arrows = (num>0?"▲":"▼").repeat(Math.abs(num));
  return `<span class="tier-badge ${cls}">${arrows} Tier ${num>0?"+"+num:num}</span>`;
}

function render(){
  const term = q.value.trim().toLowerCase();
  const items = SKILLS.filter(s=>{
    if(activeTiers.size && !activeTiers.has(s.t)) return false;
    if(activeCats.size && !s.cat.some(c=>activeCats.has(c))) return false;
    if(term){
      const hay = (s.n+" "+s.fx.map(f=>f[1]).join(" ")+" "+(s.src||"")).toLowerCase();
      if(!hay.includes(term)) return false;
    }
    return true;
  }).sort((a,b)=> TIER_ORDER[a.t]-TIER_ORDER[b.t] || a.n.localeCompare(b.n));

  shownEl.textContent = items.length;

  if(!items.length){
    grid.innerHTML = `<div class="empty"><b>No passives match</b>Try clearing a filter or shortening your search.</div>`;
    return;
  }

  grid.innerHTML = items.map(s=>{
    const fx = s.fx.map(([k,txt])=>{
      const cls = k==="g"?"good":k==="b"?"bad":"info";
      const dot = k==="g"?"+":k==="b"?"−":"•";
      return `<div class="fx ${cls}"><span class="dot">${dot}</span><span>${txt}</span></div>`;
    }).join("");
    const src = s.src ? `<div class="source">${s.src}</div>` : "";
    const tags = s.cat.map(c=>`<span class="tag">${CAT_NAMES[c]}</span>`).join("");
    return `<article class="card ${s.t==="R"?"rainbow":s.t==="W"?"worldtree":""}">
      <div class="card-top">
        <h3 class="skill-name">${s.n}</h3>
        ${tierBadge(s.t)}
      </div>
      <div class="effects">${fx}</div>
      ${src}
      <div class="tags">${tags}</div>
    </article>`;
  }).join("");
}

function wireChips(containerId, set, key){
  document.getElementById(containerId).addEventListener('click', e=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    const val = btn.dataset[key];
    if(set.has(val)){ set.delete(val); btn.classList.remove('on'); }
    else { set.add(val); btn.classList.add('on'); }
    render();
  });
}
wireChips('tierChips', activeTiers, 'tier');
wireChips('catChips', activeCats, 'cat');

document.getElementById('skillClearAll').addEventListener('click', ()=>{
  activeTiers.clear(); activeCats.clear(); q.value="";
  document.querySelectorAll('.chip.on').forEach(c=>c.classList.remove('on'));
  render();
});
q.addEventListener('input', render);

render();

document.getElementById('tabCountSkills').textContent = SKILLS.length;
})();

/* ---------- Tab 2: Pals & Roles ---------- */
(function(){
/* Tooltip text for passive chips */
const ROLE_NAMES = {combat:["Combat","r-combat"],worker:["Base Worker","r-worker"],fly:["Flying Mount","r-mount"],ground:["Ground Mount","r-mount"],water:["Water Mount","r-mount"],ranch:["Ranch","r-ranch"],transport:["Transport","r-worker"],dual:["Dual-Use","r-worker"],early:["Early Game","r-early"],endgame:["Raid / Endgame","r-combat"]};

const grid=document.getElementById('palGrid'),q=document.getElementById('palQ');
const shownEl=document.getElementById('palShown');
document.getElementById('palTotal').textContent=PALS.length;
let activeRoles=new Set();

function pvChip(name,cls){
  const tip=PV[name]||"";
  return `<span class="pv ${cls}" title="${tip.replace(/"/g,'&quot;')}">${name}</span>`;
}

function render(){
  const term=q.value.trim().toLowerCase();
  const items=PALS.filter(p=>{
    if(activeRoles.size && !p.roles.some(r=>activeRoles.has(r))) return false;
    if(term){
      const hay=(p.n+" "+p.why+" "+p.suits+" "+p.roles.map(r=>ROLE_NAMES[r][0]).join(" ")+" "
        +p.b.ideal.join(" ")+" "+(p.b.alt||[]).join(" ")).toLowerCase();
      if(!hay.includes(term)) return false;
    }
    return true;
  });
  shownEl.textContent=items.length;
  if(!items.length){
    grid.innerHTML=`<div class="empty"><b>No Pals match</b>Try clearing a filter or shortening your search.</div>`;
    return;
  }
  grid.innerHTML=items.map(p=>{
    const els=p.el.map(e=>`<span class="el el-${e}" title="${e[0].toUpperCase()+e.slice(1)}"></span>`).join("");
    const roles=p.roles.map(r=>`<span class="role ${ROLE_NAMES[r][1]}">${ROLE_NAMES[r][0]}</span>`).join("");
    const ideal=p.b.ideal.map(n=>pvChip(n,"ideal")).join("");
    const alt=(p.b.alt||[]).map(n=>pvChip(n,"alt")).join("");
    const note=p.note?`<div class="build-note">${p.note}</div>`:"";
    return `<article class="card ${p.lg?"legendary":""}">
      <div class="card-top">
        <h3 class="pal-name">${p.n}</h3>
        <div class="elems">${els}</div>
      </div>
      <div class="roles">${roles}</div>
      <div class="suits"><b>Work:</b> ${p.suits}</div>
      <p class="why">${p.why}</p>
      <details class="build">
        <summary>Recommended passives</summary>
        <div class="build-group"><div class="build-h">Ideal build (4 slots)</div><div class="passives">${ideal}</div></div>
        ${alt?`<div class="build-group"><div class="build-h">Also usable / budget</div><div class="passives">${alt}</div></div>`:""}
        ${note}
      </details>
    </article>`;
  }).join("");
}

document.getElementById('roleChips').addEventListener('click',e=>{
  const btn=e.target.closest('.chip'); if(!btn) return;
  const val=btn.dataset.role;
  if(activeRoles.has(val)){activeRoles.delete(val);btn.classList.remove('on');}
  else{activeRoles.add(val);btn.classList.add('on');}
  render();
});
document.getElementById('palClearAll').addEventListener('click',()=>{
  activeRoles.clear();q.value="";
  document.querySelectorAll('.chip.on').forEach(c=>c.classList.remove('on'));
  render();
});
q.addEventListener('input',render);
render();

document.getElementById('tabCountPals').textContent = PALS.length;
})();
