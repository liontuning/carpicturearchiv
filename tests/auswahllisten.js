// Auswahllisten: Spalten Marke › Modell › Generation, Reihenfolge, Entfernen, Tags, Suche ohne Groß-/Kleinschreibung, Drive-Konfliktkopien
const {chromium}=require('playwright');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:850}});const errs=[];
await ctx.addInitScript(()=>{window.__cls=0;window.__src=[];new PerformanceObserver(l=>{for(const e of l.getEntries()){window.__cls+=e.value;window.__src.push(e.sources.map(s=>s.node&&(s.node.id||s.node.className)).join(','))}}).observe({type:'layout-shift',buffered:true});
  window.showDirectoryPicker=async()=>(await navigator.storage.getDirectory()).getDirectoryHandle('GD3',{create:true});
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}});
let lastMsg='';
const open=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{lastMsg=d.message();d.accept()});await p.goto('http://localhost:8770/');await p.waitForTimeout(700);return p};
const A=await open();await A.click('#bNew');await A.waitForTimeout(500);
const vals=(p,sel)=>p.$$eval(sel+' option',o=>o.map(x=>x.value).filter(v=>v&&v!=='__neu__'));
const rows=(p,k)=>p.$$eval('#cl_'+k+' .crow',r=>r.map(x=>x.dataset.v));
// Spalten
await A.click('#libBtn');await A.click('#libCat');await A.waitForTimeout(300);
assert(await A.isDisabled('#ca_m')&&await A.isDisabled('#ca_g'),'Modell/Generation erst nach Auswahl');
await A.click('#cl_b .crow[data-v="BMW"]');assert((await rows(A,'m')).includes('3er'),'Marke anklicken zeigt Modelle');
await A.click('#cl_m .crow[data-v="3er"]');assert((await rows(A,'g')).includes('F30/F31/F34'),'Modell anklicken zeigt Generationen');
// Reihenfolge mit Pfeilen
const m0=await rows(A,'m');await A.click('#cl_m .crow[data-v="3er"] [data-a=up]');await A.waitForTimeout(150);
const m1=await rows(A,'m');assert(m1.indexOf('3er')===m0.indexOf('3er')-1,'▲ schiebt Modell nach oben');
// Ziehen
const g0=await rows(A,'g');await A.dragAndDrop('#cl_g .crow:last-child .h','#cl_g .crow:first-child',{targetPosition:{x:20,y:5}});await A.waitForTimeout(200);
const g1=await rows(A,'g');assert(g1[0]===g0.at(-1),'Ziehen sortiert Generation um: '+g1.join(' | '));
// Formular übernimmt Reihenfolge
await A.click('#catClose');await A.selectOption('#u_brand','BMW');
const fm=await vals(A,'#u_model');assert(fm.indexOf('3er')===m1.indexOf('3er'),'Formular nutzt neue Modell-Reihenfolge');
await A.selectOption('#u_model','3er');assert((await vals(A,'#u_gen'))[0]===g1[0],'Formular nutzt neue Generationen-Reihenfolge');
// Neue Marke über Formular + direkt gewählt
await A.selectOption('#u_brand','__neu__');await A.waitForTimeout(200);assert(await A.evaluate(()=>document.activeElement.id)==='ca_b','„＋ Neue Marke“ öffnet Liste mit Fokus');
await A.fill('#ca_b','rimac');await A.press('#ca_b','Enter');await A.waitForTimeout(200);
await A.fill('#ca_b','RIMAC');await A.press('#ca_b','Enter');await A.waitForTimeout(200);
assert((await rows(A,'b')).filter(v=>v.toLowerCase()==='rimac').length===1,'doppelte Marke wird abgefangen');
await A.fill('#ca_m','Nevera');await A.press('#ca_m','Enter');await A.waitForTimeout(200);
await A.keyboard.press('Escape');await A.waitForTimeout(150);
assert(await A.inputValue('#u_brand')==='rimac'&&await A.inputValue('#u_model')==='Nevera','neue Marke/Modell im Formular gewählt');
// Karosserie/Ansicht/Tags
await A.click('#libBtn');await A.click('#libCat');await A.click('#catTabs [data-v=bodies]');await A.waitForTimeout(150);
assert((await rows(A,'l')).includes('Touring'),'Karosserie-Liste');await A.fill('#ca_l','Shooting Brake');await A.click('#cb_l');
await A.click('#catTabs [data-v=tags]');assert((await rows(A,'l')).includes('R-Line'),'Tag-Liste vorbelegt');await A.click('#catClose');
assert((await vals(A,'#u_body')).at(-1)==='Shooting Brake','neue Karosserie im Formular');
// Tags im Formular
await A.click('#u_specs .tagin');await A.keyboard.type('r li');await A.waitForTimeout(100);
assert((await A.textContent('#u_specs .topt.on'))==='R-Line','„r li“ schlägt R-Line vor');await A.keyboard.press('Enter');
await A.keyboard.type('Black Edition');assert((await A.textContent('#u_specs .topt.on')).includes('hinzufügen'),'unbekannter Tag: „hinzufügen“');await A.keyboard.press('Enter');
await A.keyboard.type('rline');await A.keyboard.press('Enter');
const tg=await A.evaluate(()=>tagFields.u_specs.get());assert(tg.join('|')==='R-Line|Black Edition','Tags ohne Doppelte: '+tg.join('|'));
assert(await A.evaluate(()=>catList('tags').includes('Black Edition')),'neuer Tag in der Liste gespeichert');
// Bild speichern
const mk=async c=>Buffer.from(await A.evaluate(async c=>{const cv=new OffscreenCanvas(800,600);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,800,600);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},c));
await A.setInputFiles('#fileIn',[{name:'r.jpg',mimeType:'image/jpeg',buffer:await mk('#a22')}]);await A.waitForTimeout(900);
await A.selectOption('#u_brand','rimac');await A.selectOption('#u_model','Nevera');await A.click('#saveBtn');await A.waitForTimeout(1200);
assert((await A.textContent('#statusTxt')).includes('1 Bild'),'Bild gespeichert');
// Suche ohne Groß-/Kleinschreibung und Bindestriche
await A.click('#tabSearch');
for(const q of ['r line','R-LINE','rline','black edition'])
  {await A.fill('#fText',q);await A.waitForTimeout(100);assert((await A.textContent('#count')).startsWith('1 von 1'),'Suche „'+q+'“ findet das Bild')}
await A.fill('#fText','',);
await A.click('#fVer [data-v="0"]');assert((await A.textContent('#count')).startsWith('1 von 1'),'Filter Ungeprüft');
await A.click('#fVer [data-v="1"]');assert((await A.textContent('#count')).startsWith('0 von 1'),'Filter Geprüft');
await A.click('#fReset');assert(await A.$eval('#fVer .on',e=>e.dataset.v)==='','Zurücksetzen stellt „Alle“ ein');
// Marke entfernen, die ein Bild nutzt
await A.click('#libBtn');await A.click('#libCat');await A.click('#catTabs [data-v=cat]');await A.click('#cl_b .crow[data-v="rimac"] [data-a=rm]');await A.waitForTimeout(200);
assert(/1 Bild nutzt/.test(lastMsg),'Warnung nennt betroffene Bilder');
assert(!(await rows(A,'b')).includes('rimac'),'Marke aus der Liste entfernt');await A.click('#catClose');
await A.click('#tabSearch');await A.fill('#fText','nevera');await A.waitForTimeout(100);assert((await A.textContent('#count')).startsWith('1 von 1'),'Bild bleibt auffindbar');
await A.click('.item');await A.waitForTimeout(300);assert(await A.inputValue('#e_brand')==='rimac','Bild behält seine Marke');await A.click('#dClose');
// Zweiter Rechner + Drive-Konfliktkopie
const B=await open();await B.click('#libBtn');await B.click('#libOpen');await B.waitForTimeout(800);
assert(!(await B.evaluate(()=>catBrands())).includes('rimac')&&(await vals(B,'#u_body')).includes('Shooting Brake'),'B bekommt die Listen über Drive');
await A.evaluate(async()=>{const d=await (await (await navigator.storage.getDirectory()).getDirectoryHandle('GD3')).getDirectoryHandle('Archivdaten');
  const o=JSON.parse(await (await (await d.getFileHandle('katalog.json')).getFile()).text());o.editedAt='2099-01-01T00:00:00Z';o.bodies.unshift('Konflikt-Karosserie');
  const w=await (await d.getFileHandle('katalog (1).json',{create:true})).createWritable();await w.write(JSON.stringify(o));await w.close()});
await B.evaluate(()=>rescan(true));await B.waitForTimeout(600);
assert((await vals(B,'#u_body'))[0]==='Konflikt-Karosserie','neuere Konfliktkopie gewinnt');
await B.click('#libBtn');await B.click('#libCat');await B.click('#catTabs [data-v=bodies]');await B.click('#cl_l .crow:nth-child(2) [data-a=up]');await B.waitForTimeout(400);
const files=await B.evaluate(async()=>{const d=await (await (await navigator.storage.getDirectory()).getDirectoryHandle('GD3')).getDirectoryHandle('Archivdaten');const o=[];for await(const [n] of d.entries())o.push(n);return o});
assert(files.filter(n=>/^katalog/.test(n)).join()==='katalog.json','Konfliktkopie nach Speichern aufgeräumt');
// Handy: Dialog ohne waagrechtes Scrollen
const M=await b.newPage({viewport:{width:390,height:844}});await M.goto('http://localhost:8770/');await M.waitForTimeout(600);await M.click('#libBtn');await M.click('#libCat');await M.waitForTimeout(200);
assert(await M.evaluate(()=>{const d=document.getElementById('catDlg');return d.scrollWidth<=d.clientWidth&&document.documentElement.scrollWidth<=innerWidth}),'Handy: kein waagrechtes Scrollen');
await M.screenshot({path:require('os').tmpdir()+'/cat-mobile.png'});
const cls=await A.evaluate(()=>window.__cls)+await B.evaluate(()=>window.__cls);assert(cls===0,'Layout-Verschiebung 0 ('+cls+' '+await A.evaluate(()=>window.__src.join(';'))+')');
assert(!errs.length,'keine Fehler '+errs.join(';'));await b.close()})();
