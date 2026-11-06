const {chromium}=require('playwright');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:850}});
const errs=[];
const init=()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
  window.showDirectoryPicker=async()=>{const r=await navigator.storage.getDirectory();return r.getDirectoryHandle('GoogleDrive',{create:true})};
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}};
await ctx.addInitScript(init);
const open=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto('http://localhost:8770/');await p.waitForTimeout(700);return p};
const A=await open();
const mk=async(p,w,h,c)=>Buffer.from(await p.evaluate(async([w,h,c])=>{const cv=new OffscreenCanvas(w,h);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(w/4,h/4,w/3,h/3);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},[w,h,c]));
// PC A: Mediathek anlegen
await A.click('#bNew');await A.waitForTimeout(500);
assert((await A.textContent('#statusTxt')).includes('Mediathek'),'A: Mediathek angelegt');
await A.setInputFiles('#fileIn',[{name:'f30.jpg',mimeType:'image/jpeg',buffer:await mk(A,3000,2000,'#c33')},{name:'w205.jpg',mimeType:'image/jpeg',buffer:await mk(A,1600,1200,'#36c')}]);
await A.waitForTimeout(1200);
await A.click('.q:nth-child(2)'); // deselect w205
await A.selectOption('#u_brand','BMW');await A.selectOption('#u_model','3er');await A.selectOption('#u_gen','F30/F31/F34');await A.click('#u_fl [data-v=fl]');
await A.fill('#u_from','2015');await A.fill('#u_to','2019');await A.fill('#u_specs .tagin','M-Paket, 330i');await A.check('#u_verified');
await A.press('#u_brand','Enter');await A.waitForTimeout(1200);
await A.click('.q');await A.selectOption('#u_brand','Mercedes-Benz');await A.selectOption('#u_model','C-Klasse');await A.selectOption('#u_gen','W205');await A.click('#u_fl [data-v=vfl]');
await A.fill('#u_from','2014');await A.fill('#u_to','2018');await A.fill('#u_specs .tagin','AMG-Line');await A.click('#saveBtn');await A.waitForTimeout(1200);
assert((await A.textContent('#statusTxt')).includes('2 Bilder'),'A: 2 Bilder gespeichert');
const files=async p=>p.evaluate(async()=>{const out=[];const walk=async(d,pre)=>{for await(const [n,h] of d.entries()){if(h.kind==='directory')await walk(h,pre+n+'/');else out.push(pre+n)}};await walk(await (await navigator.storage.getDirectory()).getDirectoryHandle('GoogleDrive'),'');return out});
let f=await files(A);console.log(f.join('\n'));
assert(f.filter(x=>x.includes('Vorschauen/')).length===2,'Vorschaubilder angelegt');
assert(f.filter(x=>/katalog.*\.json/.test(x)).length===1&&f.includes('Archivdaten/katalog.json'),'genau eine katalog.json (neue Tags gemerkt)');
const meta=JSON.parse(await A.evaluate(async()=>{const d=await (await (await navigator.storage.getDirectory()).getDirectoryHandle('GoogleDrive')).getDirectoryHandle('Auto Bildarchiv').catch(()=>null);return d?'"sub"':'{}'}));
// PC B: zweiter Rechner öffnet dieselbe Mediathek
const B=await open();
await B.click('#libBtn');await B.click('#libOpen');await B.waitForTimeout(800);
assert((await B.textContent('#statusTxt')).includes('2 Bilder'),'B: sieht 2 Bilder aus Drive');
await B.click('#tabSearch');await B.fill('#fYear','2016');await B.waitForTimeout(300);
assert((await B.textContent('#count')).startsWith('2 von'),'B: Baujahr 2016 findet beide');
await B.click('#fFl [data-v=fl]');await B.waitForTimeout(200);assert((await B.textContent('#count')).startsWith('1 von'),'B: Facelift-Filter');
await B.fill('#fYear','2019');await B.waitForTimeout(200);assert((await B.textContent('#count')).startsWith('1 von'),'B: 2019 + FL = F30');
await B.fill('#fYear','2020');await B.waitForTimeout(200);assert((await B.textContent('#count')).startsWith('0 von'),'B: 2020 nichts');
await B.click('#fReset');await B.fill('#fText','amg c-klasse');await B.waitForTimeout(200);assert((await B.textContent('#count')).startsWith('1 von'),'B: Freitext');
await B.click('#fReset');await B.waitForTimeout(300);
const thumbOk=await B.$$eval('.item img',im=>im.filter(i=>i.complete&&i.naturalWidth>0&&i.naturalWidth<=480).length);assert(thumbOk===2,'B: Kacheln zeigen Vorschaubilder ('+thumbOk+')');
// B bearbeitet F30 -> A soll Änderung sehen
await B.click('.item');await B.waitForTimeout(400);await B.fill('#e_color','Alpinweiß');await B.click('#dSave');await B.waitForTimeout(800);
f=await files(B);assert(f.some(x=>/BMW_3er_F30-F31-F34_FL_\w{4}\.jpg$/.test(x)),'Dateiname passt nach Bearbeiten');
// A: neues Bild auf A, B übernimmt automatisch
await A.setInputFiles('#fileIn',[{name:'golf.jpg',mimeType:'image/jpeg',buffer:await mk(A,1200,900,'#3a3')}]);await A.waitForTimeout(800);
await A.selectOption('#u_brand','Volkswagen');await A.selectOption('#u_model','Golf');await A.selectOption('#u_gen','VII');await A.fill('#u_specs .tagin','GTI');await A.click('#saveBtn');await A.waitForTimeout(1000);
await A.evaluate(()=>rescan(true));await A.waitForTimeout(500);
await A.click('#tabSearch');await A.fill('#fText','alpinweiß');await A.waitForTimeout(300);assert((await A.textContent('#count')).startsWith('1 von 3'),'A: sieht Bearbeitung von B');await A.click('#fReset');
await B.evaluate(()=>rescan(true));await B.waitForTimeout(800);
assert((await B.textContent('#statusTxt')).includes('3 Bilder'),'B: übernimmt neues Bild von A automatisch');
// Drive-Konfliktkopie + Müll-Dateien
await B.evaluate(async()=>{const root=await (await navigator.storage.getDirectory()).getDirectoryHandle('GoogleDrive');let d=root.getDirectoryHandle?root:null;
  const walk=async(d)=>{for await(const [n,h] of d.entries()){if(h.kind==='directory'){const r=await walk(h);if(r)return r}else if(n.includes('Golf')&&n.endsWith('.auto.json'))return [d,n,h]}};
  const [dir,n,h]=await walk(await root.getDirectoryHandle('Bilder'));const o=JSON.parse(await (await h.getFile()).text());o.color='Konflikt-alt';o.editedAt='2000-01-01';
  const w=await (await dir.getFileHandle(n.replace('.auto.json',' (1).auto.json'),{create:true})).createWritable();await w.write(JSON.stringify(o));await w.close();
  const w2=await (await dir.getFileHandle('.DS_Store',{create:true})).createWritable();await w2.write('x');await w2.close();
  const w3=await (await dir.getFileHandle('kaputt.auto.json',{create:true})).createWritable();await w3.write('{nicht json');await w3.close()});
await B.evaluate(()=>rescan(true));await B.waitForTimeout(600);
assert((await B.textContent('#statusTxt')).includes('3 Bilder'),'B: Konfliktkopie und kaputte Datei ergeben keine Doppelten');
// Löschen auf B -> Papierkorb, A sieht es
await B.click('#tabSearch');await B.fill('#fText','golf');await B.waitForTimeout(300);await B.click('.item');await B.waitForTimeout(300);await B.click('#dDel');await B.waitForTimeout(800);
f=await files(B);assert(f.some(x=>x.startsWith('Archivdaten/Papierkorb/')&&x.includes('Golf')),'Gelöscht landet im Papierkorb');
await A.evaluate(()=>rescan(true));await A.waitForTimeout(600);
// conflict copy remains in folder so golf might still appear from "(1)" -> check
console.log('A status',await A.textContent('#statusTxt'),'B status',await B.textContent('#statusTxt'),(await files(A)).filter(x=>x.includes('Golf')));
// Duplikat über PCs
await A.click('#tabUp');await A.setInputFiles('#fileIn',[{name:'f30-nochmal.jpg',mimeType:'image/jpeg',buffer:await mk(A,3000,2000,'#c33')}]);await A.waitForTimeout(1000);
assert((await A.$$eval('.dup',e=>e.map(x=>x.textContent))).join().includes('schon drin'),'Duplikat (auch Original vor dem Verkleinern) erkannt');
// Backup export/import roundtrip in fresh browser-mode context
const [dl]=await Promise.all([A.waitForEvent('download'),A.evaluate(()=>{document.getElementById('libBtn').click();document.getElementById('exportBtn').click()})]);
const bpath=await dl.path();const bsize=require('fs').statSync(bpath).size;assert(bsize>1000,'Backup-Datei erzeugt ('+bsize+' Bytes)');
console.log('CLS A',await A.evaluate(()=>window.__cls),'CLS B',await B.evaluate(()=>window.__cls));
console.log('errors',errs);await b.close()})();
