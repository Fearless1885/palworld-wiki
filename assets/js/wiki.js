/* Palworld Wiki logic. Data lives in /data/skills.js and /data/pals.js */

/* ---------- Tabs ---------- */
(function(){
  const btns = [document.getElementById('tabBtnSkills'), document.getElementById('tabBtnPals'), document.getElementById('tabBtnWork')];
  const panels = [document.getElementById('panelSkills'), document.getElementById('panelPals'), document.getElementById('panelWork')];
  const TAB_IDX = {skills:0, pals:1, work:2};
  function activate(i, scroll){
    btns.forEach((b,j)=>{
      b.classList.toggle('active', j===i);
      b.setAttribute('aria-selected', j===i);
      panels[j].classList.toggle('active', j===i);
    });
    if(scroll) window.scrollTo({top:0,behavior:'smooth'});
  }
  btns.forEach((btn,i)=>btn.addEventListener('click',()=>activate(i,true)));
  const wantTab = new URLSearchParams(location.search).get('tab');
  if(wantTab && TAB_IDX[wantTab] !== undefined) activate(TAB_IDX[wantTab], false);
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

// Deep links: /?tab=skills&q=fire&tier=R
(function(){
  const P = new URLSearchParams(location.search);
  if(P.get('tab')==='skills'){
    if(P.get('q')) q.value = P.get('q');
    const t = P.get('tier');
    if(t){ activeTiers.add(t); const b=document.querySelector('#tierChips .chip[data-tier="'+t+'"]'); if(b) b.classList.add('on'); }
  }
})();
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
      const hay=(p.n+" "+p.el.join(" ")+" "+p.why+" "+p.suits+" "+p.roles.map(r=>ROLE_NAMES[r][0]).join(" ")+" "
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
      <div class="card-links"><a href="breeding/">Breeding routes &amp; inheritance →</a></div>
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

// Deep links: /?tab=pals&q=fire&role=fly
(function(){
  const P = new URLSearchParams(location.search);
  if(P.get('tab')==='pals'){
    if(P.get('q')) q.value = P.get('q');
    const r = P.get('role');
    if(r){ activeRoles.add(r); const b=document.querySelector('#roleChips .chip[data-role="'+r+'"]'); if(b) b.classList.add('on'); }
  }
})();

// All-72 new pals checklist (click a chip to search it)
(function(){
  if(typeof NEWPALS==='undefined') return;
  function chip(n){
    const el = n[2] ? `<span class="el el-${n[2]}"></span>` : '';
    return `<button class="np" data-name="${n[1]}"><span class="num">#${n[0]}</span>${el}${n[1]}</button>`;
  }
  const sp=document.getElementById('npSpecies'), va=document.getElementById('npVariants');
  if(sp) sp.innerHTML = NEWPALS.species.map(chip).join('');
  if(va) va.innerHTML = NEWPALS.variants.map(chip).join('');
  document.getElementById('newPalsSection').addEventListener('click',e=>{
    const b=e.target.closest('.np'); if(!b) return;
    q.value = b.dataset.name; render();
    window.scrollTo({top:0,behavior:'smooth'});
  });
})();
render();

document.getElementById('tabCountPals').textContent = PALS.length;
})();


/* ---------- Guess that Pal! ---------- */
(function(){
  const sil=document.getElementById('gSil');
  if(!sil || typeof PALS==='undefined') return;
  const opts=document.getElementById('gOpts'), msg=document.getElementById('gMsg');
  const streakEl=document.getElementById('gStreak'), bestEl=document.getElementById('gBest');
  let streak=0, best=0, answer=null, locked=false;

  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  // deterministic PRNG from name so every Pal always gets the same mystery shape
  function rng(seedStr){
    let h=2166136261;
    for(let i=0;i<seedStr.length;i++){ h^=seedStr.charCodeAt(i); h=Math.imul(h,16777619); }
    return function(){ h=Math.imul(h^h>>>15, 2246822519); h=Math.imul(h^h>>>13, 3266489917); return ((h^=h>>>16)>>>0)/4294967296; };
  }
  function blobSVG(name){
    const r=rng(name), pts=[], N=10+Math.floor(r()*5);
    for(let i=0;i<N;i++){
      const a=(i/N)*Math.PI*2, rad=42+r()*32;
      pts.push([80+Math.cos(a)*rad, 84+Math.sin(a)*rad*(0.8+r()*0.35)]);
    }
    let d='M'+pts[0][0].toFixed(1)+','+pts[0][1].toFixed(1);
    for(let i=1;i<=N;i++){
      const p=pts[i%N], prev=pts[i-1];
      const mx=((prev[0]+p[0])/2).toFixed(1), my=((prev[1]+p[1])/2).toFixed(1);
      d+=' Q'+prev[0].toFixed(1)+','+prev[1].toFixed(1)+' '+mx+','+my;
    }
    // ears / horns for character
    const ear=r()>0.4?`<ellipse cx="${60+r()*10}" cy="${34+r()*8}" rx="${7+r()*8}" ry="${14+r()*12}" transform="rotate(${-25+r()*20} 65 40)"/><ellipse cx="${95+r()*10}" cy="${34+r()*8}" rx="${7+r()*8}" ry="${14+r()*12}" transform="rotate(${10+r()*20} 100 40)"/>`:'';
    return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" fill="#0d1319">${ear}<path d="${d}Z"/></svg>`;
  }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const k=Math.floor(Math.random()*(i+1)); [a[i],a[k]]=[a[k],a[i]]; } return a; }

  function newRound(){
    locked=false; sil.classList.remove('revealed');
    const pool=shuffle(PALS.slice()).slice(0,4);
    answer=pool[Math.floor(Math.random()*4)];
    // try a real silhouette image first; fall back to the generated shape
    sil.innerHTML='';
    const img=new Image();
    img.alt='Mystery Pal';
    img.onload=()=>{ sil.innerHTML=''; sil.appendChild(img); };
    img.onerror=()=>{ sil.innerHTML=blobSVG(answer.n); };
    img.src='assets/img/silhouettes/'+slug(answer.n)+'.png';
    sil.innerHTML=blobSVG(answer.n); // show generated shape immediately; image replaces it if found
    opts.innerHTML=pool.map(p=>`<button class="guess-btn" data-n="${p.n}">${p.n}</button>`).join('');
    msg.textContent="Who's that Pal? Pick a name."; msg.className='guess-msg';
  }
  opts && document.getElementById('guessGame').addEventListener('click',e=>{
    const b=e.target.closest('.guess-btn');
    if(!b || locked) return;
    locked=true; sil.classList.add('revealed');
    const right = b.dataset.n===answer.n;
    [...opts.children].forEach(x=>{
      x.disabled=true;
      if(x.dataset.n===answer.n) x.classList.add('correct');
      else if(x===b) x.classList.add('wrong');
    });
    if(right){ streak++; best=Math.max(best,streak); msg.textContent='Correct! It\'s '+answer.n+'.'; msg.className='guess-msg win'; }
    else{ streak=0; msg.textContent='It was '+answer.n+'!'; msg.className='guess-msg lose'; }
    streakEl.textContent=streak; bestEl.textContent=best;
  });
  document.getElementById('gNext').addEventListener('click',newRound);
  newRound();
})();
