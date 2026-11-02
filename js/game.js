(function(){
'use strict';
const HAND=7, ROUND_CARD_DMG=250, ROUND_CARD_CAP=8;
const ABORT={aborted:true};

const MODES={
  easy:{id:'easy',name:'Easy',hp:1500,mult:0.8,ent:0.75,hide:1.5,prot:1.25,heal:1,desc:'1,500 HP. Damage x0.8. Fewer entities, more Hide, protection and healing cards.'},
  normal:{id:'normal',name:'Normal',hp:1000,mult:1,ent:1,hide:1,prot:1,heal:1,desc:'1,000 HP. Damage exactly as written on the cards.'},
  chaos:{id:'chaos',name:'Chaos',hp:800,mult:1.5,ent:1.5,hide:0.5,prot:1,heal:1,desc:'800 HP. Damage x1.5. More entities, fewer Hide cards.'}
};
const WINGS=[
  {id:'crimson',name:'Crimson',bg:'#C0392B',fg:'#FFFFFF',shape:'diamond'},
  {id:'azure',name:'Azure',bg:'#2F6DB5',fg:'#FFFFFF',shape:'circle'},
  {id:'emerald',name:'Emerald',bg:'#2E7D4F',fg:'#FFFFFF',shape:'triangle'},
  {id:'amber',name:'Amber',bg:'#E0A82E',fg:'#1A1408',shape:'square'}
];
const CATS={
  attack:{label:'Attack',color:'#B3261E',fg:'#FFFFFF'},
  control:{label:'Control',color:'#2F6DB5',fg:'#FFFFFF'},
  hand:{label:'Hand disruption',color:'#7B4FB0',fg:'#FFFFFF'},
  trap:{label:'Trap',color:'#8A5A12',fg:'#FFFFFF'},
  shop:{label:'Shop',color:'#16787A',fg:'#FFFFFF'},
  defense:{label:'Defense',color:'#2E7D4F',fg:'#FFFFFF'},
  heal:{label:'Healer',color:'#A8507A',fg:'#FFFFFF'},
  util:{label:'Utility',color:'#C8962E',fg:'#17130B'}
};
/* Numbers in [brackets] are damage and scale with the mode. Plain numbers do not. grp sets which mode factor changes the copy count. */
const DEFS={
  'RUSH':{kind:'entity',cat:'attack',grp:'ent',copies:3,dmg:100,short:'Hits every other player for [100].',text:'Deals [100] damage to all other players.'},
  'AMBUSH':{kind:'entity',cat:'attack',grp:'ent',copies:2,dmg:100,short:'Hits the next two players for [100] each.',text:'Deals [100] damage to each of the next two players.'},
  'SCREECH':{kind:'entity',cat:'attack',grp:'ent',copies:3,dmg:50,short:'Next player takes [50].',text:'Deals [50] damage to the next player.'},
  'EYES':{kind:'entity',cat:'attack',grp:'ent',copies:2,dmg:30,short:'Target shows a card and bleeds [30] a turn.',text:'The next player shows a random card to everyone and takes [30] damage at the start of each of their turns this room.'},
  'TIMOTHY':{kind:'entity',cat:'attack',grp:'ent',copies:2,dmg:10,short:'Their next 5 plays cost them [10] each.',text:'The next player takes [10] damage each time they play a card, for their next 5 plays.'},
  'SEEK':{kind:'entity',cat:'attack',grp:'ent',copies:2,dmg:200,short:'[200] damage. Turns off Guiding Light.',text:'Deals [200] damage to the next player and switches their Guiding Light off for 3 turns.'},
  'FIGURE':{kind:'entity',cat:'attack',grp:'ent',copies:2,dmg:150,short:'[150] damage. Turns off Guiding Light.',text:'Deals [150] damage to the next player and switches their Guiding Light off for 3 turns.'},
  'DREAD':{kind:'entity',cat:'attack',grp:'ent',copies:2,dmg:150,short:'Solve a sum in 30s or take [150].',text:'The next player must answer a quick sum within 30 seconds, or takes [150] damage.'},
  'HALT':{kind:'entity',cat:'control',grp:'ent',copies:2,dmg:150,short:'[150] damage. Everyone shows their hand.',text:'Deals [150] damage to the next player. All other players show their hands until your next turn.'},
  'SNARE':{kind:'entity',cat:'control',grp:'ent',copies:2,dmg:50,short:'[50] damage. They cannot play for 2 turns.',text:'Deals [50] damage to the next player. They cannot play cards for their next 2 turns. Guiding Light and Curious Light prevent this.'},
  'SALLY':{kind:'entity',cat:'hand',grp:'ent',copies:2,short:'Steal 2 random cards from other players.',text:'Steal 2 random cards from other players.'},
  'DUPE':{kind:'entity',cat:'trap',grp:'ent',copies:2,dmg:50,short:'Pick 1 of 3 doors. Two are fake.',text:'Pick 1 of 3 doors. One is special: draw 2 cards and heal 100. The other two are fake and deal [50] damage to you.'},
  'GLITCH':{kind:'entity',cat:'trap',grp:'ent',copies:2,chip:'x1.5',ck:'util',short:'Scramble the floor. Next attack x1.5.',text:'Scramble the floor wing and number. Your next attack deals 1.5 times damage.'},
  'JACK':{kind:'entity',cat:'shop',grp:'shop',copies:2,chip:'1 of 3',ck:'shop',short:'Pick 1 of 3 special cards.',text:'Pick 1 of 3 random special cards to add to your hand.'},
  'SHADOW':{kind:'entity',cat:'shop',grp:'shop',copies:2,chip:'1 of 5',ck:'shop',short:'Pick 1 of 5 special cards.',text:'Pick 1 of 5 random special cards to add to your hand.'},
  'BOB':{kind:'entity',cat:'shop',grp:'shop',copies:2,chip:'FREE',ck:'shop',short:'Free visit to Jeff’s shop: 1 of 3.',text:'Visit Jeff’s shop for free and take 1 of 3 items.'},
  'EL GOBLINO':{kind:'entity',cat:'shop',grp:'shop',copies:2,chip:'FREE',ck:'shop',short:'Free visit to Jeff’s shop: 1 of 3.',text:'Visit Jeff’s shop for free and take 1 of 3 items.'},
  'JEFF':{kind:'entity',cat:'shop',grp:'shop',copies:2,chip:'SHOP',ck:'shop',short:'Unlock 1 of 5 items from Jeff’s shop.',text:'Unlock one thing from Jeff’s shop: take 1 of 5 items.'},
  'HIDE':{kind:'hide',cat:'defense',grp:'hide',copies:6,chip:'2 USES',ck:'guard',short:'Cancel an entity aimed at you. 2 uses.',text:'Play when an entity targets you: cancel it and take no damage. Each Hide card has 2 uses. Cannot be played on your own turn.'},
  'CRUCIFIX':{kind:'item',cat:'defense',grp:'prot',copies:2,chip:'5 HITS',ck:'guard',short:'Blocks 5 hits. Not Seek or Figure.',text:'Blocks the next 5 entity hits against you. It does not stop Seek or Figure unless your Guiding Light is on.'},
  'GUIDING LIGHT':{kind:'item',cat:'defense',grp:'prot',copies:2,chip:'6 TURNS',ck:'guard',short:'Stun-proof. Halves Seek and Figure.',text:'For 6 turns you are stun-proof, Seek and Figure deal half damage, and Crucifix can block them. Seek and Figure switch it off for 3 turns.'},
  'CURIOUS LIGHT':{kind:'item',cat:'defense',grp:'prot',copies:2,chip:'6 TURNS',ck:'guard',short:'Stun-proof. See the next player’s hand.',text:'For 6 turns you are stun-proof and you can see the hand of the next player.'},
  'HOLY GRENADE':{kind:'item',cat:'defense',grp:'prot',copies:1,chip:'3 HITS',ck:'guard',short:'Blocks the next 3 hits from anything.',text:'Blocks the next 3 hits from anything, including Seek and Figure.'},
  'BANDAGE':{kind:'item',cat:'heal',grp:'heal',copies:3,chip:'+5 PCS',ck:'heal',short:'+5 pieces. Each heals 100, any time.',text:'Gain 5 bandage pieces (up to 15). Each piece heals 100 and can be used for free at any time on your turn.'},
  'HERB':{kind:'item',cat:'heal',grp:'heal',copies:2,heal:300,short:'Heal 300 at the start of your next 3 turns.',text:'Heal 300 at the start of each of your next 3 turns.'},
  'BREAD':{kind:'item',cat:'heal',grp:'heal',copies:1,heal:500,short:'Heal 500 and gain 4 random items.',text:'Heal 500 and gain 4 random items.'},
  'DRINKS':{kind:'item',cat:'heal',grp:'heal',copies:3,heal:400,short:'Heal 400.',text:'Heal 400.'},
  'MYSTERIOUS BARREL':{kind:'item',cat:'heal',grp:'heal',copies:1,chip:'+1K–5K',ck:'heal',short:'Heal 1,000 to 5,000 at random.',text:'Heal a random amount from 1,000 to 5,000.'},
  'GUIDING BARREL':{kind:'item',cat:'heal',grp:'heal',copies:1,chip:'+1K–5K',ck:'heal',short:'Heal 1,000 to 5,000. Guiding Light 10 turns.',text:'Heal a random amount from 1,000 to 5,000 and turn on Guiding Light for 10 turns.'},
  'REVIVE LOTUS':{kind:'passive',cat:'heal',grp:'heal',copies:1,chip:'REVIVE',ck:'heal',short:'Hold it. At 0 HP, revive at half health.',text:'Cannot be played. Keep it in your hand: if you reach 0 HP you are revived at half health and the Lotus is used up.'},
  'SKELETON KEY':{kind:'item',cat:'util',grp:'util',copies:1,chip:'2 RANDOM',ck:'util',short:'Gain 2 random cards. Some may be bad.',text:'Gain 2 random cards. They can include entity cards.'},
  'RIFT':{kind:'item',cat:'util',grp:'util',copies:1,chip:'KEEP 1',ck:'util',short:'Keep one card for the next room.',text:'Choose one card to keep in your hand for the next room.'},
  'SWITCHER DEVICE':{kind:'item',cat:'util',grp:'util',copies:1,chip:'3 CARDS',ck:'util',short:'See a hand, or play 3 cards this turn.',text:'Choose: see another player’s whole hand for the round, or play up to 3 cards this turn.'}
};
const SHOP_ITEMS=['BANDAGE','HERB','DRINKS','CRUCIFIX','GUIDING LIGHT','CURIOUS LIGHT','HOLY GRENADE','RIFT','SWITCHER DEVICE','SKELETON KEY'];
const RARE_ITEMS=['MYSTERIOUS BARREL','GUIDING BARREL','REVIVE LOTUS','BREAD'];
const BAD_ENTITIES=['RUSH','AMBUSH','SCREECH','EYES','TIMOTHY','SEEK','FIGURE','DREAD','HALT','SNARE','SALLY','DUPE','GLITCH'];

let G=null, uid=0, runToken=0, LASTMODE='normal';
const $app=document.getElementById('app');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
const wing=id=>WINGS.find(w=>w.id===id);
const speed=b=>{const v=b===undefined?850:b;return G.auto?0:Math.round((G.players.some(p=>p.human&&p.alive)?v:Math.min(v,120))*SET.speed);};
async function wait(ms){const t=G.token;await sleep(ms);while(G&&G.token===t&&VIEW!=='game'&&!G.auto&&!G.online)await sleep(200);if(!G||G.token!==t)throw ABORT;}
const nm=i=>G.players[i].name;
const you=i=>!G.auto&&G.humans===1&&G.players[i].human;
const vb=(i,w)=>you(i)?w:w+'s';
const log=s=>{G.log.push(s);if(G.log.length>60)G.log.shift();};
const mult=()=>G&&G.mode?G.mode.mult:1;
const scaled=n=>Math.max(5,Math.round(n*mult()/5)*5);
const fmt=t=>t.replace(/\[(\d+)\]/g,(m,n)=>String(scaled(+n)));
const money=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');

/* ---------- deck and state ---------- */
function mkCard(name){return{id:++uid,kind:DEFS[name].kind,name,uses:name==='HIDE'?2:0};}
function buildDeck(){
  const d=[];
  WINGS.forEach(w=>{for(let n=1;n<=9;n++)for(let k=0;k<2;k++)d.push({id:++uid,kind:'door',color:w.id,num:n,name:w.name+' '+n});});
  Object.keys(DEFS).forEach(name=>{
    const f=G.mode[DEFS[name].grp]||1;
    const n=Math.max(1,Math.round(DEFS[name].copies*f));
    for(let k=0;k<n;k++)d.push(mkCard(name));
  });
  return shuffle(d);
}
function newPlayer(n,i,hu,conn){
  return{name:n,human:!!hu,remote:!!conn,conn:conn||null,ask:null,hp:G.mode.hp,maxHp:G.mode.hp,hand:[],alive:true,
    crucifix:0,grenade:0,light:0,lightOff:0,curious:0,herb:0,bandage:0,stun:0,bleed:false,timothy:0,boost:1,peek:-1,kept:null};
}
function newGame(auto,modeId,net){
  const setup=net?net.map(x=>({n:x.n,h:!!x.h,c:x.conn||null})):(auto?['Ash','Mara','Theo','Ivy'].map(n=>({n,h:false})):SET.setup.map(x=>({n:x.n,h:!!x.h})));
  if(!auto&&!net&&!setup.some(x=>x.h))setup[0].h=true;
  const nh=setup.filter(x=>x.h).length;
  if(nh===1&&!net)setup.forEach(x=>{if(x.h)x.n='You';});
  G={auto:!!auto,online:!!net,promptSeat:-1,humans:auto?0:nh,viewer:net?0:-1,cover:null,coverRes:null,flash:null,mode:MODES[modeId]||MODES.normal,token:runToken,players:[],deck:[],discard:[],dir:1,cur:0,floor:null,halt:null,extra:0,
    round:1,log:[],over:false,winner:null,endMsg:'',turns:0,pendingAct:null,actMode:'draw',modal:null,detail:0};
  G.players=setup.map((x,k)=>newPlayer(x.n||('Player '+(k+1)),k,x.h,x.c));
  dealRound();
  log(G.mode.name+' mode. The floor is '+wing(G.floor.color).name+' '+G.floor.num+'.');
}
function dealRound(){
  G.deck=buildDeck();G.discard=[];G.dir=1;G.halt=null;G.extra=0;
  G.players.forEach(p=>{
    p.hand=[];p.bleed=false;p.timothy=0;p.stun=0;p.boost=1;p.peek=-1;
    if(p.kept){p.hand.push(p.kept);p.kept=null;}
  });
  for(let r=0;r<HAND;r++)G.players.forEach((p,i)=>{if(p.alive)draw(i,1);});
  let c;
  do{c=G.deck.pop();G.discard.push(c);}while(c.kind!=='door');
  G.floor={color:c.color,num:c.num};
}
function reshuffle(){
  if(G.discard.length<=1)return;
  const top=G.discard.pop();
  G.deck=shuffle(G.discard);G.discard=[top];
  log('The deck is reshuffled.');
}
function draw(i,n){
  const out=[];
  for(let k=0;k<n;k++){
    if(!G.deck.length)reshuffle();
    if(!G.deck.length)break;
    const c=G.deck.pop();G.players[i].hand.push(c);out.push(c);
  }
  return out;
}
function nextAlive(from,dir){
  const d=dir===undefined?G.dir:dir;let k=from;
  for(let s=0;s<G.players.length;s++){k=(k+d+4)%4;if(G.players[k].alive)return k;}
  return from;
}
const doorOK=c=>c.color===G.floor.color||c.num===G.floor.num;
function canPlay(i,c){
  if(c.kind==='door')return doorOK(c);
  if(c.kind==='hide'||c.kind==='passive')return false;
  return true;
}
function junk(c){
  if(c.kind==='door')return doorOK(c)?2:0;
  if(c.kind==='hide')return 5;
  if(c.kind==='passive')return 6;
  if(c.kind==='item')return 4;
  return 3;
}
function colorCount(p,color){return p.hand.filter(c=>c.kind==='door'&&c.color===color).length;}
function mostCommonColor(p){
  let best=null,bc=0;
  WINGS.forEach(w=>{const n=colorCount(p,w.id);if(n>bc){bc=n;best=w.id;}});
  return best;
}
const stunProof=p=>(p.light>0&&p.lightOff<=0)||p.curious>0;
const lightOn=p=>p.light>0&&p.lightOff<=0;

/* ---------- health ---------- */
function eliminate(i){
  const p=G.players[i];if(!p.alive)return;
  p.alive=false;G.discard.push(...p.hand);p.hand=[];
  log(nm(i)+' '+(you(i)?'are':'is')+' out of the game!');
  const alive=G.players.map((x,k)=>k).filter(k=>G.players[k].alive);
  if(alive.length===1)win(alive[0],'wins the match as the last one standing');
}
async function damage(i,n,src){
  if(G.over)return;
  const p=G.players[i];if(!p.alive)return;
  p.hp=Math.max(0,p.hp-n);p.lastSrc=src||'the hotel';
  log(nm(i)+' '+vb(i,'take')+' '+money(n)+' damage'+(src?' from '+src:'')+'. ('+money(p.hp)+' HP)');
  render();await wait(speed(450));
  if(p.hp<=0){
    const lotus=p.hand.find(c=>c.name==='REVIVE LOTUS');
    if(lotus){
      p.hand=p.hand.filter(c=>c.id!==lotus.id);G.discard.push(lotus);
      p.hp=Math.round(p.maxHp/2);
      log(nm(i)+' '+vb(i,'rise')+' again with the Revive Lotus! ('+money(p.hp)+' HP)');
    }else eliminate(i);
  }
}
function heal(i,n){
  const p=G.players[i];const before=p.hp;
  p.hp=Math.min(p.maxHp,p.hp+n);
  log(nm(i)+' '+vb(i,'heal')+' '+money(p.hp-before)+' HP. ('+money(p.hp)+' HP)');
}
function win(i,why){
  if(G.over)return;
  G.over=true;G.winner=i;
  G.endMsg=why.indexOf('wins the match')===0?nm(i)+' '+(you(i)?'win the match as the last one standing':why)+'.':nm(i)+' '+(you(i)?'win':'wins')+': '+why+'.';
  log(G.endMsg);
}

/* ---------- prompts ---------- */
function remoteSeat(){return G&&G.online&&G.promptSeat>=0&&G.players[G.promptSeat]&&G.players[G.promptSeat].remote?G.promptSeat:-1;}
function remoteAsk(i,msg,dflt,ms){
  return new Promise(res=>{
    const p=G.players[i];
    const ask={res,kind:msg.t==='turn'?'turn':msg.m.type,dflt,cards:msg.m&&msg.m.cards,timer:null};
    ms=ms||(msg.t==='turn'?NET.turnMs:Math.round(NET.turnMs*.8));
    ask.timer=setTimeout(()=>{
      if(p.ask!==ask)return;
      p.ask=null;p.afk=(p.afk||0)+1;
      if(p.afk>=2&&p.remote){p.remote=false;p.human=false;try{p.conn.close();}catch(e){}p.conn=null;G.humans=Math.max(1,G.players.filter(x=>x.human).length);log(p.name+' went quiet. A bot takes over.');}
      res(dflt);
    },ms);
    p.ask=ask;
    try{p.conn.send(msg);}catch(e){}
    broadcast();
  });
}
function choose(o){const rs=remoteSeat();if(rs>=0)return remoteAsk(rs,{t:'modal',m:{type:'choose',title:o.title,text:o.text,options:o.options}},o.options[o.options.length-1].value);return new Promise(res=>{G.modal={type:'choose',title:o.title,text:o.text,options:o.options,resolve:res};render();});}
function pickCards(title,text,cards,count,ordered){
  const rs=remoteSeat();
  if(rs>=0){const cn=Math.min(count,cards.length);return remoteAsk(rs,{t:'modal',m:{type:'pick',title,text,cards,count:cn,ordered:!!ordered}},cards.slice(0,cn));}
  return new Promise(res=>{
    G.modal={type:'pick',title,text,cards,count:Math.min(count,cards.length),ordered:!!ordered,sel:[],focusId:null,resolve:res};
    render();
  });
}
function seat(i){
  if(G.online){G.promptSeat=i;return Promise.resolve();}
  if(G.humans<2){G.viewer=i;return Promise.resolve();}
  if(G.viewer===i&&G.cover===null)return Promise.resolve();
  G.viewer=-1;
  return new Promise(res=>{G.cover=i;G.coverRes=()=>{G.viewer=i;G.cover=null;G.coverRes=null;res();};render();});
}
function unseat(){if(!G)return;if(G.online){G.promptSeat=-1;return;}if(G.humans>1){G.viewer=-1;}}
async function humanAct(mode,i){await seat(i);if(remoteSeat()>=0)return remoteAsk(i,{t:'turn',mode:mode||'draw'},{type:'draw'});return new Promise(res=>{G.actMode=mode||'draw';G.pendingAct=res;render();});}
async function askQuiz(t){
  const a=3+rnd(7),b=3+rnd(7);
  if(!G.players[t].human)return Math.random()<0.65;
  await seat(t);
  if(remoteSeat()>=0){const rr=await remoteAsk(t,{t:'modal',m:{type:'quiz',q:a+' × '+b,ans:a*b,left:30}},false,31000);if(t!==G.cur)unseat();return rr;}
  const r=await new Promise(res=>{
    const m={type:'quiz',q:a+' × '+b,ans:a*b,left:30,resolve:res};
    G.modal=m;render();
    const tick=setInterval(()=>{
      if(!G||G.modal!==m){clearInterval(tick);return;}
      m.left--;
      const el=document.getElementById('qt');if(el)el.textContent=m.left+'s';
      if(m.left<=0){clearInterval(tick);G.modal=null;render();res(false);}
    },1000);
  });
  if(t!==G.cur)unseat();
  return r;
}

/* ---------- hits, hide, protection ---------- */
function botUseHide(p,dmg){
  if(dmg<=0)return Math.random()<0.4;
  const r=dmg/Math.max(1,p.hp);
  if(r>=0.3)return Math.random()<0.95;
  if(r>=0.15)return Math.random()<0.75;
  return Math.random()<0.5;
}
async function offerHide(t,src,dmg){
  if(G.over)return false;
  const p=G.players[t];if(!p.alive)return false;
  const h=p.hand.find(c=>c.kind==='hide');
  if(!h)return false;
  let use;
  if(p.human){
    await seat(t);
    use=await choose({title:src+(G.humans>1?' targets '+p.name:' targets you'),text:(dmg?'Incoming: '+money(dmg)+' damage. ':'')+'Play Hide ('+h.uses+' use'+(h.uses===1?'':'s')+' left) to cancel it?',
      options:[{label:'Play Hide',value:true},{label:'Take it',value:false}]});
    if(t!==G.cur)unseat();
  }else use=botUseHide(p,dmg);
  if(!use)return false;
  h.uses--;
  if(h.uses<=0){p.hand=p.hand.filter(c=>c.id!==h.id);G.discard.push(h);}
  log(nm(t)+' '+vb(t,'hide')+'! '+src+' is cancelled.'+(h.uses>0?' (Hide: '+h.uses+' use left)':''));
  render();await wait(speed(350));
  return true;
}
/* returns true if the target actually took the hit */
async function hit(t,base,src,o){
  o=o||{};
  if(G.over)return false;
  const p=G.players[t];if(!p.alive)return false;
  if(!o.noHide&&await offerHide(t,src,scaled(base)))return false;
  if(p.grenade>0){p.grenade--;log(nm(t)+'’s Holy Grenade blocks '+src+'. ('+p.grenade+' left)');return false;}
  const sf=(src==='SEEK'||src==='FIGURE');
  if(p.crucifix>0&&(!sf||lightOn(p))){p.crucifix--;log(nm(t)+'’s Crucifix blocks '+src+'. ('+p.crucifix+' left)');return false;}
  let d=base*mult()*(o.boost||1);
  if(sf&&lightOn(p))d*=0.5;
  d=Math.max(5,Math.round(d/5)*5);
  await damage(t,d,src);
  return true;
}
async function hitOthers(i,src,base,o){
  let cur=i;
  for(let k=0;k<G.players.length-1;k++){
    cur=nextAlive(cur);
    if(cur===i||G.over)break;
    await hit(cur,base,src,o);
  }
}

/* ---------- shop and random cards ---------- */
function randItemName(){return Math.random()<0.1?RARE_ITEMS[rnd(RARE_ITEMS.length)]:SHOP_ITEMS[rnd(SHOP_ITEMS.length)];}
function addRandom(i,n,bad){
  for(let k=0;k<n;k++){
    const name=(bad&&Math.random()<0.35)?BAD_ENTITIES[rnd(BAD_ENTITIES.length)]:randItemName();
    const c=mkCard(name);G.players[i].hand.push(c);
    if(G.players[i].human)log(nm(i)+' '+vb(i,'gain')+' '+(G.humans>1?'a card':c.name)+'.');
  }
}
function itemScore(p,c){
  const miss=p.maxHp-p.hp;
  switch(c.name){
    case 'DRINKS':return Math.min(miss,400)/8;
    case 'BREAD':return Math.min(miss,500)/8+8;
    case 'HERB':return Math.min(miss,900)/15;
    case 'BANDAGE':return 18+(miss>400?8:0);
    case 'MYSTERIOUS BARREL':case 'GUIDING BARREL':return Math.min(miss,3000)/40+6;
    case 'REVIVE LOTUS':return 40;
    case 'HOLY GRENADE':return p.grenade>0?4:30;
    case 'CRUCIFIX':return p.crucifix>0?4:26;
    case 'GUIDING LIGHT':return lightOn(p)?4:22;
    case 'CURIOUS LIGHT':return p.curious>0?3:12;
    case 'SWITCHER DEVICE':return 14;
    case 'SKELETON KEY':return 12;
    default:return 6;
  }
}
async function shop(i,n,title){
  const p=G.players[i];
  const offers=[],seen=new Set();
  while(offers.length<n){const name=randItemName();if(seen.has(name))continue;seen.add(name);offers.push(mkCard(name));}
  let c;
  if(p.human){await seat(i);c=(await pickCards(title,'Choose 1 item to add to your hand.',offers,1,false))[0];}
  else c=offers.slice().sort((a,b)=>itemScore(p,b)-itemScore(p,a))[0];
  p.hand.push(c);
  log(nm(i)+' '+vb(i,'take')+' '+c.name+'.');
}
function cheapest(p,n){return p.hand.slice().sort((a,b)=>junk(a)-junk(b)||Math.random()-.5).slice(0,n);}
function useBandage(i){
  const p=G.players[i];
  if(p.bandage<=0||p.hp>=p.maxHp)return false;
  p.bandage--;heal(i,100);return true;
}

/* ---------- playing cards ---------- */
async function playCard(i,card){
  const p=G.players[i];
  p.hand=p.hand.filter(c=>c.id!==card.id);G.discard.push(card);
  if(card.kind==='door'){
    log(nm(i)+' '+vb(i,'play')+' '+card.name+'.');
    G.floor={color:card.color,num:card.num};
    return;
  }
  log(nm(i)+' '+vb(i,'play')+' '+card.name+'.');
  render();await wait(speed(500));
  await resolve(card,i);
}
async function resolve(card,i){
  const p=G.players[i];
  const t=nextAlive(i);
  const tp=G.players[t];
  const boost=p.boost;
  if(boost>1&&DEFS[card.name].dmg)p.boost=1;
  const o={from:i,boost:boost>1&&DEFS[card.name].dmg?boost:1};
  switch(card.name){
    case 'RUSH':await hitOthers(i,'RUSH',100,o);break;
    case 'AMBUSH':{
      let cur=i;
      for(let k=0;k<2;k++){cur=nextAlive(cur);if(cur===i||G.over)break;await hit(cur,100,'AMBUSH',o);}
      break;
    }
    case 'SCREECH':await hit(t,50,'SCREECH',o);break;
    case 'EYES':
      if(!(await offerHide(t,'EYES',0))){
        tp.bleed=true;
        if(tp.hand.length){const c=tp.hand[rnd(tp.hand.length)];log(nm(t)+' '+vb(t,'show')+' '+c.name+' to everyone.');}
        log(nm(t)+' '+(you(t)?'are':'is')+' bleeding for the rest of the room.');
      }
      break;
    case 'TIMOTHY':
      if(!(await offerHide(t,'TIMOTHY',0))){tp.timothy=5;log('Timothy follows '+nm(t)+' for 5 plays.');}
      break;
    case 'SEEK':case 'FIGURE':{
      const hitIt=await hit(t,card.name==='SEEK'?200:150,card.name,o);
      if(hitIt&&G.players[t].alive){tp.lightOff=3;if(tp.light>0)log(nm(t)+'’s Guiding Light flickers off.');}
      break;
    }
    case 'DREAD':{
      if(await offerHide(t,'DREAD',scaled(150)))break;
      const ok=await askQuiz(t);
      if(ok)log(nm(t)+' '+vb(t,'answer')+' Dread correctly.');
      else{log(nm(t)+' '+vb(t,'fail')+' Dread’s question.');await hit(t,150,'DREAD',{from:i,boost:o.boost,noHide:true});}
      break;
    }
    case 'HALT':
      await hit(t,150,'HALT',o);
      G.halt=i;log('Halt! Everyone shows their hand until '+nm(i)+' plays again.');
      break;
    case 'SNARE':{
      const hitIt=await hit(t,50,'SNARE',o);
      if(hitIt&&G.players[t].alive){
        if(stunProof(tp))log(nm(t)+' '+(you(t)?'are':'is')+' protected from the stun.');
        else{tp.stun=2;log(nm(t)+' '+(you(t)?'cannot':'cannot')+' play for 2 turns.');}
      }
      break;
    }
    case 'SALLY':{
      const victims=G.players.map((x,k)=>k).filter(k=>k!==i&&G.players[k].alive&&G.players[k].hand.length>0);
      shuffle(victims);
      let got=0;
      for(let k=0;k<2&&victims.length;k++){
        const v=victims[k%victims.length];
        if(!G.players[v].hand.length)continue;
        if(await offerHide(v,'SALLY',0))continue;
        const c=G.players[v].hand.splice(rnd(G.players[v].hand.length),1)[0];
        p.hand.push(c);got++;
        log(nm(i)+' '+vb(i,'steal')+' a card from '+nm(v)+'.');
      }
      if(!got)log('Sally finds nothing to steal.');
      break;
    }
    case 'DUPE':{
      const special=rnd(3);
      let pick;
      if(p.human){await seat(i);pick=await choose({title:'Dupe',text:'Pick a door. One is special. The other two are fake.',options:[0,1,2].map(k=>({label:'Door '+(k+1),value:k}))});}
      else pick=rnd(3);
      if(pick===special){log(nm(i)+' '+vb(i,'find')+' the real door.');draw(i,2);heal(i,100);}
      else{log(nm(i)+' '+vb(i,'open')+' a fake door.');await damage(i,scaled(50),'a fake door');}
      break;
    }
    case 'GLITCH':{
      G.floor={color:WINGS[rnd(4)].id,num:1+rnd(9)};
      p.boost=1.5;
      log('The floor glitches to '+wing(G.floor.color).name+' '+G.floor.num+'. '+nm(i)+'’s next attack is x1.5.');
      break;
    }
    case 'JACK':await shop(i,3,'Jack');break;
    case 'SHADOW':await shop(i,5,'Shadow');break;
    case 'BOB':await shop(i,3,'Bob’s free shop visit');break;
    case 'EL GOBLINO':await shop(i,3,'El Goblino’s free shop visit');break;
    case 'JEFF':await shop(i,5,'Jeff’s shop');break;
    case 'CRUCIFIX':p.crucifix=5;log(nm(i)+' '+vb(i,'raise')+' a Crucifix (5 hits).');break;
    case 'GUIDING LIGHT':p.light=6;p.lightOff=0;log(nm(i)+'’s Guiding Light shines for 6 turns.');break;
    case 'CURIOUS LIGHT':p.curious=6;log(nm(i)+'’s Curious Light glows for 6 turns.');break;
    case 'HOLY GRENADE':p.grenade=3;log(nm(i)+' '+vb(i,'hold')+' a Holy Grenade (3 hits).');break;
    case 'BANDAGE':p.bandage=Math.min(15,p.bandage+5);log(nm(i)+' now '+vb(i,'have')+' '+p.bandage+' bandage pieces.');break;
    case 'HERB':p.herb=3;log(nm(i)+' '+vb(i,'chew')+' a Herb (heals for 3 turns).');break;
    case 'BREAD':heal(i,500);addRandom(i,4,false);log(nm(i)+' '+vb(i,'find')+' 4 random items in the Bread.');break;
    case 'DRINKS':heal(i,400);break;
    case 'MYSTERIOUS BARREL':heal(i,1000+rnd(9)*500);break;
    case 'GUIDING BARREL':heal(i,1000+rnd(9)*500);p.light=10;p.lightOff=0;break;
    case 'SKELETON KEY':addRandom(i,2,true);log(nm(i)+' '+vb(i,'unlock')+' 2 random cards.');break;
    case 'RIFT':{
      if(!p.hand.length)break;
      let c;
      if(p.human){await seat(i);c=(await pickCards('Rift','Choose 1 card to keep for the next room.',p.hand.slice(),1,false))[0];}
      else c=p.hand.slice().sort((a,b)=>itemScore(p,b)-itemScore(p,a))[0];
      p.hand=p.hand.filter(x=>x.id!==c.id);p.kept=c;
      log(nm(i)+' '+vb(i,'tuck')+' a card into the Rift.');
      break;
    }
    case 'SWITCHER DEVICE':{
      let triple;
      if(p.human){await seat(i);triple=await choose({title:'Switcher Device',text:'See another player’s whole hand, or play up to 3 cards this turn?',options:[{label:'See a hand',value:false},{label:'Play 3 cards',value:true}]});}
      else triple=p.hand.length>=4;
      if(triple){G.extra=2;log(nm(i)+' '+vb(i,'prepare')+' to play 3 cards.');}
      else{
        const k=await (async()=>{
          const c=G.players.map((x,k)=>k).filter(k=>k!==i&&G.players[k].alive);
          if(!c.length)return -1;
          if(p.human&&c.length>1)return await choose({title:'Switcher Device',text:'Whose hand do you want to see?',options:c.map(k=>({label:G.players[k].name,value:k}))});
          return c[0];
        })();
        p.peek=k;
        if(k>=0)log(nm(i)+' '+vb(i,'look')+' at '+nm(k)+'’s hand.');
      }
      break;
    }
    default:break;
  }
}

/* ---------- bots ---------- */
function botAct(i){
  const p=G.players[i];
  const foes=G.players.filter((x,k)=>k!==i&&x.alive);
  const miss=p.maxHp-p.hp;
  let best=null,bs=-1e9;
  p.hand.forEach(c=>{
    if(!canPlay(i,c))return;
    let s=0;
    if(c.kind==='door'){s=12+colorCount(p,c.color)*1.5+c.num*0.2;}
    else if(c.kind==='item'){s=itemScore(p,c);if(c.name==='RIFT'&&p.hand.length<3)s=1;if(c.name==='BANDAGE'&&p.bandage>=10)s=1;if(c.name==='HERB'&&(p.herb>0||miss<300))s=1;if((c.name==='DRINKS'||c.name==='BREAD')&&miss<250)s=1;if(/BARREL/.test(c.name)&&miss<1000)s=1;}
    else{
      const d=DEFS[c.name];s=c.name==='GLITCH'?16:(d.cat==='shop'?22:20);
      if(d.dmg){s+=foes.some(f=>f.hp<=scaled(d.dmg)*1.3)?25:5;}
      if(c.name==='SALLY'&&foes.every(f=>!f.hand.length))s=-10;
    }
    s+=Math.random()*10;
    if(s>bs){bs=s;best=c;}
  });
  if(best&&bs>0)return{type:'play',card:best};
  return{type:'draw'};
}

/* ---------- turns ---------- */
async function takeTurn(i){
  const p=G.players[i];if(!p.alive)return;
  G.turns++;
  if(G.turns>900){
    let b=0;G.players.forEach((x,k)=>{if(x.alive&&(!G.players[b].alive||x.hp>G.players[b].hp))b=k;});
    win(b,'outlasted everyone');return;
  }
  if(G.halt===i)G.halt=null;
  if(p.light>0)p.light--;
  if(p.lightOff>0)p.lightOff--;
  if(p.curious>0)p.curious--;
  if(p.herb>0){p.herb--;heal(i,300);}
  if(p.bleed){await damage(i,scaled(30),'Eyes');if(G.over||!p.alive)return;}
  if(p.stun>0){
    p.stun--;
    log(nm(i)+' '+(you(i)?'are':'is')+' stunned and can only draw.');
    draw(i,1);
    render();await wait(speed(700));return;
  }
  render();
  if(!p.human){
    let used=0;
    while(used<3&&p.bandage>0&&p.maxHp-p.hp>=150){useBandage(i);used++;}
  }
  let first=true;
  for(;;){
    let act;
    if(p.human)act=await humanAct(first?'draw':'done',i);
    else{await wait(speed(900));act=botAct(i);if(!first&&act.type==='draw')break;}
    if(act.type==='draw'){
      if(first){const c=draw(i,1)[0];log(nm(i)+' '+vb(i,'draw')+' '+(p.human&&G.humans<2?(c?c.name:'nothing'):'a card')+'.');}
      break;
    }
    first=false;
    await playCard(i,act.card);
    if(G.over||!p.alive)break;
    if(p.timothy>0){p.timothy--;await damage(i,scaled(10),'Timothy');if(G.over||!p.alive)break;}
    if(G.extra>0&&p.hand.some(c=>canPlay(i,c))){G.extra--;continue;}
    break;
  }
  G.extra=0;
  if(G.over)return;
  if(p.alive&&p.hand.every(c=>c.kind==='hide'||c.kind==='passive')){await endRound(i);return;}
  render();await wait(speed(300));
}
async function endRound(i){
  log(nm(i)+' '+vb(i,'play')+' the last card. Room '+String(G.round).padStart(3,'0')+' is over!');
  render();await wait(speed(900));
  for(let k=0;k<G.players.length&&!G.over;k++){
    const q=G.players[k];
    if(k===i||!q.alive)continue;
    const d=Math.min(ROUND_CARD_CAP,q.hand.length);
    if(d>0)await damage(k,d*scaled(ROUND_CARD_DMG),d+' card'+(d===1?'':'s')+' left');
  }
  render();await wait(speed(1400));
  if(G.over)return;
  G.round++;
  dealRound();
  log('Room '+String(G.round).padStart(3,'0')+' begins. The floor is '+wing(G.floor.color).name+' '+G.floor.num+'.');
  render();
}
async function run(){
  try{
    while(!G.over){
      await takeTurn(G.cur);
      unseat();
      if(G.over)break;
      G.cur=nextAlive(G.cur);
      render();
    }
  }catch(e){
    if(e!==ABORT){console.error(e);if(G)log('Error: '+e.message);}
  }
  if(G)render();
}
function start(auto,modeId){
  runToken++;
  if(modeId)LASTMODE=modeId;
  newGame(auto,modeId||LASTMODE);
  VIEW='game';drawView();window.scrollTo(0,0);run();
}
function showMenu(){runToken++;G=null;VIEW='home';drawView();}
function startNet(modeId,seats){
  runToken++;LASTMODE=modeId;
  newGame(false,modeId,seats);
  VIEW='game';drawView();window.scrollTo(0,0);run();broadcast();
}


/* ================= storage, settings ================= */
const SDEF={speed:1,motion:true,scan:true,size:'m',mode:'normal',sort:'wing',icon:'eye',iconColor:'#D03045',setup:[{n:'Player 1',h:true},{n:'Mara',h:false},{n:'Theo',h:false},{n:'Ivy',h:false}]};
let SET=JSON.parse(JSON.stringify(SDEF));
try{Object.assign(SET,JSON.parse(localStorage.getItem('doords-settings')||'{}'));}catch(e){}
if(!Array.isArray(SET.setup)||SET.setup.length!==4)SET.setup=JSON.parse(JSON.stringify(SDEF.setup));
function saveSet(){try{localStorage.setItem('doords-settings',JSON.stringify(SET));}catch(e){}}
function applySet(){
  const b=document.body;
  b.classList.toggle('nomotion',!SET.motion);
  b.classList.toggle('noscan',!SET.scan);
  document.documentElement.style.setProperty('--cw',({s:'130px',m:'156px',l:'184px'})[SET.size]||'156px');
}
const idb={
  open(){return new Promise((res,rej)=>{const r=indexedDB.open('doords',1);r.onupgradeneeded=()=>r.result.createObjectStore('kv');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});},
  async get(k){const db=await this.open();return new Promise((res,rej)=>{const q=db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error);});},
  async set(k,v){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=()=>res();t.onerror=()=>rej(t.error);});}
};
let ART={};
try{ART=JSON.parse(localStorage.getItem('doords-art')||'{}')||{};}catch(e){ART={};}
async function persistArt(){
  try{await idb.set('art',ART);try{localStorage.removeItem('doords-art');}catch(e){}return true;}
  catch(e){try{localStorage.setItem('doords-art',JSON.stringify(ART));return true;}catch(e2){return false;}}
}
async function loadArt(){
  let b={};
  try{b=(await idb.get('art'))||{};}catch(e){}
  const merged=Object.assign({},ART,b);
  const changed=Object.keys(merged).length!==Object.keys(b).length;
  ART=merged;
  if(changed)await persistArt();
  try{const lg=await idb.get('logo');if(lg){LOGO=lg;}}catch(e){}
  if(VIEW!=='game')drawView();
}
async function persistLogo(){
  try{await idb.set('logo',LOGO);try{localStorage.removeItem('doords-logo');}catch(e){}return true;}
  catch(e){try{localStorage.setItem('doords-logo',LOGO);return true;}catch(e2){return false;}}
}
const artCount=()=>Object.keys(ART).filter(k=>DEFS[k]).length;

/* ================= drawing helpers ================= */
let VIEW='home',IDX={cat:'all',sel:'RUSH'},TOAST='',artTarget=null;
function eyeSVG(stroke){
  const s=stroke||'#EDE3CF';
  return '<svg class="eye" viewBox="0 0 120 64" fill="none" stroke="'+s+'" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 32C28 6 92 6 116 32 92 58 28 58 4 32Z"/><circle cx="60" cy="32" r="17"/><ellipse cx="60" cy="32" rx="4.5" ry="15" fill="'+s+'"/></svg>';
}
function svgIco(inner,c){return '<svg class="ico" viewBox="0 0 64 64" fill="none" stroke="'+c+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+inner.split('COLOR').join(c)+'</svg>';}
const ICONS={
  eye:['Eye',c=>eyeSVG(c)],
  door:['Door',c=>svgIco('<path d="M16 58V14a16 16 0 0 1 32 0v44z"/><circle cx="40" cy="36" r="2.5" fill="COLOR"/><path d="M6 58h52"/>',c)],
  key:['Key',c=>svgIco('<circle cx="20" cy="22" r="10"/><path d="M27 29l26 26M44 46l6-6M38 40l5-5"/>',c)],
  skull:['Skull',c=>svgIco('<path d="M12 30a20 18 0 0 1 40 0c0 7-4 11-8 13v8H20v-8c-4-2-8-6-8-13z"/><circle cx="24" cy="30" r="5"/><circle cx="40" cy="30" r="5"/><path d="M32 36l-3 6h6zM26 51v-6M32 51v-6M38 51v-6"/>',c)],
  candle:['Candle',c=>svgIco('<path d="M24 58V28h16v30zM32 26c-6-6 0-10 0-16 6 6 6 10 0 16z"/><path d="M18 58h28"/>',c)],
  moth:['Moth',c=>svgIco('<path d="M32 18v32M32 30C20 12 6 16 8 34c2 10 14 12 24 6M32 30C44 12 58 16 56 34c-2 10-14 12-24 6"/><path d="M30 18l-6-8M34 18l6-8"/>',c)]
};
let LOGO='';
try{LOGO=localStorage.getItem('doords-logo')||'';}catch(e){}
function logoHTML(big){
  if(SET.icon==='custom'&&LOGO)return '<img class="logo" src="'+LOGO+'" alt="">';
  const f=ICONS[SET.icon]||ICONS.eye;
  const h=f[1](SET.iconColor||'#D03045');
  return big?h.replace('class="eye"','class="eye bigeye"'):h;
}
function shapeSVG(s,size){
  const m={diamond:'<path d="M12 2l9 10-9 10-9-10z"/>',circle:'<circle cx="12" cy="12" r="9"/>',triangle:'<path d="M12 3l10 18H2z"/>',square:'<rect x="4" y="4" width="16" height="16" rx="2"/>'};
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'+m[s]+'</svg>';
}
function chipHTML(d){
  if(d.dmg)return '<span class="chip dmg">−'+scaled(d.dmg)+'</span>';
  if(d.heal)return '<span class="chip heal">+'+d.heal+'</span>';
  if(d.chip)return '<span class="chip '+(d.ck||'util')+'">'+d.chip+'</span>';
  return '';
}
function faceHTML(c){
  if(c.kind==='door'){
    const w=wing(c.color);
    return '<span class="card door" style="--c:'+w.bg+';--f:'+w.fg+'"><span class="frame"><span class="plate">'+c.num+'</span><span class="panels"><i></i><i></i><span class="dsh">'+shapeSVG(w.shape,54)+'</span><span class="knob"></span></span><span class="wn">'+w.name+'</span></span></span>';
  }
  const d=DEFS[c.name],cat=CATS[d.cat];
  const extra=c.name==='HIDE'?' · '+c.uses+' use'+(c.uses===1?'':'s'):'';
  return '<span class="card" style="--c:'+cat.color+';--f:'+cat.fg+'"><span class="frame">'
    +'<span class="img">'+(ART[c.name]?'<img src="'+ART[c.name]+'" alt="">':eyeSVG('#EDE3CF'))+'</span>'
    +'<svg class="diag" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="84" x2="100" y2="98" vector-effect="non-scaling-stroke"/></svg>'
    +'<span class="tri"></span>'
    +'<span class="ab"><i class="sp"></i>'+fmt(d.short)+'</span>'
    +'<span class="nmt">'+c.name+'</span>'
    +'<span class="bdg">'+chipHTML(d)+'</span>'
    +'<span class="cty">'+cat.label+extra+'</span>'
    +'</span></span>';
}
const backHTML=()=>'<span class="card back"><span class="frame">'+eyeSVG('#D2AC62')+'</span></span>';
function cardAria(c){return c.kind==='door'?c.name+' door':c.name+'. '+fmt(DEFS[c.name].text);}
const fmtMode=(t,m)=>t.replace(/\[(\d+)\]/g,(x,n)=>String(Math.max(5,Math.round(n*m.mult/5)*5)));

/* ================= navigation ================= */
function navHTML(){
  const l=(v,label,cur)=>'<button class="nl" data-go="'+v+'"'+(cur?' aria-current="page"':'')+'>'+label+'</button>';
  return '<header class="nav"><button class="brand" data-go="home" aria-label="Doords home">'+logoHTML(false)+'<span>DOORDS</span></button><nav aria-label="Main">'
    +l('home','Home',VIEW==='home')
    +l('game',G&&!G.over?'Resume game':(G?'Last game':'Play'),VIEW==='game')
    +l('setup','Local',VIEW==='setup')
    +l('online','Online',VIEW==='online')
    +l('profile','Profile',VIEW==='profile')
    +l('index','Card Index',VIEW==='index')
    +l('settings','Settings',VIEW==='settings')
    +l('rules','How to play',VIEW==='rules')
    +'</nav></header>';
}
function go(v){
  if(v==='game'&&!G)v='home';
  VIEW=v;TOAST='';drawView();window.scrollTo(0,0);
}

/* ================= home ================= */
function setupSummary(){
  const h=SET.setup.filter(x=>x.h).length||1;
  return h===1?'You against '+(4-h)+' bots':h+' people on this device and '+(4-h)+' bots';
}
function setupHTML(){
  const rows=SET.setup.map((x,i)=>'<div class="srow-name"><span class="sn">Seat '+(i+1)+'</span><input data-name="'+i+'" value="'+x.n.replace(/"/g,'&quot;')+'" maxlength="14" aria-label="Seat '+(i+1)+' name"><div class="seg" role="group"><button data-act="seat" data-i="'+i+'" data-v="true" aria-pressed="'+!!x.h+'">Person</button><button data-act="seat" data-i="'+i+'" data-v="false" aria-pressed="'+!x.h+'">Bot</button></div></div>').join('');
  return '<main><h1 class="h2">Players</h1><p class="lead">Pass-and-play on one device. Each person gets a cover screen so nobody sees another’s hand. Seats set to Bot are played by the hotel.</p>'
    +'<div class="opts" style="margin-bottom:14px"><button class="btn" data-act="preset" data-v="1">Solo vs 3 bots</button><button class="btn" data-act="preset" data-v="2">2 people + 2 bots</button><button class="btn" data-act="preset" data-v="3">3 people + 1 bot</button><button class="btn" data-act="preset" data-v="4">4 people</button></div>'
    +'<section class="plaque">'+rows+'</section><div class="h3" style="margin-top:18px">Start in</div>'
    +'<div class="modes">'+Object.keys(MODES).map(k=>'<button class="plaque mode" data-act="mode" data-mode="'+k+'"><small>'+MODES[k].hp.toLocaleString()+' HP</small><b>'+MODES[k].name+'</b><span>'+MODES[k].desc+'</span></button>').join('')+'</div>'
    +'<p class="note" style="margin-top:14px">To play on different devices, use the Online page.</p></main>';
}
function homeHTML(){
  return '<main><section class="hero">'+logoHTML(true)+'<h1>Doords</h1><div class="tag">THE HOTEL IS NEVER EMPTY</div></section>'
    +'<h2 class="h2">Choose how afraid you want to be</h2>'
    +'<div class="modes">'+Object.keys(MODES).map(k=>'<button class="plaque mode" data-act="mode" data-mode="'+k+'"><small>'+(SET.mode===k?'YOUR USUAL · ':'')+MODES[k].hp.toLocaleString()+' HP</small><b>'+MODES[k].name+'</b><span>'+MODES[k].desc+'</span></button>').join('')+'</div>'
    +'<div class="plaque" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center;justify-content:space-between"><span><b class="h3" style="margin:0">Players</b> '+setupSummary()+'</span><button class="btn" data-go="setup">Change players</button></div>'
    +'<div class="tiles">'
    +'<button class="tile" data-go="online"><b>Play online</b><span>Make a room code and play friends on other devices</span></button>'
    +'<button class="tile" data-go="profile"><b>Profile</b><span>'+PROFILE.name+' · '+STATS.wins+' wins</span></button>'
    +(G?'<button class="tile" data-go="game"><b>'+(G.over?'Last game':'Resume game')+'</b><span>'+G.mode.name+' · round '+G.round+'</span></button>':'')
    +'<button class="tile" data-go="index"><b>Card Index</b><span>Every card, and where to add entity images</span></button>'
    +'<button class="tile" data-act="demo"><b>Watch the bots</b><span>Four bots play a full game</span></button>'
    +'<button class="tile" data-go="settings"><b>Settings</b><span>Speed, card size, effects, backup</span></button>'
    +'<button class="tile" data-go="rules"><b>How to play</b><span>Rules, items and protection</span></button>'
    +'</div></main>';
}

/* ================= card index ================= */
const FILTERS=[['all','All']].concat(Object.keys(CATS).map(k=>[k,CATS[k].label])).concat([['door','Door cards']]);
function cardFor(sel){
  if(sel.indexOf('door:')===0)return{id:'d'+sel,kind:'door',color:sel.slice(5),num:7,name:'Door'};
  return{id:'i'+sel,kind:DEFS[sel].kind,name:sel,uses:2};
}
function indexKeys(){
  const doors=WINGS.map(w=>'door:'+w.id);
  const names=Object.keys(DEFS);
  if(IDX.cat==='all')return names.concat(doors);
  if(IDX.cat==='door')return doors;
  return names.filter(n=>DEFS[n].cat===IDX.cat);
}
const KINDS={entity:'Entity',hide:'Defense, reactive',item:'Item',passive:'Held in hand'};
function indexDetail(sel){
  const c=cardFor(sel);
  if(c.kind==='door'){
    const w=wing(c.color);
    return '<div class="plaque info"><div class="h3">'+w.name+' wing door</div><p style="margin:0">Door cards come in four wings, numbered 1 to 9, two of each: 72 in the deck. Play one that matches the floor’s wing or its number. They carry no art slot.</p></div>';
  }
  const d=DEFS[sel],ms=Object.keys(MODES).map(k=>MODES[k]);
  const th='<tr><th></th>'+ms.map(m=>'<th>'+m.name+'</th>').join('')+'</tr>';
  const copies='<tr><td>Copies</td>'+ms.map(m=>'<td>'+Math.max(1,Math.round(d.copies*(m[d.grp]||1)))+'</td>').join('')+'</tr>';
  const dm=d.dmg?'<tr><td>Damage</td>'+ms.map(m=>'<td>'+Math.max(5,Math.round(d.dmg*m.mult/5)*5)+'</td>').join('')+'</tr>':(d.heal?'<tr><td>Heal</td>'+ms.map(()=>'<td>'+d.heal+'</td>').join('')+'</tr>':'');
  const has=!!ART[sel];
  return '<div class="plaque info"><div class="h3">'+sel+'</div><div class="note">'+CATS[d.cat].label.toUpperCase()+' · '+KINDS[d.kind].toUpperCase()+'</div>'
    +'<p style="margin:8px 0 0">'+fmtMode(d.text,MODES.normal)+'</p><table>'+th+copies+dm+'</table>'
    +'<div class="opts"><button class="btn primary" data-act="upload" data-n="'+sel+'">'+(has?'Replace image':'Add entity image')+'</button>'+(has?'<button class="btn" data-act="recrop" data-n="'+sel+'">Crop / edit</button><button class="btn" data-act="clear" data-n="'+sel+'">Remove</button>':'')+'</div>'
    +'<div class="toast" role="status">'+TOAST+'</div><div class="note">Images are saved on this device. Back them up in Settings.</div></div>';
}
function indexHTML(){
  const keys=indexKeys();
  if(keys.indexOf(IDX.sel)<0)IDX.sel=keys[0];
  return '<main><h1 class="h2">Card Index</h1><p class="lead">All '+Object.keys(DEFS).length+' action cards and the Door cards. Pick a card to read it, or add your own image to it.</p>'
    +'<div class="filters" role="group" aria-label="Filter by category">'+FILTERS.map(f=>'<button class="fchip" data-act="filter" data-f="'+f[0]+'" aria-pressed="'+(IDX.cat===f[0])+'">'+f[1]+'</button>').join('')+'</div>'
    +'<div class="ix"><div class="igrid">'+keys.map(k=>'<button class="cardbtn'+(k===IDX.sel?' cur':'')+'" data-act="pick" data-n="'+k+'" aria-label="'+k.replace('door:','')+'">'+faceHTML(cardFor(k))+'</button>').join('')+'</div>'
    +'<aside class="dside">'+faceHTML(cardFor(IDX.sel))+indexDetail(IDX.sel)+'</aside></div></main>';
}

/* ================= settings and rules ================= */
function seg(k,opts){
  return '<div class="seg" role="group">'+opts.map(o=>'<button data-act="set" data-k="'+k+'" data-v=\''+JSON.stringify(o[1])+'\' aria-pressed="'+(SET[k]===o[1])+'">'+o[0]+'</button>').join('')+'</div>';
}
function settingsHTML(){
  return '<main><h1 class="h2">Settings</h1><p class="lead">Saved on this device.</p><div class="sgrid">'
    +'<section class="plaque"><div class="h3">Gameplay</div>'
    +'<div class="srow"><span class="lb">Usual difficulty</span>'+seg('mode',[['Easy','easy'],['Normal','normal'],['Chaos','chaos']])+'</div>'
    +'<div class="srow"><span class="lb">Game speed</span>'+seg('speed',[['Slow',1.6],['Normal',1],['Fast',0.5],['Blitz',0.15]])+'</div>'
    +'<div class="srow"><span class="lb">Hand order</span>'+seg('sort',[['Doors first','wing'],['Entities first','type']])+'</div></section>'
    +'<section class="plaque"><div class="h3">Look</div>'
    +'<div class="srow"><span class="lb">Card size</span>'+seg('size',[['Small','s'],['Medium','m'],['Large','l']])+'</div>'
    +'<div class="srow"><span class="lb">Flicker and glow</span>'+seg('motion',[['On',true],['Off',false]])+'</div>'
    +'<div class="srow"><span class="lb">Scanlines</span>'+seg('scan',[['On',true],['Off',false]])+'</div></section>'
    +'<section class="plaque"><div class="h3">Logo icon</div><div class="iconpick">'
    +Object.keys(ICONS).map(k=>'<button class="icb" data-act="icon" data-v="'+k+'" aria-pressed="'+(SET.icon===k)+'">'+ICONS[k][1](SET.iconColor||'#D03045')+ICONS[k][0]+'</button>').join('')
    +(LOGO?'<button class="icb" data-act="icon" data-v="custom" aria-pressed="'+(SET.icon==='custom')+'"><img src="'+LOGO+'" alt="">Yours</button>':'')
    +'</div><div class="srow"><span class="lb">Icon colour</span>'+seg('iconColor',[['Blood','#D03045'],['Brass','#E3B55E'],['Bone','#F2E6CF']])+'</div>'
    +'<div class="srow"><span class="lb">Your own image</span><div class="opts"><button class="btn" data-act="logoup">'+(LOGO?'Replace image':'Upload image')+'</button>'+(LOGO?'<button class="btn" data-act="logoclear">Remove</button>':'')+'</div></div></section>'
    +'<section class="plaque"><div class="h3">Card art and data</div>'
    +'<div class="srow"><span class="lb">'+artCount()+' of '+Object.keys(DEFS).length+' cards have an image</span><div class="opts"><button class="btn" data-go="index">Open Card Index</button></div></div>'
    +'<div class="srow"><span class="lb">Backup</span><div class="opts"><button class="btn" data-act="export"'+(artCount()?'':' disabled')+'>Export images</button><button class="btn" data-act="import">Import images</button></div></div>'
    +'<div class="srow"><span class="lb">Reset</span><div class="opts"><button class="btn danger" data-act="clearart"'+(artCount()?'':' disabled')+'>Remove all images</button><button class="btn danger" data-act="resetset">Reset settings</button></div></div>'
    +'<div class="toast" role="status">'+TOAST+'</div></section></div></main>';
}
function rulesHTML(){
  return '<main><h1 class="h2">How to play</h1><div class="rules">'
    +'<section class="plaque"><div class="h3">Goal</div><p>Be the last player standing. Play your last playable card to clear the room. Everyone else takes damage for each card left in hand (up to 8). Health carries over between rooms.</p>'
    +'<div class="h3" style="margin-top:14px">Your turn</div><ul><li>Play one card, or draw 1 (that ends your turn).</li><li>A Door card must match the floor’s wing or number.</li><li>Entity, shop, defense, healer and utility cards can be played any time on your turn.</li><li>Hide is played when an entity targets you. It cancels the hit and has 2 uses.</li><li>Bandage pieces heal 100 each and can be used for free any time on your turn.</li></ul></section>'
    +'<section class="plaque"><div class="h3">Protection</div><ul><li><b>Crucifix</b>: blocks 5 hits, but not Seek or Figure unless Guiding Light is on.</li><li><b>Holy Grenade</b>: blocks 3 hits from anything.</li><li><b>Guiding Light / Curious Light</b>: stun-proof. Seek and Figure switch Guiding Light off for 3 turns.</li><li><b>Revive Lotus</b>: hold it. At 0 HP you revive at half health.</li></ul>'
    +'<div class="h3" style="margin-top:14px">Modes</div><ul><li><b>Easy</b>: 1,500 HP, damage x0.8, more Hide and protection.</li><li><b>Normal</b>: 1,000 HP, damage as written.</li><li><b>Chaos</b>: 800 HP, damage x1.5, more entities, less Hide.</li></ul></section>'
    +'<section class="plaque"><div class="h3">Door wings</div><p>Crimson ◆, Azure ●, Emerald ▲, Amber ■. Numbers 1 to 9, two of each.</p>'
    +'<div class="h3" style="margin-top:14px">Playing with friends</div><p>Open Players to set up to four people on one device. A cover screen hides each hand until its owner is ready.</p><div class="h3" style="margin-top:14px">Entity art</div><p>Every action card has an image slot. Open the Card Index, pick a card and add your own image.</p></section>'
    +'</div></main>';
}

/* ================= game view ================= */
function viewerIdx(){
  if(G.cover!==null)return -1;
  if(G.online)return G.viewer;
  if(G.humans===0)return 0;
  if(G.humans===1)return G.players.findIndex(p=>p.human);
  return G.viewer;
}
function sortedHand(){
  const names=Object.keys(DEFS);
  const wi=c=>WINGS.findIndex(w=>w.id===c.color)*10+c.num;
  const order=SET.sort==='type'
    ?c=>c.kind==='door'?1000+wi(c):names.indexOf(c.name)
    :c=>c.kind==='door'?wi(c):100+names.indexOf(c.name);
  const V=viewerIdx();
  return V<0?[]:G.players[V].hand.slice().sort((a,b)=>order(a)-order(b));
}
function findCard(id){
  const V=viewerIdx();
  const pools=[V<0?[]:G.players[V].hand,G.discard,G.modal&&G.modal.cards?G.modal.cards:[]];
  for(const pl of pools){const c=pl.find(x=>x.id===id);if(c)return c;}
  return null;
}
function detailHTML(){
  const c=G.detail?findCard(G.detail):null;
  if(!c)return 'Hover or focus a card to read it. Highlighted cards can be played.';
  if(c.kind==='door')return '<b>'+c.name.toUpperCase()+'</b> Door card. Match the floor’s wing or the number '+c.num+'.';
  return '<b>'+c.name+'</b> '+fmt(DEFS[c.name].text);
}
function stateChips(i){
  const p=G.players[i],c=[];
  if(p.crucifix>0)c.push('Crucifix '+p.crucifix);
  if(p.grenade>0)c.push('Grenade '+p.grenade);
  if(p.light>0)c.push(p.lightOff>0?'Guiding Light off':'Guiding Light '+p.light);
  if(p.curious>0)c.push('Curious Light '+p.curious);
  if(p.herb>0)c.push('Herb '+p.herb);
  if(p.bandage>0)c.push('Bandage '+p.bandage);
  if(p.stun>0)c.push('Stunned '+p.stun);
  if(p.bleed)c.push('Bleeding');
  if(p.timothy>0)c.push('Timothy '+p.timothy);
  if(p.boost>1)c.push('Attack x1.5');
  return c.map(x=>'<span class="chipx">'+x+'</span>').join('');
}
function revealed(i){
  const V=viewerIdx();
  if(V<0||i===V)return false;
  if(G.netClient)return !!G.players[i].vis;
  const h=G.players[V];
  return (G.halt===V)||(h.curious>0&&i===nextAlive(V,1))||(h.peek===i);
}
function playerHTML(i){
  const p=G.players[i];
  const pct=Math.round(p.hp/p.maxHp*100);
  const turn=!G.over&&G.cur===i&&p.alive;
  const backs=p.hand.length?Array.from({length:Math.min(p.hand.length,14)},()=>'<span class="mini">'+eyeSVG('#D2AC62')+'</span>').join(''):'<span class="none">No cards</span>';
  return '<section class="pl'+(turn?' turn':'')+(p.alive?'':' out')+'" aria-label="'+p.name+'">'
    +'<div class="ph"><span class="pn">'+p.name+'</span>'+(turn?'<span class="tg">TURN</span>':'')+(p.alive?'':'<span class="tg off">OUT</span>')+'</div>'
    +'<div class="hpbar'+(pct<30?' low':'')+'" role="img" aria-label="'+money(p.hp)+' of '+money(p.maxHp)+' HP"><i style="width:'+pct+'%"></i></div>'
    +'<div class="hpn">'+money(p.hp)+'/'+money(p.maxHp)+' HP · '+p.hand.length+' card'+(p.hand.length===1?'':'s')+'</div>'
    +'<div class="backs">'+backs+'</div>'
    +(p.alive&&revealed(i)?'<div class="reveal"><b>HAND</b> '+(p.hand.map(c=>c.name).join(', ')||'empty')+'</div>':'')
    +'<div class="chips">'+stateChips(i)+'</div></section>';
}
function statusText(){
  if(G.over)return G.endMsg;
  const meP=G.online?G.players[G.viewer]:(G.humans===1?G.players.find(p=>p.human):null);
  if(meP&&!meP.alive)return 'You are out. The others play on.';
  if(G.pendingAct&&!G.modal){
    const yt=(G.humans>1&&!(G.online&&G.cur===G.viewer))?nm(G.cur)+'’s turn':'Your turn';
    if(G.actMode==='done')return 'Play another card, or press Done.';
    const any=G.players[G.cur].hand.some(c=>canPlay(G.cur,c));
    return any?yt+': play a highlighted card, or draw 1.':yt+': nothing to play. Draw 1.';
  }
  if(G.modal)return 'Make a choice.';
  return nm(G.cur)+' '+(you(G.cur)?'are':'is')+' playing…';
}
const me_i=p=>G.players.indexOf(p);
function gameHTML(){
  const V=viewerIdx();
  const me=G.players[V>=0?V:G.cur];
  const ready=!!G.pendingAct&&!G.modal;
  const others=G.players.map((p,k)=>k).filter(k=>V<0||k!==V);
  const top=G.discard[G.discard.length-1];
  const w=wing(G.floor.color);
  const states=['<span class="chipx">'+(G.dir===1?'Clockwise ↻':'Counter-clockwise ↺')+'</span>'];
  if(G.halt!==null)states.push('<span class="chipx">Halt: hands shown</span>');
  const lines=G.log.slice(-10).reverse().map(s=>'<li>'+s+'</li>').join('');
  const hand=sortedHand();
  const pct=Math.round(me.hp/me.maxHp*100);
  const label=G.actMode==='done'&&ready?'Done':'Draw · '+G.deck.length;
  return '<main><div class="gstrip"><div class="status" role="status">'+statusText()+'</div><div class="meta">'+G.mode.name.toUpperCase()+' · <span class="roomplate">ROOM '+String(G.round).padStart(3,'0')+'</span></div>'
    +'<div class="btns">'+(V>=0&&me.bandage>0?'<button class="btn" data-act="band"'+(ready&&me.hp<me.maxHp?'':' disabled')+'>Bandage ('+me.bandage+')</button>':'')+''+(G.online?'<button class="btn" data-act="netleave">Leave room</button>':'<button class="btn" data-act="newgame">New game</button>')+'</div></div>'
    +'<div class="gg"><div class="seats'+(others.length===4?' s4':'')+'">'+others.map(playerHTML).join('')+'</div>'
    +'<div class="tablezone"><div class="piles">'
    +'<button class="pile'+(ready?' ready':'')+'" data-act="draw" '+(ready?'':'disabled')+' aria-label="'+(G.actMode==='done'?'End your turn':'Draw one card, '+G.deck.length+' left in the deck')+'">'+backHTML()+'<span class="plabel">'+label+'</span></button>'
    +'<div class="dpile">'+(top?faceHTML(top):'')+'<span class="plabel">Discard</span></div>'
    +'<div class="floor"><span class="plabel">Floor</span><span class="fplate" style="--c:'+w.bg+';--f:'+w.fg+'">'+shapeSVG(w.shape,34)+G.floor.num+'</span><span class="fname">'+w.name+' '+G.floor.num+'</span></div>'
    +'</div><div class="states">'+states.join('')+'</div></div>'
    +'<aside class="logcol"><ol class="plaque log" aria-label="Game log">'+lines+'</ol></aside>'
    +'<section class="me" aria-label="Your hand"><div class="pl'+(!G.over&&G.cur===me_i(me)&&me.alive?' turn':'')+(me.alive?'':' out')+'"><div class="mehead"><span class="pn">'+me.name+'</span>'+(!G.over&&G.cur===me_i(me)&&me.alive?'<span class="tg">'+(G.humans>1?'TURN':'YOUR TURN')+'</span>':'')+'<div class="hpbar'+(pct<30?' low':'')+'" role="img" aria-label="'+money(me.hp)+' of '+money(me.maxHp)+' HP"><i style="width:'+pct+'%"></i></div><span class="hpn">'+money(me.hp)+'/'+money(me.maxHp)+' HP · '+me.hand.length+' cards</span></div><div class="chips">'+stateChips(me_i(me))+'</div></div>'
    +'<div class="hand">'+(hand.length?hand.map(c=>{
        const ok=ready&&V===G.cur&&canPlay(V,c);
        return '<button class="cardbtn'+(ok?' ok':'')+'" data-act="play" data-id="'+c.id+'" '+(ok?'':'disabled')+' aria-label="'+cardAria(c)+'">'+faceHTML(c)+'</button>';
      }).join(''):(V<0?'<div class="hidden-hand">Hands are hidden while the device is passed.</div>':'<span class="none">Your hand is empty.</span>'))+'</div>'
    +'<div class="plaque detail" id="detail">'+detailHTML()+'</div></section></div></main>';
}
const HINTS=['Keep a Hide card in hand. Entities rarely warn you twice.','Seek and Figure ignore a Crucifix unless your Guiding Light is on.','Bandage pieces heal for free. Do not die holding them.','A Holy Grenade blocks anything, even Seek.','Emptying your hand ends the room. Everyone else pays for every card left.','Dupe has two fake doors out of three.','Revive Lotus only works while it is in your hand.','Halt shows everyone’s hands. Use it before a big play.'];
function deathScreen(won,title,by,buttons){
  if(G.hintIdx===undefined)G.hintIdx=rnd(HINTS.length);
  return '<div class="dead'+(won?' won':'')+'" role="dialog" aria-modal="true" aria-labelledby="dt"><span class="roomplate">ROOM '+String(G.round).padStart(3,'0')+'</span><h2 id="dt">'+title+'</h2><div class="by">'+by+'</div>'
    +'<div class="hint"><small>'+(won?'THE HOTEL REMEMBERS':'HINT')+'</small>'+(won?'You made it to the next door.':HINTS[G.hintIdx])+'</div><div class="opts" style="justify-content:center">'+buttons+'</div></div>';
}
function modalHTML(){
  if(G.cover!==null&&G.coverRes){
    const p=G.players[G.cover];
    return '<div class="overlay cover"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dt"><h2 id="dt">Pass the device</h2><p>This turn is for <b>'+p.name+'</b>. Everyone else, look away.</p><div class="opts" style="justify-content:center"><button class="btn primary" data-act="uncover" data-focus="1">I am '+p.name+'</button></div></div></div>';
  }
  const meP=G.online?G.players[G.viewer]:(G.humans===1?G.players.find(p=>p.human):null);
  const leave='<button class="btn" data-act="netleave">Leave room</button>';
  const btns=G.online?((G.netClient?'':'<button class="btn primary" data-act="netlobby" data-focus="1">Back to lobby</button>')+leave):'<button class="btn primary" data-act="again" data-focus="1">Play again</button><button class="btn" data-go="setup">Players</button><button class="btn" data-go="home">Home</button>';
  if(G.over){
    if(G.auto)return deathScreen(false,'THE END','The bots finished the game. '+G.endMsg,btns);
    const w=G.players[G.winner];
    if(meP){
      if(G.winner===G.players.indexOf(meP))return deathScreen(true,'YOU MADE IT','You were the last one standing.',btns);
      return deathScreen(false,'YOU DIED','Killed by '+(meP.lastSrc||'the hotel')+'. '+w.name+' won.',btns);
    }
    return deathScreen(true,w.name.toUpperCase()+' WINS','Last one standing.',btns);
  }
  if(meP&&!G.deadSeen){
    if(!meP.alive)return deathScreen(false,'YOU DIED','Killed by '+(meP.lastSrc||'the hotel')+'.','<button class="btn primary" data-act="dismiss" data-focus="1">Watch the rest</button>'+(G.online?leave:'<button class="btn" data-act="again">Play again</button><button class="btn" data-go="home">Home</button>'));
  }
  const m=G.modal;if(!m)return '';
  if(m.type==='choose'){
    return '<div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dt"><h2 id="dt">'+m.title+'</h2><p>'+m.text+'</p><div class="opts">'
      +m.options.map((o,k)=>'<button class="btn'+(k===0?' primary':'')+'" data-act="opt" data-i="'+k+'"'+(k===0?' data-focus="1"':'')+'>'+o.label+'</button>').join('')+'</div></div></div>';
  }
  if(m.type==='quiz'){
    return '<div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dt"><h2 id="dt">Dread asks you a question</h2><p>Answer within 30 seconds, or take the damage.</p>'
      +'<div class="qbox"><span class="qt" style="font-size:30px;color:var(--bone)">'+m.q+' =</span><label for="qa" class="none">Your answer</label><input id="qa" inputmode="numeric" autocomplete="off" data-focus="1"><button class="btn primary" data-act="qok">Answer</button><span class="qt" id="qt">'+m.left+'s</span></div></div></div>';
  }
  const ready=m.sel.length===m.count;
  return '<div class="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dt"><h2 id="dt">'+m.title+'</h2><p>'+m.text+' ('+m.sel.length+'/'+m.count+' chosen)</p><div class="pickgrid">'
    +m.cards.map(c=>{
      const k=m.sel.indexOf(c.id);
      return '<button class="cardbtn'+(k>=0?' sel':'')+'" data-act="sel" data-id="'+c.id+'" aria-pressed="'+(k>=0)+'" aria-label="'+cardAria(c)+'"'+(m.focusId===c.id?' data-focus="1"':'')+'>'+faceHTML(c)+(k>=0&&m.ordered?'<span class="ord">'+(k+1)+'</span>':'')+'</button>';
    }).join('')
    +'</div><div class="opts"><button class="btn primary" data-act="ok"'+(ready?'':' disabled')+(m.focusId===null?' data-focus="1"':'')+'>Confirm</button></div></div></div>';
}
function drawView(){
  if(G&&G.over&&!G.statDone&&!G.auto){G.statDone=true;recordResult();}
  let body;
  if(VIEW==='game'&&G)body=gameHTML();
  else if(VIEW==='index')body=indexHTML();
  else if(VIEW==='settings')body=settingsHTML();
  else if(VIEW==='rules')body=rulesHTML();
  else if(VIEW==='setup')body=setupHTML();
  else if(VIEW==='online')body=onlineHTML();
  else if(VIEW==='profile')body=profileHTML();
  else{VIEW='home';body=homeHTML();}
  $app.innerHTML=navHTML()+body+(VIEW==='game'&&G?modalHTML():'');
  if(VIEW==='game'&&G&&(G.modal||G.over||G.cover!==null||$app.querySelector('.dead'))){
    const f=$app.querySelector('[data-focus]')||$app.querySelector('.dialog button:not([disabled])');
    if(f)f.focus();
  }
}
function render(){if(VIEW==='game')drawView();if(G&&G.online&&!G.netClient)broadcast();}

/* ================= art upload, backup ================= */
function loadImage(file,name){
  const r=new FileReader();
  r.onload=()=>{
    const im=new Image();
    im.onload=async()=>{
      const W=400,H=560;
      const cv=document.createElement('canvas');cv.width=W;cv.height=H;
      const x=cv.getContext('2d');
      const sc=Math.max(W/im.width,H/im.height);
      const w=im.width*sc,h=im.height*sc;
      x.fillStyle='#000';x.fillRect(0,0,W,H);
      x.drawImage(im,(W-w)/2,(H-h)/2,w,h);
      ART[name]=cv.toDataURL('image/jpeg',0.86);
      const ok=await persistArt();
      TOAST=ok?'Saved image for '+name+'.':'Could not save to this browser. The image stays until you close the page.';
      drawView();
    };
    im.onerror=()=>{TOAST='That file could not be read as an image.';drawView();};
    im.src=r.result;
  };
  r.readAsDataURL(file);
}
/* ================= crop and edit ================= */
let CROP=null;
const $crop=document.createElement('div');$crop.id='croproot';document.body.appendChild($crop);
function openCrop(src,name){
  const go2=url=>{
    const im=new Image();
    im.onload=()=>{CROP={name,im,zoom:1,ox:0,oy:0,rot:0,flip:false,br:1,ct:1};buildCrop();};
    im.onerror=()=>{TOAST='That file could not be read as an image.';drawView();};
    im.src=url;
  };
  if(typeof src==='string')go2(src);
  else{const r=new FileReader();r.onload=()=>go2(r.result);r.readAsDataURL(src);}
}
function paintCrop(cv,W,H,guide){
  const C=CROP,x=cv.getContext('2d');
  x.fillStyle='#000';x.fillRect(0,0,W,H);
  const odd=C.rot%2===1;
  const iw=odd?C.im.height:C.im.width,ih=odd?C.im.width:C.im.height;
  const s=Math.max(W/iw,H/ih)*C.zoom;
  const mx=Math.max(0,(iw*s-W)/2),my=Math.max(0,(ih*s-H)/2);
  const ox=Math.max(-mx,Math.min(mx,C.ox*W)),oy=Math.max(-my,Math.min(my,C.oy*H));
  C.ox=ox/W;C.oy=oy/H;
  x.save();
  try{x.filter='brightness('+C.br+') contrast('+C.ct+')';}catch(e){}
  x.translate(W/2+ox,H/2+oy);x.rotate(C.rot*Math.PI/2);x.scale(C.flip?-1:1,1);
  x.drawImage(C.im,-C.im.width*s/2,-C.im.height*s/2,C.im.width*s,C.im.height*s);
  x.restore();
  if(guide){
    x.save();x.beginPath();x.moveTo(0,H*.6);x.lineTo(W,H*.7);x.lineTo(W,H);x.lineTo(0,H);x.closePath();
    x.fillStyle='rgba(0,0,0,.74)';x.fill();
    x.strokeStyle='#E3B55E';x.setLineDash([6,5]);x.lineWidth=2;x.beginPath();x.moveTo(0,H*.6);x.lineTo(W,H*.7);x.stroke();
    x.setLineDash([]);x.fillStyle='#F2E6CF';x.font='14px "Special Elite",monospace';x.fillText('Ability text sits here',12,H*.84);
    x.restore();
  }
}
function repaintCrop(){const cv=document.getElementById('cropcv');if(cv&&CROP)paintCrop(cv,300,420,true);}
function buildCrop(){
  const C=CROP;
  const sl=(id,label,min,max,v)=>'<label class="cl" for="'+id+'">'+label+'</label><input type="range" id="'+id+'" min="'+min+'" max="'+max+'" step="0.01" value="'+v+'">';
  $crop.innerHTML='<div class="overlay" style="z-index:25"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="cht" style="max-width:760px"><h2 id="cht">Crop and edit: '+C.name+'</h2>'
    +'<p>Drag the picture to move it. The dimmed area is where the ability text sits. Only the part above it shows on the card.</p>'
    +'<div class="cropgrid"><canvas id="cropcv" width="300" height="420" tabindex="0" aria-label="Image preview. Use arrow keys to move, plus and minus to zoom."></canvas>'
    +'<div class="cropctl">'+sl('cz','Zoom',1,4,C.zoom)+sl('cb','Brightness',0.5,1.6,C.br)+sl('cc','Contrast',0.5,1.8,C.ct)
    +'<div class="opts"><button class="btn" data-c="rotl">Rotate left</button><button class="btn" data-c="rotr">Rotate right</button><button class="btn" data-c="flip">Flip</button><button class="btn" data-c="reset">Reset</button></div></div></div>'
    +'<div class="opts" style="margin-top:16px"><button class="btn primary" data-c="ok">Confirm image</button><button class="btn" data-c="cancel">Cancel</button></div></div></div>';
  const cv=document.getElementById('cropcv');
  let drag=null;
  cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);});
  cv.addEventListener('pointermove',e=>{
    if(!drag||!CROP)return;
    const r=cv.getBoundingClientRect();
    CROP.ox+=(e.clientX-drag.x)/r.width;CROP.oy+=(e.clientY-drag.y)/r.height;
    drag={x:e.clientX,y:e.clientY};repaintCrop();
  });
  const end=()=>{drag=null;};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  cv.addEventListener('wheel',e=>{e.preventDefault();setZoom(CROP.zoom*(e.deltaY<0?1.08:0.93));},{passive:false});
  cv.addEventListener('keydown',e=>{
    const k=e.key,st=0.03;let h=true;
    if(k==='ArrowLeft')CROP.ox-=st;else if(k==='ArrowRight')CROP.ox+=st;else if(k==='ArrowUp')CROP.oy-=st;else if(k==='ArrowDown')CROP.oy+=st;
    else if(k==='+'||k==='=')setZoom(CROP.zoom*1.08);else if(k==='-')setZoom(CROP.zoom*0.93);else h=false;
    if(h){e.preventDefault();repaintCrop();}
  });
  repaintCrop();cv.focus();
}
function setZoom(z){CROP.zoom=Math.max(1,Math.min(4,z));const el=document.getElementById('cz');if(el)el.value=CROP.zoom;repaintCrop();}
function closeCrop(){CROP=null;$crop.innerHTML='';}
$crop.addEventListener('input',e=>{
  if(!CROP)return;
  const id=e.target.id,v=parseFloat(e.target.value);
  if(id==='cz')CROP.zoom=v;else if(id==='cb')CROP.br=v;else if(id==='cc')CROP.ct=v;
  repaintCrop();
});
$crop.addEventListener('click',async e=>{
  const b=e.target.closest('[data-c]');if(!b||!CROP)return;
  const c=b.dataset.c;
  if(c==='rotl'){CROP.rot=(CROP.rot+3)%4;CROP.ox=0;CROP.oy=0;repaintCrop();}
  else if(c==='rotr'){CROP.rot=(CROP.rot+1)%4;CROP.ox=0;CROP.oy=0;repaintCrop();}
  else if(c==='flip'){CROP.flip=!CROP.flip;repaintCrop();}
  else if(c==='reset'){Object.assign(CROP,{zoom:1,ox:0,oy:0,rot:0,flip:false,br:1,ct:1});['cz','cb','cc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=1;});repaintCrop();}
  else if(c==='cancel'){closeCrop();}
  else if(c==='ok'){
    const cv=document.createElement('canvas');cv.width=400;cv.height=560;
    paintCrop(cv,400,560,false);
    const name=CROP.name;
    ART[name]=cv.toDataURL('image/jpeg',0.88);
    closeCrop();
    const ok=await persistArt();
    TOAST=ok?'Saved image for '+name+'.':'Could not save to this browser. The image stays until you close the page.';
    drawView();
  }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&CROP)closeCrop();});
function exportArt(){
  try{
    const blob=new Blob([JSON.stringify({doords:1,art:ART})],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='doords-card-art.json';
    document.body.appendChild(a);a.click();a.remove();
    TOAST='Exported '+artCount()+' images.';
  }catch(e){TOAST='Export is not available here.';}
  drawView();
}
function importArt(file){
  const r=new FileReader();
  r.onload=async()=>{
    try{
      const j=JSON.parse(r.result);let n=0;
      Object.keys(j.art||{}).forEach(k=>{if(DEFS[k]&&typeof j.art[k]==='string'&&j.art[k].indexOf('data:image/')===0){ART[k]=j.art[k];n++;}});
      await persistArt();TOAST='Imported '+n+' images.';
    }catch(e){TOAST='That file is not a Doords backup.';}
    drawView();
  };
  r.readAsText(file);
}


/* ================= profile and stats ================= */
let PROFILE={name:'Player',avatar:'eye'};
try{Object.assign(PROFILE,JSON.parse(localStorage.getItem('doords-profile')||'{}'));}catch(e){}
let STATS={games:0,wins:0,losses:0,bestRoom:0};
try{Object.assign(STATS,JSON.parse(localStorage.getItem('doords-stats')||'{}'));}catch(e){}
function saveProfile(){try{localStorage.setItem('doords-profile',JSON.stringify(PROFILE));}catch(e){}}
function saveStats(){try{localStorage.setItem('doords-stats',JSON.stringify(STATS));}catch(e){}}
function recordResult(){
  const meP=G.online?G.players[G.viewer]:(G.humans===1?G.players.find(p=>p.human):null);
  if(!meP)return;
  STATS.games++;
  if(G.winner===G.players.indexOf(meP))STATS.wins++;else STATS.losses++;
  STATS.bestRoom=Math.max(STATS.bestRoom||0,G.round);
  saveStats();
}
function avatarHTML(k,size){
  const f=ICONS[k]||ICONS.eye;
  return '<span class="av" style="width:'+size+'px;height:'+size+'px">'+f[1]('#E3B55E')+'</span>';
}
function profileHTML(){
  const rate=STATS.games?Math.round(STATS.wins/STATS.games*100)+'%':'none yet';
  return '<main><h1 class="h2">Profile</h1><p class="lead">Your name and look in online rooms. Saved on this device.</p><div class="sgrid">'
    +'<section class="plaque"><div class="h3">Who are you</div>'
    +'<div class="srow"><label for="pname">Display name</label><input id="pname" class="tin" maxlength="14" value="'+PROFILE.name.replace(/"/g,'&quot;')+'" autocomplete="off"></div>'
    +'<div class="srow"><span class="lb">Avatar</span><div class="iconpick">'+Object.keys(ICONS).map(k=>'<button class="icb" data-act="pavatar" data-v="'+k+'" aria-pressed="'+(PROFILE.avatar===k)+'">'+ICONS[k][1]('#E3B55E')+ICONS[k][0]+'</button>').join('')+'</div></div></section>'
    +'<section class="plaque"><div class="h3">Record</div>'
    +'<table class="stat"><tr><td>Games finished</td><td>'+STATS.games+'</td></tr><tr><td>Wins</td><td>'+STATS.wins+'</td></tr><tr><td>Deaths</td><td>'+STATS.losses+'</td></tr><tr><td>Win rate</td><td>'+rate+'</td></tr><tr><td>Deepest room</td><td>'+(STATS.bestRoom?'ROOM '+String(STATS.bestRoom).padStart(3,'0'):'none yet')+'</td></tr></table>'
    +'<div class="opts" style="margin-top:10px"><button class="btn danger" data-act="resetstats">Reset record</button></div>'
    +'<p class="note" style="margin-top:10px">This is a profile, not an account with a password. It lives only in this browser. Passwords and a record that follows you between devices need a server.</p></section></div></main>';
}

/* ================= online play (peer to peer) ================= */
const NET={turnMs:(+(localStorage.getItem('doords-turnms'))||75000),role:null,peer:null,code:'',conns:[],hostConn:null,lobby:null,status:'',err:'',mode:'normal',started:false,prefill:''};
function peerOpts(){let o={};try{o=JSON.parse(localStorage.getItem('doords-peer')||'{}')||{};}catch(e){}return Object.assign({debug:0},o);}
function newCode(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ';let s='';for(let i=0;i<4;i++)s+=c[rnd(c.length)];return s;}
function netErr(e){
  const t=e&&e.type;
  if(t==='peer-unavailable')return 'No room with that code.';
  if(t==='network'||t==='server-error'||t==='socket-error'||t==='socket-closed')return 'Could not reach the matchmaking service. Check your connection.';
  return 'Online play hit a problem'+(t?' ('+t+')':'')+'.';
}
function copyText(v){
  const done=ok=>{TOAST=ok?'Copied.':'Copy failed. Select the text instead.';drawView();};
  try{navigator.clipboard.writeText(v).then(()=>done(true),()=>done(false));}catch(e){done(false);}
}
function netReset(){
  try{if(NET.peer)NET.peer.destroy();}catch(e){}
  NET.role=null;NET.peer=null;NET.code='';NET.conns=[];NET.hostConn=null;NET.lobby=null;NET.status='';NET.started=false;
}
function leaveRoom(keepErr){
  const wasGame=G&&G.online;
  if(NET.role==='host'){NET.conns.forEach(c=>{try{c.send({t:'bye'});}catch(e){}});}
  if(wasGame){runToken++;G=null;}
  const e=NET.err;netReset();NET.err=keepErr?e:'';
  VIEW='online';drawView();
}
function lobbyPlayers(){
  const me={name:PROFILE.name||'Host',icon:PROFILE.avatar};
  return [me].concat(NET.conns.filter(c=>c.dname).map(c=>({name:c.dname,icon:c.dicon})));
}
function sendLobby(){
  if(NET.role!=='host')return;
  const m={t:'lobby',code:NET.code,players:lobbyPlayers(),mode:NET.mode};
  NET.conns.forEach(c=>{try{c.send(m);}catch(e){}});
}
function hostRoom(){
  if(!window.Peer){NET.err='Online play needs to load a helper library, and it could not load. Check your connection and reload.';drawView();return;}
  netReset();NET.err='';NET.role='host';NET.status='Opening room…';NET.mode=SET.mode||'normal';
  drawView();tryOpen(0);
}
function tryOpen(n){
  const code=newCode();let peer;
  try{peer=new Peer('doords-'+code,peerOpts());}catch(e){NET.err=netErr(e);NET.role=null;drawView();return;}
  NET.peer=peer;
  peer.on('open',()=>{NET.code=code;NET.status='ready';drawView();});
  peer.on('error',e=>{
    if(e&&e.type==='unavailable-id'&&n<6){try{peer.destroy();}catch(_){}tryOpen(n+1);return;}
    NET.err=netErr(e);if(!NET.code){NET.role=null;}drawView();
  });
  peer.on('connection',c=>onHostConn(c));
}
function onHostConn(c){
  c.on('open',()=>{
    if(NET.started||NET.conns.length>=3){try{c.send({t:'full'});}catch(e){}setTimeout(()=>{try{c.close();}catch(e){}},400);return;}
  });
  c.on('data',m=>onHostMsg(c,m));
  c.on('close',()=>onHostClose(c));
  c.on('error',()=>onHostClose(c));
}
function uniqueName(n){
  n=String(n||'Guest').replace(/[<>&"]/g,'').slice(0,14)||'Guest';
  const used=lobbyPlayers().map(p=>p.name).concat(NET.conns.map(c=>c.dname).filter(Boolean));
  let out=n,k=2;while(used.indexOf(out)>=0)out=n.slice(0,12)+k++;
  return out;
}
function onHostMsg(c,m){
  if(!m||typeof m!=='object')return;
  if(m.t==='hello'){
    if(NET.started||c.dname)return;
    if(NET.conns.length>=3&&NET.conns.indexOf(c)<0){try{c.send({t:'full'});}catch(e){}return;}
    c.dname=uniqueName(m.name);c.dicon=ICONS[m.icon]?m.icon:'eye';
    if(NET.conns.indexOf(c)<0)NET.conns.push(c);
    sendLobby();drawView();return;
  }
  if(!G||!G.online)return;
  const seat=G.players.findIndex(p=>p.conn===c);if(seat<0)return;
  const p=G.players[seat];
  if(m.t==='band'){if(p.ask&&p.ask.kind==='turn'&&useBandage(seat))render();return;}
  const ask=p.ask;if(!ask)return;
  p.afk=0;
  if(m.t==='act'&&ask.kind==='turn'){
    const a=m.a||{};
    if(a.type==='draw'){clearTimeout(ask.timer);p.ask=null;ask.res({type:'draw'});}
    else if(a.type==='play'){
      const card=p.hand.find(x=>x.id===a.id);
      if(card&&G.cur===seat&&canPlay(seat,card)){clearTimeout(ask.timer);p.ask=null;ask.res({type:'play',card});}
    }
    return;
  }
  if(m.t==='reply'){
    if(ask.kind==='choose'){clearTimeout(ask.timer);p.ask=null;ask.res(m.v);}
    else if(ask.kind==='pick'){
      const ids=Array.isArray(m.v)?m.v:[];
      const cards=ids.map(id=>ask.cards.find(x=>x.id===id)).filter(Boolean);
      clearTimeout(ask.timer);p.ask=null;ask.res(cards.length?cards:ask.dflt);
    }
    else if(ask.kind==='quiz'){clearTimeout(ask.timer);p.ask=null;ask.res(!!m.v);}
  }
}
function onHostClose(c){
  if(NET.role!=='host')return;
  if(NET.started&&G&&G.online){
    const seat=G.players.findIndex(p=>p.conn===c);
    if(seat>=0){
      const p=G.players[seat];
      if(p.remote){
        p.remote=false;p.human=false;p.conn=null;G.humans=Math.max(1,G.players.filter(x=>x.human).length);
        const ask=p.ask;p.ask=null;if(ask){clearTimeout(ask.timer);ask.res(ask.dflt);}
        log(p.name+' left. A bot takes over.');render();
      }
    }
    return;
  }
  const i=NET.conns.indexOf(c);
  if(i>=0){NET.conns.splice(i,1);sendLobby();if(VIEW==='online')drawView();}
}
function hostStart(){
  if(NET.role!=='host'||NET.started||!NET.code)return;
  const seats=[{n:PROFILE.name||'Host',h:true,conn:null}];
  NET.conns.filter(c=>c.dname&&c.open).forEach(c=>seats.push({n:c.dname,h:true,conn:c}));
  const bots=['Mara','Theo','Ivy','Ash'];
  const taken=seats.map(x=>x.n);
  for(const b of bots){if(seats.length>=4)break;if(taken.indexOf(b)<0){seats.push({n:b,h:false,conn:null});taken.push(b);}}
  while(seats.length<4)seats.push({n:'Guest'+seats.length,h:false,conn:null});
  NET.started=true;
  startNet(NET.mode,seats);
}
function backToLobby(){
  if(NET.role==='host'){NET.started=false;runToken++;G=null;sendLobby();VIEW='online';drawView();}
}
function joinRoom(code){
  code=String(code||'').trim().toUpperCase();
  if(!/^[A-Z]{4}$/.test(code)){NET.err='Enter the 4 letter room code.';drawView();return;}
  if(!window.Peer){NET.err='Online play needs to load a helper library, and it could not load. Check your connection and reload.';drawView();return;}
  netReset();NET.err='';NET.role='client';NET.code=code;NET.status='Connecting…';drawView();
  let peer;
  try{peer=new Peer(undefined,peerOpts());}catch(e){NET.err=netErr(e);netReset();drawView();return;}
  NET.peer=peer;
  const timer=setTimeout(()=>{if(NET.role==='client'&&NET.status!=='joined'){NET.err='Could not reach that room. Check the code and try again.';netReset();drawView();}},15000);
  peer.on('open',()=>{
    const c=peer.connect('doords-'+code,{reliable:true});NET.hostConn=c;
    c.on('open',()=>{clearTimeout(timer);NET.status='joined';try{c.send({t:'hello',name:PROFILE.name||'Guest',icon:PROFILE.avatar});}catch(e){}drawView();});
    c.on('data',onClientMsg);
    c.on('close',()=>{if(NET.role==='client'){NET.err='The host closed the room.';leaveRoom(true);}});
    c.on('error',()=>{});
  });
  peer.on('error',e=>{clearTimeout(timer);NET.err=netErr(e);netReset();VIEW='online';drawView();});
}
function onClientMsg(m){
  if(!m||typeof m!=='object')return;
  if(m.t==='full'){NET.err='That room is full or already playing.';netReset();drawView();return;}
  if(m.t==='bye'){NET.err='The host closed the room.';leaveRoom(true);return;}
  if(m.t==='lobby'){
    NET.lobby=m;
    if(G&&G.netClient){G=null;}
    if(VIEW==='game')VIEW='online';
    drawView();return;
  }
  if(m.t==='state'){applyState(m);return;}
  if(!G||!G.netClient)return;
  if(m.t==='turn'){
    G.actMode=m.mode||'draw';
    G.pendingAct=a=>{try{NET.hostConn.send({t:'act',a:a.type==='play'?{type:'play',id:a.card.id}:{type:'draw'}});}catch(e){}};
    render();return;
  }
  if(m.t==='modal'){
    const md=m.m;
    const send=v=>{try{NET.hostConn.send({t:'reply',v});}catch(e){}};
    if(md.type==='choose')G.modal={type:'choose',title:md.title,text:md.text,options:md.options,resolve:send};
    else if(md.type==='pick')G.modal={type:'pick',title:md.title,text:md.text,cards:md.cards,count:md.count,ordered:md.ordered,sel:[],focusId:null,resolve:cs=>send(cs.map(x=>x.id))};
    else if(md.type==='quiz'){
      const q={type:'quiz',q:md.q,ans:md.ans,left:md.left,resolve:send};
      G.modal=q;
      const tick=setInterval(()=>{
        if(!G||G.modal!==q){clearInterval(tick);return;}
        q.left--;const el=document.getElementById('qt');if(el)el.textContent=q.left+'s';
        if(q.left<=0){clearInterval(tick);G.modal=null;render();}
      },1000);
    }
    render();
  }
}
function revealedTo(s,i){
  if(s===i)return false;
  const h=G.players[s];
  return (G.halt===s)||(h.curious>0&&i===nextAlive(s,1))||(h.peek===i);
}
function snapFor(s){
  return{t:'state',seat:s,mode:G.mode.id,round:G.round,cur:G.cur,dir:G.dir,halt:G.halt,floor:G.floor,deckN:G.deck.length,
    top:G.discard[G.discard.length-1]||null,log:G.log.slice(-14),over:G.over,winner:G.winner,endMsg:G.endMsg,
    players:G.players.map((p,i)=>({name:p.name,hp:p.hp,maxHp:p.maxHp,alive:p.alive,lastSrc:p.lastSrc||null,crucifix:p.crucifix,grenade:p.grenade,light:p.light,lightOff:p.lightOff,curious:p.curious,herb:p.herb,bandage:p.bandage,stun:p.stun,bleed:p.bleed,timothy:p.timothy,boost:p.boost,
      n:p.hand.length,hand:(i===s||revealedTo(s,i))?p.hand:null}))};
}
let bq=false;
function broadcast(){
  if(bq)return;bq=true;
  Promise.resolve().then(()=>{
    bq=false;
    if(!G||!G.online||G.netClient)return;
    G.players.forEach((p,s)=>{if(p.remote&&p.conn&&p.conn.open){try{p.conn.send(snapFor(s));}catch(e){}}});
  });
}
function applyState(m){
  const fresh=!G||!G.netClient;
  if(fresh){
    G={netClient:true,online:true,auto:false,humans:2,viewer:m.seat,cover:null,coverRes:null,promptSeat:-1,modal:null,pendingAct:null,actMode:'draw',detail:0,token:0,players:[],deck:[],discard:[],extra:0,turns:0,statDone:false,deadSeen:false};
  }
  G.viewer=m.seat;G.mode=MODES[m.mode]||MODES.normal;G.round=m.round;G.cur=m.cur;G.dir=m.dir;G.halt=m.halt;G.floor=m.floor;
  G.deck=new Array(m.deckN);G.discard=m.top?[m.top]:[];G.log=m.log;G.over=m.over;G.winner=m.winner;G.endMsg=m.endMsg;
  G.players=m.players.map((p,i)=>Object.assign({},p,{human:i===m.seat,vis:p.hand!==null&&i!==m.seat,hand:p.hand||new Array(p.n).fill({id:-1,kind:'x',name:'?'})}));
  if(G.cur!==m.seat||G.over){G.pendingAct=G.over?null:G.pendingAct;}
  VIEW='game';drawView();
}
function onlineHTML(){
  const err=NET.err?'<p class="note" style="color:#FFB3BC">'+NET.err+'</p>':'';
  const toast=TOAST?'<p class="toast" role="status">'+TOAST+'</p>':'';
  const who='<p class="note">Playing as <b>'+PROFILE.name+'</b>. <button class="nl" style="min-height:32px;padding:0 6px" data-go="profile">Change</button></p>';
  const plist=ps=>'<ul class="plist">'+ps.map((p,i)=>'<li>'+avatarHTML(p.icon,34)+'<span>'+p.name+'</span>'+(i===0?'<small>HOST</small>':'')+'</li>').join('')+'</ul>';
  if(!NET.role){
    return '<main><h1 class="h2">Play online</h1><p class="lead">Up to 4 players on different devices. One person makes a room and shares the code. Empty seats are filled by bots.</p>'+err+who
      +'<div class="sgrid"><section class="plaque"><div class="h3">Make a room</div><p class="note">You are the host. The game runs on your device, so keep this tab open.</p><div class="opts"><button class="btn primary" data-act="netcreate">Create room</button></div></section>'
      +'<section class="plaque"><div class="h3">Join a room</div><label class="note" for="roomcode">Room code</label><div class="opts" style="margin-top:6px"><input id="roomcode" class="tin code" maxlength="4" autocomplete="off" autocapitalize="characters" value="'+(NET.prefill||'')+'" placeholder="ABCD"><button class="btn primary" data-act="netjoin">Join</button></div></section></div>'
      +(window.Peer?'':'<p class="note" style="margin-top:14px">The online helper has not loaded, so rooms are unavailable right now.</p>')+'</main>';
  }
  if(NET.role==='host'){
    const link=location.origin&&location.origin!=='null'?location.origin+location.pathname+'?room='+NET.code:'';
    if(NET.status!=='ready')return '<main><h1 class="h2">Your room</h1><p class="lead">'+NET.status+'</p>'+err+'<div class="opts"><button class="btn" data-act="netleave">Cancel</button></div></main>';
    const ps=lobbyPlayers();
    return '<main><h1 class="h2">Your room</h1><p class="lead">Share this code. Friends open Doords, go to Online and enter it.</p>'+err+toast
      +'<div class="plaque roombox"><span class="note">ROOM CODE</span><div class="bigcode" id="bigcode">'+NET.code+'</div><div class="opts" style="justify-content:center"><button class="btn" data-act="copy" data-v="'+NET.code+'">Copy code</button>'+(link?'<button class="btn" data-act="copy" data-v="'+link+'">Copy link</button>':'')+'</div></div>'
      +'<div class="sgrid" style="margin-top:16px"><section class="plaque"><div class="h3">In the room ('+ps.length+'/4)</div>'+plist(ps)+'<p class="note">'+(4-ps.length)+' empty seat'+(4-ps.length===1?'':'s')+' will be filled by bots.</p></section>'
      +'<section class="plaque"><div class="h3">Difficulty</div><div class="seg" role="group">'+Object.keys(MODES).map(k=>'<button data-act="netmode" data-v="'+k+'" aria-pressed="'+(NET.mode===k)+'">'+MODES[k].name+'</button>').join('')+'</div><p class="note" style="margin-top:8px">'+MODES[NET.mode].desc+'</p>'
      +'<div class="opts" style="margin-top:12px"><button class="btn primary" data-act="netstart">Start game</button><button class="btn danger" data-act="netleave">Close room</button></div></section></div></main>';
  }
  const lb=NET.lobby;
  return '<main><h1 class="h2">Room '+NET.code+'</h1>'+err+(NET.status!=='joined'?'<p class="lead">'+NET.status+'</p>':'<p class="lead">You are in. Waiting for the host to start the game.</p>')
    +(lb?'<section class="plaque"><div class="h3">In the room ('+lb.players.length+'/4)</div>'+plist(lb.players)+'<p class="note">Difficulty: '+MODES[lb.mode].name+'</p></section>':'')
    +'<div class="opts" style="margin-top:14px"><button class="btn danger" data-act="netleave">Leave room</button></div></main>';
}

/* ================= input ================= */
function submitQuiz(){
  const m=G&&G.modal;if(!m||m.type!=='quiz')return;
  const el=document.getElementById('qa');
  const ok=el&&parseInt(el.value,10)===m.ans;
  G.modal=null;render();m.resolve(!!ok);
}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='qa'){e.preventDefault();submitQuiz();}});
document.getElementById('artfile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];
  if(f&&artTarget)openCrop(f,artTarget);
});
document.getElementById('logofile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const im=new Image();
    im.onload=async()=>{
      const S=160,cv=document.createElement('canvas');cv.width=S;cv.height=S;
      const x=cv.getContext('2d');const sc=Math.max(S/im.width,S/im.height);
      x.drawImage(im,(S-im.width*sc)/2,(S-im.height*sc)/2,im.width*sc,im.height*sc);
      LOGO=cv.toDataURL('image/png');SET.icon='custom';saveSet();
      TOAST=(await persistLogo())?'Logo saved.':'Could not save the logo to this browser.';
      drawView();
    };
    im.src=r.result;
  };
  r.readAsDataURL(f);
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t&&t.id==='pname'){PROFILE.name=(t.value||'').slice(0,14);saveProfile();return;}
  if(t&&t.dataset&&t.dataset.name!==undefined){SET.setup[+t.dataset.name].n=t.value;saveSet();}
});
document.getElementById('impfile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0];
  if(f)importArt(f);
});
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');
  if(g){go(g.dataset.go);return;}
  const t=e.target.closest('[data-act]');
  if(!t||t.disabled)return;
  const a=t.dataset.act;
  if(a==='mode'){SET.mode=t.dataset.mode;saveSet();start(false,t.dataset.mode);return;}
  if(a==='netcreate'){hostRoom();return;}
  if(a==='netjoin'){const el=document.getElementById('roomcode');joinRoom(el?el.value:'');return;}
  if(a==='netleave'){leaveRoom();return;}
  if(a==='netlobby'){backToLobby();return;}
  if(a==='netstart'){hostStart();return;}
  if(a==='netmode'){NET.mode=t.dataset.v;sendLobby();drawView();return;}
  if(a==='copy'){copyText(t.dataset.v);return;}
  if(a==='pavatar'){PROFILE.avatar=t.dataset.v;saveProfile();drawView();return;}
  if(a==='resetstats'){STATS={games:0,wins:0,losses:0,bestRoom:0};saveStats();drawView();return;}
  if(a==='demo'){start(true,LASTMODE);return;}
  if(a==='again'){start(false,LASTMODE);return;}
  if(a==='newgame'){showMenu();return;}
  if(a==='filter'){IDX.cat=t.dataset.f;TOAST='';drawView();return;}
  if(a==='pick'){IDX.sel=t.dataset.n;TOAST='';drawView();return;}
  if(a==='recrop'){if(ART[t.dataset.n])openCrop(ART[t.dataset.n],t.dataset.n);return;}
  if(a==='upload'){artTarget=t.dataset.n;const f=document.getElementById('artfile');f.value='';f.click();return;}
  if(a==='clear'){delete ART[t.dataset.n];persistArt().then(()=>{TOAST='Removed image for '+t.dataset.n+'.';drawView();});return;}
  if(a==='clearart'){if(window.confirm('Remove all card images from this device?')){ART={};persistArt().then(()=>{TOAST='All images removed.';drawView();});}return;}
  if(a==='export'){exportArt();return;}
  if(a==='import'){const f=document.getElementById('impfile');f.value='';f.click();return;}
  if(a==='resetset'){SET=JSON.parse(JSON.stringify(SDEF));saveSet();applySet();LASTMODE=SET.mode;TOAST='Settings reset.';drawView();return;}
  if(a==='seat'){
    const i=+t.dataset.i;SET.setup[i].h=t.dataset.v==='true';
    if(!SET.setup.some(x=>x.h))SET.setup[0].h=true;
    saveSet();drawView();return;
  }
  if(a==='preset'){const n=+t.dataset.v;SET.setup.forEach((x,i)=>{x.h=i<n;});saveSet();drawView();return;}
  if(a==='icon'){SET.icon=t.dataset.v;saveSet();drawView();return;}
  if(a==='logoup'){const f=document.getElementById('logofile');f.value='';f.click();return;}
  if(a==='logoclear'){LOGO='';if(SET.icon==='custom')SET.icon='eye';saveSet();try{localStorage.removeItem('doords-logo');}catch(e){}idb.set('logo','').catch(()=>{});drawView();return;}
  if(a==='uncover'){if(G&&G.coverRes){G.coverRes();render();}return;}
  if(a==='dismiss'){if(G){G.deadSeen=true;render();}return;}
  if(a==='set'){
    SET[t.dataset.k]=JSON.parse(t.dataset.v);saveSet();applySet();
    if(t.dataset.k==='mode')LASTMODE=SET.mode;
    drawView();return;
  }
  if(!G)return;
  if(a==='play'){
    if(!G.pendingAct||G.modal)return;
    const V=viewerIdx();
    const c=V<0||V!==G.cur?null:G.players[V].hand.find(x=>x.id===+t.dataset.id);
    if(c&&canPlay(V,c)){const r=G.pendingAct;G.pendingAct=null;render();r({type:'play',card:c});}
    return;
  }
  if(a==='draw'){
    if(!G.pendingAct||G.modal)return;
    const r=G.pendingAct;G.pendingAct=null;render();r({type:'draw'});return;
  }
  if(a==='band'){
    if(G.netClient){if(G.pendingAct&&!G.modal&&NET.hostConn)try{NET.hostConn.send({t:'band'});}catch(e){}return;}
    if(G.pendingAct&&!G.modal&&viewerIdx()===G.cur&&useBandage(G.cur))render();
    return;
  }
  const m=G.modal;
  if(a==='qok'){submitQuiz();return;}
  if(a==='opt'&&m&&m.type==='choose'){G.modal=null;render();m.resolve(m.options[+t.dataset.i].value);return;}
  if(a==='sel'&&m&&m.type==='pick'){
    const id=+t.dataset.id,k=m.sel.indexOf(id);
    if(k>=0)m.sel.splice(k,1);else if(m.sel.length<m.count)m.sel.push(id);
    m.focusId=id;render();return;
  }
  if(a==='ok'&&m&&m.type==='pick'&&m.sel.length===m.count){
    G.modal=null;render();
    m.resolve(m.sel.map(id=>m.cards.find(c=>c.id===id)));
  }
});
function showDetail(e){
  const b=e.target.closest&&e.target.closest('[data-id]');
  if(!b||!G||VIEW!=='game')return;
  G.detail=+b.dataset.id;
  const d=document.getElementById('detail');
  if(d)d.innerHTML=detailHTML();
}
$app.addEventListener('mouseover',showDetail);
$app.addEventListener('focusin',showDetail);

window.__dc={start,go,get G(){return G;},get VIEW(){return VIEW;}};
LASTMODE=SET.mode||'normal';
applySet();
const qs=location.search;
{const rm=qs.match(/[?&]room=([A-Za-z]{4})/);if(rm){NET.prefill=rm[1].toUpperCase();VIEW='online';}}
if(/[?&]auto=1/.test(qs)){const m=qs.match(/[?&]mode=(\w+)/);start(true,m?m[1]:'normal');}
else drawView();
loadArt();
})();

;(function(){var r=document.documentElement;addEventListener('pointermove',function(e){r.style.setProperty('--mx',e.clientX+'px');r.style.setProperty('--my',e.clientY+'px')},{passive:true})})();
