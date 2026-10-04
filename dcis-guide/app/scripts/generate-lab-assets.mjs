// Original procedural artwork; no scanned or third-party character geometry.
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
globalThis.FileReader = class { readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.()})} readAsDataURL(blob){blob.arrayBuffer().then(result=>{this.result='data:application/octet-stream;base64,'+Buffer.from(result).toString('base64');this.onloadend?.()})} };
const out=new URL('../public/lab/',import.meta.url);await mkdir(out,{recursive:true});
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.65,metalness:.08,flatShading:true});
function mesh(group,geo,color,pos,scale){const m=new THREE.Mesh(geo,mat(color));m.position.set(...pos);if(scale)m.scale.set(...scale);group.add(m);return m}
const ball=(g,c,p,s)=>mesh(g,new THREE.SphereGeometry(1,12,8),c,p,s);
const box=(g,c,p,s)=>mesh(g,new THREE.BoxGeometry(1,1,1),c,p,s);
async function save(g,name){const binary=await new GLTFExporter().parseAsync(g,{binary:true});await writeFile(new URL(name,out),Buffer.from(binary));console.log(name,binary.byteLength)}
for(const [color,hex] of Object.entries({mint:'#63d9b8',violet:'#aa97ed',sun:'#f4be65'}))for(const hat of ['bare','cap'])for(const face of ['happy','wonder']){
 const g=new THREE.Group();
 mesh(g,new THREE.CylinderGeometry(.20,.24,.35,6),hex,[0,.32,0]);mesh(g,new THREE.ConeGeometry(.20,.16,6),hex,[0,.575,0]);
 ball(g,'#273c4d',[-.12,.065,.025],[.105,.06,.13]);ball(g,'#273c4d',[.12,.065,.025],[.105,.06,.13]);
 ball(g,hex,[-.255,.30,0],[.055,.115,.055]);const arm=ball(g,hex,[.26,.37,0],[.055,.12,.055]);arm.rotation.z=-.7;
 for(const x of [-.076,.076]){ball(g,'#fff8e8',[x,.385,.186],[.049,.06,.026]);ball(g,'#263b4b',[x,.38,.21],[.024,face==='wonder'?.034:.024,.014]);ball(g,'#ffffff',[x-.008,.393,.221],[.007,.01,.005]);ball(g,'#ec9694',[x*1.7,.32,.186],[.03,.018,.009])}
 if(face==='wonder')ball(g,'#273c4d',[0,.29,.245],[.025,.035,.012]);else{const smile=mesh(g,new THREE.TorusGeometry(.037,.009,6,16,Math.PI),'#273c4d',[0,.31,.245]);smile.rotation.z=Math.PI}
 if(hat==='cap'){mesh(g,new THREE.CylinderGeometry(.17,.20,.065,12),'#30485c',[0,.59,0]);box(g,'#30485c',[0,.565,.16],[.3,.025,.18]);ball(g,'#f4be65',[0,.637,0],[.032,.024,.032])}
 await save(g,`pip-${color}-${hat}-${face}.glb`);
}
// Schematic exhibit-map outline, copied verbatim from the existing public map.
const room=new THREE.Group(),points=[[70,230],[800,230],[800,1000],[400,1000],[400,480],[180,480],[180,410],[70,410]];
const shape=new THREE.Shape();points.forEach(([x,z],i)=>{const p=[(x-435)/100,(z-615)/100];i?shape.lineTo(...p):shape.moveTo(...p)});shape.closePath();
const floor=mesh(room,new THREE.ShapeGeometry(shape),'#cbdad4',[0,0,0]);floor.rotation.x=Math.PI/2;floor.material.side=THREE.DoubleSide;
// Low perimeter expresses a tabletop, not a surveyed reconstruction.
for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];const dx=(b[0]-a[0])/100,dz=(b[1]-a[1])/100;const rail=box(room,'#718b88',[(a[0]+b[0]-870)/200,.08,(a[1]+b[1]-1230)/200],[Math.hypot(dx,dz),.16,.05]);rail.rotation.y=-Math.atan2(dz,dx)}
const content=JSON.parse(await readFile(new URL('../content/mineral-hall.public.json',import.meta.url),'utf8'));
// Public numeric map positions; case heights and contents are deliberately illustrative.
const source=await readFile(new URL('../src/mineralHallKnowledge.ts',import.meta.url),'utf8');
const items=JSON.parse(source.split('export const mineralMapItems: MineralMapItem[] = ')[1].split('\n];')[0]+'\n]');
for(const id of ['1','3','18']){const p=items.find(x=>x.id===id);const x=(p.x-435)/100,z=(p.y-615)/100;box(room,'#314c58',[x,.35,z],[1,.7,.5]);box(room,'#ebd8ad',[x,.73,z],[1.05,.065,.55]);for(let i=0;i<3;i++)mesh(room,new THREE.ConeGeometry(.12,.32+i*.04,6),['#63d9b8','#aa97ed','#f4be65'][i],[x+(i-1)*.29,.92,z]);}
await save(room,'mineral-hall-tabletop.glb');
