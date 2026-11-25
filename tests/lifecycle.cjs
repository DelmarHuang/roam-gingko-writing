const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(require('path').join(__dirname,'../extension.js'),'utf8').replace('export default {','this.plugin={');
let listeners=0;const commands=new Map(),writes=[];
class El {
 constructor(tag){this.tag=tag;this.children=[];this.attrs={};this.styles=new Map();this.style={setProperty:(k,v)=>this.styles.set(k,v),getPropertyValue:k=>this.styles.get(k)||'',removeProperty:k=>this.styles.delete(k)};this.classList={toggle(){}};}
 append(...els){for(const e of els){e.remove?.();this.children.push(e);e.parentNode=this;e.isConnected=true;}}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;this.isConnected=false;}
 setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k]??null;}
 querySelector(s){if(this.tag==='dialog'&&s==='button')return this.closeButton??=new El('button');return null;}
 querySelectorAll(){return [];}addEventListener(){}removeEventListener(){}
}
const doc={head:new El('head'),body:new El('body'),documentElement:new El('html'),createElement:t=>new El(t),querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){listeners++},removeEventListener(){listeners--}};
const win={addEventListener(){listeners++},removeEventListener(){listeners--}};
const ext={settings:{get:()=>null,canSet:true,set:async(k,v)=>writes.push([k,v])},ui:{commandPalette:{addCommand:async a=>commands.set(a.label,a.callback),removeCommand:async a=>commands.delete(a.label)}}};
const ctx={document:doc,window:win,localStorage:{getItem:()=>null,setItem(){}},MutationObserver:class{observe(){}disconnect(){}},cancelAnimationFrame(){},clearTimeout,setTimeout,console};
vm.createContext(ctx);vm.runInContext(source,ctx);
(async()=>{
 await ctx.plugin.onload({extensionAPI:ext});assert.equal(commands.size,2);assert.ok(listeners>0);const bodyCount=doc.body.children.length;
 const panel=doc.body.children.find(x=>x.id==='gc-settings');assert.ok(panel.innerHTML.includes('min="0.02"'));assert.ok(panel.innerHTML.includes('texture'));
 panel.oninput({target:{name:'dim',type:'range',value:'.02'}});
 await ctx.plugin.onunload();assert.equal(writes.at(-1)[1].dim,.02);assert.equal(commands.size,0);assert.equal(doc.body.children.length,0);assert.equal(doc.head.children.length,0);assert.equal(listeners,0);assert.equal(win.__roamGingkoFocus,undefined);
 await ctx.plugin.onload({extensionAPI:ext});await ctx.plugin.onload({extensionAPI:ext});assert.equal(doc.body.children.length,bodyCount);assert.equal(commands.size,2);await ctx.plugin.onunload();assert.equal(listeners,0);console.log('PASS full plugin load/unload/reload; two commands; native settings write; DOM/listener cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
