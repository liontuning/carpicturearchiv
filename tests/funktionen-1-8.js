// Version 1.8: klebendes Ablagefeld, Bilder überall ins Fenster ziehen, Liontuning-Gelb, Scrolltiefe bleibt, Mausrad, Bild nach Umbenennen.
const {chromium}=require('playwright');const os=require('os');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const errs=[];
const open=async(w,h)=>{const ctx=await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
    window.showDirectoryPicker=async()=>{const r=await navigator.storage.getDirectory();return r.getDirectoryHandle('V18-'+innerWidth,{create:true})};
    const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto('http://localhost:8770/');await p.waitForTimeout(700);return p};
const mkIn=(p,w,h,c)=>p.evaluate(async([w,h,c])=>{const cv=new OffscreenCanvas(w,h);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(w/5,h/5,w/3,h/3);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},[w,h,c]);
const box=(p,sel)=>p.evaluate(s=>{const r=document.querySelector(s).getBoundingClientRect();return{top:Math.round(r.top),bottom:Math.round(r.bottom),h:Math.round(r.height)}},sel);
const drag=(p,type,sel,bytes)=>p.evaluate(([type,sel,bytes])=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(bytes)],'gezogen.jpg',{type:'image/jpeg'}));
  (document.querySelector(sel)||document.body).dispatchEvent(new DragEvent(type,{dataTransfer:dt,bubbles:true,cancelable:true}))},[type,sel,bytes]);

// ---------- breit ----------
let p=await open(1280,720);await p.click('#bNew');await p.waitForTimeout(500);
const hdr=await box(p,'header'),d0=await box(p,'#drop');
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(300);
let d1=await box(p,'#drop'),q1=await box(p,'#queue');
assert(d1.top>=hdr.bottom&&d1.bottom<=720&&d1.h===d0.h,'Breit: Ablagefeld bleibt nach dem Scrollen sichtbar, gleiche Größe');
assert(q1.top>=hdr.bottom&&q1.bottom<=720,'Breit: Warteschlange bleibt sichtbar');
assert(await p.evaluate(()=>scrollY>100),'Breit: die Seite ist wirklich gescrollt');
// Ziehen über das Fenster: Rahmen erscheint, Loslassen irgendwo fügt hinzu
const img=await mkIn(p,900,600,'#c33');
await drag(p,'dragenter','#u_notes',img);assert(await p.isVisible('#dragOv'),'Beim Ziehen über das Fenster erscheint der Rahmen');
await drag(p,'drop','#u_notes',img);await p.waitForTimeout(700);
assert(!(await p.isVisible('#dragOv'))&&await p.evaluate(()=>queue.length===1&&!!queue[0].sha),'Loslassen neben dem Feld legt das Bild in die Warteschlange');
// Mausrad über aktivem Jahresfeld
await p.evaluate(()=>scrollTo(0,0));await p.selectOption('#u_brand','BMW');await p.selectOption('#u_model','3er');await p.fill('#u_from','2015');
await p.hover('#u_from');await p.mouse.wheel(0,300);await p.waitForTimeout(200);
assert(await p.inputValue('#u_from')==='2015','Mausrad verstellt die Jahreszahl nicht');
await p.evaluate(()=>scrollTo(0,0));await p.click('#saveBtn');await p.waitForTimeout(1200);
assert(await p.evaluate(()=>cars.length===1),'Bild gespeichert');
// Pflichtfeld fehlt: Fokus springt hin
await drag(p,'drop','#drop',await mkIn(p,800,600,'#36c'));await p.waitForTimeout(700);
await p.selectOption('#u_brand','');await p.click('#saveBtn');assert(await p.evaluate(()=>document.activeElement.id==='u_brand'),'Fehlende Marke: Feld bekommt den Fokus');
await p.selectOption('#u_brand','Audi');await p.selectOption('#u_model','A4');await p.click('#saveBtn');await p.waitForTimeout(1200);
// Im Reiter Suchen fallen lassen: wechselt zum Einsortieren
await p.click('#tabSearch');await p.waitForTimeout(300);
await drag(p,'drop','#grid',await mkIn(p,700,500,'#3a3'));await p.waitForTimeout(700);
assert(await p.isVisible('#viewUp')&&await p.evaluate(()=>queue.length===1),'Im Reiter Suchen fallen gelassen: Einsortieren öffnet sich mit dem Bild');
// Bei offenem Fenster nicht annehmen
await p.click('#libBtn');await drag(p,'drop','#libDlg',await mkIn(p,600,500,'#939'));await p.waitForTimeout(300);
assert(await p.evaluate(()=>queue.length===1),'Offenes Fenster: Bild wird nicht unbemerkt hinzugefügt');await p.click('#libClose');
await p.click('.q .x');assert(await p.evaluate(()=>queue.length===0&&!document.querySelector('.q')),'Entfernen aus der Warteschlange');
// Farbe: Gelb mit dunkler Schrift, kein Orange mehr
const col=await p.evaluate(()=>{const s=getComputedStyle(document.querySelector('.tabs button.on'));return [s.backgroundColor,s.color]});
assert(col[0]==='rgb(244, 232, 28)'&&col[1]==='rgb(20, 20, 20)','Aktiver Reiter: Liontuning-Gelb mit dunkler Schrift');
assert(!(await p.content()).toLowerCase().includes('ff5a1f'),'Kein Orange mehr im Code');
// Detail: Bild bleibt stehen; nach Ändern des Modells (Datei wird umbenannt) lädt das Bild wieder
await p.click('#tabSearch');await p.waitForTimeout(400);await p.click('.item');await p.waitForTimeout(500);
const i0=await box(p,'#dBox');await p.evaluate(()=>document.getElementById('dlg').scrollTo(0,9999));await p.waitForTimeout(200);const i1=await box(p,'#dBox');
assert(await p.evaluate(()=>document.getElementById('dlg').scrollTop>0)?i1.top>=0&&i1.top<=i0.top:true,'Detail: Bild bleibt beim Scrollen der Angaben sichtbar');
const id=await p.evaluate(()=>cur.id);const other=await p.evaluate(()=>[...document.getElementById('e_model').options].map(o=>o.value).find(v=>v&&v!=='__neu__'&&v!==cur.model));await p.selectOption('#e_model',other);await p.click('#dSave');await p.waitForTimeout(800);
await p.evaluate(id=>openDlg(id),id);await p.waitForTimeout(800);
assert(await p.evaluate(()=>document.getElementById('dImg').naturalWidth>0),'Bild lädt nach dem Umbenennen der Datei');
await p.click('#dSave');await p.waitForTimeout(300);assert((await p.textContent('#toast')).includes('Nichts geändert')&&!(await p.isVisible('#dlg')),'Unverändert speichern schreibt nichts');
// Tag-Filter: gleicher Tag in anderer Schreibweise ist ein Eintrag
await p.evaluate(()=>{cars[0].specs=['R-Line'];cars[1].specs=['r line'];fillFilters();render()});
assert(await p.evaluate(()=>document.querySelectorAll('#fSpecs [data-s]').length===1),'Tag-Filter fasst Schreibweisen zusammen');
await p.click('#fSpecs [data-s]');assert(await p.evaluate(()=>document.querySelectorAll('#grid .item').length===2&&document.querySelectorAll('#fSpecs .on').length===1),'Tag-Filter findet beide Schreibweisen');
await p.click('#fReset');
// Scrolltiefe bleibt nach Daten-Änderung
await p.evaluate(()=>{for(let i=0;i<400;i++)cars.push(normalize({id:'t'+i,brand:'Test',model:'M'+(i%7),file:'x.jpg'}));render()});
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(500);await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(500);
const before=await p.evaluate(()=>[document.querySelectorAll('#grid .item').length,scrollY]);
await p.evaluate(()=>render(true));await p.waitForTimeout(300);const after=await p.evaluate(()=>[document.querySelectorAll('#grid .item').length,scrollY]);
assert(before[0]>120&&after[0]>=before[0]&&after[1]===before[1],'Nach Speichern/Abgleich bleibt die Trefferliste an derselben Stelle ('+before+' → '+after+')');
assert(await p.evaluate(()=>window.__cls)===0,'Breit: kein Layout-Springen (CLS 0)');
await p.screenshot({path:os.tmpdir()+'/v18-such.png'});

// ---------- schmal (eine Spalte) ----------
for(const [w,h] of [[760,800],[390,844]]){const n=await open(w,h);await n.evaluate(()=>document.getElementById('banner').classList.add('hidden'));
  const a=await box(n,'#drop');await n.evaluate(()=>scrollTo(0,700));await n.waitForTimeout(300);const z=await box(n,'#drop'),hd=await box(n,'header');
  const hb=await n.evaluate(()=>getComputedStyle(document.querySelector('header')).position==='sticky')?hd.bottom:0;
  assert(z.top>=hb&&z.top<hb+40&&z.h===a.h,`Breite ${w}: Ablagefeld klebt oben, gleiche Größe`);
  assert(!(await n.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Breite ${w}: kein waagrechtes Scrollen`);
  assert(await n.evaluate(()=>window.__cls)===0,`Breite ${w}: kein Layout-Springen (CLS 0)`);
  await n.screenshot({path:os.tmpdir()+`/v18-${w}.png`})}
assert(errs.length===0,'keine Fehler '+errs);
await b.close()})();
