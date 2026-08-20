const board=document.getElementById('board'), scoreEl=document.getElementById('score'), message=document.getElementById('message');
let grid=[],score=0;
function start(){grid=Array.from({length:4},()=>Array(4).fill(0));score=0;message.textContent='';add();add();render()}
function add(){let empty=[];for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(!grid[r][c])empty.push([r,c]);if(empty.length){let [r,c]=empty[Math.floor(Math.random()*empty.length)];grid[r][c]=Math.random()<.9?2:4}}
function render(){board.innerHTML='';grid.flat().forEach(v=>{let d=document.createElement('div');d.className='tile '+(v?'n'+v:'');d.textContent=v||'';board.appendChild(d)});scoreEl.textContent=score}
function slide(row){let a=row.filter(Boolean);for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;score+=a[i];a.splice(i+1,1)}return [...a,...Array(4-a.length).fill(0)]}
function move(dir){let old=JSON.stringify(grid);if(dir==='left')grid=grid.map(slide);if(dir==='right')grid=grid.map(r=>slide(r.reverse()).reverse());if(dir==='up'||dir==='down'){for(let c=0;c<4;c++){let col=grid.map(r=>r[c]);if(dir==='down')col.reverse();col=slide(col);if(dir==='down')col.reverse();for(let r=0;r<4;r++)grid[r][c]=col[r]}}if(JSON.stringify(grid)!==old){add();render();if(grid.flat().includes(2048))message.textContent='You reached 2048! 🎉'}}
document.addEventListener('keydown',e=>{let m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(m){e.preventDefault();move(m)}});document.getElementById('newGame').onclick=start;start();
