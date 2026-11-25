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
const ctx={root,pageCard:page,held:false,dragging:false,BOX:'BOX',ROW:'ROW',OMIT:'OMIT',all:()=>rows,visible:()=>true,document:{activeElement:editor(B)},active:B,preferred:'B',focusingUid:null,zoom:1,manual:false,columnDepth:null,columnScroll:0,watched:new Set(),sizes:{observe(){},unobserve(){}},blockUid:b=>b?.uid,mark:(e,k,v)=>e.attrs[k]=v,variable:(e,k,v)=>e.vars[k]=v,positionTitle(){},positionActions(){},branchGuide(){},titlePosition:null};
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
ctx.manual=true;root.scrollLeft=77;root.scrollTop=99;ctx.run();assert.equal(root.scrollLeft,77);assert.equal(root.scrollTop,99);
ctx.inBoard=()=>true;ctx.pageCard.contains=e=>e===page;ctx.readBlock=()=>null;ctx.ownerOf=()=>null;ctx.childMemory=new Map();ctx.queue=()=>{};
vm.runInContext(s.slice(s.indexOf('  function down(e)'),s.indexOf('  function release()'))+s.slice(s.indexOf('  function focus(e)'),s.indexOf('  function wheel(e)'))+';this.down=down;this.focus=focus',ctx);
ctx.down({target:page});assert.equal(ctx.manual,false,'title pointer is not manual browsing');
ctx.manual=true;ctx.focus({target:page});assert.equal(ctx.manual,false,'title focus resumes centering');
console.log('PASS title center, reentry, resize, manual scroll, pointer and focus');
