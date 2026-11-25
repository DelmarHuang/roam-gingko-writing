const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(require('path').join(__dirname,'../extension.js'),'utf8');
const calls=[];const block=(owner,children=[])=>({':block/_children':owner?[{':block/uid':owner}]:[],':block/children':children.map((uid,i)=>({':block/uid':uid,':block/order':i})),':block/string':'text'});
const rows={page:block(null,['A','B','C']),A:block('page',['1','2','3']),B:block('page',['4','5']),C:block('page',['6']),4:block('B'),5:block('B'),6:block('C')};
const ctx={getComputedStyle:()=>({lineHeight:'20px'}),caretOffset:(input,row,pos)=>input.lines?.[pos]||0,disposed:false,root:{},busy:false,config:{arrows:true},inBoard:()=>true,popupOpen:()=>false,pageCard:null,pageUid:'page',active:{uid:'B'},BOX:'BOX',ROW:'ROW',blockUid:b=>b?.uid,readBlock:u=>rows[u],ownerOf:r=>r?.[':block/_children']?.[0]?.[':block/uid'],childMemory:new Map(),all:()=>Object.keys(rows),rowUid:x=>x,operationGuard:()=>()=>true,window:{roamAlphaAPI:{util:{generateUID:()=> 'new'}}},writeBlock:async(k,a)=>calls.push([k,a]),focusUid:async(u,c)=>calls.push(['focus',u,c]),notice:()=>{}};
vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf('  function atVerticalBoundary(input,direction)'),src.indexOf('  function shortcut(e)')),ctx);
function event(key,pos=0,extra={}){const box={uid:'B'};return {key,target:{value:'text',selectionStart:pos,selectionEnd:pos,matches:()=>true,closest:()=>box},preventDefault(){this.prevented=true},stopImmediatePropagation(){},...extra};}
(async()=>{
for(const e of [event('ArrowRight',2),event('ArrowLeft',1),event('ArrowRight',4,{isComposing:true}),event('ArrowRight',4,{shiftKey:true}),event('ArrowRight',4,{ctrlKey:true})]){ctx.navigate(e);assert.equal(e.prevented,undefined);}
const selected=event('ArrowRight',4);selected.target.selectionStart=2;ctx.navigate(selected);assert.equal(selected.prevented,undefined);
const multiline=event('ArrowDown',2);multiline.target.lines={0:0,2:20,4:40};ctx.navigate(multiline);assert.equal(multiline.prevented,undefined,'middle visual line retains native Down');
multiline.key='ArrowUp';ctx.navigate(multiline);assert.equal(multiline.prevented,undefined,'middle visual line retains native Up');
assert.equal(ctx.atVerticalBoundary(multiline.target,'ArrowUp'),false);
multiline.target.selectionStart=0;assert.equal(ctx.atVerticalBoundary(multiline.target,'ArrowUp'),true);
multiline.target.selectionStart=4;assert.equal(ctx.atVerticalBoundary(multiline.target,'ArrowDown'),true);
ctx.config.arrows=false;const off=event('ArrowRight',4);ctx.navigate(off);assert.equal(off.prevented,undefined);ctx.config.arrows=true;
const button=event('ArrowRight',4);button.target.matches=()=>false;ctx.navigate(button);assert.equal(button.prevented,undefined);
const repeat=event('ArrowRight',4,{repeat:true});ctx.navigate(repeat);assert.equal(repeat.prevented,true);assert.equal(calls.length,0);
await ctx.moveSelection('ArrowRight','B');assert.deepEqual(calls.map(c=>c[0]),['update','focus']);assert.equal(calls.at(-1)[1],'4');calls.length=0;
ctx.childMemory.set('B','5');await ctx.moveSelection('ArrowRight','B');assert.equal(calls.at(-1)[1],'5');calls.length=0;
await ctx.moveSelection('ArrowLeft','4');assert.deepEqual(calls,[['focus','B',4]]);calls.length=0;
await ctx.moveSelection('ArrowDown','4');assert.equal(calls.at(-1)[1],'5');calls.length=0;
await ctx.moveSelection('ArrowDown','5');assert.equal(calls.length,0,'never escape to another parent');
await ctx.moveSelection('ArrowUp','4');assert.equal(calls.length,0,'never escape to parent');
await ctx.moveSelection('ArrowRight','4');assert.deepEqual(calls.map(c=>c[0]),['create','update','focus']);assert.equal(calls[0][1].location['parent-uid'],'4');assert.equal(calls.at(-1)[1],'new');calls.length=0;
await ctx.moveSelection('ArrowLeft','B');assert.equal(calls.at(-1)[1],'page');
console.log('PASS caret boundaries, selections, IME, modifiers, disabled option, repeat guard, parent/child and same-parent navigation');
})().catch(e=>{console.error(e);process.exitCode=1});
