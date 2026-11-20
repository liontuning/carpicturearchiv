// „Rückgängig“ nach Bearbeiten, „Gemeinsam ändern“ und Löschen; Download-Vorgabe 1600×1200.
const {chromium}=require('playwright');const fs=require('fs'),os=require('os');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const errs=[];
for(const mode of ['dir','browser']){
const ctx=await b.newContext({viewport:{width:1280,height:850},acceptDownloads:true});
await ctx.addInitScript(mode=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
  if(mode==='browser')window.showDirectoryPicker=undefined;else window.showDirectoryPicker=async()=>{const r=await navigator.storage.getDirectory();return r.getDirectoryHandle('U',{create:true})};
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}},mode);
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8770/');await p.waitForTimeout(700);
const T=m=>'['+(mode==='dir'?'Mediathek':'Browser')+'] '+m;
const mk=async(w,h,c,type='image/jpeg')=>Buffer.from(await p.evaluate(async([w,h,c,type])=>{const cv=new OffscreenCanvas(w,h);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(w/5,h/5,w/3,h/3);return [...new Uint8Array(await (await cv.convertToBlob({type})).arrayBuffer())]},[w,h,c,type]));
if(mode==='dir'){await p.click('#bNew');await p.waitForTimeout(500)}else await p.evaluate(()=>document.getElementById('banner').classList.add('hidden'));
await p.setInputFiles('#fileIn',[{name:'a.jpg',mimeType:'image/jpeg',buffer:await mk(900,600,'#c33')},{name:'hochkant.jpg',mimeType:'image/jpeg',buffer:await mk(600,900,'#36c')},{name:'c.png',mimeType:'image/png',buffer:await mk(700,500,'#3a3','image/png')}]);await p.waitForTimeout(900);
await p.selectOption('#u_brand','BMW');await p.selectOption('#u_model','3er');await p.fill('#u_color','Rot');await p.fill('#u_specs .tagin','M-Paket,');await p.click('#saveBtn');await p.waitForTimeout(1200);
await p.click('#tabSearch');await p.waitForTimeout(400);
const state=()=>p.evaluate(()=>cars.map(c=>[c.id,c.brand,c.model,c.color,c.specs.join('+'),c.verified].join('|')).sort().join(' ; '));
const s0=await state();

// Einzelbild bearbeiten und zurücknehmen
await p.click('.item');await p.waitForTimeout(300);await p.fill('#e_color','Blau');await p.click('#dSave');await p.waitForTimeout(600);
assert((await state())!==s0&&await p.isVisible('#toast button'),T('Nach dem Bearbeiten erscheint „Rückgängig“'));
await p.click('#toast button');await p.waitForTimeout(900);
assert((await state())===s0,T('Rückgängig stellt die Angaben des Einzelbilds wieder her'));

// Gemeinsam ändern und zurücknehmen
await p.click('.item .pick');await p.click('#selAllVis');await p.click('#selEdit');
await p.selectOption('#b_brand','Audi');await p.selectOption('#b_model','A4');await p.fill('#b_addSpecs .tagin','S-Line,');await p.fill('#b_rmSpecs .tagin','M-Paket');await p.keyboard.press('Enter');await p.click('#bulkTitle');await p.click('#b_ver [data-v="1"]');
await p.click('#bulkSave');await p.waitForTimeout(1200);
const s1=await state();assert(s1.includes('Audi|A4')&&!s1.includes('BMW')&&s1.includes('S-Line')&&!s1.includes('M-Paket'),T('Gemeinsam ändern hat alle drei geändert'));
await p.click('#toast button');await p.waitForTimeout(1500);
assert((await state())===s0,T('Rückgängig nimmt „Gemeinsam ändern“ bei allen Bildern zurück'));
if(mode==='dir'){const names=await p.evaluate(async()=>{const out=[];const walk=async(d)=>{for await(const [n,h] of d.entries()){if(h.kind==='directory')await walk(h);else out.push(n)}};await walk(await (await (await navigator.storage.getDirectory()).getDirectoryHandle('U')).getDirectoryHandle('Bilder'));return out});
  assert(names.length===6&&names.every(n=>n.includes('BMW_3er')),T('Dateinamen heißen wieder BMW_3er, je Bild eine Begleitdatei'));
  await p.evaluate(()=>rescan(true));await p.waitForTimeout(500);assert((await state())===s0,T('Stand bleibt nach neuem Einlesen'))}

// Mehrere löschen und zurückholen
await p.click('#selDel');await p.waitForTimeout(1200);
assert(await p.evaluate(()=>cars.length)===0&&await p.isVisible('#toast button'),T('Alle gelöscht, „Rückgängig“ wird angeboten'));
await p.click('#toast button');await p.waitForTimeout(3500);
assert((await state())===s0,T('Rückgängig holt alle gelöschten Bilder mit Angaben zurück'));
await p.waitForTimeout(400);
assert((await p.$$eval('.item img',im=>im.filter(i=>i.complete&&i.naturalWidth>0).length))===3,T('Zurückgeholte Bilder werden angezeigt'));
// Einzeln löschen und zurückholen
await p.click('.item');await p.waitForTimeout(300);await p.click('#dDel');await p.waitForTimeout(900);
assert(await p.evaluate(()=>cars.length)===2,T('Einzelbild gelöscht'));await p.click('#toast button');await p.waitForTimeout(2500);
assert((await state())===s0,T('Rückgängig holt das Einzelbild zurück'));
// Meldung ohne Knopf lässt sich nicht anklicken
await p.evaluate(()=>toast('Nur Text'));await p.waitForTimeout(200);
assert(await p.evaluate(()=>getComputedStyle(document.getElementById('toast')).pointerEvents==='none'&&!document.querySelector('#toast button')),T('Meldung ohne Knopf fängt keine Klicks ab'));

// Download-Vorgaben
if(mode==='dir'){
  assert((await p.inputValue('#dlPreset'))==='orig'&&(await p.$eval('#dlPreset',s=>[...s.options].map(o=>o.textContent).slice(0,2).join(' | ')))==='Download: Original | Download: 1600×1200 · JPG','Original ist Standard, 1600×1200 steht direkt darunter');
  await p.evaluate(async()=>{const cv=new OffscreenCanvas(2400,1200);const g=cv.getContext('2d');g.fillStyle='#850';g.fillRect(0,0,2400,1200);const big=await cv.convertToBlob({type:'image/jpeg'});
    const r=normalize({id:crypto.randomUUID(),originalName:'gross.jpg',sha256:await sha256(big),importedAt:new Date().toISOString(),brand:'Opel',model:'Astra'});await store.add(r,big);cars.push(r);fillFilters();render()});
  await p.waitForTimeout(400);await p.selectOption('#dlPreset','j1600');
  const dl=async sel=>{const [d]=await Promise.all([p.waitForEvent('download'),p.click(sel)]);const f=os.tmpdir()+'/'+d.suggestedFilename();await d.saveAs(f);const buf=fs.readFileSync(f);
    const dim=await p.evaluate(async a=>{const im=await createImageBitmap(new Blob([new Uint8Array(a)]));return im.width+'×'+im.height},[...buf]);return{name:d.suggestedFilename(),dim,size:buf.length}};
  const sizeOf=txt=>p.evaluate(async txt=>{const c=cars.find(x=>(x.brand+' '+x.model+' '+x.originalName).includes(txt));return (await store.blob(c)).size},txt);
  await p.fill('#fText','astra');await p.waitForTimeout(250);let d=await dl('.item .dl');assert(d.dim==='1600×800'&&/\.jpg$/.test(d.name),'1600×1200: breites Bild wird auf 1600 Breite verkleinert ('+d.dim+')');
  await p.fill('#fText','hochkant');await p.waitForTimeout(250);d=await dl('.item .dl');assert(d.dim==='600×900'&&d.size===await sizeOf('hochkant'),'1600×1200: kleineres JPG bleibt unverändert, ohne Qualitätsverlust ('+d.dim+')');
  await p.fill('#fText','c.png');await p.waitForTimeout(250);d=await dl('.item .dl');assert(d.dim==='700×500'&&/\.jpg$/.test(d.name),'1600×1200: PNG wird als JPG ausgegeben ('+d.name+')');
  await p.selectOption('#dlPreset','orig');d=await dl('.item .dl');assert(/\.png$/.test(d.name)&&d.size===await sizeOf('c.png'),'Original: Datei kommt unverändert ('+d.name+')');
  await p.click('#fReset')}
const cls=await p.evaluate(()=>window.__cls);assert(cls===0,T('CLS '+cls));await ctx.close()}
assert(errs.length===0,'keine Fehler '+errs);await b.close()})();
