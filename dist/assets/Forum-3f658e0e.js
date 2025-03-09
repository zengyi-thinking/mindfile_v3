import{u as ee,r as v,x as N,g as te,b as r,o as p,c as _,d as l,t as u,e as t,w as o,F as U,h as z,j as le,y as P,f as c,z as ae,i as V,E as F,$ as se,a0 as oe,Q as ne,a1 as ie,m as re}from"./index-d9b6abc2.js";import{r as ue,A as ce}from"./activityTracker-6427563e.js";import{_ as de}from"./_plugin-vue_export-helper-c27b6911.js";const pe={class:"forum-container"},ve={class:"page-header"},_e={class:"user-info"},me={class:"forum-content"},fe={class:"forum-sidebar"},ge={class:"sidebar-card"},he={class:"hot-topics"},ye=["onClick"],be={class:"hot-rank"},we={class:"hot-title"},Ve={class:"sidebar-card"},Ce={class:"category-filters"},Se={class:"forum-main"},Te={class:"search-section"},ke={class:"topic-filter"},De={class:"topic-list"},Re=["onClick"],xe={class:"topic-content"},Ie={class:"topic-header"},Ne={class:"topic-title"},Ue={class:"topic-meta"},ze={class:"meta-item"},Pe={class:"meta-item"},Je={class:"topic-stats"},Oe={class:"stat-item"},Fe={class:"stat-value"},$e={class:"stat-item"},Ae={class:"stat-value"},Be={key:0,class:"topic-last-reply"},Le={class:"last-reply-info"},Ee={key:0,class:"pagination-container"},je={class:"dialog-footer"},Me={__name:"Forum",setup(Ge){const $=ee(),C=v(""),g=v(!1),S=v(""),h=v("newest"),T=v(1),A=[{label:"全部",value:""},{label:"思维导图",value:"mindmap"},{label:"Python",value:"python"},{label:"算法",value:"algorithm"},{label:"项目管理",value:"project"},{label:"工具推荐",value:"tools"}],m=v((()=>{const s=localStorage.getItem("currentUser");if(s)try{return JSON.parse(s)}catch(e){return console.error("解析用户数据失败",e),{role:"游客",avatar:"G",username:"游客"}}else return{role:"游客",avatar:"G",username:"游客"}})()),f=v([]),B=N(()=>[...f.value].sort((s,e)=>(e.views||0)-(s.views||0)).slice(0,5)),y=N(()=>{let s=[...f.value];if(S.value&&(s=s.filter(e=>e.category===S.value)),C.value.trim()){const e=C.value.toLowerCase();s=s.filter(i=>i.title.toLowerCase().includes(e)||i.content.toLowerCase().includes(e))}return h.value==="newest"?s.sort((e,i)=>new Date(i.publishDate)-new Date(e.publishDate)):h.value==="hottest"?s.sort((e,i)=>(i.views||0)-(e.views||0)):h.value==="mostReplies"&&s.sort((e,i)=>(i.replies||0)-(e.replies||0)),s});N(()=>{const e=(T.value-1)*10;return y.value.slice(e,e+10)});const L=s=>{T.value=s,window.scrollTo({top:0,behavior:"smooth"})},E=s=>{S.value=s,T.value=1},j=()=>{T.value=1},M=()=>{const s=localStorage.getItem("topics");if(s)try{f.value=JSON.parse(s)}catch(e){console.error("解析话题数据失败",e),f.value=[]}else{const e=[{id:1,title:"如何高效使用思维导图进行学习规划",author:"admin",publishDate:"2023-03-06",category:"mindmap",content:"思维导图是一种非常有效的学习工具，可以帮助我们更好地组织和记忆知识。我想分享一些使用思维导图进行学习规划的经验和技巧...",views:128,replies:15,tags:["beginner","tips"],lastReplier:"user123",lastReplyTime:"2023-03-10 14:30"},{id:2,title:"Python数据分析入门指南",author:"datascientist",publishDate:"2023-03-05",category:"python",content:"本指南将介绍Python数据分析的基础知识，包括NumPy、Pandas和Matplotlib等库的使用方法，以及一些实用的数据处理技巧...",views:95,replies:8,tags:["beginner","resources"],lastReplier:"pythonfan",lastReplyTime:"2023-03-09 10:15"},{id:3,title:"算法复杂度分析方法详解",author:"coder",publishDate:"2023-03-04",category:"algorithm",content:"理解算法复杂度对于编写高效代码至关重要。本文将详细讲解时间复杂度和空间复杂度的概念，以及如何分析不同类型算法的复杂度...",views:76,replies:5,tags:["advanced"],lastReplier:"algorithmexpert",lastReplyTime:"2023-03-08 16:45"}];localStorage.setItem("topics",JSON.stringify(e)),f.value=e}},J=s=>{$.push(`/forum/${s}`)},G=()=>{n.value={title:"",category:"",content:"",tags:[]},g.value=!0},n=v({title:"",category:"",content:"",tags:[]}),Q=()=>{if(!n.value.title.trim()||!n.value.category||!n.value.content.trim()){F.warning("请填写完整的讨论信息");return}const s={id:Date.now().toString(),title:n.value.title,author:m.value.username||m.value.role,publishDate:new Date().toISOString().split("T")[0],category:n.value.category,content:n.value.content,tags:n.value.tags||[],views:0,replies:0,lastReplier:m.value.username||m.value.role,lastReplyTime:new Date().toLocaleString()};f.value.unshift(s);const e=localStorage.getItem("topics");let i=[];if(e)try{i=JSON.parse(e),i.unshift(s)}catch(k){console.error("解析话题数据失败",k),i=[s]}else i=[s];localStorage.setItem("topics",JSON.stringify(i)),ue({type:ce.POST,topicId:s.id,topicTitle:s.title}),g.value=!1,F.success("发布讨论成功")},Y=()=>{M()};return te(()=>{Y()}),(s,e)=>{const i=r("el-avatar"),k=r("el-tag"),x=r("el-input"),D=r("el-button"),b=r("el-icon"),I=r("el-radio-button"),q=r("el-radio-group"),H=r("el-empty"),K=r("el-pagination"),R=r("el-form-item"),d=r("el-option"),O=r("el-select"),W=r("el-form"),X=r("el-dialog");return p(),_("div",pe,[l("div",ve,[e[8]||(e[8]=l("h1",null,"讨论交流",-1)),l("div",_e,[l("span",null,u(m.value.role),1),t(i,{size:40,class:"avatar"},{default:o(()=>[c(u(m.value.avatar),1)]),_:1})])]),l("div",me,[l("div",fe,[l("div",ge,[e[9]||(e[9]=l("h3",null,"热门话题",-1)),l("div",he,[(p(!0),_(U,null,z(B.value,(a,w)=>(p(),_("div",{key:w,class:"hot-topic-item",onClick:Z=>J(a.id)},[l("span",be,u(w+1),1),l("span",we,u(a.title),1)],8,ye))),128))])]),l("div",Ve,[e[10]||(e[10]=l("h3",null,"分类筛选",-1)),l("div",Ce,[(p(),_(U,null,z(A,a=>t(k,{key:a.value,class:ae([{"active-filter":S.value===a.value},"category-tag"]),onClick:w=>E(a.value),effect:"plain"},{default:o(()=>[c(u(a.label),1)]),_:2},1032,["class","onClick"])),64))])])]),l("div",Se,[l("div",Te,[t(x,{modelValue:C.value,"onUpdate:modelValue":e[0]||(e[0]=a=>C.value=a),placeholder:"搜索讨论...",class:"search-input",clearable:"","prefix-icon":"Search"},null,8,["modelValue"]),t(D,{type:"primary",onClick:j},{default:o(()=>e[11]||(e[11]=[c("搜索")])),_:1}),t(D,{type:"primary",class:"create-btn",onClick:G},{default:o(()=>[t(b,null,{default:o(()=>[t(V(se))]),_:1}),e[12]||(e[12]=c(" 发起讨论 "))]),_:1})]),l("div",ke,[t(q,{modelValue:h.value,"onUpdate:modelValue":e[1]||(e[1]=a=>h.value=a),size:"small"},{default:o(()=>[t(I,{label:"newest"},{default:o(()=>e[13]||(e[13]=[c("最新")])),_:1}),t(I,{label:"hottest"},{default:o(()=>e[14]||(e[14]=[c("最热")])),_:1}),t(I,{label:"mostReplies"},{default:o(()=>e[15]||(e[15]=[c("最多回复")])),_:1})]),_:1},8,["modelValue"])]),l("div",De,[(p(!0),_(U,null,z(y.value,(a,w)=>(p(),_("div",{key:w,class:"topic-item",onClick:Z=>J(a.id)},[l("div",xe,[l("div",Ie,[t(i,{size:36,class:"topic-avatar"},{default:o(()=>[c(u(a.author.charAt(0)),1)]),_:2},1024),l("h3",Ne,u(a.title),1),t(k,{size:"small",effect:"plain",class:"topic-category"},{default:o(()=>[c(u(a.category),1)]),_:2},1024)]),l("div",Ue,[l("span",ze,[t(b,null,{default:o(()=>[t(V(oe))]),_:1}),c(" "+u(a.author),1)]),l("span",Pe,[t(b,null,{default:o(()=>[t(V(ne))]),_:1}),c(" "+u(a.publishDate),1)])])]),l("div",Je,[l("div",Oe,[t(b,null,{default:o(()=>[t(V(ie))]),_:1}),l("span",Fe,u(a.views||0),1),e[16]||(e[16]=l("span",{class:"stat-label"},"浏览",-1))]),l("div",$e,[t(b,null,{default:o(()=>[t(V(re))]),_:1}),l("span",Ae,u(a.replies||0),1),e[17]||(e[17]=l("span",{class:"stat-label"},"回复",-1))])]),a.lastReplier?(p(),_("div",Be,[l("div",Le,[l("span",null,"最后回复: "+u(a.lastReplier),1),l("span",null,u(a.lastReplyTime),1)])])):P("",!0)],8,Re))),128)),y.value.length===0?(p(),le(H,{key:0,description:"暂无相关讨论"})):P("",!0)]),y.value.length>0?(p(),_("div",Ee,[t(K,{background:"",layout:"prev, pager, next",total:y.value.length,"page-size":10,onCurrentChange:L},null,8,["total"])])):P("",!0)])]),t(X,{modelValue:g.value,"onUpdate:modelValue":e[7]||(e[7]=a=>g.value=a),title:"发起讨论",width:"600px",class:"topic-dialog"},{footer:o(()=>[l("span",je,[t(D,{onClick:e[6]||(e[6]=a=>g.value=!1)},{default:o(()=>e[18]||(e[18]=[c("取消")])),_:1}),t(D,{type:"primary",onClick:Q},{default:o(()=>e[19]||(e[19]=[c("发布")])),_:1})])]),default:o(()=>[t(W,{model:n.value,"label-width":"80px"},{default:o(()=>[t(R,{label:"标题"},{default:o(()=>[t(x,{modelValue:n.value.title,"onUpdate:modelValue":e[2]||(e[2]=a=>n.value.title=a),placeholder:"请输入讨论标题"},null,8,["modelValue"])]),_:1}),t(R,{label:"分类"},{default:o(()=>[t(O,{modelValue:n.value.category,"onUpdate:modelValue":e[3]||(e[3]=a=>n.value.category=a),placeholder:"请选择分类"},{default:o(()=>[t(d,{label:"思维导图方法",value:"mindmap"}),t(d,{label:"Python学习",value:"python"}),t(d,{label:"算法学习",value:"algorithm"}),t(d,{label:"项目管理",value:"project"}),t(d,{label:"工具推荐",value:"tools"})]),_:1},8,["modelValue"])]),_:1}),t(R,{label:"内容"},{default:o(()=>[t(x,{modelValue:n.value.content,"onUpdate:modelValue":e[4]||(e[4]=a=>n.value.content=a),type:"textarea",rows:6,placeholder:"请输入讨论内容"},null,8,["modelValue"])]),_:1}),t(R,{label:"标签"},{default:o(()=>[t(O,{modelValue:n.value.tags,"onUpdate:modelValue":e[5]||(e[5]=a=>n.value.tags=a),multiple:"",placeholder:"请选择标签",style:{width:"100%"}},{default:o(()=>[t(d,{label:"入门",value:"beginner"}),t(d,{label:"进阶",value:"advanced"}),t(d,{label:"技巧分享",value:"tips"}),t(d,{label:"问题求助",value:"help"}),t(d,{label:"资源分享",value:"resources"})]),_:1},8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue"])])}}},Ke=de(Me,[["__scopeId","data-v-093d5642"]]);export{Ke as default};
