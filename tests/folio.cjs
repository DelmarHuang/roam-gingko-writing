const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(require('path').join(__dirname,'../extension.js'),'utf8');
let sheet=null,queued=0;
const attrs=new Set();
const root={hasAttribute:k=>attrs.has(k),removeAttribute:k=>attrs.delete(k),contains:()=>true};
const ctx={root,document:{querySelector:()=>sheet},window:{matchMedia:q=>({matches:q==='screen'})},mark:(el,k)=>attrs.add(k),queue:()=>queued++,getComputedStyle:el=>el.css};
vm.createContext(ctx);
vm.runInContext(src.slice(src.indexOf('  const WIDE ='),src.indexOf('  const visible =')),ctx);
ctx.syncFolio();assert.equal(attrs.size,0);
sheet={sheet:{disabled:false}};ctx.syncFolio();assert.ok(attrs.has('data-lg-folio'));assert.equal(queued,1);
ctx.syncFolio();assert.equal(queued,1,'unchanged state must not schedule a layout loop');
sheet.sheet.disabled=true;ctx.syncFolio();assert.equal(attrs.size,0);
sheet.sheet.disabled=false;sheet.media='print';ctx.syncFolio();assert.equal(attrs.size,0);
sheet.media='screen';ctx.syncFolio();assert.equal(attrs.size,1);
sheet=null;ctx.syncFolio();assert.equal(attrs.size,0,'unload removes compatibility');
sheet={};ctx.syncFolio();
const scroller={css:{overflowX:'auto',overflowY:'visible'},scrollWidth:800,clientWidth:300,scrollHeight:100,clientHeight:100,parentElement:null};
const target={closest:()=>scroller};
assert.equal(ctx.widgetScroll(target,70,0),true,'wide widget receives horizontal scrolling');
assert.equal(ctx.widgetScroll(target,0,70),false,'vertical movement still scrolls the column');
scroller.css.overflowY='auto';scroller.scrollHeight=500;assert.equal(ctx.widgetScroll(target,0,70),true);
sheet=null;ctx.syncFolio();assert.equal(ctx.widgetScroll(target,70,0),true,'native wide widgets still scroll with Folio disabled');
ctx.root=null;assert.equal(ctx.widgetScroll(target,70,0),false,'exit disables widget routing');ctx.root=root;
assert.ok(src.includes('folioObserver.disconnect()'));
assert.ok(src.includes('row.closest(WIDE)'));
console.log('PASS Folio enable/disable/media/unload, idempotent detection, widget scrolling and cleanup');

// DOM facts captured from the user's page: 375px content, a -116px
// full-width host (491px), and a data-table footer with min-width:500px.
// These selectors must reach the outer hosts, not only their inner widgets.
assert.ok(src.includes('[data-lg-row] :is(.rm-full-width,.rm-ds-q)'));
assert.ok(src.includes('[data-lg-row] .rm-data-table__footer{'));
assert.ok(src.includes('[data-lg-row] .kanban-column-container{'));
assert.ok(src.includes('width:max-content!important;min-width:100%!important;max-width:none!important;table-layout:auto!important'));
console.log('PASS observed full-width host, table footer and kanban scroll-container rule coverage');

assert.ok(!src.includes('[data-lg-board][data-lg-folio]) [data-lg-row]'), 'basic width rules must not depend on Folio');
