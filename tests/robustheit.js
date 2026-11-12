// Fehlerquellen aus der Durchsicht von Version 1.5.1: jede Zeile stellt einen behobenen Fehler nach.
const {chromium}=require('playwright');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:850}});const errs=[];
await ctx.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
  window.showDirectoryPicker=async()=>{const r=await navigator.storage.getDirectory();return r.getDirectoryHandle('Robust',{create:true})};
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8770/');await p.waitForTimeout(700);
const mk=async(w,h,c)=>Buffer.from(await p.evaluate(async([w,h,c])=>{const cv=new OffscreenCanvas(w,h);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(w/5,h/5,w/3,h/3);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},[w,h,c]));
const files=()=>p.evaluate(async()=>{const out=[];const walk=async(d,pre)=>{for await(const [n,h] of d.entries()){if(h.kind==='directory')await walk(h,pre+n+'/');else out.push(pre+n)}};await walk(await (await navigator.storage.getDirectory()).getDirectoryHandle('Robust'),'');return out});
const pics=async()=>(await files()).filter(x=>x.startsWith('Bilder/')&&!x.endsWith('.auto.json'));
await p.click('#bNew');await p.waitForTimeout(500);

// 1 Enter im Tag-Feld wählt einen Tag und speichert nicht
await p.setInputFiles('#fileIn',[{name:'a.jpg',mimeType:'image/jpeg',buffer:await mk(900,600,'#c33')}]);await p.waitForTimeout(600);
await p.selectOption('#u_brand','BMW');await p.selectOption('#u_model','3er');
await p.click('#u_specs .tagin');await p.keyboard.press('Enter');await p.waitForTimeout(500);
assert((await p.textContent('#qCount'))==='1','Enter im leeren Tag-Feld speichert nicht');
await p.fill('#u_specs .tagin','330i');await p.keyboard.press('Enter');await p.waitForTimeout(500);
assert((await p.textContent('#qCount'))==='1'&&(await pics()).length===0,'Enter beim Tag-Eintippen speichert nicht');
await p.focus('#selAll');await p.keyboard.press('Enter');await p.waitForTimeout(400);
assert((await pics()).length===0,'Enter auf einem Knopf speichert nicht');
await p.click('#selAll');await p.waitForTimeout(100);
if(!(await p.$('.q.sel')))await p.click('#selAll');
await p.press('#u_color','Enter');await p.waitForTimeout(900);
assert((await pics()).length===1,'Enter in einem Textfeld speichert weiterhin');

// 2 Viele Bilder desselben Autos in derselben Minute: gleiche Kurz-Kennung überschreibt nichts
const n0=(await pics()).length;
const res=await p.evaluate(async()=>{const mkBlob=async c=>{const cv=new OffscreenCanvas(300,200);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,300,200);return cv.convertToBlob({type:'image/jpeg'})};
  const at=new Date().toISOString(),out=[];
  for(const [id,c] of [['abcd1111-0000-4000-8000-000000000001','#111'],['abcd2222-0000-4000-8000-000000000002','#999'],['abcd3333-0000-4000-8000-000000000003','#eee']]){
    const blob=await mkBlob(c);const r=normalize({id,originalName:'x.jpg',sha256:await sha256(blob),importedAt:at,brand:'Audi',model:'A4'});await store.add(r,blob);cars.push(r);out.push(r.file)}
  return out});
assert(new Set(res).size===3&&(await pics()).length===n0+3,'Gleiche Kurz-Kennung: drei Dateien, nichts überschrieben ('+res.map(x=>x.split('_').pop()).join(', ')+')');
const ren=await p.evaluate(async()=>{const c=cars.filter(x=>x.brand==='Audi');for(const x of c){x.gen='B9';await store.update(x)}return c.map(x=>x.file)});
assert(new Set(ren).size===3&&(await pics()).length===n0+3,'Umbenennen nach Bearbeiten überschreibt nichts');
assert((await files()).filter(x=>x.startsWith('Bilder/')&&x.endsWith('.auto.json')).length===n0+3,'Genau eine Begleitdatei je Bild nach dem Umbenennen');

// 3 Schreibfehler der Begleitdatei beim Umbenennen: Bild heißt danach wieder wie vorher
const back=await p.evaluate(async()=>{const c=cars.find(x=>x.brand==='BMW');const old=c.file,wf=store.writeFile;c.gen='E90';store.writeFile=async()=>{throw new Error('Platte voll')};
  let err='';try{await store.update(c)}catch(e){err=e.message}store.writeFile=wf;c.gen='';
  let there=true;try{await c._dir.getFileHandle(old)}catch{there=false}return{err,same:c.file===old,there}});
assert(back.err&&back.same&&back.there,'Fehler beim Speichern: Bilddatei behält ihren Namen und ihre Begleitdatei');

// 4 Unlesbares Bild hält die Warteschlange nicht auf
await p.setInputFiles('#fileIn',[{name:'kaputt.heic',mimeType:'image/heic',buffer:Buffer.from('kein bild')},{name:'gut.jpg',mimeType:'image/jpeg',buffer:await mk(800,600,'#3a3')},{name:'text.txt',mimeType:'text/plain',buffer:Buffer.from('x')}]);
await p.waitForTimeout(900);
assert((await p.textContent('#qCount'))==='2'&&(await p.$$('.q .wait')).length===0,'Unlesbares Bild blockiert nicht („prüfe …“ verschwindet)');
assert((await p.textContent('.q .dup'))==='Format nicht lesbar','Unlesbares Bild ist gekennzeichnet');
assert(!(await p.isDisabled('#saveBtn')),'Speichern bleibt möglich');
await p.click('#saveBtn');await p.waitForTimeout(900);
assert((await pics()).length===n0+4&&(await p.textContent('#qCount'))==='1','Nur das lesbare Bild wurde gespeichert');
await p.click('.q .x');

// 5 Datei neben das Feld fallen lassen: Seite bleibt, Bild landet in der Warteschlange
const dropped=await p.evaluate(async()=>{const cv=new OffscreenCanvas(200,100);cv.getContext('2d').fillRect(0,0,200,100);const f=new File([await cv.convertToBlob({type:'image/png'})],'drop.png',{type:'image/png'});
  const dt=new DataTransfer();dt.items.add(f);const over=new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt});document.querySelector('header').dispatchEvent(over);
  const ev=new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt});document.querySelector('header').dispatchEvent(ev);return over.defaultPrevented&&ev.defaultPrevented});
await p.waitForTimeout(600);
assert(dropped&&(await p.textContent('#qCount'))==='1','Datei neben dem Feld: Browser öffnet sie nicht, sie kommt in die Warteschlange');
await p.click('.q .x');

// 6 Mediathek kurz nicht erreichbar: Bilder verschwinden nicht, Status erholt sich
const total=await p.evaluate(()=>cars.length);
await p.evaluate(async()=>{window.__list=store.list;store.list=async()=>{throw new DOMException('weg','NotFoundError')};await rescan(true)});
assert((await p.textContent('#statusTxt')).includes('nicht erreichbar')&&(await p.evaluate(()=>cars.length))===total,'Ordner nicht erreichbar: Hinweis im Status, Bilder bleiben');
await p.evaluate(async()=>{store.list=window.__list;await rescan(true)});
assert((await p.textContent('#statusTxt')).includes(total+' Bilder'),'Ordner wieder da: Status erholt sich von selbst');

// 7 Abgleich während hier gespeichert wird, zeigt keinen alten Stand
const stale=await p.evaluate(async()=>{const c=cars.find(x=>x.brand==='BMW');const scan=rescan(true);c.color='Frisch';c.editedAt=new Date().toISOString();await store.update(c);await scan;return cars.find(x=>x.id===c.id).color});
assert(stale==='Frisch','Abgleich überschreibt eine gerade gespeicherte Änderung nicht');

// 8 Bilddatei von Hand gelöscht: Eintrag lässt sich trotzdem entfernen
const rm=await p.evaluate(async()=>{const c=cars.find(x=>x.brand==='Audi');await c._dir.removeEntry(c.file);try{await store.remove(c);cars=cars.filter(x=>x!==c);return true}catch(e){return e.message}});
assert(rm===true,'Eintrag ohne Bilddatei lässt sich löschen ('+rm+')');

// 9 Fenster: Text markieren und daneben loslassen schließt nicht, Klick daneben schon
await p.click('#tabSearch');await p.waitForTimeout(400);await p.click('.item .pick');await p.click('#selEdit');await p.waitForTimeout(200);
const box=await (await p.$('#b_from')).boundingBox();await p.mouse.move(box.x+20,box.y+20);await p.mouse.down();await p.mouse.move(5,5,{steps:4});await p.mouse.up();await p.waitForTimeout(200);
assert(await p.evaluate(()=>document.getElementById('bulkDlg').open),'Ziehen aus dem Fenster heraus schließt es nicht');
await p.mouse.click(5,5);await p.waitForTimeout(200);
assert(!(await p.evaluate(()=>document.getElementById('bulkDlg').open)),'Klick neben das Fenster schließt weiterhin');
await p.click('#selNone');

// 10 Baujahr außerhalb 1900–2100 wird abgelehnt
await p.click('.item');await p.waitForTimeout(300);await p.fill('#e_from','20155');await p.click('#dSave');await p.waitForTimeout(300);
assert(await p.evaluate(()=>document.getElementById('dlg').open)&&(await p.textContent('#toast')).includes('1900'),'Unmögliches Baujahr wird nicht gespeichert');
await p.fill('#e_from','');await p.click('#dSave');await p.waitForTimeout(500);

// 11 Backup mit einem beschädigten Eintrag: der Rest wird importiert
const imp=await p.evaluate(async()=>{const cv=new OffscreenCanvas(120,80);const g=cv.getContext('2d');g.fillStyle='#07c';g.fillRect(0,0,120,80);const blob=await cv.convertToBlob({type:'image/png'});
  const url=await new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(blob)});
  return JSON.stringify({app:'auto-bildarchiv',schema:1,cars:[{id:'imp-kaputt',brand:'Opel',model:'Corsa',image:null},{id:'imp-gut',brand:'Opel',model:'Astra',specs:'kein Array',from:'2016',image:url}]})});
const before=await p.evaluate(()=>cars.length);
await p.setInputFiles('#importFile',{name:'backup.json',mimeType:'application/json',buffer:Buffer.from(imp)});await p.waitForTimeout(900);
const after=await p.evaluate(()=>({n:cars.length,c:cars.find(x=>x.id==='imp-gut')}));
assert(after.n===before+1&&after.c&&after.c.from===2016&&Array.isArray(after.c.specs),'Backup: beschädigter Eintrag wird übersprungen, der Rest importiert und bereinigt');

// 12 Begleitdatei mit falschen Typen (von Hand geändert) bringt Suche und Sortierung nicht zum Absturz
await p.evaluate(()=>{cars.push(normalize({id:'schräg',file:'x.jpg',brand:123,model:null,specs:[5,null,'ok'],from:'abc',to:'2020'}));fillFilters();render()});
await p.fill('#fText','123');await p.waitForTimeout(200);
assert((await p.textContent('#count')).startsWith('1 von'),'Falsche Typen in einer Begleitdatei: Suche läuft weiter');
await p.evaluate(()=>{cars=cars.filter(c=>c.id!=='schräg')});await p.click('#fReset');

// 13 Update ohne Verbindung: App lädt nicht neu und bleibt offline startfähig
await p.evaluate(()=>{updLatest={version:'9',build:999,notes:[]};document.getElementById('updBox').classList.remove('hidden');window.__alive=1});
await ctx.setOffline(true);await p.click('#updGo');await p.waitForTimeout(800);
assert((await p.evaluate(()=>window.__alive))===1&&(await p.textContent('#updGo'))==='Aktualisieren','Update ohne Verbindung: kein Neuladen, Knopf wieder bereit');
await ctx.setOffline(false);

assert(errs.length===0,'keine Fehler '+errs);
const cls=await p.evaluate(()=>window.__cls);assert(cls===0,'CLS '+cls);
await b.close()})();
