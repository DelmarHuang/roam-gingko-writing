const {chromium}=require('playwright'), fs=require('fs'),path=require('path'), assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
 const page=await browser.newPage({viewport:{width:1400,height:900}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;font:16px/1.5 sans-serif;color:#222;background:#faf8f5}.rm-topbar{height:40px}.roam-article{max-width:650px;margin:auto}.rm-block-main{display:flex;padding:8px}.rm-block-children{margin-left:20px}textarea{font:inherit;width:100%}.controls{width:20px}.rm-zen-mode .rm-topbar{display:none}</style><div class="rm-topbar"><input id="find-or-create-input"></div><main class="roam-article"><div class="rm-title-display-container" data-page-uid="page00001"><h1 class="rm-title-display"><span>Writing title</span></h1></div><div class="roam-outline"></div></main>`);
 await page.evaluate(()=>{
  window.db={page00001:{text:'Writing title',children:['block0001','block0002','block0003']},block0001:{text:'A',children:['child0001']},block0002:{text:'B',children:['child0002','child0003']},block0003:{text:'C',children:[]},child0001:{text:'One',children:[]},child0002:{text:'Four',children:[]},child0003:{text:'Five',children:[]}};
  const outline=document.querySelector('.roam-outline');
  function render(uid,parent){const n=document.createElement('div');n.className='roam-block-container';n.dataset.uid=uid;n.innerHTML='<div class="rm-block-main"><span class="controls"><span class="rm-bullet" draggable="true">•</span></span><div class="rm-block-text"></div></div><div class="rm-block-children"></div>';const text=n.querySelector('.rm-block-text');text.textContent=db[uid].text;text.onclick=()=>{const ta=document.createElement('textarea');ta.className='rm-block-input';ta.value=db[uid].text;ta.onblur=()=>{db[uid].text=ta.value;};text.replaceWith(ta);ta.focus();};parent.append(n);for(const child of db[uid].children)render(child,n.lastElementChild);}
  for(const uid of db.page00001.children)render(uid,outline);
  document.querySelector('h1').onclick=function(){const edit=document.createElement('div');edit.className='rm-title-editing-display';const ta=document.createElement('textarea');ta.className='rm-title-textarea';ta.value='Writing title';edit.append(ta);this.replaceWith(edit);ta.focus();};
  let chord=false;document.addEventListener('keydown',e=>{if(e.key==='k'&&(e.ctrlKey||e.metaKey))chord=true;else if(chord&&e.key==='z'){document.body.classList.toggle('rm-zen-mode');chord=false;}});
  window.commands=new Map();window.writes=[];
  const pull=(_,ref)=>{const uid=ref[1],row=db[uid];if(!row)return null;const parent=Object.keys(db).find(p=>db[p].children.includes(uid));return {':block/uid':uid,':block/string':row.text,':block/order':parent?db[parent].children.indexOf(uid):0,':block/_children':parent?[{':block/uid':parent}]:[],':block/children':row.children.map((u,i)=>({':block/uid':u,':block/order':i}))};};
  window.roamAlphaAPI={data:{pull,block:{create:async a=>writes.push(['create',a]),update:async a=>writes.push(['update',a]),move:async a=>writes.push(['move',a])}},util:{generateUID:()=> 'new000001'},ui:{getFocusedBlock:()=>({'block-uid':'block0002'}),commandPalette:{addCommand:async a=>commands.set(a.label,a.callback),removeCommand:async a=>commands.delete(a.label)}}};
 });
 await page.addScriptTag({content:fs.readFileSync(path.join(__dirname,'../extension.js'),'utf8').replace('export default {','window.plugin = {')});
 await page.evaluate(()=>plugin.onload());
 await page.locator('#lg-tools button').click();await page.waitForSelector('[data-lg-board]');
 await page.locator('[data-lg-page] h1').click();
 await page.waitForFunction(()=>{const a=document.querySelector('[data-lg-page]').getBoundingClientRect(),b=document.querySelector('[data-lg-board]').getBoundingClientRect();return Math.abs(a.x+a.width/2-(b.x+b.width/2))<2});
 let centered=await page.evaluate(()=>{const a=document.querySelector('[data-lg-page]').getBoundingClientRect(),b=document.querySelector('[data-lg-board]').getBoundingClientRect();return {x:a.x+a.width/2-(b.x+b.width/2),y:a.y+a.height/2-(b.y+b.height/2)};});
 assert.ok(Math.abs(centered.x)<2); // Editing centers the caret vertically, not the title label.
 const titleText=await page.locator('.rm-title-textarea').inputValue();assert.equal(titleText,'Writing title');
 await page.locator('[data-uid="block0002"] > .rm-block-main .rm-block-text').click();
 await page.locator('.rm-title-textarea').click();
 await page.waitForFunction(()=>Math.abs(document.querySelector('[data-lg-page]').getBoundingClientRect().x+document.querySelector('[data-lg-page]').getBoundingClientRect().width/2-innerWidth/2)<2);
 await page.setViewportSize({width:1000,height:720});
 await page.waitForFunction(()=>Math.abs(document.querySelector('[data-lg-page]').getBoundingClientRect().x+document.querySelector('[data-lg-page]').getBoundingClientRect().width/2-innerWidth/2)<2);
 await page.evaluate(()=>plugin.onunload());
 assert.equal(await page.locator('[data-lg-board],[data-lg-page],#lg-tools,#gc-settings,#gc-actions').count(),0);
 assert.equal(await page.evaluate(()=>document.body.classList.contains('rm-zen-mode')),false);
 assert.deepEqual(await page.evaluate(()=>writes),[]);assert.deepEqual(errors,[]);
 console.log('PASS Chromium: actual CSS/title editor focus, repeat focus, resize, Zen exit, no graph writes, unload');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
