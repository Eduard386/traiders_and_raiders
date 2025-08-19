const GOODS=["Зерно","Соль","Шерсть","Скот","Бронза","Древесина"];
const CITIES=["Портовый","Горная крепость","Лесная деревня","Оазис"];
const weights={ALL2:3,ONE_CHEAP:2,ONE_EXP:2,CHEAP_EXP:1};
const boardEl=document.getElementById("board");
const btnUpdate=document.getElementById("btnUpdate");
const btnRaid=document.getElementById("btnRaid");
const raidResult=document.getElementById("raidResult");
const cityStates=CITIES.map(()=>({mode:"ALL2"}));
function randInt(e){return Math.floor(Math.random()*e)}
function sampleDistinct(e,t){const n=Array.from({length:e},((e,t)=>t));for(let e=e-1;e>0;e--){const t=randInt(e+1);[n[e],n[t]]=[n[t],n[e]]}return n.slice(0,t)}
function weightedPick(e){const t=Object.entries(e),n=t.reduce(((e,[,t])=>e+t),0);let o=Math.random()*n;for(const[e,n]of t)if((o-=n)<=0)return e;return t[t.length-1][0]}
function newState(e){if("ALL2"===e)return{mode:e};if("ONE_CHEAP"===e)return{mode:e,cheap:[randInt(GOODS.length)]};if("ONE_EXP"===e)return{mode:e,exp:[randInt(GOODS.length)]};const[t,n]=sampleDistinct(GOODS.length,2);return{mode:e,cheap:[t],exp:[n]}}
function updateTwoCities(){const e=sampleDistinct(CITIES.length,2);for(const t of e){const e=weightedPick(weights);cityStates[t]=newState(e)}render()}
function render(){if(!boardEl.childElementCount){CITIES.forEach(((e,t)=>{const n=document.createElement("section");n.className="city",n.id=`city-${t}`,n.innerHTML=`\n        <h2>${e} <span class="badge" id="badge-${t}">все = 2</span></h2>\n        <div class="row" id="row-${t}"></div>\n        <div class="note" id="note-${t}"></div>\n      `,boardEl.appendChild(n)}))}cityStates.forEach(((e,t)=>{const n=document.getElementById(`row-${t}`);n.innerHTML="";const o=document.getElementById(`badge-${t}`),a=document.getElementById(`note-${t}`);let i="все = 2";const d=new Set(null!=e.cheap?e.cheap:[]),c=new Set(null!=e.exp?e.exp:[]);GOODS.forEach(((e,t)=>{let o="token",a="2";if(d.has(t))o+=" cheap",a="1";else if(c.has(t))o+=" exp",a="3";const i=document.createElement("div");i.className=o,i.textContent=e+" ";const r=document.createElement("span");r.className="val",r.textContent=a,i.appendChild(r),n.appendChild(i)})),function(e,t,n){switch(e){case"ALL2":return t("все = 2"),void n("—");case"ONE_CHEAP":return t("есть 1× дешёвый (1)"),void n("");case"ONE_EXP":return t("есть 1× дорогой (3)"),void n("");case"CHEAP_EXP":return t("1× дешёвый (1) и 1× дорогой (3)"),void n("")}}(e,(e=>o.textContent=e),(e=>a.textContent=e))}))}
btnUpdate.addEventListener("click",updateTwoCities);
btnRaid.addEventListener("click",(()=>{const e=Math.random()<.5;e?(raidResult.textContent="Засада! Без охраны: потеряешь 2/3 стоимости груза. С охраной: заплати 1/3 и едешь безопасно.",raidResult.style.color="#d7263d"):(raidResult.textContent="Чисто — проезжай.",raidResult.style.color="green")}));
render();
