const {chromium}=require('playwright');const fs=require('fs');const {execSync}=require('child_process');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:850},acceptDownloads:true});const errs=[];
await ctx.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});
  window.showDirectoryPicker=async()=>(await navigator.storage.getDirectory()).getDirectoryHandle('GD2',{create:true});
  const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}});
const open=async()=>{const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto('http://localhost:8770/');await p.waitForTimeout(700);return p};
const A=await open();await A.click('#bNew');await A.waitForTimeout(500);
// Katalog-Kaskade
const nb=await A.$$eval('#u_brand option',o=>o.length);assert(nb>70,'Markenliste vorbelegt ('+(nb-2)+' Marken)');
assert(await A.isDisabled('#u_model'),'Modell gesperrt bis Marke gewählt');
await A.selectOption('#u_brand','BMW');const models=await A.$$eval('#u_model option',o=>o.map(x=>x.textContent));assert(models.includes('3er')&&models.includes('X5'),'BMW-Modelle vorhanden');
await A.selectOption('#u_model','3er');const gens=await A.$$eval('#u_gen option',o=>o.map(x=>x.textContent));console.log('  ',gens.slice(1,5).join(' | '));
await A.selectOption('#u_gen','F30/F31/F34');
assert(await A.inputValue('#u_from')==='2011'&&await A.inputValue('#u_to')==='2019','Generation füllt Bauzeit 2011–2019');
await A.click('#u_fl [data-v=fl]');assert(await A.inputValue('#u_from')==='2015'&&await A.inputValue('#u_to')==='2019','Facelift → 2015–2019');
await A.click('#u_fl [data-v=vfl]');assert(await A.inputValue('#u_from')==='2011'&&await A.inputValue('#u_to')==='2015','Vor-Facelift → 2011–2015');
await A.selectOption('#u_brand','Audi');assert(await A.inputValue('#u_model')===''&&await A.inputValue('#u_gen')==='','Markenwechsel setzt Modell/Generation zurück');
// Eigener Katalogeintrag über "Neu ..."
await A.selectOption('#u_model','A4');await A.selectOption('#u_gen','__neu__');await A.waitForTimeout(300);
assert(await A.isVisible('#catDlg'),'„Neue Generation …“ öffnet Marken & Modelle');
assert(await A.$eval('#cl_b .crow.on',e=>e.dataset.v)==='Audi'&&await A.$eval('#cl_m .crow.on',e=>e.dataset.v)==='A4','Marke/Modell in den Spalten ausgewählt');
assert(await A.evaluate(()=>document.activeElement.id)==='ca_g','Feld „Neue Generation“ hat den Fokus');
await A.fill('#ca_g','B10 Test');await A.press('#ca_g','Enter');await A.waitForTimeout(200);
assert(await A.evaluate(()=>document.activeElement.id)==='ge_from','danach Bauzeit eingeben');
await A.fill('#ge_from','2024');await A.fill('#ge_fl','2027');await A.click('#ge_save');await A.waitForTimeout(300);
assert(await A.inputValue('#u_gen')==='B10 Test','neue Generation gleich im Formular gewählt');
await A.fill('#ca_b','Rimac');await A.click('#cb_b');await A.fill('#ca_m','Nevera');await A.click('#cb_m');await A.waitForTimeout(300);
await A.mouse.click(5,5);await A.waitForTimeout(200);assert(!(await A.isVisible('#catDlg')),'Klick daneben schließt Fenster');
await A.selectOption('#u_brand','Audi');await A.selectOption('#u_model','A4');
assert((await A.$$eval('#u_gen option',o=>o.map(x=>x.value))).includes('B10 Test'),'eigene Generation in der Liste');
assert((await A.$$eval('#u_brand option',o=>o.map(x=>x.value))).includes('Rimac'),'eigene Marke in der Liste');
// Bilder speichern (3 Stück)
const mk=async(c)=>Buffer.from(await A.evaluate(async(c)=>{const cv=new OffscreenCanvas(1600,1200);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,1600,1200);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},c));
await A.setInputFiles('#fileIn',[{name:'1.jpg',mimeType:'image/jpeg',buffer:await mk('#a22')},{name:'2.jpg',mimeType:'image/jpeg',buffer:await mk('#2a2')},{name:'3.jpg',mimeType:'image/jpeg',buffer:await mk('#22a')}]);await A.waitForTimeout(1000);
await A.selectOption('#u_gen','B9 (8W)');await A.click('#u_fl [data-v=fl]');await A.click('#saveBtn');await A.waitForTimeout(1500);
assert((await A.textContent('#statusTxt')).includes('3 Bilder'),'3 Bilder gespeichert');
// Zweiter Rechner sieht eigene Katalogeinträge
const B=await open();await B.click('#libBtn');await B.click('#libOpen');await B.waitForTimeout(800);
assert((await B.$$eval('#u_brand option',o=>o.map(x=>x.value))).includes('Rimac'),'B: eigene Marke kommt über Drive an');
// Kacheln: Download-Knopf
await A.click('#tabSearch');await A.waitForTimeout(500);
const [d1]=await Promise.all([A.waitForEvent('download'),A.click('.item:nth-child(1) [data-dl]')]);
assert(/^Audi_A4_B9-8W_FL_\w{4}\.jpg$/.test(d1.suggestedFilename()),'Kachel-Download mit sprechendem Namen: '+d1.suggestedFilename());
assert(!(await A.isVisible('#dlg')),'Download-Knopf öffnet keine Detailansicht');
// Auswahl
const cls0=await A.evaluate(()=>window.__cls);
await A.click('.item:nth-child(1) [data-pick]');assert(await A.isVisible('#selbar'),'Auswahlleiste erscheint');
await A.click('.item:nth-child(3) [data-pick]',{modifiers:['Shift']});assert((await A.textContent('#selCount')).startsWith('3'),'Umschalt-Klick wählt Bereich (3)');
await A.click('.item:nth-child(2)');assert((await A.textContent('#selCount')).startsWith('2'),'Klick auf Kachel im Auswahlmodus wählt ab');
await A.click('#selAllVis');assert((await A.textContent('#selCount')).startsWith('3'),'Alle Treffer auswählen');
const [z]=await Promise.all([A.waitForEvent('download'),A.click('#selZip')]);await z.saveAs(require('os').tmpdir()+'/t.zip');
const zl=execSync('python3 -c "import zipfile;z=zipfile.ZipFile(\''+require('os').tmpdir()+'/t.zip\');print(z.testzip());print(len(z.namelist()));print(\'|\'.join(z.namelist()))"').toString().trim().split('\n');
assert(zl[0]==='None'&&zl[1]==='3','ZIP gültig mit 3 Bildern: '+zl[2]);
// Gemeinsam ändern
await A.click('#selEdit');await A.waitForTimeout(200);
await A.click('#b_ver [data-v="1"]');await A.fill('#b_addSpecs .tagin','S-Line, Quattro');await A.selectOption('#b_view','Front');await A.click('#bulkSave');await A.waitForTimeout(1500);
const recs=await A.evaluate(()=>cars.map(c=>[c.verified,c.specs.join('+'),c.view,c.brand,c.model,c.gen,c.facelift,c.from,c.to]));console.log('  ',JSON.stringify(recs[0]));
assert(recs.every(r=>r[0]===true&&r[1]==='S-Line+Quattro'&&r[2]==='Front'&&r[3]==='Audi'&&r[5]==='B9 (8W)'&&r[6]==='fl'&&r[7]===2019),'Gemeinsam ändern: nur ausgefüllte Felder geändert, Rest bleibt');
await A.click('#selEdit');await A.selectOption('#b_brand','BMW');await A.selectOption('#b_model','3er');await A.selectOption('#b_gen','G20/G21');await A.click('#b_fl [data-v=fl]');
assert(await A.inputValue('#b_from')==='2022','Gemeinsam ändern: Generation schlägt Baujahr vor');
await A.click('#bulkSave');await A.waitForTimeout(1500);
const r2=await A.evaluate(()=>cars.map(c=>[c.brand,c.model,c.gen,c.from,c.to,c.verified,c.file]));
assert(r2.every(r=>r[0]==='BMW'&&r[2]==='G20/G21'&&r[3]===2022&&r[5]===true&&r[6].includes('BMW_3er_G20-G21_FL')),'Fahrzeug für alle geändert, Dateien umbenannt');
await B.evaluate(()=>rescan(true));await B.waitForTimeout(800);await B.click('#tabSearch');await B.selectOption('#fBrand','BMW');await B.waitForTimeout(300);
assert((await B.textContent('#count')).startsWith('3 von 3'),'B sieht die gemeinsame Änderung');
// Detailfenster: Klick daneben + Schutz vor Verlust
await A.click('#selNone');await A.click('.item:nth-child(1)');await A.waitForTimeout(400);assert(await A.isVisible('#dlg'),'Detail offen');
await A.mouse.click(3,400);await A.waitForTimeout(200);assert(!(await A.isVisible('#dlg')),'Klick daneben schließt Detail (ohne Änderung)');
await A.click('.item:nth-child(1)');await A.waitForTimeout(300);await A.fill('#e_color','Rot');
let asked=false;A.removeAllListeners('dialog');A.on('dialog',d=>{asked=true;d.dismiss()});
await A.mouse.click(3,400);await A.waitForTimeout(200);assert(asked&&await A.isVisible('#dlg'),'Ungespeicherte Änderung: Nachfrage, Fenster bleibt');
await A.keyboard.press('Escape');await A.waitForTimeout(200);assert(await A.isVisible('#dlg'),'Esc fragt ebenfalls nach');
A.removeAllListeners('dialog');A.on('dialog',d=>d.accept());await A.mouse.click(3,400);await A.waitForTimeout(200);assert(!(await A.isVisible('#dlg')),'Verwerfen schließt');
// Mehrfach löschen
await A.click('.item:nth-child(1) [data-pick]');await A.click('#selDel');await A.waitForTimeout(1200);assert((await A.textContent('#statusTxt')).includes('2 Bilder'),'Auswahl löschen');
console.log('CLS A',await A.evaluate(()=>window.__cls),'B',await B.evaluate(()=>window.__cls));
await A.click('.item:nth-child(1) [data-pick]');await A.screenshot({path:require('os').tmpdir()+'/sel.png'});
await A.click('#selEdit');await A.waitForTimeout(200);await A.screenshot({path:require('os').tmpdir()+'/bulk.png'});await A.keyboard.press('Escape');
await A.click('#tabUp');await A.screenshot({path:require('os').tmpdir()+'/form.png'});
console.log('errors',errs);await b.close()})();
