const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'../extension.js'),'utf8');
const extract=(a,b)=>src.slice(src.indexOf(a),src.indexOf(b));
function harness(){
 let finish;const calls=[];
 const api={data:{block:{create:args=>{calls.push(['create',args]);return new Promise(r=>finish=r)},update:async args=>calls.push(['update',args]),move:async args=>calls.push(['move',args])}},util:{generateUID:()=> 'new'}};
 const ctx={window:{roamAlphaAPI:api},disposed:false,operationEpoch:0,session:true,root:{},cancelled:()=>Object.assign(new Error('cancelled'),{cancelled:true}),console,Map,Set};
 vm.createContext(ctx);vm.runInContext(extract('  function operationGuard()','  const childMemory='),ctx);
 return {ctx,calls,resolve:()=>finish()};
}
(async()=>{
 for(const stop of ['dispose','exit','reenter']){
  const h=harness();vm.runInContext('this.live=operationGuard()',h.ctx);
  const task=vm.runInContext('(async()=>{await writeBlock("create",{block:{uid:"new",string:""}},live);await writeBlock("update",{block:{uid:"parent",open:true}},live)})()',h.ctx);
  if(stop==='dispose')h.ctx.disposed=true;else {h.ctx.operationEpoch++;h.ctx.root=stop==='exit'?null:{}};
  h.resolve();await assert.rejects(task,/cancelled/);assert.equal(h.calls.length,1);
 }
 // Enter waits for the native editor; it must never write its text snapshot back.
 const h=harness(),blocks={parent:{':block/string':'draft',':block/_children':[{':block/uid':'page'}],':block/order':0,':block/children':[{}]}};
 Object.assign(h.ctx,{busy:false,tabPending:false,ROW:'ROW',BOX:'BOX',readBlock:uid=>blocks[uid],ownerOf:r=>r?.[':block/_children']?.[0]?.[':block/uid'],blockUid:()=> 'parent',all:()=>[],visible:()=>true,popupOpen:()=>false,notice:()=>{},focusUid:async()=>true,wait:async()=>{},root:{contains:()=>true}});
 vm.runInContext(extract('  async function enterSibling(e)','  function dropTarget(e)'),h.ctx);
 let e={key:'Enter',target:{value:'user draft',selectionStart:10,selectionEnd:10,matches:()=>true,closest:()=>({}),blur(){}},preventDefault(){},stopImmediatePropagation(){}};
 await h.ctx.enterSibling(e);assert.equal(h.calls.length,0,'stale or unsaved editor must not create or overwrite');
 blocks.parent[':block/string']='user draft';const t=h.ctx.enterSibling(e);h.resolve();await t;
 assert.equal(h.calls.length,1);assert.equal(h.calls[0][0],'create');assert.equal(h.calls[0][1].location['parent-uid'],'page');assert.equal(h.calls[0][1].location.order,1);
 assert.ok(!/deleteBlock|deletePage|starts-with\?/.test(src));
 console.log('PASS cancellation after in-flight write, exit/reentry guard, native Enter sibling, stale text preservation');
})().catch(e=>{console.error(e);process.exitCode=1});
