// Neue Funktionen in Version 1.7.0: Filter Karosserie/Farbe, Artikelnummern, seitenweises Laden, Blättern/Zoom,
// Papierkorb, Standortdaten entfernen, Download-Vorgaben, Backup als ZIP.
const {chromium}=require('playwright');const fs=require('fs'),os=require('os');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:850},acceptDownloads:true});const errs=[];
await ctx.addInitScript(()=>{window.__cls=0;window.__src=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__cls+=e.value;window.__src.push(e.sources.map(s=>s.node&&(s.node.id||s.node.className)).join())}}).observe({type:'layout-shift',buffered:true});
  window.showDirectoryPicker=async()=>{const r=await navigator.storage.getDirectory();return r.getDirectoryHandle('F'+(localStorage.getItem('n')||''),{create:true})};
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8770/');await p.waitForTimeout(700);
const mk=async(w,h,c)=>Buffer.from(await p.evaluate(async([w,h,c])=>{const cv=new OffscreenCanvas(w,h);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,w,h);g.fillStyle='#fff';g.fillRect(w/5,h/5,w/3,h/3);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},[w,h,c]));
const files=()=>p.evaluate(async()=>{const out=[];const walk=async(d,pre)=>{for await(const [n,h] of d.entries()){if(h.kind==='directory')await walk(h,pre+n+'/');else out.push(pre+n)}};await walk(await (await navigator.storage.getDirectory()).getDirectoryHandle('F'),'');return out});
await p.click('#bNew');await p.waitForTimeout(500);

// --- 8 Standortdaten: JPEG mit EXIF (Ausrichtung + GPS) bauen ---
const plain=await mk(800,600,'#246');
const exif=(()=>{const t=Buffer.alloc(8+2+2*12+4+2+2*12+4+24);let o=0;t.write('II',0);t.writeUInt16LE(42,2);t.writeUInt32LE(8,4);o=8;
  t.writeUInt16LE(2,o);o+=2;
  t.writeUInt16LE(0x0112,o);t.writeUInt16LE(3,o+2);t.writeUInt32LE(1,o+4);t.writeUInt16LE(1,o+8);o+=12;       // Ausrichtung = 1
  const gpsAt=8+2+24+4;t.writeUInt16LE(0x8825,o);t.writeUInt16LE(4,o+2);t.writeUInt32LE(1,o+4);t.writeUInt32LE(gpsAt,o+8);o+=12;t.writeUInt32LE(0,o);o+=4;
  t.writeUInt16LE(2,o);o+=2;
  t.writeUInt16LE(1,o);t.writeUInt16LE(2,o+2);t.writeUInt32LE(2,o+4);t.write('N\0',o+8);o+=12;                    // LatRef
  const dataAt=gpsAt+2+24+4;t.writeUInt16LE(2,o);t.writeUInt16LE(5,o+2);t.writeUInt32LE(3,o+4);t.writeUInt32LE(dataAt,o+8);o+=12;t.writeUInt32LE(0,o);o+=4;
  for(const v of [52,1,31,1,1234,100]){t.writeUInt32LE(v,o);o+=4}                                                  // 52° 31' 12.34"
  const body=Buffer.concat([Buffer.from('Exif\0\0','latin1'),t]);const seg=Buffer.alloc(4);seg.writeUInt16BE(0xFFE1,0);seg.writeUInt16BE(body.length+2,2);
  return Buffer.concat([plain.subarray(0,2),seg,body,plain.subarray(2)])})();
assert(exif.includes(Buffer.from([52,0,0,0,1,0,0,0,31,0,0,0])),'Testbild enthält GPS-Koordinaten');
await p.setInputFiles('#fileIn',[{name:'gps.jpg',mimeType:'image/jpeg',buffer:exif},{name:'ohne.jpg',mimeType:'image/jpeg',buffer:await mk(700,500,'#642')}]);await p.waitForTimeout(900);
assert((await p.$$eval('.q .dup',e=>e.map(x=>x.textContent))).join()==='Standort entfernt','Nur das Bild mit GPS ist als „Standort entfernt“ markiert');
await p.selectOption('#u_brand','BMW');await p.selectOption('#u_model','3er');await p.selectOption('#u_body','Touring');await p.fill('#u_color','Alpinweiß');
await p.fill('#u_artnr','4711-22, AB 0815.01');await p.click('#saveBtn');await p.waitForTimeout(1000);
const stored=await p.evaluate(async()=>{const c=cars.find(x=>x.gpsRemoved);const b=new Uint8Array(await (await store.blob(c)).arrayBuffer());const im=await createImageBitmap(new Blob([b],{type:'image/jpeg'}));
  const has=(arr)=>{outer:for(let i=0;i<b.length-arr.length;i++){for(let j=0;j<arr.length;j++)if(b[i+j]!==arr[j])continue outer;return true}return false};
  return{gps:has([52,0,0,0,1,0,0,0,31,0,0,0]),orient:has([0x12,0x01,3,0,1,0,0,0,1,0]),w:im.width,orig:!!c.origSha256,art:c.artnr}});
assert(!stored.gps&&stored.orient&&stored.w===800&&stored.orig,'Gespeichertes Bild: GPS weg, Ausrichtung und Bild unverändert, Original-Fingerabdruck gemerkt');
await p.setInputFiles('#fileIn',[{name:'gps-nochmal.jpg',mimeType:'image/jpeg',buffer:exif}]);await p.waitForTimeout(700);
assert((await p.textContent('.q .dup')).includes('schon drin'),'Dasselbe Original wird weiter als Duplikat erkannt');await p.click('.q .x');

// --- 5 Artikelnummern ---
assert(stored.art.join('|')==='4711-22|AB 0815.01','Artikelnummern am Bild gespeichert');
await p.setInputFiles('#fileIn',[{name:'audi.jpg',mimeType:'image/jpeg',buffer:await mk(900,600,'#a22')}]);await p.waitForTimeout(600);
await p.selectOption('#u_brand','Audi');await p.selectOption('#u_model','A4');await p.selectOption('#u_body','Avant');await p.fill('#u_color','Rot');await p.fill('#u_artnr','9999');
await p.click('#saveBtn');await p.waitForTimeout(900);
await p.click('#tabSearch');await p.waitForTimeout(400);
const cnt=async()=>(await p.textContent('#count')).split(' ')[0];
await p.fill('#fArt','ab0815');await p.waitForTimeout(200);assert(await cnt()==='2','Artikelnummer-Filter findet ohne Leerzeichen und Punkt');
await p.fill('#fArt','');await p.fill('#fText','4711 22');await p.waitForTimeout(200);assert(await cnt()==='2','Freitext findet Artikelnummer');
await p.click('#fReset');await p.waitForTimeout(200);

// --- 4 Filter Karosserie und Farbe ---
await p.selectOption('#fBody','Avant');await p.waitForTimeout(200);assert(await cnt()==='1','Filter Karosserie');
await p.selectOption('#fBody','');await p.selectOption('#fColor','Alpinweiß');await p.waitForTimeout(200);assert(await cnt()==='2','Filter Farbe');
assert((await p.textContent('#fReset')).includes('(1)'),'Aktive Filter werden gezählt');
await p.click('#fReset');await p.waitForTimeout(200);assert(await cnt()==='3'&&(await p.inputValue('#fColor'))==='','Zurücksetzen leert auch die neuen Filter');

// --- 5b Artikelnummern gemeinsam hinzufügen ---
await p.click('.item .pick');await p.click('#selAllVis');await p.click('#selEdit');await p.fill('#b_artnr','SET-1, 9999');await p.click('#bulkSave');await p.waitForTimeout(900);
const arts=await p.evaluate(()=>cars.map(c=>c.artnr.join('|')).sort());
assert(arts.every(a=>a.includes('SET-1'))&&arts.filter(a=>a==='9999|SET-1').length===1,'Gemeinsam ändern fügt Artikelnummern hinzu, ohne Doppelte ('+arts.join(' ; ')+')');
await p.click('#selNone');

// --- 3 Blättern und Zoom ---
await p.click('.item');await p.waitForTimeout(400);
assert((await p.textContent('#dPos')).trim()==='1 / 3'&&await p.isDisabled('#dPrev'),'Detail zeigt Position, „zurück“ am Anfang gesperrt');
const first=await p.inputValue('#e_brand');await p.click('#dNext');await p.waitForTimeout(400);
assert((await p.textContent('#dPos')).trim()==='2 / 3','Knopf blättert weiter');
await p.focus('#dClose');await p.keyboard.press('ArrowRight');await p.waitForTimeout(400);
assert((await p.textContent('#dPos')).trim()==='3 / 3'&&await p.isDisabled('#dNext'),'Pfeiltaste blättert, am Ende gesperrt');
await p.focus('#e_color');await p.keyboard.press('ArrowLeft');await p.waitForTimeout(200);
assert((await p.textContent('#dPos')).trim()==='3 / 3','Pfeiltaste im Eingabefeld blättert nicht');
await p.focus('#dClose');await p.keyboard.press('ArrowLeft');await p.keyboard.press('ArrowLeft');await p.waitForTimeout(400);
assert((await p.inputValue('#e_brand'))===first,'Zurückblättern landet wieder beim ersten Bild');
const boxBefore=await (await p.$('#dBox')).boundingBox();await p.click('#dImg',{position:{x:100,y:80}});await p.waitForTimeout(200);
const z=await p.evaluate(()=>({zoom:document.getElementById('dBox').classList.contains('zoom'),tr:getComputedStyle(document.getElementById('dImg')).transform}));
const boxAfter=await (await p.$('#dBox')).boundingBox();
assert(z.zoom&&z.tr.includes('2.5')&&JSON.stringify(boxBefore)===JSON.stringify(boxAfter),'Klick vergrößert das Bild, der Rahmen bleibt gleich groß');
await p.click('#dBox',{position:{x:100,y:80}});assert(!(await p.evaluate(()=>document.getElementById('dBox').classList.contains('zoom'))),'Zweiter Klick verkleinert wieder');await p.click('#dClose');await p.waitForTimeout(200);

// --- 9 Download-Vorgaben ---
const [d1]=await Promise.all([p.waitForEvent('download'),p.click('.item .dl')]);
assert(/\.jpg$/.test(d1.suggestedFilename()),'Download Original: '+d1.suggestedFilename());
await p.selectOption('#dlPreset','w800');
const [d2]=await Promise.all([p.waitForEvent('download'),p.click('.item .dl')]);const p2=os.tmpdir()+'/dl.webp';await d2.saveAs(p2);const wb=fs.readFileSync(p2);
const dim=await p.evaluate(async a=>{const im=await createImageBitmap(new Blob([new Uint8Array(a)],{type:'image/webp'}));return[im.width,im.height]},[...wb]);
assert(/\.webp$/.test(d2.suggestedFilename())&&wb.subarray(8,12).toString()==='WEBP'&&Math.max(...dim)===800,'Download 800 px WebP: '+d2.suggestedFilename()+' '+dim.join('×'));
assert((await p.evaluate(()=>localStorage.getItem('dlPreset')))==='w800','Download-Vorgabe wird pro Rechner gemerkt');
await p.selectOption('#dlPreset','orig');

// --- 1 Papierkorb ---
await p.fill('#fText','audi');await p.waitForTimeout(200);await p.click('.item');await p.waitForTimeout(300);await p.click('#dDel');await p.waitForTimeout(800);await p.click('#fReset');
assert(await cnt()==='2','Bild gelöscht');
await p.click('#libBtn');await p.click('#trashBtn');await p.waitForTimeout(700);
assert((await p.textContent('#trashInfo')).startsWith('1 Bild')&&(await p.textContent('.trow .n')).includes('Audi A4'),'Papierkorb zeigt das gelöschte Bild');
assert(await p.$eval('.trow img',i=>i.complete&&i.naturalWidth>0),'Papierkorb zeigt eine Vorschau');
await p.click('.trow [data-a=re]');await p.waitForTimeout(2200);
assert((await p.textContent('#trashInfo')).includes('leer')&&await p.evaluate(()=>cars.length)===3,'Wiederherstellen holt das Bild zurück');
let f=await files();assert(f.filter(x=>x.includes('Papierkorb/')).length===0&&f.filter(x=>x.startsWith('Bilder/')&&x.includes('Audi')).length===2,'Dateien liegen wieder unter Bilder, Papierkorb ist leer');
await p.click('#trashX');await p.evaluate(()=>rescan(true));await p.waitForTimeout(400);
const back=await p.evaluate(()=>{const c=cars.find(x=>x.brand==='Audi');return c&&!c.deletedAt&&c.artnr.includes('SET-1')&&c.color});
assert(back==='Rot','Wiederhergestelltes Bild hat alle Angaben, auch nach neuem Einlesen');
await p.click('.item');await p.waitForTimeout(300);await p.click('#dDel');await p.waitForTimeout(800);
await p.click('#libBtn');await p.click('#trashBtn');await p.waitForTimeout(600);await p.click('#trashEmpty');await p.waitForTimeout(700);
f=await files();assert(f.filter(x=>x.includes('Papierkorb/')).length===0&&(await p.textContent('#trashInfo')).includes('leer')&&await p.isDisabled('#trashEmpty'),'Papierkorb leeren löscht endgültig');
await p.click('#trashX');

// --- Meldungen liegen über offenen Fenstern ---
await p.click('.item');await p.waitForTimeout(300);await p.fill('#e_from','3000');await p.click('#dSave');await p.waitForTimeout(300);
const top=await p.evaluate(()=>{const t=document.getElementById('toast'),r=t.getBoundingClientRect();return document.elementsFromPoint(r.x+r.width/2,r.y+r.height/2).length>0&&t.matches(':popover-open')&&getComputedStyle(t).opacity==='1'});
assert(top,'Fehlermeldung ist über dem offenen Fenster sichtbar');await p.fill('#e_from','');await p.click('#dClose');await p.waitForTimeout(200);

// --- 6 Seitenweises Laden ---
await p.evaluate(()=>{for(let i=0;i<400;i++)cars.push(normalize({id:'viel'+i,file:'x'+i+'.jpg',brand:'Test',model:'M'+String(i).padStart(3,'0'),importedAt:new Date().toISOString()}));fillFilters();render()});
await p.waitForTimeout(400);
const n1=await p.$$eval('.item',e=>e.length);assert(n1>=120&&n1<402&&(await p.textContent('#count')).startsWith('402 von'),'Zuerst nur ein Teil der Kacheln ('+n1+' von 402), Zähler stimmt');
const cls0=await p.evaluate(()=>window.__cls);
for(let i=0;i<12;i++){await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(250)}
const n2=await p.$$eval('.item',e=>e.length);assert(n2===402,'Beim Scrollen kommen alle nach ('+n2+')');
assert((await p.evaluate(()=>window.__cls))===cls0,'Nachladen verschiebt nichts');
await p.evaluate(()=>scrollTo(0,0));await p.click('.item .pick');await p.click('#selAllVis');
assert((await p.textContent('#selCount')).startsWith('402'),'„Alle Treffer auswählen“ nimmt auch noch nicht geladene Kacheln');
await p.click('#selNone');await p.evaluate(()=>{cars=cars.filter(c=>!c.id.startsWith('viel'));fillFilters();render()});

// --- 7 Backup als ZIP, in neuer Mediathek laden ---
await p.click('#libBtn');const [dz]=await Promise.all([p.waitForEvent('download'),p.click('#exportBtn')]);const zp=os.tmpdir()+'/funk-backup.zip';await dz.saveAs(zp);await p.click('#libClose');
const zb=fs.readFileSync(zp);assert(/\.zip$/.test(dz.suggestedFilename())&&zb.subarray(0,2).toString()==='PK'&&zb.includes(Buffer.from('.auto.json')),'Backup ist eine ZIP-Datei mit Bildern und Begleitdateien ('+zb.length+' Bytes)');
const want=await p.evaluate(()=>cars.map(c=>c.id+'|'+c.brand+'|'+c.artnr.join('+')).sort().join());
await p.evaluate(()=>localStorage.setItem('n','2'));await p.click('#libBtn');await p.click('#libNew');await p.waitForTimeout(800);
assert(await p.evaluate(()=>cars.length)===0,'Neue leere Mediathek');
await p.click('#libBtn');await p.setInputFiles('#importFile',zp);await p.waitForTimeout(1500);await p.click('#libClose');
const got=await p.evaluate(()=>cars.map(c=>c.id+'|'+c.brand+'|'+c.artnr.join('+')).sort().join());
assert(got===want&&got.length>10,'ZIP-Backup vollständig in neue Mediathek geladen');
const okImg=await p.evaluate(async()=>{for(const c of cars){const im=await createImageBitmap(await store.blob(c));if(!im.width)return false}return true});assert(okImg,'Bilder aus dem Backup sind lesbar');
await p.click('#libBtn');await p.setInputFiles('#importFile',zp);await p.waitForTimeout(1200);await p.click('#libClose');
assert(await p.evaluate(()=>cars.length)===2,'Backup zweimal laden ergibt keine Doppelten');

assert(errs.length===0,'keine Fehler '+errs);
const cls=await p.evaluate(()=>[window.__cls,window.__src.join(' ; ')]);assert(cls[0]===0,'CLS '+cls[0]+' '+cls[1]);
await b.close()})();
