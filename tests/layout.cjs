const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s=fs.readFileSync(require('path').join(__dirname,'../extension.js'),'utf8');
const root={vars:{},attrs:{},clientWidth:1400,clientHeight:800,scrollLeft:0,scrollTop:0,contains:()=>true};
function node(uid,parent){
 const box={uid,parentElement:{attrs:{},vars:{},parentElement:parent||root,closest:()=>parent||null},vars:{},attrs:{}};
 const row={box,attrs:{},vars:{},closest:sel=>sel==='BOX'?box:null,contains:x=>x?.box===box,getBoundingClientRect:()=>({height:70})};box.row=row;return box;
}
const page={uid:'page',isConnected:true,attrs:{},vars:{},contains:()=>false,getBoundingClientRect:()=>({height:70})};
const A=node('A'),B=node('B'),C=node('C'),a1=node('1',A),b4=node('4',B),b5=node('5',B);
const boxes=[A,a1,B,b4,b5,C],rows=boxes.map(b=>b.row);
const editor=box=>({box,closest:()=>box,matches:()=>false});
const ctx={config:{margin:40},disposed:false,columnY:new Map(),columnEnds:new Map(),columnGeometry:null,root,pageCard:page,held:false,dragging:false,BOX:'BOX',ROW:'ROW',OMIT:'OMIT',all:()=>rows,visible:()=>true,document:{activeElement:editor(B)},active:B,preferred:'B',focusingUid:null,zoom:1,manual:false,columnDepth:null,columnScroll:0,watched:new Set(),sizes:{observe(){},unobserve(){}},blockUid:b=>b?.uid,mark:(e,k,v)=>e.attrs[k]=v,variable:(e,k,v)=>e.vars[k]=v,positionTitle(){},positionActions(){},branchGuide(){},titlePosition:null};
vm.createContext(ctx);vm.runInContext(s.slice(s.indexOf('  function layout()'),s.indexOf('  function down(e)'))+';this.run=layout',ctx);
ctx.run();assert.equal(ctx.columnDepth,1);assert.ok(ctx.titlePosition.x>6);assert.ok(parseFloat(B.vars['--lg-x'])>ctx.titlePosition.x);let x=root.scrollLeft;
ctx.document.activeElement=editor(C);ctx.run();assert.equal(root.scrollLeft,x,'same-depth switch to leaf must not shift horizontally');
ctx.document.activeElement=editor(page);ctx.focusingUid='A';ctx.run();assert.equal(ctx.active,A,'requested block beats intermediate native parent focus');assert.equal(root.scrollLeft,x);
ctx.focusingUid=null;ctx.document.activeElement=editor(B);ctx.run();assert.equal(b4.row.attrs['data-lg-role'],'child');assert.equal(a1.row.attrs['data-lg-role'],'other');
assert.equal(page.attrs['data-lg-role'],'context');console.log('PASS real layout: page column left, sibling horizontal stability, requested focus priority, branch separation');

// Clicking the title must resume centering even after manual scroll.
ctx.document.activeElement=editor(page);ctx.active=page;ctx.manual=false;root.scrollTop=1234;root.scrollLeft=500;ctx.run();
const width=parseFloat(root.vars['--lg-width']);
assert.equal(ctx.titlePosition.x-root.scrollLeft+width/2,root.clientWidth/2,'title horizontal center');
assert.equal(ctx.titlePosition.y-root.scrollTop+35,root.clientHeight/2,'title vertical center');
ctx.document.activeElement=editor(B);ctx.run();ctx.document.activeElement=editor(page);ctx.run();
assert.equal(ctx.titlePosition.x-root.scrollLeft+width/2,root.clientWidth/2,'repeat title focus');
root.clientWidth=900;ctx.run();
assert.equal(ctx.titlePosition.x-root.scrollLeft+parseFloat(root.vars['--lg-width'])/2,450,'resize retains title center');
ctx.manual=true;root.scrollLeft=77;const savedY=ctx.columnY.get(0);ctx.run();assert.equal(root.scrollLeft,77);assert.equal(ctx.columnY.get(0),savedY);
ctx.inBoard=()=>true;ctx.pageCard.contains=e=>e===page;ctx.readBlock=()=>null;ctx.ownerOf=()=>null;ctx.childMemory=new Map();ctx.queue=()=>{};
vm.runInContext(s.slice(s.indexOf('  function down(e)'),s.indexOf('  function release()'))+s.slice(s.indexOf('  function focus(e)'),s.indexOf('  function wheel(e)'))+';this.down=down;this.focus=focus',ctx);
ctx.down({target:page});assert.equal(ctx.manual,false,'title pointer is not manual browsing');
ctx.manual=true;ctx.focus({target:page});assert.equal(ctx.manual,false,'title focus resumes centering');
console.log('PASS title center, reentry, resize, manual scroll, pointer and focus');

ctx.held=false;ctx.manual=false;ctx.document.activeElement=editor(B);ctx.run();
const oldParent=ctx.titlePosition.y-root.scrollTop;
const before=ctx.columnY.get(2),beforeParent=ctx.columnY.get(1);
ctx.root.getBoundingClientRect=()=>({left:0});ctx.queue=()=>{};
ctx.scrollColumn(2,40);ctx.run();
assert.equal(ctx.columnY.get(2),before-40);assert.equal(ctx.columnY.get(1),beforeParent);
assert.equal(ctx.titlePosition.y-root.scrollTop,oldParent,'parent viewport position stays put when scrolling children');
assert.equal(ctx.columnAt(ctx.columnGeometry.edge+ctx.columnGeometry.width*2-root.scrollLeft+1),2);
assert.equal(ctx.columnAt(-5000),null);
// A tall child group must show its beginning instead of centering the full group.
b4.row.getBoundingClientRect=()=>({height:600});b5.row.getBoundingClientRect=()=>({height:600});
ctx.manual=false;ctx.run();
const Btop=parseFloat(B.vars['--lg-y'])-root.scrollTop;
const childTop=parseFloat(b4.vars['--lg-y'])+parseFloat(B.vars['--lg-y'])-root.scrollTop;
assert.ok(childTop>=28 && childTop<=root.clientHeight/2);assert.ok(Math.abs(childTop-Btop)<1);
console.log('PASS independent column scroll, stable parent, tall group start, column hit testing');

// Paint the whole child group while keeping the current card's siblings separate.
ctx.root.style={getPropertyValue:()=>"rgb(250, 248, 245)"};ctx.getComputedStyle=()=>({color:'rgb(35, 35, 35)'});ctx.encodeURIComponent=encodeURIComponent;
vm.runInContext(s.slice(s.indexOf('  function surfaceOutline('),s.indexOf('  function layout()')),ctx);
const parent={x:100,top:150,height:70,parent:null};
const current={x:400,top:150,height:70,parent};
const sibling={x:400,top:222,height:70,parent};
const child1={x:700,top:130,height:70,parent:current};
const child2={x:700,top:202,height:70,parent:current};
const unrelated={x:700,top:300,height:70,parent:sibling};
ctx.columnGeometry={edge:100};ctx.config={focusTint:0};
ctx.branchGuide([[parent],[current,sibling],[child1,child2,unrelated]],new Set([parent,current]),new Set([current,child1,child2]),300);
const svg=decodeURIComponent(root.vars['--lg-groups'].slice('url("data:image/svg+xml,'.length,-2));
assert.ok(svg.includes('fill="rgb(250, 248, 245)"'),'bright surface matches theme paper / toolbar');
assert.ok(!svg.includes('fill-opacity='),'no grey tint on selected branch');
const outline=ctx.surfaceOutline([{x:0,y:20,w:100,h:40},{x:100,y:0,w:100,h:80}],7);
assert.equal((outline.match(/M/g)||[]).length,1,'adjoining parent and children share one outline');
assert.equal((outline.match(/Q/g)||[]).length,8,'both outer and inner exposed corners are rounded');
const merged=ctx.surfaceOutline([{x:0,y:0,w:100,h:40},{x:0,y:40,w:100,h:40}],7);
assert.equal((merged.match(/Q/g)||[]).length,4,'adjacent siblings have no interior corners');
console.log('PASS unified bright outline, rounded exposed corners, flush siblings, toolbar-matching color');

ctx.config.texture=true;ctx.grainMarks='<circle cx="1" cy="1" r=".5"/>';
ctx.branchGuide([[parent],[current,sibling],[child1,child2,unrelated]],new Set([parent,current]),new Set([current,child1,child2]),300);
assert.ok(decodeURIComponent(root.vars['--lg-groups']).includes('id="paper-grain"'));
assert.ok(s.includes('left:0!important;right:0!important;top:36px!important;bottom:0!important'));
console.log('PASS full workspace surface and optional local texture');

const textured=decodeURIComponent(root.vars['--lg-groups']);
const brightPath=textured.match(/<path d="([^"]+)" fill="rgb/)[1];
assert.ok(textured.includes('<path d="'+brightPath+'" fill="url(#paper-grain)"/>'),'texture uses the exact bright outline');
assert.ok(!/<rect[^>]+fill="url\(#paper-grain\)"/.test(textured),'no full-canvas texture');
assert.ok(s.includes('[data-lg-board]{background-image:none!important}'));
assert.ok(s.includes('[data-lg-page])[data-lg-role=current]{background-image:var(--lg-texture)'));
console.log('PASS texture confined to bright silhouette; inactive board and title stay plain');
