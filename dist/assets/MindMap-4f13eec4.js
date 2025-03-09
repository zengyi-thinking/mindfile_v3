import{u as ye,r as c,x as Me,g as Ce,E as y,b as i,o as f,c as M,d as o,t as d,e as l,w as s,F as T,h as P,y as D,f as m,j as z,z as N,A as S,B as Z,_ as we}from"./index-d9b6abc2.js";import{g as U}from"./mindmap-a70de1df.js";import{g as G,a as F,b as I}from"./tags-2c6feec3.js";import{_ as He}from"./_plugin-vue_export-helper-c27b6911.js";const ke={class:"mindmap-container"},be={class:"page-header"},xe={class:"user-info"},Te={class:"file-map-description"},Pe={class:"search-section"},ze={class:"tag-filter-section"},Ee={class:"tag-category"},Le={class:"tag-list"},Be={key:0,class:"tag-subcategory"},$e={class:"tag-list"},Ae={key:1,class:"tag-tertiary"},De={class:"tag-list"},Ne={class:"mindmap-grid"},Se={class:"mindmap-content"},Ue={class:"mindmap-icon"},Fe={class:"mindmap-info"},Ie={class:"mindmap-meta"},Oe={class:"mindmap-actions"},Re={key:0,class:"empty-state"},je={class:"dialog-footer"},qe={__name:"MindMap",setup(Qe){const J={render(){return Z("svg",{viewBox:"0 0 24 24",width:"1em",height:"1em"},[Z("path",{fill:"currentColor",d:"M13,3V10H18V9H15V3H13M6,3H8V11H10V3H12V11H10V13H8V11H6V3M8,13H10V15H8V13M10,15H12V17H10V15M12,15H14V17H12V15M14,15H16V17H14V15M16,15H18V17H16V15M18,15H20V17H18V15M20,15V13H24V15H22M22,13H20V11H22V13M20,11H18V9H20V11M18,9H16V7H18V9M16,7H14V5H16V7M14,5H12V3H14V5Z"})])}},K=ye(),w=c(""),O=c({role:"管理员",avatar:"A"}),g=c([]),R=c(0),j=c(0),E=c([]),L=c([]),H=c([]),v=c(""),p=c(""),h=c([]),W=()=>{E.value=G(),j.value=X()},X=()=>{let t=0;return G().forEach(n=>{I(n).forEach(u=>{t+=F(n,u).length})}),t},Y=t=>{v.value===t?(v.value="",p.value="",L.value=[],H.value=[]):(v.value=t,p.value="",L.value=I(t),H.value=[]),b()},ee=t=>{p.value===t?(p.value="",H.value=[]):(p.value=t,H.value=F(v.value,t)),b()},te=t=>{const e=h.value.indexOf(t);e>-1?h.value.splice(e,1):h.value.push(t),b()},b=async()=>{try{const t=await U();if(!v.value){g.value=t;return}g.value=t.filter(e=>{const n=(e.title+" "+e.description).toLowerCase();return v.value&&!n.includes(v.value.toLowerCase())||p.value&&!n.includes(p.value.toLowerCase())?!1:h.value.length>0?h.value.some(r=>n.includes(r.toLowerCase())):!0})}catch(t){console.error("筛选思维导图出错:",t),y.error("筛选思维导图时出错")}},le=async()=>{try{if(!w.value.trim()){await b();return}const e=(await U()).filter(n=>{const r=n.title.toLowerCase().includes(w.value.toLowerCase()),u=n.description.toLowerCase().includes(w.value.toLowerCase()),V=ae(n.tags);return r||u||V});e.length===0&&y.info("未找到匹配的思维导图"),g.value=e}catch(t){console.error("搜索思维导图出错:",t),y.error("搜索思维导图时出错")}},ae=t=>!(!t||v.value&&t.primary!==v.value||p.value&&t.secondary!==p.value||h.value.length>0&&!h.value.includes(t.tertiary)),k=c(!1),B=c(!1),_=c({tagPath:[],title:"",description:""}),se=Me(()=>E.value.map(t=>({value:t,label:t,children:I(t).map(e=>({value:e,label:e,children:F(t,e).map(n=>({value:n,label:n}))}))}))),q=()=>{k.value=!0,_.value={tagPath:[],title:"",description:""}},oe=async()=>{if(!_.value.tagPath||_.value.tagPath.length===0){y.warning("请选择标签路径");return}B.value=!0;try{const{generateMindmapFromTags:t,getMaterialsByTagPath:e}=await we(()=>import("./tagBasedMindmap-6b59b98e.js"),["assets/tagBasedMindmap-6b59b98e.js","assets/mindmap-a70de1df.js","assets/storage-02b3d0a9.js"]),n=await e(_.value.tagPath),r=await t(_.value.tagPath,n);if(r.isNew)g.value.unshift(r.mindmap),y.success("思维导图创建成功");else{const u=g.value.findIndex(V=>V.id===r.mindmap.id);u!==-1?g.value[u]=r.mindmap:g.value.unshift(r.mindmap),y.success("思维导图已更新")}k.value=!1}catch(t){console.error("创建思维导图出错:",t),y.error("创建思维导图失败")}finally{B.value=!1}},Q=t=>{console.log("查看思维导图:",t),K.push(`/mindmap/${t}`)},ne=t=>{console.log("编辑思维导图:",t)},ie=t=>{console.log("删除思维导图:",t)};return Ce(async()=>{try{W();const t=await U();g.value=t;const e=new Set;t.forEach(n=>{n.relatedMaterials&&n.relatedMaterials.length>0&&n.relatedMaterials.forEach(r=>e.add(r))}),R.value=e.size}catch(t){console.error("加载思维导图数据出错:",t),y.error("加载思维导图数据时出错")}}),(t,e)=>{const n=i("el-avatar"),r=i("el-input"),u=i("el-button"),V=i("el-tag"),C=i("el-icon"),re=i("Calendar"),ue=i("Connection"),ce=i("Edit"),de=i("View"),ve=i("Delete"),pe=i("el-card"),_e=i("el-col"),fe=i("el-row"),me=i("el-empty"),ge=i("el-cascader"),$=i("el-form-item"),Ve=i("el-form"),he=i("el-dialog");return f(),M("div",ke,[o("div",be,[e[6]||(e[6]=o("h1",null,"FileMap",-1)),o("div",xe,[o("span",null,d(O.value.role),1),l(n,{size:40,class:"avatar"},{default:s(()=>[m(d(O.value.avatar),1)]),_:1})])]),o("div",Te,[o("p",null,"本园已收集"+d(R.value)+"个资料，收录"+d(j.value)+"个不同标签",1)]),o("div",Pe,[l(r,{modelValue:w.value,"onUpdate:modelValue":e[0]||(e[0]=a=>w.value=a),placeholder:"搜索思维导图...",class:"search-input",clearable:""},null,8,["modelValue"]),l(u,{type:"primary",onClick:le},{default:s(()=>e[7]||(e[7]=[m("搜索")])),_:1}),l(u,{type:"primary",class:"create-btn",onClick:q},{default:s(()=>e[8]||(e[8]=[m("创建新思维导图")])),_:1})]),o("div",ze,[o("div",Ee,[e[9]||(e[9]=o("h3",null,"按分类筛选",-1)),o("div",Le,[(f(!0),M(T,null,P(E.value,a=>(f(),z(V,{key:a,class:N([{"active-tag":v.value===a},"filter-tag"]),onClick:x=>Y(a),effect:"plain"},{default:s(()=>[m(d(a),1)]),_:2},1032,["class","onClick"]))),128))])]),v.value?(f(),M("div",Be,[o("h3",null,d(v.value)+"子分类",1),o("div",$e,[(f(!0),M(T,null,P(L.value,a=>(f(),z(V,{key:a,class:N([{"active-tag":p.value===a},"filter-tag"]),onClick:x=>ee(a),effect:"plain",type:"success"},{default:s(()=>[m(d(a),1)]),_:2},1032,["class","onClick"]))),128))])])):D("",!0),p.value?(f(),M("div",Ae,[o("h3",null,d(p.value)+"标签",1),o("div",De,[(f(!0),M(T,null,P(H.value,a=>(f(),z(V,{key:a,class:N([{"active-tag":h.value.includes(a)},"filter-tag"]),onClick:x=>te(a),effect:"plain",type:"info"},{default:s(()=>[m(d(a),1)]),_:2},1032,["class","onClick"]))),128))])])):D("",!0)]),o("div",Ne,[l(fe,{gutter:24},{default:s(()=>[(f(!0),M(T,null,P(g.value,(a,x)=>(f(),z(_e,{xs:24,sm:12,md:8,key:x},{default:s(()=>[l(pe,{class:"mindmap-card",shadow:"hover",onClick:A=>Q(a.id)},{default:s(()=>[o("div",Se,[o("div",Ue,[l(C,{size:40},{default:s(()=>[l(J)]),_:1})]),o("div",Fe,[o("h3",null,d(a.title),1),o("p",null,d(a.description),1),o("div",Ie,[l(V,{size:"small",type:"info",effect:"plain"},{default:s(()=>[l(C,null,{default:s(()=>[l(re)]),_:1}),o("span",null,d(a.createdAt),1)]),_:2},1024),l(V,{size:"small",type:"success",effect:"plain"},{default:s(()=>[l(C,null,{default:s(()=>[l(ue)]),_:1}),o("span",null,d(a.nodeCount)+" 节点",1)]),_:2},1024)])])]),o("div",Oe,[l(u,{type:"primary",size:"small",onClick:S(A=>ne(a.id),["stop"])},{default:s(()=>[l(C,null,{default:s(()=>[l(ce)]),_:1}),e[10]||(e[10]=m(" 编辑 "))]),_:2},1032,["onClick"]),l(u,{type:"info",size:"small",onClick:S(A=>Q(a.id),["stop"])},{default:s(()=>[l(C,null,{default:s(()=>[l(de)]),_:1}),e[11]||(e[11]=m(" 查看 "))]),_:2},1032,["onClick"]),l(u,{type:"danger",size:"small",onClick:S(A=>ie(a.id),["stop"])},{default:s(()=>[l(C,null,{default:s(()=>[l(ve)]),_:1}),e[12]||(e[12]=m(" 删除 "))]),_:2},1032,["onClick"])])]),_:2},1032,["onClick"])]),_:2},1024))),128))]),_:1})]),g.value.length===0?(f(),M("div",Re,[l(me,{description:"暂无思维导图","image-size":200},{default:s(()=>[l(u,{type:"primary",onClick:q},{default:s(()=>e[13]||(e[13]=[m("创建第一个思维导图")])),_:1})]),_:1})])):D("",!0),l(he,{modelValue:k.value,"onUpdate:modelValue":e[5]||(e[5]=a=>k.value=a),title:"创建基于标签的思维导图",width:"500px",class:"create-dialog","destroy-on-close":""},{footer:s(()=>[o("span",je,[l(u,{onClick:e[4]||(e[4]=a=>k.value=!1)},{default:s(()=>e[14]||(e[14]=[m("取消")])),_:1}),l(u,{type:"primary",onClick:oe,loading:B.value},{default:s(()=>e[15]||(e[15]=[m("创建")])),_:1},8,["loading"])])]),default:s(()=>[l(Ve,{model:_.value,"label-width":"100px"},{default:s(()=>[l($,{label:"选择标签",required:""},{default:s(()=>[l(ge,{modelValue:_.value.tagPath,"onUpdate:modelValue":e[1]||(e[1]=a=>_.value.tagPath=a),options:se.value,props:{checkStrictly:!0},clearable:"",placeholder:"请选择标签路径",style:{width:"100%"}},null,8,["modelValue","options"])]),_:1}),l($,{label:"思维导图名称"},{default:s(()=>[l(r,{modelValue:_.value.title,"onUpdate:modelValue":e[2]||(e[2]=a=>_.value.title=a),placeholder:"留空将根据标签自动生成"},null,8,["modelValue"])]),_:1}),l($,{label:"描述"},{default:s(()=>[l(r,{modelValue:_.value.description,"onUpdate:modelValue":e[3]||(e[3]=a=>_.value.description=a),type:"textarea",placeholder:"思维导图描述",rows:"3"},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue"])])}}},We=He(qe,[["__scopeId","data-v-3c0b7fc1"]]);export{We as default};
