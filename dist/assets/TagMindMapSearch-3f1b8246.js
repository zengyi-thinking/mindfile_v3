import{u as $,r as u,x as j,b as n,o as _,c as g,d as l,e,w as a,C as A,y as D,E as h,f as i,F as L,h as O,j as Q,t as p}from"./index-9511e055.js";import{g as R,b as q,a as G}from"./tags-2c6feec3.js";import{searchMindmapsByTags as H}from"./tagBasedMindmap-6b59b98e.js";import{_ as J}from"./_plugin-vue_export-helper-c27b6911.js";import"./mindmap-a70de1df.js";import"./storage-02b3d0a9.js";const W={class:"tag-mindmap-search"},X={class:"search-header"},Y={class:"search-section"},Z={class:"search-results"},ee={class:"mindmap-content"},te={class:"mindmap-icon"},ae={class:"mindmap-info"},ne={class:"mindmap-meta"},oe={key:0,class:"empty-state"},le={__name:"TagMindMapSearch",setup(se){const y=$(),b=u(""),d=u([]),m=u([]),f=u(!1),V=j(()=>R().map(o=>({value:o,label:o,children:q(o).map(t=>({value:t,label:t,children:G(o,t).map(r=>({value:r,label:r}))}))}))),C=async()=>{if(d.value.length===0){h.warning("请选择标签路径");return}f.value=!0;try{const o=await H(d.value);m.value=o,o.length===0&&h.info("未找到匹配的思维导图")}catch(o){console.error("搜索出错:",o),h.error("搜索失败")}finally{f.value=!1}},x=o=>{y.push(`/mindmap/${o}`)},k=()=>{y.push("/mindmap/new")};return(o,t)=>{const r=n("el-breadcrumb-item"),T=n("el-breadcrumb"),w=n("Search"),c=n("el-icon"),B=n("el-input"),S=n("el-cascader"),v=n("el-button"),N=n("BrainIcon"),z=n("Calendar"),M=n("el-tag"),E=n("Connection"),I=n("el-card"),F=n("el-col"),K=n("el-row"),P=n("el-empty");return _(),g("div",W,[l("div",X,[t[4]||(t[4]=l("h1",null,"标签思维导图搜索",-1)),e(T,{separator:"/"},{default:a(()=>[e(r,{to:{path:"/"}},{default:a(()=>t[2]||(t[2]=[i("首页")])),_:1}),e(r,null,{default:a(()=>t[3]||(t[3]=[i("标签搜索")])),_:1})]),_:1})]),l("div",Y,[e(B,{modelValue:b.value,"onUpdate:modelValue":t[0]||(t[0]=s=>b.value=s),placeholder:"搜索思维导图...",class:"search-input",clearable:"",onKeyup:A(C,["enter"])},{prefix:a(()=>[e(c,null,{default:a(()=>[e(w)]),_:1})]),_:1},8,["modelValue"]),e(S,{modelValue:d.value,"onUpdate:modelValue":t[1]||(t[1]=s=>d.value=s),options:V.value,props:{checkStrictly:!0},placeholder:"请选择标签路径",clearable:"",class:"tag-selector"},null,8,["modelValue","options"]),e(v,{type:"primary",onClick:C,loading:f.value,class:"search-btn"},{default:a(()=>[e(c,null,{default:a(()=>[e(w)]),_:1}),t[5]||(t[5]=i(" 搜索 "))]),_:1},8,["loading"]),e(v,{type:"primary",onClick:k,class:"create-btn"},{default:a(()=>t[6]||(t[6]=[i(" 创建新思维导图 ")])),_:1})]),l("div",Z,[e(K,{gutter:24},{default:a(()=>[(_(!0),g(L,null,O(m.value,(s,U)=>(_(),Q(F,{key:U,xs:24,sm:12,md:8},{default:a(()=>[e(I,{class:"mindmap-card",shadow:"hover",onClick:re=>x(s.id)},{default:a(()=>[l("div",ee,[l("div",te,[e(c,{size:40},{default:a(()=>[e(N)]),_:1})]),l("div",ae,[l("h3",null,p(s.title),1),l("p",null,p(s.description),1),l("div",ne,[e(M,{size:"small",type:"info",effect:"plain"},{default:a(()=>[e(c,null,{default:a(()=>[e(z)]),_:1}),l("span",null,p(s.createdAt),1)]),_:2},1024),e(M,{size:"small",type:"success",effect:"plain"},{default:a(()=>[e(c,null,{default:a(()=>[e(E)]),_:1}),l("span",null,p(s.nodeCount)+" 节点",1)]),_:2},1024)])])])]),_:2},1032,["onClick"])]),_:2},1024))),128))]),_:1}),m.value.length===0?(_(),g("div",oe,[e(P,{description:"暂无搜索结果","image-size":200},{default:a(()=>[e(v,{type:"primary",onClick:k},{default:a(()=>t[7]||(t[7]=[i(" 创建新思维导图 ")])),_:1})]),_:1})])):D("",!0)])])}}},me=J(le,[["__scopeId","data-v-d6381b99"]]);export{me as default};
