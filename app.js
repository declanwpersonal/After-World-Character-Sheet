(function(){
var KEY='aw-chars-v1',LAST='aw-last-v1',A=['Brawn','Agility','Health','Smarts','Senses','Presence'];
var DIE=[0,4,6,8,12],FAT=['No effect','Disadvantage on ability rolls','Speed halved','Disadvantage on all rolls','HP max halved','No movement, Opportunity Actions, Surprise Actions or Interactions','Death'];
var $=function(s){return document.querySelector(s)},ok=true,db={},cur=null;
function load(){try{db=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){db={};ok=false}}
function put(){try{localStorage.setItem(KEY,JSON.stringify(db));$('#st').textContent='Saved'}catch(e){ok=false;$('#st').textContent='Not saved: storage blocked'}}
function mk(){var o={id:'c'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),name:'',race:'',bg:'',concept:'',level:1,raceBonus:0,wounds:0,fatigue:0,hp:0,hpBonus:0,ar:0,pen:0,armName:'',speed:1,mpMax:0,mp:0,carried:0,weapons:'',traits:'',gear:'',money:'',notes:'',upd:Date.now()};A.forEach(function(a){o[a]=0});return o}
function eff(a){return Math.max(0,cur[a]-cur.wounds)}
function dn(r){return r?'d'+DIE[r]:'none'}
function hpMax(){return Math.max(0,cur.Health*5+(+cur.hpBonus||0))}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function fld(l,f,t){return '<label class="f"><span>'+l+'</span><input data-f="'+f+'" type="'+(t||'text')+'"'+(t==='number'?' inputmode="numeric"':'')+' value="'+esc(cur[f])+'"></label>'}
function area(l,f,r){return '<label class="f"><span>'+l+'</span><textarea data-f="'+f+'" rows="'+(r||4)+'">'+esc(cur[f])+'</textarea></label>'}
function step(k,l){return '<div class="st"><button data-s="'+k+'" data-d="-1" aria-label="Lower '+l+'">−</button><b id="v-'+k+'"></b><button data-s="'+k+'" data-d="1" aria-label="Raise '+l+'">+</button></div>'}
function listView(){
  $('#sheet').hidden=true;$('#list').hidden=false;$('#back').hidden=true;$('#ttl').textContent='After World Characters';$('#st').textContent='';
  var ids=Object.keys(db).sort(function(a,b){return db[b].upd-db[a].upd}),h='';
  if(!ok)h+='<p class="warn">This browser is blocking storage, so characters will not be kept. Use Export to keep a copy.</p>';
  h+='<button class="pri" id="new">New character</button>';
  if(!ids.length)h+='<p class="meta">No characters yet. Tap New character to make one.</p>';
  ids.forEach(function(id){var c=db[id];
    h+='<div class="card"><button class="open" data-o="'+id+'"><strong>'+esc(c.name||'Unnamed character')+'</strong><span>Level '+esc(c.level)+(c.race?' · '+esc(c.race):'')+(c.bg?' · '+esc(c.bg):'')+'</span><span class="meta">HP '+esc(c.hp)+' · edited '+new Date(c.upd).toLocaleDateString()+'</span></button><button class="del" data-x="'+id+'">Delete</button></div>'});
  h+='<div class="foot"><button id="exp">Export all</button><label class="btn">Import<input id="imp" type="file" accept="application/json,.json" hidden></label></div>';
  $('#list').innerHTML=h;
}
function open(id){
  cur=db[id];if(!cur)return listView();try{localStorage.setItem(LAST,id)}catch(e){}
  $('#list').hidden=true;$('#sheet').hidden=false;$('#back').hidden=false;
  var h='<section>'+fld('Name','name')+'<div class="g2">'+fld('Race','race')+fld('Background','bg')+'</div>'+fld('Concept','concept')+'<div class="g2">'+fld('Level','level','number')+fld('Race bonus ranks','raceBonus','number')+'</div></section>';
  h+='<section><h2>Attributes</h2><p class="meta" id="rk"></p>';
  A.forEach(function(a){h+='<div class="row"><span class="an">'+a+'</span>'+step(a,a)+'<span class="die" id="d-'+a+'"></span><button class="roll" data-r="'+a+'">Roll</button></div>'});
  h+='<label class="f"><span>Roll bonus (tools, traits)</span><input id="bon" type="number" inputmode="numeric" value="0"></label><p id="rr" class="res" aria-live="polite">Tap Roll on an attribute.</p></section>';
  h+='<section><h2>Health</h2><div class="row"><span class="an">Hit Points</span>'+step('hp','Hit Points')+'<span class="die" id="hm"></span></div>'+fld('HP bonus (traits such as Healthy)','hpBonus','number');
  h+='<div class="row"><span class="an">Wounds</span><div class="wd">'+[1,2,3].map(function(n){return '<button data-w="'+n+'" id="w'+n+'">'+n+'</button>'}).join('')+'</div></div><p class="meta" id="wn"></p>';
  h+='<div class="row"><span class="an">Fatigue</span>'+step('fatigue','Fatigue')+'</div><p class="meta" id="fx"></p></section>';
  h+='<section><h2>Defence</h2><div class="big"><div><b id="cd"></b><span>Combat Defence</span></div><div><b id="mds"></b><span>Magic DS</span></div></div><div class="g3">'+fld('Armour','armName')+fld('Armour Rating','ar','number')+fld('Armour penalty','pen','number')+'</div><div class="g2">'+fld('Speed (zones)','speed','number')+fld('Carried weight','carried','number')+'</div><p class="meta" id="cw"></p></section>';
  h+='<section><h2>Magic</h2><div class="row"><span class="an">Magic points</span>'+step('mp','Magic points')+'<span class="die" id="mm"></span></div>'+fld('Magic points max','mpMax','number')+'<p class="meta" id="lr"></p></section>';
  h+='<section><h2>Gear and abilities</h2>'+area('Weapons','weapons')+area('Traits and powers','traits',6)+area('Equipment','gear',6)+fld('Money','money')+area('Notes','notes',5)+'</section>';
  $('#sheet').innerHTML=h;$('#sheet').scrollTop=0;scrollTo(0,0);refresh();
}
function refresh(){
  var sp=0;A.forEach(function(a){sp+=+cur[a]||0;$('#v-'+a).textContent=cur[a];$('#d-'+a).textContent=cur.wounds?(dn(eff(a))+' (wounded)'):dn(cur[a])});
  var tot=10+(+cur.raceBonus||0)+Math.max(0,(+cur.level||1)-1);
  $('#rk').textContent='Ranks spent '+sp+' of '+tot+'. Max Rank 4.';$('#rk').className='meta'+(sp>tot?' over':'');
  var hm=hpMax();$('#v-hp').textContent=cur.hp;$('#hm').textContent='of '+hm;
  [1,2,3].forEach(function(n){$('#w'+n).className=cur.wounds>=n?'on':''});
  $('#wn').textContent=cur.wounds?'Wounds lower every attribute by '+cur.wounds+' rank'+(cur.wounds>1?'s':'')+'. A fourth Wound is death.':'Spend a Wound to turn a hit into 0 damage.';
  $('#v-fatigue').textContent=cur.fatigue;$('#fx').textContent=FAT[cur.fatigue]||'';
  $('#cd').textContent=12+eff('Agility')-(+cur.pen||0);
  $('#mds').textContent=10+Math.max(eff('Senses'),eff('Presence'));
  var cap=eff('Brawn')*5;$('#cw').textContent='Carry capacity '+cap+(+cur.carried>cap?' (over)':'')+'. Light 1, Medium 3, Heavy 6.';
  $('#v-mp').textContent=cur.mp;$('#mm').textContent='of '+(+cur.mpMax||0);
  $('#lr').textContent='A light rest returns '+Math.max(eff('Senses'),eff('Presence'))*10+' magic points.';
}
function save(){cur.upd=Date.now();db[cur.id]=cur;put()}
function lim(k){if(k==='hp')return[0,hpMax()];if(k==='mp')return[0,Math.max(0,+cur.mpMax||0)];if(k==='fatigue')return[0,6];return[0,4]}
function roll(a){
  var r=Math.ceil(Math.random()*10),e=eff(a),b=+$('#bon').value||0,o=$('#rr');
  if(r===10){o.textContent=a+': natural 10. Success.';return}
  if(r===1){o.textContent=a+': natural 1. Failure.';return}
  var s=e?Math.ceil(Math.random()*DIE[e]):0;
  o.textContent=a+': d10 '+r+(e?' + '+dn(e)+' '+s:' (no skill die)')+(b?' + bonus '+b:'')+' = '+(r+s+b);
}
document.addEventListener('click',function(e){
  var t=e.target.closest('button,label.btn');if(!t)return;
  if(t.id==='new'){var c=mk();db[c.id]=c;put();open(c.id)}
  else if(t.dataset.o)open(t.dataset.o);
  else if(t.dataset.x){var c2=db[t.dataset.x];if(confirm('Delete '+(c2.name||'this character')+'? This cannot be undone.')){delete db[t.dataset.x];put();listView()}}
  else if(t.id==='back'){listView()}
  else if(t.dataset.s){var k=t.dataset.s,full=cur.hp===hpMax(),l=lim(k),v=(+cur[k]||0)+(+t.dataset.d);cur[k]=Math.max(l[0],Math.min(l[1],v));if(k==='Health'&&(full||cur.hp>hpMax()))cur.hp=hpMax();save();refresh()}
  else if(t.dataset.w){var n=+t.dataset.w;cur.wounds=cur.wounds===n?n-1:n;save();refresh()}
  else if(t.dataset.r)roll(t.dataset.r);
  else if(t.id==='exp'){var bl=new Blob([JSON.stringify(db,null,1)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='after-world-characters.json';document.body.appendChild(a);a.click();a.remove()}
});
document.addEventListener('input',function(e){var f=e.target.dataset&&e.target.dataset.f;if(!f||!cur)return;
  cur[f]=e.target.type==='number'?(e.target.value===''?0:Number(e.target.value)):e.target.value;
  if(f==='name')$('#ttl').textContent=cur.name||'Unnamed character';
  save();refresh()});
document.addEventListener('change',function(e){if(e.target.id!=='imp')return;var fl=e.target.files[0];if(!fl)return;var rd=new FileReader();
  rd.onload=function(){try{var d=JSON.parse(rd.result),n=0;Object.keys(d).forEach(function(k){if(d[k]&&typeof d[k]==='object'){var c=Object.assign(mk(),d[k]);if(db[c.id]||!c.id)c.id=mk().id;db[c.id]=c;n++}});put();listView();alert('Imported '+n+' character'+(n===1?'':'s')+'.')}catch(x){alert('That file is not an After World characters export.')}};rd.readAsText(fl)});
load();
listView();
if('serviceWorker' in navigator&&location.protocol!=='file:'){addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})})}
})();
