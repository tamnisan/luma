// Package exports/stl + exports/scene.json (written by Export.cs) into a browser viewer that opens from disk with no install:
//   <run>/Viewer.html, <run>/viewer/model-data.js (geometry as base64 in a classic script, so file:// works), vendored three.js r147.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const run=process.argv[2]||path.join(root,'builds',fs.readFileSync(path.join(root,'LATEST.txt'),'utf8').trim().split(/[\\/]/).pop());
const scene=JSON.parse(fs.readFileSync(path.join(run,'exports','scene.json'),'utf8'));
const csv=fs.readFileSync(path.join(run,'BOM.csv'),'utf8').trim().split(/\r?\n/);
const keys=csv.shift().split(',');
const bom=Object.fromEntries(csv.map(l=>{const r=l.split(',');return [r[0],Object.fromEntries(keys.map((k,i)=>[k,r[i]]))];}));
const CREASE=Math.cos(35*Math.PI/180);

// Binary STL -> indexed mesh with crease-angle normals (flat faces stay flat, cylinders shade smoothly).
function mesh(file){
 const b=fs.readFileSync(file),n=b.readUInt32LE(80);if(b.length<84+n*50)throw new Error(file+': not a binary STL');
 const pos=[],ids=new Map(),tri=new Uint32Array(n*3),fn=new Float32Array(n*3);
 for(let t=0;t<n;t++){const o=84+t*50+12,v=[];for(let k=0;k<3;k++){const x=b.readFloatLE(o+k*12),y=b.readFloatLE(o+k*12+4),z=b.readFloatLE(o+k*12+8),key=`${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;let id=ids.get(key);if(id===undefined){id=pos.length/3;ids.set(key,id);pos.push(x,y,z);}tri[t*3+k]=id;v.push([x,y,z]);}
  const u=v[1].map((c,i)=>c-v[0][i]),w=v[2].map((c,i)=>c-v[0][i]),c=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],l=Math.hypot(...c)||1;fn.set(c.map(q=>q/l),t*3);}
 const around=Array.from({length:pos.length/3},()=>[]);for(let t=0;t<n;t++)for(let k=0;k<3;k++)around[tri[t*3+k]].push(t);
 const P=[],N=[],I=[],out=new Map();
 for(let t=0;t<n;t++)for(let k=0;k<3;k++){const id=tri[t*3+k];let s=[0,0,0];for(const q of around[id]){const d=fn[t*3]*fn[q*3]+fn[t*3+1]*fn[q*3+1]+fn[t*3+2]*fn[q*3+2];if(d>=CREASE)for(let i=0;i<3;i++)s[i]+=fn[q*3+i];}
  const l=Math.hypot(...s)||1,nq=s.map(c=>Math.round(c/l*127)),key=id+':'+nq;let o=out.get(key);if(o===undefined){o=P.length/3;out.set(key,o);P.push(pos[id*3],pos[id*3+1],pos[id*3+2]);N.push(...nq);}I.push(o);}
 const big=P.length>65535,b64=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64');
 const p=new Float32Array(P);let min=[1e9,1e9,1e9],max=[-1e9,-1e9,-1e9];for(let i=0;i<p.length;i++){min[i%3]=Math.min(min[i%3],p[i]);max[i%3]=Math.max(max[i%3],p[i]);}
 return {triangles:n,min,max,data:{p:b64(p),n:b64(new Int8Array(N)),i:b64(big?new Uint32Array(I):new Uint16Array(I)),i32:big}};
}
// SolidWorks ArrayData is row-vector: p' = p*R*scale + T (metres). Returned as a column-major 4x4 in mm, as three.js Matrix4.fromArray expects.
const matrix=m=>[m[0]*m[12],m[1]*m[12],m[2]*m[12],0, m[3]*m[12],m[4]*m[12],m[5]*m[12],0, m[6]*m[12],m[7]*m[12],m[8]*m[12],0, m[9]*1000,m[10]*1000,m[11]*1000,1];
function worldBox(g,e){let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9];for(let c=0;c<8;c++){const v=[c&1?g.max[0]:g.min[0],c&2?g.max[1]:g.min[1],c&4?g.max[2]:g.min[2]];for(let r=0;r<3;r++){const x=e[r]*v[0]+e[4+r]*v[1]+e[8+r]*v[2]+e[12+r];lo[r]=Math.min(lo[r],x);hi[r]=Math.max(hi[r],x);}}return lo.concat(hi);}

const geo={};let tris=0,worst={d:0};
for(const f of fs.readdirSync(path.join(run,'exports','stl')).filter(f=>f.toLowerCase().endsWith('.stl'))){const k=f.slice(0,-4);geo[k]=mesh(path.join(run,'exports','stl',f));tris+=geo[k].triangles;}
const configurations=scene.configurations.map(c=>({name:c.name,description:c.description,components:c.components.map(o=>{
 const g=geo[o.part];if(!g)throw new Error(`${c.name}: no STL for ${o.part}`);const e=matrix(o.m);
 // The placed STL envelope must reproduce SolidWorks' own component box; otherwise the viewer would show parts in the wrong place.
 if(o.box){const w=worldBox(g,e),d=Math.max(...w.map((v,i)=>Math.abs(v-o.box[i])));if(d>worst.d)worst={d,where:c.name+' / '+o.name};}
 return {part:o.part,name:o.name,e:e.map(v=>+v.toFixed(6)),color:o.color||(scene.parts[o.part]||{}).color||null};})}));
if(worst.d>1)throw new Error(`Placement check failed: ${worst.d.toFixed(2)} mm at ${worst.where}`);

const info=Object.fromEntries(Object.keys(geo).map(k=>{const r=bom[k];return [k,r?{group:r.Configuration_group,envelope:`${r.Width_mm} × ${r.Height_mm} × ${r.Depth_mm} mm`,material:r.Material,process:r.Process,qty:r.Qty}:{group:k.startsWith('REFERENCE_')?'Host reference (illustrative, not supplied)':'',envelope:'',material:'',process:'',qty:''}];}));
const out=path.join(run,'viewer');fs.mkdirSync(out,{recursive:true});
const model={build:path.basename(run),triangles:tris,parts:Object.fromEntries(Object.entries(geo).map(([k,g])=>[k,{...g.data,info:info[k]}])),configurations};
fs.writeFileSync(path.join(out,'model-data.js'),'window.LUMA_MODEL='+JSON.stringify(model)+';\n');
for(const f of ['three.min.js','OrbitControls.js','three-LICENSE.txt'])fs.copyFileSync(path.join(__dirname,'vendor',f),path.join(out,f));
fs.copyFileSync(path.join(__dirname,'Viewer.html'),path.join(run,'Viewer.html'));
console.log(`${Object.keys(geo).length} parts, ${tris} triangles, ${configurations.length} configurations; worst placement deviation ${worst.d.toFixed(3)} mm`);
console.log(path.join(run,'Viewer.html'));
