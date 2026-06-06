var A='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var ci=function(c){return A.indexOf(c);};
var ic=function(i){return A[i];};
var ROTORS={I:{w:'EKMFLGDQVZNTOWYHXUSPAIBRCJ',n:'Q'},II:{w:'AJDKSIRUXBLHWTMCQGZNPYFVOE',n:'E'},III:{w:'BDFHJLCPRTXVZNYEIWGAKMUSQO',n:'V'},IV:{w:'ESOVPZJAYQUIRHXLNFTGKDCMWB',n:'J'},V:{w:'VZBRGITYUPSDNHLXAWMJQOFECK',n:'Z'}};
var REF_B='YRUHQSLDPXNGOKMIEBFZCWVJAT';

// Enigma Machine
var EnigmaM=function(){
  this.order=[];this.pos=[];this.ring=[];this.pb={};
};
EnigmaM.prototype.init=function(order,startPos,ringOffsets,plugPairs){
  this.order=order.slice();
  this.pos=startPos.map(function(c){return ci(c);});
  this.ring=ringOffsets.slice();
  this.notch=order.map(function(r){return ci(ROTORS[r].n);});
  this.pb={};
  for(var i=0;i<26;i++)this.pb[A[i]]=A[i];
  for(var j=0;j<plugPairs.length;j++){var x=plugPairs[j][0],y=plugPairs[j][1];this.pb[x]=y;this.pb[y]=x;}
};
EnigmaM.prototype.setPos=function(p){this.pos=p.map(function(c){return ci(c);});};
EnigmaM.prototype.getPos=function(){return this.pos.map(function(i){return ic(i);});};
EnigmaM.prototype.step=function(){
  if(this.pos[1]===this.notch[1]){this.pos[0]=(this.pos[0]+1)%26;this.pos[1]=(this.pos[1]+1)%26;}
  else if(this.pos[2]===this.notch[2]){this.pos[1]=(this.pos[1]+1)%26;}
  this.pos[2]=(this.pos[2]+1)%26;
};
EnigmaM.prototype.fwd=function(c){
  if(!A.includes(c))return c;
  this.step();
  var x=this.pb[c];
  for(var i=2;i>=0;i--){var r=ROTORS[this.order[i]];var idx=(ci(x)+this.pos[i]-this.ring[i]+26)%26;var wc=r.w[idx];x=ic((ci(wc)-this.pos[i]+this.ring[i]+26)%26);}
  x=REF_B[ci(x)];
  for(var i=0;i<3;i++){var r=ROTORS[this.order[i]];var idx=(ci(x)+this.pos[i]-this.ring[i]+26)%26;var ri=r.w.indexOf(ic(idx));x=ic((ri-this.pos[i]+this.ring[i]+26)%26);}
  return this.pb[x];
};
EnigmaM.prototype.encode=function(s){
  var r='';
  for(var i=0;i<s.length;i++){var ch=s[i];if(A.includes(ch))r+=this.fwd(ch);else r+=ch;}
  return r;
};

// Audio
var actx=null;
function ac(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();return actx;}
function tone(f,dur,t,v){t=t||'sine';v=v||0.12;dur=dur||0.07;
  try{var c=ac(),o=c.createOscillator(),g=c.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur);}catch(e){}
}
function click(){tone(900,0.035,'square',0.06);}
function success(){
  var c=ac();if(!c)return;
  var o=c.createOscillator(),g=c.createGain();o.type='sine';
  o.frequency.setValueAtTime(523,c.currentTime);o.frequency.setValueAtTime(659,c.currentTime+0.08);o.frequency.setValueAtTime(784,c.currentTime+0.16);
  g.gain.setValueAtTime(0.1,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.35);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+0.35);
}
function fail(){
  var c=ac();if(!c)return;
  var o=c.createOscillator(),g=c.createGain();o.type='sawtooth';o.frequency.value=140;
  g.gain.setValueAtTime(0.08,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+0.3);
  o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+0.3);
}

// Levels
var LEVEL_BASES=[
  {title:'The First Light',story:'June 21, 1944. The sun rises over the English Channel at 04:52. Your field station crackles to life with a transmission. Decode it before the day slips away.',plain:'THE SUN SHALL RISE AGAIN'},
  {title:'The Hidden Signal',story:'A coded message from the resistance. They speak of a meeting point. The enemy listens \u2014 every wrong letter costs precious daylight.',plain:'MEET AT THE OLD MILL'},
  {title:'Crossing the Line',story:'Enemy communications intercepted. They are planning a sweep at dusk. Decrypt the order and buy us time.',plain:'SWEEP BEGINS AT DUSK'},
  {title:'Solstice Watch',story:'The longest day stretches on. A high-priority message is coming through. The Enigma settings have been rotated. Work quickly \u2014 the sun will not wait.',plain:'CONVOY ARRIVES AT MIDNIGHT'},
  {title:'Midnight Break',story:'The final transmission. Decode it to end the longest day. All is quiet \u2014 but one last secret remains locked in the Enigma.',plain:'VICTORY IS OUR DAWN'},
];
var ROTOR_KEYS=['I','II','III','IV','V'];
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function generateLevels(){
  var L=[];
  for(var i=0;i<LEVEL_BASES.length;i++){
    var b=LEVEL_BASES[i];
    var order=shuffle(ROTOR_KEYS.slice()).slice(0,3);
    var start=[ic(Math.floor(Math.random()*26)),ic(Math.floor(Math.random()*26)),ic(Math.floor(Math.random()*26))];
    var av=A.split(''),pairs=[];
    shuffle(av);
    var nPairs=3+Math.floor(Math.random()*3);
    for(var j=0;j<nPairs&&j*2+1<av.length;j++){pairs.push([av[j*2],av[j*2+1]]);}
    var m=new EnigmaM();m.init(order,start,[0,0,0],pairs);
    var cipher=m.encode(b.plain.replace(/[^A-Z]/g,''));
    L.push({title:b.title,story:b.story,plain:b.plain,cipher:cipher,order:order,start:start,pairs:pairs,mode:i%2?'encode':'decode'});
  }
  shuffle(L);
  return L;
}
var LEVELS=generateLevels();

var DAY_START=4*60+52,DAY_END=23*60+59,WRONG_P=45,PENALTY_RATE=1/2.5;
var WIRE_COLORS=['#d4a843','#0d9488','#f59e0b','#e11d48','#06b6d4','#84cc16','#a855f7','#f97316','#14b8a6','#e8b83a'];
var dragSrc=null,dragActive=false,dragMoved=false;

var S={lv:0,m:null,plain:'',cipher:'',source:'',target:'',decoded:[],corrects:[],day:DAY_START,score:0,phase:'intro',storyChars:[],storyIdx:0,typing:false,timerPause:0,mode:'decode'};

var el={};
['story-text','cipher-msg','output-text','rotor-controls','plugboard-grid',
 'keyboard','lampboard','freq-chart','bombe-results',
  'hud-level','hud-time','hud-score','hud-progress','hud-progress-label','daylight-arc','sun-orb',
  'cipher-idx','panel-label','output-label','bombe-crib','bombe-run','btn-reset','btn-skip','btn-next','btn-tutorial',
 'modal-overlay','modal-title','modal-body','modal-btn',
 'tut-overlay','tut-prev','tut-next','tut-close','tut-steps','tut-dots',
  'plugboard-canvas','plugboard-wrap','splash-begin','splash-overlay'].forEach(function(id){el[id]=document.querySelector('#'+id);});

// ── Init ────────────────────────────────────────────────────────────────────
function initLevel(idx){
  var l=LEVELS[idx];
  S.lv=idx;S.plain=l.plain;S.cipher=l.cipher;
  S.mode=l.mode;
  S.source=S.mode==='encode'?l.plain:l.cipher;
  S.target=S.mode==='encode'?l.cipher:l.plain;
  S.m=new EnigmaM();S.m.init(l.order,l.start,[0,0,0],l.pairs);
  S.decoded=[];S.corrects=[];S.day=DAY_START;S.score=S.score||0;
  S.phase='intro';S.storyChars=l.story.split('');S.storyIdx=0;S.typing=true;S.timerPause=0;
  el['btn-next'].disabled=true;
  el['cipher-msg'].style.display='none';
  el['story-text'].textContent='';
  el['panel-label'].textContent=S.mode==='encode'?'Plaintext — type the highlighted letter to encode':'Ciphertext — type the highlighted letter on your keyboard';
  if(el['hud-progress-label'])el['hud-progress-label'].textContent=S.mode==='encode'?'Encoded':'Decoded';
  if(el['output-label'])el['output-label'].textContent=S.mode==='encode'?'Encoded Output':'Decoded Message';
  renderAll();
  typeNext();
}
function typeNext(){
  if(!S.typing||S.storyIdx>=S.storyChars.length){
    S.typing=false;
    if(S.storyIdx>=S.storyChars.length){S.phase='playing';el['cipher-msg'].style.display='';renderCipher();updateOutput();renderHUD();}
    return;
  }
  el['story-text'].textContent=S.storyChars.slice(0,S.storyIdx+1).join('')+'\u258C';
  click();S.storyIdx++;
  setTimeout(typeNext,22);
}

// ── Rendering ───────────────────────────────────────────────────────────────
function renderAll(){try{renderHUD();}catch(e){}try{renderRotors();}catch(e){}try{renderPlug();}catch(e){}try{renderKeys();}catch(e){}try{renderLamps();}catch(e){}try{renderFreq();}catch(e){}}

function renderHUD(){
  var t=DAY_END-DAY_START,e=S.day-DAY_START,p=Math.min(1,Math.max(0,e/t)),r=69.12;
  el['daylight-arc'].setAttribute('stroke-dashoffset',r*(1-p));
  var a=Math.PI*(1-p);el['sun-orb'].setAttribute('cx',32+22*Math.cos(a));
  var h=Math.floor(S.day/60),m=Math.floor(S.day%60);
  el['hud-time'].textContent=(h<10?'0':'')+h+':'+(m<10?'0':'')+m;
  el['hud-level'].textContent=(S.lv+1)+'/'+LEVELS.length;
  el['hud-score'].textContent=S.score;
  var ok=S.corrects.filter(function(b){return b;}).length,tot=S.plain.replace(/[^A-Z]/g,'').length;
  el['hud-progress'].textContent=ok+'/'+tot;
  var w=DAY_START+t*0.7,c2=DAY_START+t*0.85;
  var hud=document.querySelector('#hud');
  hud.classList.toggle('timer-warn',S.day>=w);
  hud.classList.toggle('timer-critical',S.day>=c2);
}

function renderRotors(){
  var pos=S.m.getPos(),h='';
  for(var i=0;i<3;i++){
    var opts='';for(var k in ROTORS){opts+='<option value="'+k+'"'+(k===S.m.order[i]?'selected':'')+'>'+k+'</option>';}
    h+='<div class="rotor-unit"><div class="rotor-label">Rotor '+(i+1)+'</div><select data-ri="'+i+'">'+opts+'</select><div class="rotor-dials"><button class="rotor-dial-btn" data-dri="'+i+'" data-dir="-1">\u25B2</button><div class="rotor-dial-val">'+pos[i]+'</div><button class="rotor-dial-btn" data-dri="'+i+'" data-dir="1">\u25BC</button></div></div>';
  }
  el['rotor-controls'].innerHTML=h;
  el['rotor-controls'].querySelectorAll('select').forEach(function(s){s.addEventListener('change',onRotor);});
  el['rotor-controls'].querySelectorAll('.rotor-dial-btn').forEach(function(b){b.addEventListener('click',onDial);});
}

function renderPlug(){
  var pb=S.m.pb,h='',pairedCount=0;
  for(var i=0;i<26;i++){var ch=A[i],p=pb[ch],paired=ch!==p;if(paired)pairedCount++;h+='<div class="plug-cell '+(paired?'paired':'')+'" data-pc="'+ch+'" data-partner="'+(paired?p:'')+'">'+ch+'</div>';}
  el['plugboard-grid'].innerHTML=h;
  el['plugboard-grid'].querySelectorAll('.plug-cell').forEach(function(c){c.addEventListener('mousedown',onPlugDown);c.addEventListener('touchstart',onTouchStart,{passive:false});});
  drawCanvas();
}

function getPairs(){
  var pb=S.m.pb,pairs=[],used={};
  for(var k in pb){var v=pb[k];if(k!==v&&!used[k]&&!used[v]){pairs.push([k,v]);used[k]=1;used[v]=1;}}
  return pairs;
}

function drawWire(ctx,a,b,col,dashed,wr){
  var ca=el['plugboard-grid'].querySelector('[data-pc="'+a+'"]'),cb=el['plugboard-grid'].querySelector('[data-pc="'+b+'"]');
  if(!ca||!cb)return;
  var ra=ca.getBoundingClientRect(),rb=cb.getBoundingClientRect();
  var x1=ra.left+ra.width/2-wr.left,y1=ra.top+ra.height/2-wr.top;
  var x2=rb.left+rb.width/2-wr.left,y2=rb.top+rb.height/2-wr.top;
  var mx=(x1+x2)/2,my=(y1+y2)/2,dy=Math.abs(y2-y1),cy=Math.max(my-(40+dy*0.3),5);
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(mx,cy,x2,y2);
  if(dashed)ctx.setLineDash([5,4]);else ctx.setLineDash([]);
  ctx.strokeStyle=col;ctx.lineWidth=dashed?2:2.5;ctx.lineCap='round';ctx.stroke();ctx.setLineDash([]);
  if(!dashed){
    ctx.beginPath();ctx.arc(x1,y1,4,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
    ctx.beginPath();ctx.arc(x2,y2,4,0,Math.PI*2);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();
  }
}

function drawCanvas(tx,ty){
  var canvas=el['plugboard-canvas'],wrap=el['plugboard-wrap'];
  if(!canvas||!wrap)return;
  canvas.width=wrap.offsetWidth;canvas.height=wrap.offsetHeight;
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  var wr=wrap.getBoundingClientRect();
  el['plugboard-grid'].querySelectorAll('.plug-cell').forEach(function(c){c.style.background='';c.style.borderColor='';});
  getPairs().forEach(function(p,idx){
    var col=WIRE_COLORS[idx%WIRE_COLORS.length];
    drawWire(ctx,p[0],p[1],col,false,wr);
    var ca=el['plugboard-grid'].querySelector('[data-pc="'+p[0]+'"]'),cb=el['plugboard-grid'].querySelector('[data-pc="'+p[1]+'"]');
    if(ca){ca.style.borderColor=col;ca.style.background=col+'22';}
    if(cb){cb.style.borderColor=col;cb.style.background=col+'22';}
  });
  if(dragActive&&tx!==undefined&&dragSrc){
    var sc=el['plugboard-grid'].querySelector('[data-pc="'+dragSrc+'"]');
    if(sc){
      var sr=sc.getBoundingClientRect();
      var x1=sr.left+sr.width/2-wr.left,y1=sr.top+sr.height/2-wr.top;
      var mx=(x1+tx)/2,my=(y1+ty)/2,cy=Math.max(my-(20+Math.abs(ty-y1)*0.2),5);
      ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(mx,cy,tx,ty);
      ctx.setLineDash([5,4]);ctx.strokeStyle='rgba(245,158,11,0.6)';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();ctx.setLineDash([]);
    }
  }
}

function onPlugDown(e){
  if(S.phase!=='playing')return;
  e.preventDefault();
  dragSrc=e.currentTarget.dataset.pc;dragActive=true;dragMoved=false;
  document.addEventListener('mousemove',onPlugMove);
  document.addEventListener('mouseup',onPlugUp);
}
function onPlugMove(e){
  if(!dragActive)return;
  dragMoved=true;
  var wrap=el['plugboard-wrap'],rect=wrap.getBoundingClientRect();
  el['plugboard-grid'].querySelectorAll('.plug-cell.drag-over').forEach(function(c){c.classList.remove('drag-over');});
  var tgt=document.elementFromPoint(e.clientX,e.clientY);
  if(tgt&&tgt.classList.contains('plug-cell')&&tgt.dataset.pc!==dragSrc)tgt.classList.add('drag-over');
  drawCanvas(e.clientX-rect.left,e.clientY-rect.top);
}
function onPlugUp(e){
  if(!dragActive){dragActive=false;return;}
  dragActive=false;
  document.removeEventListener('mousemove',onPlugMove);
  document.removeEventListener('mouseup',onPlugUp);
  el['plugboard-grid'].querySelectorAll('.plug-cell.drag-over').forEach(function(c){c.classList.remove('drag-over');});
  if(!dragMoved){
    var pb=S.m.pb;
    if(pb[dragSrc]!==dragSrc){var op=pb[dragSrc];pb[dragSrc]=dragSrc;pb[op]=op;renderPlug();resetDecoded();return;}
    drawCanvas();return;
  }
  var tgt=document.elementFromPoint(e.clientX,e.clientY);
  if(tgt&&tgt.classList.contains('plug-cell')){
    var ch=tgt.dataset.pc;
    if(ch!==dragSrc){
      var pb=S.m.pb;
      if(pb[dragSrc]!==dragSrc){var op=pb[dragSrc];pb[dragSrc]=dragSrc;pb[op]=op;}
      if(pb[ch]!==ch){var op=pb[ch];pb[ch]=ch;pb[op]=op;}
      pb[dragSrc]=ch;pb[ch]=dragSrc;
      renderPlug();resetDecoded();return;
    }
  }
  drawCanvas();
}

function onTouchStart(e){
  if(S.phase!=='playing')return;
  e.preventDefault();
  var t=e.changedTouches[0],el2=document.elementFromPoint(t.clientX,t.clientY);
  if(!el2||!el2.classList.contains('plug-cell'))return;
  dragSrc=el2.dataset.pc;dragActive=true;dragMoved=false;
  document.addEventListener('touchmove',onTouchMove,{passive:false});
  document.addEventListener('touchend',onTouchEnd);
}
function onTouchMove(e){
  if(!dragActive)return;
  e.preventDefault();
  var t=e.changedTouches[0];
  onPlugMove({clientX:t.clientX,clientY:t.clientY});
}
function onTouchEnd(e){
  if(!dragActive)return;
  dragActive=false;
  document.removeEventListener('touchmove',onTouchMove);
  document.removeEventListener('touchend',onTouchEnd);
  el['plugboard-grid'].querySelectorAll('.plug-cell.drag-over').forEach(function(c){c.classList.remove('drag-over');});
  if(!dragMoved){
    var pb=S.m.pb;
    if(pb[dragSrc]!==dragSrc){var op=pb[dragSrc];pb[dragSrc]=dragSrc;pb[op]=op;renderPlug();resetDecoded();return;}
    drawCanvas();return;
  }
  var t=e.changedTouches[0],tgt=document.elementFromPoint(t.clientX,t.clientY);
  if(tgt&&tgt.classList.contains('plug-cell')){
    var ch=tgt.dataset.pc;
    if(ch!==dragSrc){
      var pb=S.m.pb;
      if(pb[dragSrc]!==dragSrc){var op=pb[dragSrc];pb[dragSrc]=dragSrc;pb[op]=op;}
      if(pb[ch]!==ch){var op=pb[ch];pb[ch]=ch;pb[op]=op;}
      pb[dragSrc]=ch;pb[ch]=dragSrc;
      renderPlug();resetDecoded();return;
    }
  }
  drawCanvas();
}

var KB_ROWS=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
function renderKeys(){
  var h='';
  for(var r=0;r<KB_ROWS.length;r++){
    h+='<div class="kb-row r'+(r+1)+'">';
    for(var i=0;i<KB_ROWS[r].length;i++)h+='<div class="key" data-k="'+KB_ROWS[r][i]+'">'+KB_ROWS[r][i]+'</div>';
    h+='</div>';
  }
  el['keyboard'].innerHTML=h;
  el['keyboard'].querySelectorAll('.key').forEach(function(k){k.addEventListener('click',onKey);});
}
function renderLamps(){
  var h='';
  for(var i=0;i<26;i++)h+='<div class="lamp" data-l="'+A[i]+'">'+A[i]+'</div>';
  el['lampboard'].innerHTML=h;
}
function renderCipher(){
  var ct=S.source,dc=S.decoded,h='',idx=0;
  for(var i=0;i<ct.length;i++){var ch=ct[i];if(!A.includes(ch)){h+='<span>'+ch+'</span>';continue;}var done=idx<dc.length,active=idx===dc.length;h+='<span class="cipher-char'+(done?' done':'')+(active?' active':'')+'" data-ci="'+idx+'">'+ch+'</span>';idx++;}
  el['cipher-msg'].innerHTML=h;
  var tot=S.target.replace(/[^A-Z]/g,'').length,ok=S.corrects.filter(function(b){return b;}).length;
  el['cipher-idx'].textContent=ok+'/'+tot;
}
function updateOutput(){
  var h='',pi=0;
  for(var i=0;i<S.plain.length;i++){var ch=S.plain[i];if(!A.includes(ch)){h+='<span>'+ch+'</span>';continue;}if(pi<S.decoded.length){var cls=S.corrects[pi]?'char-correct':'char-wrong';h+='<span class="'+cls+'">'+S.decoded[pi]+'</span>';}else h+='<span class="char-pending">_</span>';pi++;}
  el['output-text'].innerHTML=h;
}
function renderFreq(){
  var freq={},tot=0;
  for(var i=0;i<26;i++)freq[A[i]]=0;
  for(var i=0;i<S.source.length;i++){var ch=S.source[i];if(A.includes(ch)){freq[ch]++;tot++;}}
  if(!tot)return;
  var max=1;for(var k in freq)if(freq[k]>max)max=freq[k];
  var eng={A:8.2,B:1.5,C:2.8,D:4.3,E:12.7,F:2.2,G:2.0,H:6.1,I:7.0,J:0.15,K:0.77,L:4.0,M:2.4,N:6.7,O:7.5,P:1.9,Q:0.095,R:6.0,S:6.3,T:9.1,U:2.8,V:0.98,W:2.4,X:0.15,Y:2.0,Z:0.074};
  var h='';
  for(var i=0;i<26;i++){var ch=A[i],pct=(freq[ch]/tot)*100,eh=(eng[ch]/12.7)*80,bh=Math.max(1,(pct/max)*80);h+='<div class="freq-wrap"><div class="freq-bar '+(freq[ch]>0?'hit':'')+'" style="height:'+bh+'px"></div><div class="freq-eng" style="height:'+eh+'px"></div><div class="freq-label">'+ch+'</div></div>';}
  el['freq-chart'].innerHTML=h;
}

// ── Input Processing ────────────────────────────────────────────────────────
function decodeChar(cidx){
  if(S.phase!=='playing')return;
  var target=S.target.replace(/[^A-Z]/g,'');
  if(S.decoded.length>=target.length)return;
  var ch=A[cidx];
  var result=S.m.fwd(ch);
  S.decoded.push(result);
  var ok=result===target[S.decoded.length-1];
  S.corrects.push(ok);
  click();
  if(ok){
    success();S.score+=100;S.timerPause=Date.now()+30000;
  }else{
    fail();S.day=Math.min(DAY_END,S.day+WRONG_P);
    if(S.day>=DAY_END){S.phase='lost';showModal('Daylight Expired','The sun has set. The message remains undecoded. Try again.','Retry');renderAll();return;}
  }
  renderHUD();renderRotors();updateOutput();renderCipher();
  if(el['keyboard'])el['keyboard'].querySelectorAll('.key.pressed').forEach(function(x){x.classList.remove('pressed');});
  if(el['lampboard'])el['lampboard'].querySelectorAll('.lamp.lit').forEach(function(x){x.classList.remove('lit');});
  var k=el['keyboard']&&el['keyboard'].querySelector('[data-k="'+ch+'"]');
  var l=el['lampboard']&&el['lampboard'].querySelector('[data-l="'+result+'"]');
  if(k)k.classList.add('pressed');
  if(l)l.classList.add('lit');
  setTimeout(function(){if(k)k.classList.remove('pressed');},200);
  setTimeout(function(){if(l)l.classList.remove('lit');},600);
  var all=S.corrects.length===target.length&&S.corrects.every(function(b){return b;});
  if(all){
    S.phase='won';S.score+=500;
    el['btn-next'].disabled=false;
    setTimeout(function(){el['modal-btn'].click();},900);
  }
}

// ── Event Handlers ──────────────────────────────────────────────────────────
function onRotor(e){
  var i=parseInt(e.target.dataset.ri);
  S.m.order[i]=e.target.value;
  click();resetDecoded();
}
function onDial(e){
  var i=parseInt(e.target.dataset.dri),d=parseInt(e.target.dataset.dir);
  S.m.pos[i]=(S.m.pos[i]+d+26)%26;
  click();resetDecoded();renderRotors();renderHUD();
}

function onKey(e){
  if(S.phase!=='playing')return;
  decodeChar(A.indexOf(e.currentTarget.dataset.k));
}

// ── Tutorial ─────────────────────────────────────────────────────────────────
var tutStep=0,TUT_TOTAL=7;
function showTutorial(){tutStep=0;
  var isEncode=S.mode==='encode';
  document.querySelectorAll('.tut-mode-decode').forEach(function(e){e.style.display=isEncode?'none':'';});
  document.querySelectorAll('.tut-mode-encode').forEach(function(e){e.style.display=isEncode?'':'none';});
  renderTutStep();el['tut-overlay'].classList.add('active');
}
function closeTutorial(){el['tut-overlay'].classList.remove('active');localStorage.setItem('solstice_tut_seen','1');}
function renderTutStep(){
  el['tut-steps'].querySelectorAll('.tut-step').forEach(function(s){s.classList.toggle('active',parseInt(s.dataset.tut)===tutStep);});
  el['tut-prev'].disabled=tutStep===0;
  el['tut-next'].textContent=tutStep===TUT_TOTAL-1?'Done':'Next \u2192';
  var dots='';
  for(var i=0;i<TUT_TOTAL;i++){var cls=i===tutStep?'active':i<tutStep?'done':'';dots+='<div class="tut-dot '+cls+'"></div>';}
  el['tut-dots'].innerHTML=dots;
}
el['tut-next'].addEventListener('click',function(){if(tutStep<TUT_TOTAL-1){tutStep++;renderTutStep();}else closeTutorial();});
el['tut-prev'].addEventListener('click',function(){if(tutStep>0){tutStep--;renderTutStep();}});
el['tut-close'].addEventListener('click',closeTutorial);

// ── Bombe ───────────────────────────────────────────────────────────────────
function runBombe(){
  var crib=el['bombe-crib'].value.toUpperCase().replace(/[^A-Z]/g,'');
  if(!crib||crib.length<2){el['bombe-results'].innerHTML='<span class="fail">Enter a crib (\u22652 letters).</span>';return;}
  var ct=S.cipher.replace(/[^A-Z]/g,'');
  if(ct.length<crib.length){el['bombe-results'].innerHTML='<span class="fail">Crib longer than ciphertext.</span>';return;}
  el['bombe-results'].innerHTML='<span class="hint">Scanning positions \u00B15\u2026</span>';
  setTimeout(function(){
    var res=[],order=S.m.order.slice();
    var pairs=[],used={};
    for(var k in S.m.pb){var v=S.m.pb[k];if(k!==v&&!used[k]&&!used[v]){pairs.push([k,v]);used[k]=1;used[v]=1;}}
    var center=S.m.pos.slice();
    for(var da=-5;da<=5&&res.length<3;da++){
      for(var db=-5;db<=5&&res.length<3;db++){
        for(var dc=-5;dc<=5&&res.length<3;dc++){
          var pos=[A[(center[0]+da+26)%26],A[(center[1]+db+26)%26],A[(center[2]+dc+26)%26]];
          for(var si=0;si<=ct.length-crib.length&&res.length<3;si++){
            var mm=new EnigmaM();mm.init(order,pos,[0,0,0],pairs);
            for(var s=0;s<si;s++)mm.step();
            var match=true;
            for(var ci2=0;ci2<crib.length;ci2++){
              var dec=mm.fwd(ct[si+ci2]);
              if(dec!==crib[ci2]||dec===ct[si+ci2]){match=false;break;}
            }
            if(match)res.push({pos:pos.join(''),off:si});
          }
        }
      }
    }
    if(res.length)el['bombe-results'].innerHTML=res.map(function(r){return'<div class="hint">pos '+r.pos+' offset '+r.off+'</div>';}).join('');
    else el['bombe-results'].innerHTML='<span class="fail">No match near current position. Try different rotor order or a longer crib.</span>';
  },30);
}

// ── Timer ───────────────────────────────────────────────────────────────────
var loop=null;
function startLoop(){
  if(loop)clearInterval(loop);
  var last=Date.now();
  loop=setInterval(function(){
    var now=Date.now(),dt=now-last;last=now;
    if(S.phase==='playing'||S.phase==='intro'){
      if(S.timerPause>now){}else{S.timerPause=0;S.day+=PENALTY_RATE*dt/1000;if(S.day>=DAY_END){S.day=DAY_END;if(S.phase==='playing'){S.phase='lost';showModal('Daylight Expired','The sun has set. The message remains undecoded. Try again.','Retry');}}}
      renderHUD();
    }
  },250);
}

// ── Navigation ──────────────────────────────────────────────────────────────
function loadLevel(idx){
  if(idx>=LEVELS.length){showModal('Victory','All transmissions decoded. The longest day is over.','Play Again');el['btn-next'].disabled=true;return;}
  initLevel(idx);
}
function resetDecoded(){
  var l=LEVELS[S.lv];
  S.m=new EnigmaM();S.m.init(l.order,l.start,[0,0,0],l.pairs);
  S.decoded=[];S.corrects=[];
  renderAll();updateOutput();renderCipher();
  drawCanvas();
}
function showModal(title,body,btn){
  el['modal-title'].textContent=title;
  el['modal-body'].textContent=body;
  el['modal-btn'].textContent=btn;
  el['modal-overlay'].classList.add('active');
}

el['modal-btn'].addEventListener('click',function(){
  el['modal-overlay'].classList.remove('active');
  if(S.phase==='lost'){initLevel(S.lv);}
  else if(S.phase==='won'){if(S.lv<LEVELS.length-1)loadLevel(S.lv+1);else loadLevel(0);}
});
el['btn-reset'].addEventListener('click',resetDecoded);
el['btn-skip'].addEventListener('click',function(){
  S.typing=false;S.storyIdx=S.storyChars.length;
  el['story-text'].textContent=S.storyChars.join('');
  S.phase='playing';el['cipher-msg'].style.display='';renderCipher();updateOutput();renderHUD();
});
el['btn-next'].addEventListener('click',function(){if(S.phase==='won'&&S.lv<LEVELS.length-1)loadLevel(S.lv+1);});
el['bombe-run'].addEventListener('click',runBombe);
el['btn-tutorial'].addEventListener('click',showTutorial);

document.addEventListener('keydown',function(e){
  var ch=e.key.toUpperCase();
  if(A.includes(ch)&&S.phase==='playing')decodeChar(A.indexOf(ch));
});

// ── Start ───────────────────────────────────────────────────────────────────
el['splash-begin'].addEventListener('click',function(){
  el['splash-overlay'].classList.add('splash-done');
  document.querySelector('#app').classList.add('game-ready');
  loadLevel(0);
  startLoop();
  if(!localStorage.getItem('solstice_tut_seen'))setTimeout(showTutorial,600);
});

window.addEventListener('resize',function(){if(el['plugboard-canvas'])drawCanvas();});
