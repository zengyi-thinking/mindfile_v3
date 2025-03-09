import{g as h,c as y,u as g}from"./mindmap-a70de1df.js";import{g as p}from"./storage-02b3d0a9.js";const $=async n=>{try{const[e,c,r]=n;return(await h()).filter(d=>{var i,s,o;return!(((i=d.tags)==null?void 0:i.primary)!==e||c&&((s=d.tags)==null?void 0:s.secondary)!==c||r&&((o=d.tags)==null?void 0:o.tertiary)!==r)})}catch(e){return console.error("根据标签搜索思维导图失败:",e),[]}},f=async(n,e=[])=>{try{if(!n||n.length===0)throw new Error("标签路径不能为空");const[c,r,a]=n;let t=c;r&&(t+=` - ${r}`,a&&(t+=` - ${a}`));const i=(await h()).find(s=>s.title===t||s.tags&&s.tags.primary===c&&s.tags.secondary===r&&(a?s.tags.tertiary===a:!0));return i?{mindmap:await m(i,e),isNew:!1}:{mindmap:await M(t,n,e),isNew:!0}}catch(c){throw console.error("生成思维导图出错:",c),c}},M=async(n,e,c)=>{const[r,a,t]=e;let d=`基于${r}`;a&&(d+=`/${a}`,t&&(d+=`/${t}`)),d+="标签自动生成的思维导图";const i=c.map(o=>o.id),s={title:n,description:d,tags:{primary:r,secondary:a||null,tertiary:t||null},relatedMaterials:i,nodes:T(e,c)};return await y(s)},m=async(n,e)=>{const c=n.relatedMaterials||[],r=e.map(i=>i.id),a=[...new Set([...c,...r])],t=x(n.nodes,e),d={relatedMaterials:a,nodeCount:t?t.length:n.nodeCount,nodes:t||n.nodes};return await g(n.id,d)},T=(n,e)=>{const[c,r,a]=n,t={id:"root",text:c,children:[]};if(r){const d={id:`secondary-${r}`,text:r,children:[]};if(a){const i={id:`tertiary-${a}`,text:a,children:[]};e.forEach(s=>{s.customTags&&s.customTags.length>0?s.customTags.forEach(o=>{let l=i.children.find(u=>u.data&&u.data.type==="customTag"&&u.text===o);l||(l={id:`customTag-${o.replace(/\s+/g,"-")}`,text:o,data:{type:"customTag",value:o},children:[]},i.children.push(l)),l.children.push({id:`material-${s.id}`,text:s.name,data:{materialId:s.id,type:"material"}})}):i.children.push({id:`material-${s.id}`,text:s.name,data:{materialId:s.id,type:"material"}})}),d.children.push(i)}else e.forEach(i=>{d.children.push({id:`material-${i.id}`,text:i.name,data:{materialId:i.id,type:"material"}})});t.children.push(d)}else e.forEach(d=>{t.children.push({id:`material-${d.id}`,text:d.name,data:{materialId:d.id,type:"material"}})});return[t]},x=(n,e)=>{if(!n||n.length===0)return null;const c=JSON.parse(JSON.stringify(n)),r=c[0];let a=r;if(r.children&&r.children.length>0){const t=r.children[0];t.children&&t.children.length>0&&t.children[0].children?a=t.children[0]:a=t}return e.forEach(t=>{a.children.find(i=>i.data&&i.data.type==="material"&&i.data.materialId===t.id)||(t.customTags&&t.customTags.length>0?t.customTags.forEach(i=>{let s=a.children.find(o=>o.data&&o.data.type==="customTag"&&o.text===i);s||(s={id:`customTag-${i.replace(/\s+/g,"-")}`,text:i,data:{type:"customTag",value:i},children:[]},a.children.push(s)),s.children.push({id:`material-${t.id}`,text:t.name,data:{materialId:t.id,type:"material"}})}):a.children.push({id:`material-${t.id}`,text:t.name,data:{materialId:t.id,type:"material"}}))}),c},I=async n=>{try{const e={};n.forEach(r=>{if(r.hierarchicalTags&&r.hierarchicalTags.length>0){const a=r.hierarchicalTags.join("|");e[a]||(e[a]=[]),e[a].push(r)}});const c=[];for(const r in e){const a=r.split("|"),t=e[r],d=await f(a,t);c.push(d)}return c}catch(e){throw console.error("组织资料思维导图出错:",e),e}},E=async n=>{try{const e=await p(),[c,r,a]=n;return e.filter(d=>{const i=d.hierarchicalTags||[];return!(i[0]!==c||r&&i[1]!==r||a&&i[2]!==a)})}catch(e){return console.error("根据标签路径获取资料失败:",e),[]}};export{f as generateMindmapFromTags,E as getMaterialsByTagPath,I as organizeMaterialsByTags,$ as searchMindmapsByTags};
