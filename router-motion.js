// Planar model from the report, pp. 159–163. Distances are in millimetres.
const corners = [[-25,-88.21],[25,-88.21],[25,-38.21],[-25,-38.21],[-25,-88.21]];
function configuration(t) {
  const side = Math.min(3, Math.floor(t/10));
  const u = (t-side*10)/10;
  const fraction = u**3*(10-15*u+6*u*u);
  const [x,y] = corners[side].map((v,i)=>v+(corners[side+1][i]-v)*fraction);
  const carriageY = guideX => y+Math.sqrt(276**2-(x-guideX)**2);
  return {x,y,left:carriageY(-250),right:carriageY(250),side};
}
const byId = id => document.getElementById(id);
const scene = byId('machine'), ctx = scene.getContext('2d');
const position = byId('position'), stage = byId('stage'), view = byId('view');
const explanations = [
  'The base sets the reference frame. The guide centres are 500 mm apart. Each carriage can travel 300 mm along its guide.',
  'Each motor turns an SFU1204 screw. One revolution advances its carriage 4 mm. Watch the two carriage strokes change independently.',
  'A 276 mm link runs from each carriage pivot to the common table pivot. The joint angles change while the distance between pins stays constant.',
  'The 100 × 100 mm table translates with the common pivot. Its orientation stays fixed. The tool stays at the crosshair while the workpiece moves underneath.'
];
function redraw() {
  const t = Number(position.value), q = configuration(t);
  const level = Number(stage.value), iso = view.value==='assembly';
  const w=scene.clientWidth,h=scene.clientHeight,dpr=Math.min(2,devicePixelRatio || 1);
  if (!w || !h) return;
  if(scene.width!==Math.round(w*dpr)||scene.height!==Math.round(h*dpr)){
    scene.width=Math.round(w*dpr);scene.height=Math.round(h*dpr);
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const k=Math.min((w-30)/(iso?860:720),(h-22)/(iso?680:570));
  const project=([x,y,z=0])=>iso?[w/2+k*(.86*x+.49*y),h*.69+k*(.25*x-.43*y-.83*z)]:[w/2+k*x,h/2-k*y];
  function path(points,color,width=2,fill=''){
    ctx.beginPath();points.map(project).forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
  }
  function plate(x,y,z,dx,dy,color,fill){
    path([[x-dx/2,y-dy/2,z],[x+dx/2,y-dy/2,z],[x+dx/2,y+dy/2,z],[x-dx/2,y+dy/2,z]],color,2,fill);
  }
  function pin(point,color) {const [x,y]=project(point);ctx.beginPath();ctx.arc(x,y,Math.max(3,5*k),0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  plate(0,0,0,676,526,'#8d9f90','#27362d');
  for(let x=-300;x<=300;x+=50)path([[x,-250],[x,250]],'#37483d',1);
  for(let y=-250;y<=250;y+=50)path([[-325,y],[325,y]],'#37483d',1);
  for(const [x,cy] of [[-250,q.left],[250,q.right]]){
    for(const dx of [-14,14])path([[x+dx,-150,8],[x+dx,150,8]],'#a8b1ab',3);
    path([[x,-162,10],[x,177,10]],'#abb4aa',3);
    plate(x,185,10,40,42,'#9aa79a','#48564e');
    if(level>=1){
      for(let y=-149+((cy+150)%4);y<151;y+=4)path([[x-2,y,10],[x+2,y+2,10]],'#66786e',1);
      plate(x,cy,15,39,33,'#ffc28c','#96643a');
    }
    if(level>=2){
      path([[x,cy,18],[q.x,q.y,18]],'#e9ab73',Math.max(4,11*k));
      pin([x,cy,19],'#fff0cf');
    }
  }
  if(level>=2)pin([q.x,q.y,19],'#fff0cf');
  if(level===3){
    plate(q.x,q.y,25,100,100,'#b6d0c6','#577267');
    // Past tool positions expressed in the current workpiece frame.
    const track=[];
    for(let j=0;j<=q.side;j++)track.push([q.x+6.28-corners[j][0],q.y-63.21-corners[j][1],26]);
    track.push([6.28,-63.21,26]);path(track,'#ffce87',2);
    if(iso){
      for(const x of [-305,305])path([[x,-63.21,0],[x,-63.21,300]],'#a1afa4',5);
      path([[-305,-63.21,300],[305,-63.21,300]],'#a1afa4',5);
      path([[6.28,-63.21,300],[6.28,-63.21,118]],'#8e9b96',4);
      path([[6.28,-63.21,140],[6.28,-63.21,51]],'#a6b9af',12);
      path([[6.28,-63.21,51],[6.28,-63.21,26]],'#e6ede9',3);
    }
    path([[-3.72,-63.21,26],[16.28,-63.21,26]],'#fff',1.5);
    path([[6.28,-73.21,26],[6.28,-53.21,26]],'#fff',1.5);
  }
  byId('values').textContent='Time '+t.toFixed(1)+' s   ·   Left '+(q.left+150).toFixed(1)+' mm   ·   Right '+(q.right+150).toFixed(1)+' mm   ·   Table ('+q.x.toFixed(1)+', '+q.y.toFixed(1)+') mm';
  byId('guide').textContent=explanations[level];
}
let frame=0,started=0;
function stop(){cancelAnimationFrame(frame);frame=0;byId('play').textContent='Play cycle';}
function tick(now){
  const seconds=Math.min(40,(now-started)/1000);
  position.value=seconds;redraw();
  if(seconds>=40)stop();else frame=requestAnimationFrame(tick);
}
byId('play').onclick=()=>{
  if(frame){stop();return;}
  if(Number(position.value)>=40)position.value=0;
  started=performance.now()-Number(position.value)*1000;
  byId('play').textContent='Pause';frame=requestAnimationFrame(tick);
};
position.oninput=()=>{stop();redraw();};
stage.onchange=view.onchange=redraw;
byId('reset').onclick=()=>{stop();position.value=0;redraw();};
new ResizeObserver(redraw).observe(scene);
redraw();
