const {chromium}=require('playwright');const fs=require('fs');
const assert=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({acceptDownloads:true});const errs=[];
await ctx.addInitScript(()=>{window.__noDir=localStorage.getItem('nodir')==='1';if(window.__noDir){delete window.showDirectoryPicker;window.showDirectoryPicker=undefined}else window.showDirectoryPicker=async()=>(await navigator.storage.getDirectory()).getDirectoryHandle('M'+(localStorage.getItem('n')||''),{create:true});
 const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(v,k){if(v&&v.kind==='directory')return put.call(this,'x',k);return put.call(this,v,k)}});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('http://localhost:8770/');await p.evaluate(()=>localStorage.setItem('nodir','1'));await p.reload();await p.waitForTimeout(600);
assert((await p.textContent('#banner')).includes('Chrome'),'Ohne Ordner-Zugriff: Hinweis auf Chrome/Edge');
const mk=async(c)=>Buffer.from(await p.evaluate(async(c)=>{const cv=new OffscreenCanvas(800,600);const g=cv.getContext('2d');g.fillStyle=c;g.fillRect(0,0,800,600);return [...new Uint8Array(await (await cv.convertToBlob({type:'image/jpeg'})).arrayBuffer())]},c));
await p.setInputFiles('#fileIn',[{name:'a.jpg',mimeType:'image/jpeg',buffer:await mk('#a11')},{name:'b.jpg',mimeType:'image/jpeg',buffer:await mk('#1a1')}]);await p.waitForTimeout(800);
await p.selectOption('#u_brand','Audi');await p.selectOption('#u_model','A4');await p.click('#saveBtn');await p.waitForTimeout(800);
assert((await p.textContent('#statusTxt')).includes('2 Bilder'),'Browser-Modus speichert');
await p.click('#libBtn');const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#exportBtn')]);await dl.saveAs(require('os').tmpdir()+'/backup.json');await p.click('#libClose');
// switch to dir mode, migrate
await p.evaluate(()=>{localStorage.setItem('nodir','0');localStorage.setItem('n','1')});await p.reload();await p.waitForTimeout(700);
await p.click('#libBtn');await p.click('#libNew');await p.waitForTimeout(800);
await p.click('#libBtn');assert(await p.isVisible('#libMigrate'),'Übernehmen-Knopf sichtbar');await p.click('#libMigrate');await p.waitForTimeout(1500);await p.click('#libClose');
assert((await p.textContent('#statusTxt')).includes('2 Bilder'),'Browser-Bilder in Mediathek übernommen');
// import backup into fresh mediathek
await p.evaluate(()=>localStorage.setItem('n','2'));await p.reload();await p.waitForTimeout(700);await p.click('#libBtn');await p.click('#libNew');await p.waitForTimeout(800);
await p.click('#libBtn');await p.setInputFiles('#importFile',require('os').tmpdir()+'/backup.json');await p.waitForTimeout(1500);await p.click('#libClose');
assert((await p.textContent('#statusTxt')).includes('2 Bilder'),'Backup in neue Mediathek geladen');
await p.setInputFiles('#importFile',require('os').tmpdir()+'/backup.json');await p.waitForTimeout(1000);
assert((await p.textContent('#statusTxt')).includes('2 Bilder'),'Backup zweimal laden ergibt keine Doppelten');
console.log('errors',errs);await b.close()})();
