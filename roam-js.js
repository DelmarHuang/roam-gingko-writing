async function startGingko(extensionAPI) {
  const key = "__roamGingkoFocus";
  window.__gingkoControls?.();
  await window[key]?.dispose?.();
  const $ = (s, el = document) => el.querySelector(s);
  const all = (s, el = document) => Array.from(el.querySelectorAll(s));
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const BOX = ".roam-block-container,.rm-block";
  const ROW = ".rm-block-main,.rm-block__self";
  const OMIT = ".rm-reference-main,.rm-mentions,.rm-embed-container,.rm-block-ref,.rm-query";
  const EDIT = "textarea.rm-block-input,textarea.rm-block__input,[contenteditable=true]";
  const visible = el => !!el?.getClientRects().length && getComputedStyle(el).visibility !== "hidden";

  const store = 'gingko-controls-v1';
  let config = { buttons: true, arrows: false, texture: true, margin: 40, dim: 0.18, focusTint: 0.035 };
  try { config = { ...config, ...JSON.parse(localStorage.getItem(store) || '{}') }; } catch {}
  try { config={...config,...(extensionAPI?.settings?.get("preferences") || {})}; } catch {}
  config.dim=Math.max(.02,Math.min(.8,Number(config.dim)||.18));
  config.focusTint=Math.max(0,Math.min(.12,Number(config.focusTint)||0));
  let settingsWrite=Promise.resolve();
  // Repeating local SVG tile; no external image, canvas or network request.
  let grainSeed=71;
  const randomGrain=()=>((grainSeed=(grainSeed*1664525+1013904223)>>>0)/4294967296);
  const grainMarks=Array.from({length:1100},()=>{
    const x=randomGrain()*192,y=randomGrain()*192,length=.7+randomGrain()*3.3;
    const angle=randomGrain()*Math.PI*2,dx=Math.cos(angle)*length,dy=Math.sin(angle)*length;
    const d=`M${x.toFixed(2)} ${y.toFixed(2)}q${(dx*.45-dy*.18).toFixed(2)} ${(dy*.45+dx*.18).toFixed(2)} ${dx.toFixed(2)} ${dy.toFixed(2)}`;
    const width=(.25+randomGrain()*.45).toFixed(2),alpha=(.035+randomGrain()*.045).toFixed(3);
    return `<path d="${d}" fill="none" stroke="#fff" stroke-width="${width}" opacity=".18" transform="translate(.35 .35)"/><path d="${d}" fill="none" stroke="#000" stroke-width="${width}" opacity="${alpha}"/>`;
  }).join('');
  const grain='<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192">'+grainMarks+'</svg>';
  const grainURL='data:image/svg+xml,'+encodeURIComponent(grain);
  const style = document.createElement("style");
  style.textContent = `
    #lg-tools{display:inline-flex;align-items:center;gap:2px}
    #lg-tools.lg-fixed{position:fixed;top:5px;right:12px;z-index:101}
    #lg-tools button{width:30px;height:30px;padding:5px;color:inherit}
    #lg-tools svg{width:18px;height:18px;display:block}
    :is(.roam-main,.rm-article-wrapper,.roam-article):has([data-lg-board]){
      max-width:none!important;transform:none!important;contain:none!important}
    [data-lg-board]{position:fixed!important;inset:36px 0 0!important;
      width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;
      margin:0!important;padding:0!important;display:block!important;box-sizing:border-box;
      overflow:auto!important;overscroll-behavior:contain;overflow-anchor:none;
      isolation:isolate;z-index:4;background:var(--lg-paper)!important}
    [data-lg-board]::after{content:"";position:absolute;pointer-events:none;
      left:var(--lg-end-x);top:var(--lg-end-y);width:1px;height:1px}
    [data-lg-pass]{position:static!important;transform:none!important;contain:none!important;
      overflow:visible!important;margin:0!important;padding:0!important;border:0!important}
    [data-lg-box]{position:absolute!important;left:var(--lg-x)!important;top:var(--lg-y)!important;
      width:var(--lg-width)!important;min-width:0!important;max-width:none!important;
      height:auto!important;min-height:0!important;transform:none!important;contain:none!important;
      overflow:visible!important;margin:0!important;padding:0!important;border:0!important;box-sizing:border-box}
    [data-lg-board]::before{content:"";position:absolute;inset:0 auto auto 0;pointer-events:none;z-index:-1;
      width:var(--lg-end-x);height:var(--lg-end-y);background:currentColor;opacity:.035;clip-path:var(--lg-profile)}
    [data-lg-sep]{position:absolute!important;left:var(--lg-x)!important;top:var(--lg-y)!important;width:var(--lg-width)!important}
    [data-lg-row]{box-sizing:border-box;width:100%!important;max-width:none!important;
      margin:0!important;padding:8px 12px!important;align-items:flex-start;
      border-radius:5px;box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 10%,transparent)}
    [data-lg-row][data-lg-role="current"]{box-shadow:inset 2px 0 currentColor,
      inset 0 0 0 1px color-mix(in srgb,currentColor 20%,transparent)}
    [data-lg-row][data-lg-role="context"]{box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 22%,transparent)}
    [data-lg-row] :is(.rm-block__input,.rm-block-text,.roam-block,textarea.rm-block-input){
      min-width:0!important;max-width:none!important}
    [data-lg-row] > :is(.roam-block,.rm-block__input,.rm-block-text),
    [data-lg-row] > :has(> .rm-block__input),[data-lg-row] > :has(> .rm-block-text){
      flex:1 1 0%;min-width:0!important;max-width:none!important}
    [data-lg-row] textarea.rm-block-input{width:100%!important;box-sizing:border-box}
    [data-lg-note]{position:fixed;top:40px;right:12px;z-index:1100;padding:.6em 1em}
  `;
  style.textContent += `
    [data-lg-board]{left:var(--gc-margin)!important;right:var(--gc-margin)!important;
      top:52px!important;bottom:24px!important;border-radius:8px}
    [data-lg-row]{transition:opacity 120ms ease}
    [data-lg-row][data-lg-role=other]{opacity:var(--gc-dim)}
    [data-lg-row][data-lg-role=other]:hover{opacity:1}
    [data-lg-row][data-lg-role=current]{outline:2px solid currentColor;outline-offset:-2px}
    [data-lg-row][data-lg-role=context]{opacity:.85}
    #gc-actions{position:fixed;z-index:102;display:flex;gap:3px;padding:3px;
      border-radius:6px;background:var(--gc-paper,Canvas);color:inherit;box-shadow:0 0 0 1px color-mix(in srgb,currentColor 18%,transparent)}
    #gc-actions button{width:26px;height:26px;padding:4px}
    #gc-settings{color:inherit;background:Canvas;border:1px solid currentColor;
      border-radius:10px;padding:22px;width:min(380px,85vw)}
    #gc-settings label{display:flex;justify-content:space-between;gap:16px;margin:18px 0}
    #gc-settings input[type=range]{width:160px}
    [data-lg-row][data-lg-role=other]{opacity:var(--gc-dim)}
    [data-lg-row][data-lg-role=child]{opacity:1;background:color-mix(in srgb,currentColor 5%,var(--lg-paper))}
    [data-lg-row][data-lg-group=selected]{box-shadow:inset 3px 0 currentColor,
      inset 0 0 0 1px color-mix(in srgb,currentColor 25%,transparent)}
    [data-lg-drop=up]{box-shadow:inset 0 3px currentColor!important}
    [data-lg-drop=down]{box-shadow:inset 0 -3px currentColor!important}
    [data-lg-drop=right]{box-shadow:inset -3px 0 currentColor!important}
    [data-lg-board]{top:52px!important}
    [data-lg-row], [data-lg-row][data-lg-role], [data-lg-row][data-lg-group]{
      border:0!important;outline:none!important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 18%,transparent)!important}
    [data-lg-row][data-lg-role=current]{
      outline:1px solid color-mix(in srgb,currentColor 55%,transparent)!important;outline-offset:0;
      background:color-mix(in srgb,currentColor 14%,var(--lg-paper))}
    [data-lg-row][data-lg-group=selected]{
      background:color-mix(in srgb,currentColor 5%,var(--lg-paper))}
    [data-lg-page]{position:fixed!important;left:var(--lg-title-x)!important;
      top:var(--lg-title-y)!important;width:var(--lg-width)!important;
      max-width:none!important;min-width:0!important;margin:0!important;padding:12px!important;
      box-sizing:border-box!important;z-index:5;background:var(--lg-paper)!important;
      border:0!important;border-radius:5px;box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 18%,transparent)!important;
      clip-path:inset(var(--lg-title-clip,0px));}
    [data-lg-page]::before{content:"Page title · edits rename this page";display:block;
      font:11px/1.5 sans-serif;opacity:.45;margin-bottom:6px;pointer-events:none}
    [data-lg-page] :is(.rm-title-display,.rm-title-editing-display,.rm-title-textarea){
      font:inherit!important;color:inherit!important;background:transparent!important;
      width:100%!important;min-height:0!important;margin:0!important;padding:0!important;
      border:0!important;box-shadow:none!important;outline:none!important;}
    [data-lg-page] :is(.rm-title-display,.rm-title-editing-display)::before,
    [data-lg-page] :is(.rm-title-display,.rm-title-editing-display)::after{display:none!important}
    [data-lg-page][data-lg-role=current]{outline:1px solid color-mix(in srgb,currentColor 55%,transparent)!important}
    [data-lg-row][data-lg-drop=up]{box-shadow:inset 0 3px currentColor!important}
    [data-lg-row][data-lg-drop=down]{box-shadow:inset 0 -3px currentColor!important}
    [data-lg-row][data-lg-drop=right]{box-shadow:inset -3px 0 currentColor!important}
    #gc-settings::backdrop{background:rgba(0,0,0,.25)}
  `;
  style.textContent += `
    [data-lg-row][data-lg-role=other]:hover{opacity:max(var(--gc-dim),.35)}
    [data-lg-row]{transition:opacity 160ms ease,background-color 160ms ease}
    [data-lg-row][data-lg-role=child], [data-lg-row][data-lg-group=selected]{
      background:color-mix(in srgb,currentColor 1.5%,var(--lg-paper))!important}
    [data-lg-row][data-lg-role=current]{
      background:color-mix(in srgb,currentColor var(--gc-focus-tint,3.5%),var(--lg-paper))!important;
      outline:1px solid color-mix(in srgb,currentColor 30%,transparent)!important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 8%,transparent)!important}
    html body :is(#gingko-title-override,[data-lg-page]){
      all:revert!important;position:fixed!important;display:block!important;
      left:var(--lg-title-x)!important;top:var(--lg-title-y)!important;
      width:var(--lg-width)!important;max-width:none!important;box-sizing:border-box!important;
      z-index:5!important;clip-path:inset(var(--lg-title-clip,0px))!important;
      border:0!important;border-radius:5px!important;margin:0!important;
      box-shadow:inset 0 0 0 1px color-mix(in srgb,currentColor 18%,transparent)!important;
      color:inherit!important;font:inherit!important;line-height:1.55!important;text-align:left!important;
      background:var(--lg-paper)!important;background-image:none!important;
      padding:14px 16px!important;min-height:0!important;height:auto!important;
      letter-spacing:normal!important;text-transform:none!important;}
    html body :is(#gingko-title-override,[data-lg-page])::before{
      all:revert!important;content:"Page title"!important;display:block!important;
      font:11px/1.5 sans-serif!important;color:inherit!important;opacity:.4!important;
      margin:0 0 6px!important;padding:0!important;position:static!important;
      background:none!important;border:0!important;box-shadow:none!important;pointer-events:none!important}
    html body :is(#gingko-title-override,[data-lg-page])::after,
    html body :is(#gingko-title-override,[data-lg-page]) *::before,
    html body :is(#gingko-title-override,[data-lg-page]) *::after{
      display:none!important;content:none!important;}
    html body :is(#gingko-title-override,[data-lg-page]) > :not(.rm-title-display):not(.rm-title-editing-display){display:none!important}
    html body :is(#gingko-title-override,[data-lg-page]) :is(.rm-title-display,.rm-title-editing-display),
    html body :is(#gingko-title-override,[data-lg-page]) :is(.rm-title-display,.rm-title-editing-display) > span{
      all:revert!important;display:block!important;box-sizing:border-box!important;
      width:100%!important;max-width:none!important;min-width:0!important;
      margin:0!important;padding:0!important;border:0!important;outline:0!important;
      font-family:inherit!important;font-size:18px!important;font-weight:500!important;
      line-height:1.55!important;letter-spacing:normal!important;text-transform:none!important;
      text-align:left!important;text-indent:0!important;color:inherit!important;
      background:transparent!important;box-shadow:none!important;text-shadow:none!important;
      transform:none!important;filter:none!important;float:none!important;
      min-height:0!important;max-height:none!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;}
    html body :is(#gingko-title-override,[data-lg-page]) .rm-title-textarea{resize:none!important;overflow:hidden!important;font:inherit!important;text-align:left!important;letter-spacing:normal!important;text-transform:none!important;text-shadow:none!important;transform:none!important;background:none!important;}
    html body :is(#gingko-title-override,[data-lg-page]) :is(.rm-title-display,.rm-title-editing-display) > :not(span):not(textarea){display:none!important}
  `;
  style.textContent += `
    /* Hide native hierarchy guides, not the draggable bullets. */
    :is(#gingko-guide-override,[data-lg-board]) > .rm-multibar,
    :is(#gingko-guide-override,[data-lg-pass]) > .rm-multibar,
    :is(#gingko-guide-override,[data-lg-box]) > :is(.rm-block-children,.rm-block__children) > .rm-multibar{
      display:none!important;border:0!important;background:none!important;box-shadow:none!important;pointer-events:none!important;
    }
  `;
  style.textContent += `
    [data-lg-board]{left:0!important;right:0!important;top:36px!important;bottom:0!important;border-radius:0!important;overflow-y:hidden!important;background:color-mix(in srgb,currentColor 14%,var(--lg-paper))!important}
    [data-lg-board]::before{clip-path:none!important;opacity:1!important;z-index:-1;
      background:var(--lg-groups) no-repeat 0 0!important;width:var(--lg-end-x);height:var(--lg-end-y)}
    html body :is(#gingko-group-override,[data-lg-row]){
      opacity:1!important;border:0!important;outline:0!important;box-shadow:none!important;
      border-radius:0!important;background:transparent!important;padding:15px 18px!important;
      transition:background-color 130ms ease!important}
    html body :is(#gingko-group-override,[data-lg-row])[data-lg-role=current]{
      background:transparent!important}
    html body :is(#gingko-group-override,[data-lg-row])[data-lg-role=other] > :not(.controls){opacity:var(--gc-dim)!important}
    html body :is(#gingko-group-override,[data-lg-row])[data-lg-role]:hover > :not(.controls){opacity:1!important}
    html body :is(#gingko-group-override,[data-lg-row]):is([data-lg-role=context],[data-lg-role=peer]) > :not(.controls){opacity:var(--gc-dim)!important}
    html body :is(#gingko-group-override,[data-lg-row]):is([data-lg-role=current],[data-lg-role=child]) > :not(.controls){opacity:1!important}
    html body :is(#gingko-group-override,[data-lg-row]) > .controls{opacity:.45}
    html body :is(#gingko-group-override,[data-lg-row]):hover > .controls{opacity:1}
    html body :is(#gingko-title-override,[data-lg-page]){box-shadow:none!important;border-radius:7px!important;outline:none!important}
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role=current]{background:color-mix(in srgb,currentColor 0%,var(--lg-paper))!important}
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role=context]{background:color-mix(in srgb,currentColor 14%,var(--lg-paper))!important}
    html body :is(#gingko-group-override,[data-lg-row])[data-lg-drop=up]{box-shadow:inset 0 3px currentColor!important}
    html body :is(#gingko-group-override,[data-lg-row])[data-lg-drop=down]{box-shadow:inset 0 -3px currentColor!important}
    html body :is(#gingko-group-override,[data-lg-row])[data-lg-drop=right]{box-shadow:inset -3px 0 currentColor!important}
  `;
  style.textContent += `
    [data-lg-board]{background-image:none!important}
    html body :is(#gingko-title-override,[data-lg-page]){background-image:none!important}
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role=current]{background-image:var(--lg-texture)!important}
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role=context]{opacity:1!important}
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role=context]::before,
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role=context] > :is(.rm-title-display,.rm-title-editing-display){opacity:var(--gc-dim)!important}
    html body :is(#gingko-title-override,[data-lg-page]) :is(.rm-title-display,.rm-title-editing-display) :is(span,textarea){opacity:1!important}
  `;
  style.textContent += `
    html body #gc-actions{gap:1px;padding:2px 5px;border:0!important;box-shadow:none!important;
      border-radius:7px 7px 0 0;background:var(--gc-paper,Canvas)!important;
      background-image:var(--lg-texture)!important;z-index:6}
    html body #gc-actions button{width:22px!important;height:22px!important;min-width:22px!important;
      min-height:22px!important;padding:3px!important;margin:0!important;border:0!important;
      box-shadow:none!important;border-radius:4px;background:transparent!important;color:inherit!important;opacity:.6}
    html body #gc-actions button::before{font-size:13px!important;color:inherit!important}
    html body #gc-actions button:hover,html body #gc-actions button:focus-visible{
      opacity:1;background:color-mix(in srgb,currentColor 7%,transparent)!important}
  `;
  style.textContent += `
    [data-lg-board][data-lg-drag-armed], [data-lg-board][data-lg-drag-armed] *{
      user-select:none!important;-webkit-user-select:none!important}
  `;
  style.textContent += `
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role]:hover::before,
    html body :is(#gingko-title-override,[data-lg-page])[data-lg-role]:hover > :is(.rm-title-display,.rm-title-editing-display){opacity:1!important}
  `;
  document.head.append(style);

  const tools = document.createElement("span");
  tools.id = "lg-tools";
  function button(label, svg) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bp3-button bp3-small bp3-minimal";
    b.title = label;
    b.setAttribute("aria-label", label);
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + svg + '</svg>';
    tools.append(b);
    return b;
  }
  const toggle = button("Gingko Writing", '<rect x="2" y="6" width="5" height="12" rx="1"/><rect x="9.5" y="3" width="5" height="18" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/>');

  let root, active, preferred, frame, observer, sizes, pending, note, noteTimer;
  let session = false, held = false, dragging = false, zoom = 1, disposed = false;
  let route, oldScroll, scroller, sentZen, confirmedZen;
  let manual=false, clickTimer, busy=false;
  let lastIconClick=0, moving=null, dropRow=null, tabPending=false, dragCandidate=null;
  let focusRequest=0, operationEpoch=0, shortcutTimer;
  const downloads=new Map();
  const cancelled=()=>Object.assign(new Error("Operation cancelled"),{cancelled:true});
  function operationGuard(){
    const epoch=operationEpoch;
    return ()=>!disposed && !!root && session && epoch===operationEpoch;
  }
  async function writeBlock(kind,args,live){
    if(!live())throw cancelled();
    const api=window.roamAlphaAPI;
    await (api.data?.block?.[kind] || api[kind+"Block"])(args);
    if(!live())throw cancelled();
  }
  const childMemory=new Map();
  const panel = document.createElement('dialog');
  panel.id = 'gc-settings';
  panel.innerHTML = `<strong>Gingko Writing settings</strong>
    <label>Block buttons<input name="buttons" type="checkbox"></label>
    <label>Paper texture<input name="texture" type="checkbox"></label>
    <label>Left/right block navigation<input name="arrows" type="checkbox"></label>
    <label>Side margins<input name="margin" type="range" min="16" max="120" step="4"></label>
    <label>Inactive text opacity<input name="dim" type="range" min="0.02" max="0.8" step="0.01"></label>

    <button type="button" class="bp3-button">Close</button>`;
  panel.querySelector('button').onclick = () => panel.close();
  document.body.append(panel);
  function apply() {
    document.documentElement.style.setProperty('--lg-texture',config.texture?`url("${grainURL}")`:'none');
    document.documentElement.style.setProperty('--gc-margin', config.margin + 'px');
    document.documentElement.style.setProperty('--gc-dim', config.dim);
    document.documentElement.style.setProperty('--gc-focus-tint', (config.focusTint*100)+'%');
    for (const input of panel.querySelectorAll('input')) {
      if (input.type === 'checkbox') input.checked = config[input.name];
      else input.value = config[input.name];
    }
    queue();
    positionActions();
  }
  panel.oninput = e => {
    const input = e.target;
    if (!input.name) return;
    config[input.name] = input.type === 'checkbox' ? input.checked : Number(input.value);
    saveSettings();
  };
  function saveSettings() {
    try { localStorage.setItem(store, JSON.stringify(config)); } catch {}
    if(extensionAPI?.settings && extensionAPI.settings.canSet!==false){
      const snapshot={...config};
      settingsWrite=settingsWrite.catch(()=>{}).then(()=>extensionAPI.settings.set("preferences",snapshot)).catch(error=>console.error("Gingko Writing settings",error));
    }
    apply();
  }
  let pageCard=null, pageUid=null, titlePosition=null, titleObserver=null;
  let focusingUid=null, columnDepth=null, columnScroll=0;
  const columnY=new Map(),columnEnds=new Map();
  let columnGeometry=null,touchPoint=null;
  const inBoard=el=>!!el && (!!root?.contains(el)||!!pageCard?.contains(el));
  function positionTitle(){
    if(!root || !pageCard || !titlePosition)return;
    const r=root.getBoundingClientRect(), p=titlePosition;
    const x=r.left+p.x-root.scrollLeft, y=r.top+p.y-root.scrollTop;
    variable(pageCard,"--lg-title-x",x+"px");
    variable(pageCard,"--lg-title-y",y+"px");
    variable(pageCard,"--lg-title-clip",[
      Math.max(0,r.top-y),Math.max(0,x+p.width-r.right),
      Math.max(0,y+pageCard.offsetHeight-r.bottom),Math.max(0,r.left-x)
    ].map(n=>n+"px").join(" "));
  }
  let shortcutUntil=0;
  function popupOpen(){
    return panel.open || Date.now()<shortcutUntil ||
      all('.rm-command-palette,.bp3-omnibar,.bp4-omnibar,.bp5-omnibar,.bp3-dialog,.bp4-dialog,.bp5-dialog,.bp3-popover,.bp4-popover,.bp5-popover,[role="dialog"],[role="listbox"],dialog[open]')
      .some(el=>el!==panel && visible(el));
  }
  const actions = document.createElement('div');
  actions.id = 'gc-actions';
  actions.hidden = true;
  document.body.append(actions);
  let target;
  const touched = new Set(), watched = new Set();
  function rowUid(row) {
    const box = row?.closest(BOX);
    return box?.getAttribute('data-uid') || row?.getAttribute('data-uid') ||
      row?.querySelector('[id^="block-input-"]')?.id.match(/([A-Za-z0-9_-]{9})$/)?.[1];
  }
  async function add(child) {
    if (disposed || !root || busy || !target) return;
    const live=operationGuard();
    const api = window.roamAlphaAPI, uid = rowUid(target);
    if (!uid) return;
    busy = true;
    try {
      const pull = api.data?.pull || api.pull;
      const current = pull('[:block/order {:block/_children [:block/uid]}]', [':block/uid', uid]);
      const parents = current[':block/_children'];
      const parent = (Array.isArray(parents) ? parents[0] : parents)?.[':block/uid'];
      const fresh = api.util.generateUID();
      await writeBlock("create",{
        location: { 'parent-uid': child ? uid : parent, order: child ? 'last' : current[':block/order'] + 1 },
        block: { uid: fresh, string: '' }
      },live);
      manual = false;
      if (child) await writeBlock("update",{ block: { uid, open: true } },live);
      await focusUid(fresh,0);
    } catch (error) { console.error('Gingko', error); }
    finally { busy = false; }
  }
  for (const [label, icon, fn] of [
    ['Add sibling', 'plus', () => add(false)],
    ['Add child', 'fork', () => add(true)],
    ['Export branch', 'download', () => exportBranch()]
  ]) {
    const button = document.createElement('button');
    button.type = 'button'; button.title = label; button.setAttribute('aria-label', label);
    button.className = 'bp3-button bp3-minimal bp3-icon-' + icon;
    button.onmousedown = e => e.preventDefault(); button.onclick = fn;
    actions.append(button);
  }
  function positionActions() {
    target = root?.querySelector('[data-lg-role=current]');
    if(active===pageCard)target=null;
    const r = target?.getBoundingClientRect(), b = root?.getBoundingClientRect();
    const show = config.buttons && !popupOpen() && r && r.bottom > b.top && r.top < b.bottom && r.right > b.left && r.left < b.right;
    actions.style.display = show ? 'flex' : 'none';
    if (!show) return;
    actions.style.setProperty('--gc-paper', root.style.getPropertyValue('--lg-paper'));
    actions.style.left = Math.max(b.left, Math.min(r.right - 86, b.right - 86)) + 'px';
    actions.style.top = Math.max(b.top, r.top - 26) + 'px';
  }

  function mark(el, name, value = "") {
    if (el.getAttribute(name) !== value) el.setAttribute(name, value);
    touched.add(el);
  }
  function variable(el, name, value) {
    if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
  }
  function mountTools() {
    const bar = $(".rm-topbar");
    const fixed = session || !visible(bar);
    const home = fixed ? document.body : bar;
    if (tools.parentNode !== home) home.append(tools);
    tools.classList.toggle("lg-fixed", fixed);

    toggle.setAttribute("aria-pressed", String(session));
    toggle.title = session ? "Exit Gingko Writing and Zen Mode" : "Enter Gingko Writing and Zen Mode";
    toggle.setAttribute("aria-label", toggle.title);
  }
  function notice(text) {
    if(disposed)return;
    note?.remove(); clearTimeout(noteTimer);
    note = document.createElement("div");
    note.setAttribute("data-lg-note", ""); note.setAttribute("role", "status");
    note.className = "bp3-card"; note.textContent = text;
    document.body.append(note);
    noteTimer = setTimeout(() => note?.remove(), 5500);
  }

  // Use the native palette entry when available; the chord is Roam's default.
  function zenState() {
    if ($(".rm-zen-mode,.rm-topbar--zen,.rm-zen-mode-topbar,[data-zen-mode=true]")) return true;
    const bar = $(".rm-topbar");
    if (!bar) return null;
    const normal = $("#find-or-create-input,.rm-find-or-create-wrapper,.rm-topbar__find-or-create,#topbar-more-menu-button", bar);
    if (visible(normal)) return false;
    if (!normal && $(".bp3-icon-help,.bp3-icon-help-circle,.rm-sync-status,.rm-topbar__sync-status", bar)) return true;
    return null;
  }
  function stroke(letter, mod = false, target = document.body) {
    const mac = /Mac|iPad|iPhone/.test(navigator.platform);
    for (const type of ["keydown", "keyup"]) {
      const n = letter.toUpperCase().charCodeAt(0);
      target.dispatchEvent(new KeyboardEvent(type, {key:letter,code:"Key"+letter.toUpperCase(),
        keyCode:n,which:n,metaKey:mod && mac,ctrlKey:mod && !mac,bubbles:true,cancelable:true}));
    }
  }
  async function paletteCommand() {
    const selector = ".rm-command-palette,.bp3-omnibar,.bp4-omnibar,.bp5-omnibar";
    const palette = () => all(selector).find(visible);
    if (palette()) return false;
    stroke("p", true);
    let pane;
    for (let i=0;i<10 && !(pane=palette());i++) await wait(30);
    if (!pane) return false;
    const input = $("input", pane);
    if (input) {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(input,"Zen Mode");
      input.dispatchEvent(new Event("input",{bubbles:true}));
    }
    for (let i=0;i<10;i++) {
      const item = all('[role=menuitem],[role=option],.bp3-menu-item,.bp4-menu-item,.bp5-menu-item',pane)
        .find(el => visible(el) && /^(toggle zen mode|切换专注模式|切換專注模式)/i.test(el.textContent.trim()));
      if (item) { item.click(); return true; }
      await wait(30);
    }
    (input || pane).dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",code:"Escape",keyCode:27,which:27,bubbles:true}));
    return false;
  }
  async function zen(on) {
    const state=zenState();
    if(on){sentZen=false;confirmedZen=state===true;}
    if(state===on && (on || !sentZen || confirmedZen)) return;
    if(on) sentZen=true;
    if (!(await paletteCommand())) {
      stroke("k", true); await wait(55); stroke("z");
    }
    for (let i=0;i<12 && zenState()!==on;i++) await wait(40);
    if(on && zenState()===true) confirmedZen=true;
    if (zenState() === !on) notice("Roam did not switch Zen Mode. Check the Toggle Zen Mode shortcut.");
  }

  function findRoot() {
    const article = $(".roam-main .roam-article") || $(".roam-article");
    if (!article) return null;
    const valid = row => !row.closest(OMIT) && visible(row);
    const focused = document.activeElement?.closest(ROW);
    const row = (focused && article.contains(focused) && valid(focused)) ? focused : all(ROW,article).find(valid);
    let top = row?.closest(BOX);
    if (!top) return null;
    let outer;
    while ((outer=top.parentElement?.closest(BOX)) && article.contains(outer)) top=outer;
    const list = top.parentElement.closest(".rm-block-children,.rm-block__children,.roam-outline");
    return list && article.contains(list) ? list : top.parentElement;
  }
  function blockUid(box) {
    if (!box) return null;
    if(box===pageCard)return pageUid;
    const row = $(ROW,box);
    const input = row && $('[id^="block-input-"]',row);
    return box.getAttribute("data-uid") || row?.getAttribute("data-uid") ||
      input?.id.match(/([A-Za-z0-9_-]{9})$/)?.[1];
  }
  function paperColor(el) {
    for (let n=el;n;n=n.parentElement) {
      const color=getComputedStyle(n).backgroundColor;
      if(color && color!=="transparent" && color!=="rgba(0, 0, 0, 0)") return color;
    }
    return "Canvas";
  }
  function queue() {
    if (!disposed && root && !frame) frame=requestAnimationFrame(() => {frame=0;layout();});
  }
  function caretOffset(input,row,at=input.selectionDirection==="backward"?input.selectionStart:input.selectionEnd) {
    const mirror=document.createElement("div"), css=getComputedStyle(input);
    for(const prop of ["font","lineHeight","letterSpacing","wordSpacing","textIndent","tabSize","padding","border","boxSizing","direction","textAlign","wordBreak","overflowWrap"])
      mirror.style[prop]=css[prop];
    Object.assign(mirror.style,{position:"fixed",visibility:"hidden",pointerEvents:"none",top:"0",left:"0",
      width:input.offsetWidth+"px",whiteSpace:"pre-wrap",overflowWrap:"break-word"});
    const marker=document.createElement("span");
    marker.textContent=input.value.slice(at)||"\u200b";
    mirror.append(document.createTextNode(input.value.slice(0,at)),marker);
    document.body.append(mirror);
    const r=marker.getClientRects()[0];
    const y=input.getBoundingClientRect().top-row.getBoundingClientRect().top+
      (r?r.top+r.height/2:0)-input.scrollTop;
    mirror.remove();
    return y;
  }
  // Paint sibling groups behind native editors; never reparent Roam's React nodes.
  function surfaceOutline(rects,radius){
    if(!rects.length)return '';
    const xs=[...new Set(rects.flatMap(r=>[r.x,r.x+r.w]))].sort((a,b)=>a-b);
    const ys=[...new Set(rects.flatMap(r=>[r.y,r.y+r.h]))].sort((a,b)=>a-b);
    const cells=new Set(),key=(x,y)=>x+','+y;
    for(const r of rects)for(let x=xs.indexOf(r.x);x<xs.indexOf(r.x+r.w);x++)
      for(let y=ys.indexOf(r.y);y<ys.indexOf(r.y+r.h);y++)cells.add(key(x,y));
    const edges=new Map();
    const add=(x,y,a,b)=>{const k=key(x,y);if(!edges.has(k))edges.set(k,[]);edges.get(k).push([a,b]);};
    for(const cell of cells){const [x,y]=cell.split(',').map(Number);
      if(!cells.has(key(x,y-1)))add(x,y,x+1,y);
      if(!cells.has(key(x+1,y)))add(x+1,y,x+1,y+1);
      if(!cells.has(key(x,y+1)))add(x+1,y+1,x,y+1);
      if(!cells.has(key(x-1,y)))add(x,y+1,x,y);
    }
    const paths=[];
    while(edges.size){
      const start=edges.keys().next().value;let at=start;const points=[];
      do{const [x,y]=at.split(',').map(Number);points.push([xs[x],ys[y]]);
        const choices=edges.get(at),next=choices.pop();if(!choices.length)edges.delete(at);
        at=key(...next);
      }while(at!==start && edges.has(at));
      const corners=points.filter((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];return (p[0]-a[0])*(b[1]-p[1])!==(p[1]-a[1])*(b[0]-p[0]);});
      const segments=corners.map((p,i)=>{const a=corners[(i+corners.length-1)%corners.length],b=corners[(i+1)%corners.length];
        const before=Math.hypot(p[0]-a[0],p[1]-a[1]),after=Math.hypot(b[0]-p[0],b[1]-p[1]),r=Math.min(radius,before/2,after/2);
        return {p,in:[p[0]+(a[0]-p[0])*r/before,p[1]+(a[1]-p[1])*r/before],out:[p[0]+(b[0]-p[0])*r/after,p[1]+(b[1]-p[1])*r/after]};});
      if(segments.length)paths.push('M'+segments[0].in.join(' ')+segments.map((q,i)=>(i?' L'+q.in.join(' '):'')+' Q'+q.p.join(' ')+' '+q.out.join(' ')).join('')+' Z');
    }
    return paths.join(' ');
  }
  function branchGuide(levels,chain,branch,width) {
    const ink=getComputedStyle(root).color, paper=root.style.getPropertyValue("--lg-paper") || paperColor(root);
    const esc=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
    // One silhouette per connected bright region, rather than a mix of
    // individually rounded groups and square card overlays.
    const bright=[];
    for(const col of levels){
      let run=null;
      for(const n of col){
        if(!branch.has(n)){run=null;continue;}
        if(run && Math.abs(run.y+run.h-n.top)<1)run.h=n.top+n.height-run.y;
        else {run={x:n.x,y:n.top,w:width,h:n.height};bright.push(run);}
      }
    }
    const outline=surfaceOutline(bright,7);
    const parts=[`<path d="${outline}" fill="${esc(paper)}"/>`];
    if(config.texture)parts.push(`<defs><pattern id="paper-grain" width="192" height="192" patternUnits="userSpaceOnUse">${grainMarks}</pattern></defs>`);
    const endX=Math.ceil(levels.at(-1)[0].x+width+columnGeometry.edge);
    const endY=Math.ceil(Math.max(...levels.flat().map(n=>n.top+n.height))+root.clientHeight);
    if(config.texture)parts.push(`<path d="${outline}" fill="url(#paper-grain)"/>`);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${endX}" height="${endY}">${parts.join('')}</svg>`;
    variable(root,'--lg-groups',`url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
    variable(root,'--lg-end-x',endX+'px');variable(root,'--lg-end-y',endY+'px');
  }
  function layout() {
    if (!root || held || dragging || disposed) return;
    const levels=[], nodes=new Map();
    const pageNode=pageCard?.isConnected?{box:pageCard,row:pageCard,parent:null,depth:0,page:true}:null;
    if(pageNode){nodes.set(pageCard,pageNode);levels.push([pageNode]);}
    for (const row of all(ROW,root)) {
      const box=row.closest(BOX);
      if (!box || box===root || nodes.has(box) || row.closest(OMIT) || !visible(row)) continue;
      const domParent=nodes.get(box.parentElement.closest(BOX));
      const parent=domParent || pageNode;
      const depth=parent ? parent.depth+1 : 0;
      const item={box,row,parent,domParent,depth};
      nodes.set(box,item); (levels[depth] ||= []).push(item);
      mark(box,"data-lg-box"); mark(row,"data-lg-row");
      for(let n=box.parentElement;n && n!==root && n!==domParent?.box;n=n.parentElement) mark(n,"data-lg-pass");
    }
    if (!nodes.size) return;
    const editor=document.activeElement;
    const focusBox=pageCard?.contains(editor)?pageCard:editor?.closest(BOX);
    const requested=focusingUid && [...nodes.values()].find(n=>blockUid(n.box)===focusingUid);
    if(focusingUid && !requested)return;
    const selected=requested || nodes.get(focusBox) || nodes.get(active) ||
      (preferred && [...nodes.values()].find(n=>blockUid(n.box)===preferred)) || nodes.values().next().value;
    active=selected.box;preferred=blockUid(active);
    const w=root.clientWidth,h=root.clientHeight,gap=0;
    if(!w || !h)return;
    const width=Math.min(w-12,Math.max(Math.min(360,w-12),Math.min(480,Math.max(1,w-2*config.margin)/3))*zoom);
    const edge=Math.max(6,(w-width)/2);
    columnGeometry={edge,width,count:levels.length};
    variable(root,'--lg-width',width+'px');
    if(pageCard)variable(pageCard,'--lg-width',width+'px');
    const chain=new Set(),branch=new Set([selected]);
    for(let n=selected;n;n=n.parent)chain.add(n);
    const input=selected.row.contains(editor) && editor.matches('textarea')?editor:null;
    const desired=[],ends=[];
    for(const [depth,col] of levels.entries()){
      let y=0,previousParent;
      for(const n of col){
        // Adjacent groups meet at their surface boundary, without empty spacer rows.
        previousParent=n.parent;
        if(branch.has(n.parent))branch.add(n);
        const related=chain.has(n)||branch.has(n);
        mark(n.row,'data-lg-role',n===selected?'current':branch.has(n)?'child':related?'context':chain.has(n.parent)?'peer':'other');
        mark(n.row,'data-lg-group',n.parent===selected?'selected':'other');
        mark(n.row,'data-lg-depth',String(depth));
        n.y=y;n.height=n.row.getBoundingClientRect().height;y+=n.height+gap;
        if(!watched.has(n.row)){sizes.observe(n.row);watched.add(n.row);}
      }
      ends[depth]=Math.max(0,y-gap);
      const anchor=col.find(n=>chain.has(n));
      if(anchor){
        const offset=anchor===selected && input?caretOffset(input,anchor.row):Math.min(anchor.height/2,h*.30);
        desired[depth]=h/2-anchor.y-offset;
      }else{
        const related=col.filter(n=>branch.has(n));
        const first=related[0]||col[0],last=related.at(-1)||first;
        const span=last.y+last.height-first.y;
        const owner=first.parent;
        const ownerTop=owner?(desired[depth-1]+owner.y):h/2;
        desired[depth]=span>h*.65?Math.max(28,Math.min(h/2,ownerTop))-first.y:h/2-(first.y+last.y+last.height)/2;
      }
      if(!manual || !columnY.has(depth))columnY.set(depth,desired[depth]);
      columnEnds.set(depth,ends[depth]);
    }
    for(const depth of columnY.keys())if(depth>=levels.length){columnY.delete(depth);columnEnds.delete(depth);}
    for(const row of watched)if(row!==pageCard && !root.contains(row)){sizes.unobserve(row);watched.delete(row);}
    // Shared positive document origin, independent visible offsets for each column.
    const origin=Math.max(h,...[...columnY.values()].map(y=>-y+h));
    for(const [depth,col] of levels.entries())for(const n of col){
      n.x=edge+depth*width;n.top=origin+columnY.get(depth)+n.y;
      if(n.page){titlePosition={x:n.x,y:n.top,width};continue;}
      variable(n.box,'--lg-x',n.x-(n.domParent?.x||0)+'px');
      variable(n.box,'--lg-y',n.top-(n.domParent?.top||0)+'px');
      for(const [sep,offset] of [[n.box.previousElementSibling,0],[n.box.nextElementSibling,n.height]]){
        if(!sep?.matches('.rm-block-separator'))continue;
        mark(sep,'data-lg-sep');variable(sep,'--lg-x',n.x-(n.domParent?.x||0)+'px');variable(sep,'--lg-y',n.top+offset-(n.domParent?.top||0)+'px');
      }
    }
    branchGuide(levels,chain,branch,width);
    root.scrollTop=origin;
    if(!manual)columnScroll=Math.max(0,selected.x-(w-width)/2);
    else columnScroll=root.scrollLeft;
    root.scrollLeft=columnScroll;columnDepth=selected.depth;
    positionTitle();positionActions();
  }
  function columnAt(clientX){
    if(!root || !columnGeometry)return null;
    const {edge,width,count}=columnGeometry;
    const x=clientX-root.getBoundingClientRect().left+root.scrollLeft-edge;
    return x<0 || x>=count*width?null:Math.floor(x/width);
  }
  function scrollColumn(depth,delta){
    if(depth===null || !columnY.has(depth))return;
    const h=root.clientHeight,limit=columnEnds.get(depth)||0;
    columnY.set(depth,Math.max(h/2-limit,Math.min(h/2,columnY.get(depth)-delta)));
    manual=true;queue();
  }

  function down(e) {
    if(!inBoard(e.target)) return;
    focusingUid=null;
    held=true;
    const box=pageCard?.contains(e.target)?pageCard:e.target.closest(BOX);
    manual=!box;
    if(box) active=box;
  }
  function release(){held=false;queue();}
  function armDrag(e){
    if(e.button!==0 || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || !root?.contains(e.target))return;
    const handle=e.target.closest('.rm-bullet,.rm-block__bullet');
    if(!handle)return;
    const uid=blockUid(handle.closest(BOX));if(!uid)return;
    dragCandidate={uid,box:handle.closest(BOX)};held=true;
    root.setAttribute('data-lg-drag-armed','');
    // Stop Roam's range-selection gesture, but retain the browser's native drag default.
    e.stopImmediatePropagation();
  }
  function guardDragGesture(e){
    if(!dragCandidate && !dragging)return;
    if(e.type==='selectstart')e.preventDefault();
    e.stopImmediatePropagation();
  }
  function finishPointer(e){
    if(dragCandidate && !dragging){
      e.stopImmediatePropagation();dragCandidate=null;root?.removeAttribute('data-lg-drag-armed');
    }
    release();
  }
  function dragStart(e){
    if(!root?.contains(e.target))return;
    const handle=e.target.closest('.rm-bullet,.rm-block__bullet');
    const box=handle?.closest(BOX) || (dragCandidate && e.target.closest(BOX)===dragCandidate.box?dragCandidate.box:null);
    if(!box)return;
    moving=blockUid(box);if(!moving)return;
    dragging=true;held=true;root.setAttribute('data-lg-drag-armed','');
    e.stopImmediatePropagation();
    // A real drag owns selection only inside this outline, never elsewhere on the page.
    const selection=window.getSelection?.();
    if(selection && root.contains(selection.anchorNode) && root.contains(selection.focusNode))selection.removeAllRanges();
    if(e.dataTransfer){e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','(('+moving+'))');}
  }
  function dragEnd(){
    if(dropRow)dropRow.removeAttribute('data-lg-drop');
    root?.removeAttribute('data-lg-drag-armed');dragCandidate=null;
    dropRow=null;moving=null;dragging=false;release();
  }
  function focus(e){
    if(!inBoard(e.target))return;
    const box=pageCard?.contains(e.target)?pageCard:e.target.closest(BOX);
    if(focusingUid && blockUid(box)!==focusingUid)return;
    manual=false;
    active=box||active;
    const uid=blockUid(active), owner=uid && ownerOf(readBlock(uid));
    if(owner)childMemory.set(owner,uid);
    queue();
  }
  function wheel(e){
    if(!inBoard(e.target) || e.ctrlKey || popupOpen())return;
    if(e.altKey){
      e.preventDefault();manual=false;
      zoom=Math.max(.6,Math.min(1.8,zoom+(e.deltaY<0?.1:-.1)));queue();return;
    }
    manual=true;
    if(e.shiftKey || Math.abs(e.deltaX)>Math.abs(e.deltaY)){
      e.preventDefault();root.scrollLeft+=(e.deltaX || e.deltaY)*(e.deltaMode===1?18:1);
      columnScroll=root.scrollLeft;positionTitle();positionActions();return;
    }
    const depth=columnAt(e.clientX);
    if(depth===null)return;
    e.preventDefault();
    const scale=e.deltaMode===1?18:e.deltaMode===2?root.clientHeight:1;
    scrollColumn(depth,e.deltaY*scale);
  }
  function touchStart(e){
    if(!inBoard(e.target) || e.touches.length!==1 || popupOpen()){touchPoint=null;return;}
    const t=e.touches[0];touchPoint={x:t.clientX,y:t.clientY,depth:columnAt(t.clientX)};
  }
  function touchMove(e){
    if(!touchPoint || e.touches.length!==1)return;
    const t=e.touches[0],dx=touchPoint.x-t.clientX,dy=touchPoint.y-t.clientY;
    held=false;
    if(Math.abs(dx)>Math.abs(dy)){manual=true;root.scrollLeft+=dx;}
    else scrollColumn(touchPoint.depth,dy);
    if(e.cancelable)e.preventDefault();
    touchPoint.x=t.clientX;touchPoint.y=t.clientY;
  }
  function selection(){if(inBoard(document.activeElement)&&document.activeElement.matches(EDIT))queue();}
  function clean() {
    operationEpoch++;dragEnd();columnY.clear();columnEnds.clear();columnGeometry=null;touchPoint=null;
    titleObserver?.disconnect();focusingUid=null;columnDepth=null;columnScroll=0;
    focusRequest++;childMemory.clear();
    observer?.disconnect();sizes?.disconnect();watched.clear();
    cancelAnimationFrame(frame);frame=0;
    for(const el of touched) {
      for(const a of ["data-lg-board","data-lg-box","data-lg-row","data-lg-role","data-lg-pass","data-lg-sep","data-lg-group","data-lg-page","data-lg-depth"]) el.removeAttribute(a);
      for(const v of ["--lg-x","--lg-y","--lg-width","--lg-end-x","--lg-end-y","--lg-paper","--lg-profile","--lg-title-x","--lg-title-y","--lg-title-clip","--lg-groups"]) el.style.removeProperty(v);
    }
    touched.clear();root=active=null;pageCard=null;pageUid=null;titlePosition=null;held=dragging=false;
    if(scroller?.isConnected) scroller.scrollTop=oldScroll;
  }
  async function close() {
    clean();
    positionActions();
    try {await zen(false);} finally {session=false;mountTools();}
  }
  async function open() {
    manual=false;
    const candidate=findRoot();
    if(!candidate){notice("Open a Roam outline with a visible block.");return;}
    preferred=window.roamAlphaAPI?.ui?.getFocusedBlock?.()?.["block-uid"] || blockUid(document.activeElement?.closest(BOX));
    scroller=candidate.closest(".rm-article-wrapper") || candidate.parentElement;
    oldScroll=scroller.scrollTop;route=location.href;session=true;mountTools();
    await zen(true);
    if(disposed)return;
    root=findRoot() || (candidate.isConnected?candidate:null);
    if(!root){await close();return;}
    const paper=paperColor(root);
    mark(root,"data-lg-board");variable(root,"--lg-paper",paper);
    const article=root.closest(".roam-article");
    pageCard=article?.querySelector(".rm-title-display-container[data-page-uid]") || null;
    pageUid=pageCard?.getAttribute("data-page-uid") || null;
    if(pageCard){
      mark(pageCard,"data-lg-page");variable(pageCard,"--lg-paper",paper);
      titleObserver=new MutationObserver(queue);
      titleObserver.observe(pageCard,{childList:true,subtree:true,characterData:true});
    }
    sizes=new ResizeObserver(queue);sizes.observe(root);
    observer=new MutationObserver(queue);
    observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","aria-expanded","hidden"]});
    layout();
  }
  function switchMode(){
    if(pending || disposed)return;
    clearTimeout(clickTimer);lastIconClick=0;
    pending=(session?close():open()).catch(async error=>{
      if(session) await close().catch(()=>{});
      notice(error.message);
    }).finally(()=>{pending=null;});
    return pending;
  }
  function exportBranch(){
    const uid=blockUid(active),api=window.roamAlphaAPI;
    if(!uid){notice("Click a block to export its branch.");return;}
    const row=(api.data?.pull||api.pull)("[:block/string :block/order {:block/children ...}]",[":block/uid",uid]);
    if(!row)return;
    const lines=[];
    function visit(n,indent){
      lines.push(indent+"- "+(n[":block/string"]||"").replace(/\r?\n/g,"\n"+indent+"  "));
      for(const child of [...(n[":block/children"]||[])].sort((a,b)=>a[":block/order"]-b[":block/order"]))visit(child,indent+"  ");
    }
    visit(row,"");
    const url=URL.createObjectURL(new Blob([lines.join("\n")+"\n"],{type:"text/markdown"}));
    const link=document.createElement("a");link.href=url;link.download="branch-"+uid+".md";
    link.click();downloads.set(url,setTimeout(()=>{URL.revokeObjectURL(url);downloads.delete(url);},1000));
  };
  function readBlock(uid){
    const api=window.roamAlphaAPI;
    return (api.data?.pull||api.pull)("[:block/order :block/string {:block/_children [:block/uid]} {:block/children [:block/uid :block/order]}]",[":block/uid",uid]);
  }
  function ownerOf(row){
    const parents=row?.[":block/_children"];
    return (Array.isArray(parents)?parents[0]:parents)?.[":block/uid"];
  }
  async function focusUid(uid, cursor=0) {
    const request=++focusRequest, api=window.roamAlphaAPI;
    if(disposed || !root)return false;
    manual=false;preferred=uid;focusingUid=uid;
    if(uid===pageUid && pageCard){
      active=pageCard;layout();
      if(!pageCard.querySelector("textarea"))pageCard.querySelector(".rm-title-display")?.click();
      for(let i=0;i<20 && !disposed && root && request===focusRequest;i++){
        const input=pageCard?.querySelector("textarea");
        if(input){input.focus({preventScroll:true});input.setSelectionRange(input.value.length,input.value.length);focusingUid=null;queue();return true;}
        await wait(16);
      }
      focusingUid=null;return false;
    }
    queue();
    const location={"block-uid":uid,"window-id":"main-window"};
    for(let attempt=0;attempt<4 && !disposed && root && request===focusRequest;attempt++){
      try{await api.ui.setBlockFocusAndSelection({location,selection:{start:cursor,end:cursor}});}
      catch(error){if(request===focusRequest)focusingUid=null;throw error;}
      for(let i=0;i<8 && !disposed && root && request===focusRequest;i++){
        const input=document.activeElement;
        if(input?.matches("textarea") && root.contains(input) &&
          blockUid(input.closest(BOX))===uid){
          input.focus({preventScroll:true});
          active=input.closest(BOX);focusingUid=null;queue();return true;
        }
        await wait(16);
      }
    }
    if(request===focusRequest)focusingUid=null;
    if(root && request===focusRequest)notice("Roam could not focus the block. Please click the new block.");
    return false;
  }
  async function enterSibling(e){
    if(disposed || e.isComposing||e.keyCode===229)return;
    if(session && busy && e.key==="Tab" && !popupOpen()){
      e.preventDefault();e.stopImmediatePropagation();tabPending=!e.shiftKey;return;
    }
    if(!root?.contains(e.target))return;
    if(e.key!=="Enter"||e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||!e.target.matches("textarea"))return;
    if(all('.bp3-popover,.bp4-popover,.bp5-popover,[role=listbox]').some(visible))return;
    const input=e.target,uid=blockUid(input.closest(BOX));
    if(!uid||input.selectionStart!==input.value.length||input.selectionEnd!==input.value.length)return;
    const row=readBlock(uid),owner=ownerOf(row);
    // Roam normally inserts a child at the end of an expanded parent.
    // In this view Enter must insert the next card in the same column.
    if(!owner||!row[":block/children"]?.length)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(busy)return;
    busy=true;tabPending=false;
    const live=operationGuard();
    const api=window.roamAlphaAPI, fresh=api.util.generateUID();
    try{
      // Let Roam commit its own editor; never overwrite a block from a stale snapshot.
      const draft=input.value;
      input.blur();
      for(let i=0;i<30 && live() && readBlock(uid)?.[":block/string"]!==draft;i++)await wait(16);
      if(!live())return;
      const current=readBlock(uid);
      if(current?.[":block/string"]!==draft){notice("Roam is still saving this block. Please try Enter again.");return;}
      const parent=ownerOf(current);
      if(!parent)return;
      await writeBlock("create",{location:{"parent-uid":parent,order:current[":block/order"]+1},block:{uid:fresh,string:""}},live);
      if(tabPending){
        await writeBlock("move",{location:{"parent-uid":uid,order:"last"},block:{uid:fresh}},live);
        await writeBlock("update",{block:{uid,open:true}},live);
        tabPending=false;
      }
      await focusUid(fresh,0);
      if(tabPending){
        await writeBlock("move",{location:{"parent-uid":uid,order:"last"},block:{uid:fresh}},live);
        await writeBlock("update",{block:{uid,open:true}},live);
        tabPending=false;await focusUid(fresh,0);
      }
    }catch(error){if(!error.cancelled)notice(error.message);}finally{busy=false;tabPending=false;}
  }
  function dropTarget(e){
    if(dropRow)dropRow.removeAttribute("data-lg-drop");
    dropRow=null;
    if(!moving||!root?.contains(e.target))return;
    const row=e.target.closest(ROW),uid=rowUid(row);
    if(!uid||uid===moving)return;
    const seen=new Set();
    for(let next=uid;next && !seen.has(next);next=ownerOf(readBlock(next))){
      if(next===moving)return;
      seen.add(next);
    }
    const r=row.getBoundingClientRect();
    const position=e.clientY-r.top<r.height/4?"up":r.bottom-e.clientY<r.height/4?"down":r.right-e.clientX<r.width/4?"right":null;
    if(!position)return;
    dropRow=row;row.setAttribute("data-lg-drop",position);
    return {uid,position};
  }
  function dragOver(e){
    if(!moving)return;
    e.preventDefault();e.stopImmediatePropagation();
    const dest=dropTarget(e);
    if(e.dataTransfer)e.dataTransfer.dropEffect=dest?"move":"none";
  }
  async function dropBranch(e){
    if(!moving){dragEnd();return;}
    e.preventDefault();e.stopImmediatePropagation();
    const source=moving,dest=dropTarget(e);dragEnd();
    if(disposed||!root||!dest||busy)return;
    const live=operationGuard();
    busy=true;
    try{
      const api=window.roamAlphaAPI;
      const owner=dest.position==="right"?dest.uid:ownerOf(readBlock(dest.uid));
      const siblings=[...(readBlock(owner)[":block/children"]||[])].sort((a,b)=>a[":block/order"]-b[":block/order"]).filter(n=>n[":block/uid"]!==source);
      const index=siblings.findIndex(n=>n[":block/uid"]===dest.uid);
      if(dest.position!=="right" && index<0)return;
      const order=dest.position==="right"?siblings.length:index+Number(dest.position==="down");
      await writeBlock("move",{location:{"parent-uid":owner,order},block:{uid:source}},live);
      if(dest.position==="right")await writeBlock("update",{block:{uid:owner,open:true}},live);
      await focusUid(source);
    }catch(error){if(!error.cancelled)notice(error.message);}finally{busy=false;}
  }

  function atVerticalBoundary(input,direction){
    const css=getComputedStyle(input);
    const line=parseFloat(css.lineHeight)||parseFloat(css.fontSize)*1.2||20;
    const current=caretOffset(input,input,input.selectionStart);
    const edge=caretOffset(input,input,direction==='ArrowUp'?0:input.value.length);
    return Math.abs(current-edge)<line*.5;
  }
  function navigate(e) {
    if(!inBoard(e.target)||e.defaultPrevented||e.isComposing||e.keyCode===229||
      e.shiftKey||e.ctrlKey||e.metaKey||e.altKey||popupOpen())return;
    const horizontal=e.key==="ArrowLeft"||e.key==="ArrowRight";
    if(!horizontal && e.key!=="ArrowUp" && e.key!=="ArrowDown")return;
    if(horizontal && !config.arrows)return;
    const input=e.target;
    if(input.matches("textarea")){
      if(input.selectionStart!==input.selectionEnd)return;
      if(e.key==="ArrowLeft" && input.selectionStart!==0)return;
      if(e.key==="ArrowRight" && input.selectionEnd!==input.value.length)return;
      if(!horizontal && !atVerticalBoundary(input,e.key))return;
    }else return; // Never intercept controls, links or an unfocused card.
    const source=pageCard?.contains(input)?pageCard:input.closest(BOX);
    const uid=blockUid(source);
    if(!uid)return;
    active=source;
    e.preventDefault();e.stopImmediatePropagation();
    // Holding Right on an empty leaf must not create a chain of empty descendants.
    if((horizontal && e.repeat) || busy)return;
    void moveSelection(e.key,uid);
  }
  async function moveSelection(direction, uid=blockUid(active)) {
    if(disposed || !uid || busy || !root)return;
    const live=operationGuard();
    const row=readBlock(uid),owner=ownerOf(row);
    if(!row)return;
    if(uid===pageUid && direction!=="ArrowRight")return;
    const children=[...(row?.[":block/children"]||[])].sort((a,b)=>a[":block/order"]-b[":block/order"]);
    let next;
    if(direction==="ArrowLeft")next=owner;
    else if(direction==="ArrowRight")next=(children.find(n=>n[":block/uid"]===childMemory.get(uid))||children[0])?.[":block/uid"];
    else {
      if(!owner)return;
      const siblings=[...(readBlock(owner)?.[":block/children"]||[])].sort((a,b)=>a[":block/order"]-b[":block/order"]);
      const index=siblings.findIndex(n=>n[":block/uid"]===uid);
      if(index<0)return;
      next=siblings[index+(direction==="ArrowUp"?-1:1)]?.[":block/uid"];
    }
    // Stop native up/down from escaping the sibling group.
    if(direction==="ArrowLeft" && next!==pageUid && !all(ROW,root).some(n=>rowUid(n)===next))return;
    if(!next && direction!=="ArrowRight")return;
      busy=true;
      const api=window.roamAlphaAPI;
      try{
        if(direction==="ArrowRight"){
          if(!next){
            next=api.util.generateUID();
            await writeBlock("create",{location:{"parent-uid":uid,order:"last"},block:{uid:next,string:""}},live);
          }
          if(uid!==pageUid)await writeBlock("update",{block:{uid,open:true}},live);
        }
        await focusUid(next,(direction==="ArrowLeft"||direction==="ArrowUp")?(readBlock(next)?.[":block/string"]||"").length:0);
      }catch(error){if(!error.cancelled)notice(error.message);}finally{busy=false;}
  }
  function shortcut(e){
    if(!session || (!e.ctrlKey && !e.metaKey && e.key!=="Escape"))return;
    shortcutUntil=Date.now()+500;
    positionActions();
    clearTimeout(shortcutTimer);shortcutTimer=setTimeout(()=>{if(!disposed)positionActions();},520);
  }

  toggle.onmousedown=e=>e.preventDefault();

  function showSettings(){
    clearTimeout(clickTimer);lastIconClick=0;
    if(disposed)return;
    if(!panel.open)panel.showModal();
    positionActions();
  }
  toggle.onclick=e=>{
    clearTimeout(clickTimer);
    const now=performance.now();
    if(e.detail>1 || (lastIconClick && now-lastIconClick<650)){showSettings();return;}
    lastIconClick=now;
    clickTimer=setTimeout(()=>{lastIconClick=0;switchMode();},650);
  };
  toggle.oncontextmenu=e=>{e.preventDefault();showSettings();};
  toggle.ondblclick=e=>{
    e.preventDefault();clearTimeout(clickTimer);
    showSettings();
  };
  panel.addEventListener("close",positionActions);
  const listeners=[
    [window,"pointerdown",armDrag,true],[document,"pointerdown",down,true],[window,"pointerup",finishPointer,true],
    [window,"mousedown",guardDragGesture,true],[window,"mousemove",guardDragGesture,true],
    [window,"pointermove",guardDragGesture,true],[window,"selectstart",guardDragGesture,true],
    [window,"pointercancel",finishPointer,true],[window,"dragstart",dragStart,true],
    [window,"dragend",dragEnd,true],[window,"drop",dropBranch,true],[window,"blur",dragEnd],
    [document,"focusin",focus,true],[document,"input",selection,true],
    [document,"selectionchange",selection],[window,"resize",queue],
    [document,"wheel",wheel,{passive:false}],
    [document,"touchstart",touchStart,{passive:true}],
    [document,"touchmove",touchMove,{passive:false}],
    [document,"touchend",()=>{touchPoint=null;}],
    [document,"touchcancel",()=>{touchPoint=null;}],
    [document,"input",e=>{if(root?.contains(e.target)){manual=false;queue();}},true],
    [document,"keydown",shortcut,true],[document,"keydown",enterSibling,true],[window,"keydown",navigate,true],[document,"dragover",dragOver,true],[document,"scroll",()=>{if(root && manual)columnScroll=root.scrollLeft;else if(root && Math.abs(root.scrollLeft-columnScroll)>1)root.scrollLeft=columnScroll;positionTitle();positionActions();},true]
  ];
  for(const [el,type,fn,opt] of listeners)el.addEventListener(type,fn,opt);
  const chrome=new MutationObserver(()=>{
    positionActions();
    if(root && (!root.isConnected||location.href!==route)){switchMode();return;}
    if(!tools.isConnected || (!session && $(".rm-topbar") && tools.parentNode!==$(".rm-topbar"))) mountTools();
  });
  chrome.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","open","aria-hidden"]});
  const commandPalette=extensionAPI?.ui?.commandPalette || window.roamAlphaAPI?.ui?.commandPalette;
  const commandLabels=[];
  let commandBusy=false;
  async function runCommand(fn){
    if(disposed || commandBusy || pending || busy)return;
    commandBusy=true;
    try{
      // Allow Roam to close its palette before focusing an editor or opening settings.
      const paletteVisible=()=>all('.rm-command-palette,.bp3-omnibar,.bp4-omnibar,.bp5-omnibar').some(visible);
      await wait(32);
      for(let i=0;i<30 && paletteVisible();i++)await wait(32);
      if(disposed)return;
      if(paletteVisible()){notice("Close the command palette and try again.");return;}
      await fn();
    }catch(error){if(!error.cancelled)notice(error.message);}
    finally{commandBusy=false;}
  }
  async function registerCommands(){
    if(!commandPalette?.addCommand){notice("Roam command palette API is unavailable.");return;}
    const commands=[["Toggle",switchMode],["Settings",showSettings]];
    for(const [name,fn] of commands){
      const label="Gingko Writing: "+name;
      try{
        await commandPalette.addCommand({label,callback:()=>runCommand(fn),"disable-hotkey":false});
        commandLabels.push(label);
      }catch(error){console.error("Gingko command:",label,error);}
    }
  }
  apply();mountTools();
  const commandsReady=registerCommands();
  let disposal;
  window[key]={dispose(){
    if(disposal)return disposal;
    disposed=true;operationEpoch++;focusRequest++;
    chrome.disconnect();for(const [el,type,fn,opt] of listeners)el.removeEventListener(type,fn,opt);
    clearTimeout(clickTimer);clearTimeout(shortcutTimer);
    panel.removeEventListener("close",positionActions);
    for(const [url,timer] of downloads){clearTimeout(timer);URL.revokeObjectURL(url);}downloads.clear();
    disposal=(async()=>{
    await commandsReady;await settingsWrite;
    for(const label of commandLabels){
      try{await commandPalette.removeCommand({label});}catch(error){console.error("Gingko command cleanup",error);}
    }
    await pending;if(session)await close();
    clean();panel.remove();actions.remove();
    document.documentElement.style.removeProperty('--lg-texture');
    document.documentElement.style.removeProperty("--gc-margin");
    document.documentElement.style.removeProperty("--gc-dim");
    document.documentElement.style.removeProperty("--gc-focus-tint");
    clearTimeout(noteTimer);note?.remove();tools.remove();style.remove();if(window[key]===controller)delete window[key];
    })();
    return disposal;
  }};
  const controller=window[key];
  await commandsReady;
  return window[key];
}

void startGingko().catch(console.error);
