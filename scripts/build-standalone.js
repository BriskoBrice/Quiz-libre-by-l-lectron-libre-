const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const img=fs.readFileSync(path.join(root,'assets/warehouse-neon.jpg')).toString('base64');
html=html.replace(/<link rel="stylesheet" href="([^"]+)" \/>/g,(_,href)=>{
  let css=fs.readFileSync(path.join(root,href),'utf8');
  css=css.replaceAll("url('assets/warehouse-neon.jpg')",`url('data:image/jpeg;base64,${img}')`);
  return `<style data-source="${href}">\n${css}\n</style>`;
});
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,src)=>`<script data-source="${src}">\n${fs.readFileSync(path.join(root,src),'utf8')}\n</script>`);
const out=path.join(root,'dist','quiz-libre-v4-test.html');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,html,'utf8');
console.log(`Built ${out} (${fs.statSync(out).size} bytes)`);
