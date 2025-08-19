type Mode = "ALL2"|"ONE_CHEAP"|"ONE_EXP"|"CHEAP_EXP";

const GOODS = ["Зерно","Соль","Шерсть","Скот","Бронза","Древесина"];
const CITIES = ["Портовый","Горная крепость","Лесная деревня","Оазис"] as const;

interface CityState {
  mode: Mode;
  cheap?: number[]; // индексы товаров со значением 1
  exp?: number[];   // индексы товаров со значением 3
}

const weights: Record<Mode, number> = {
  // A×3, B×2, C×2, D×1
  ALL2: 3,       // чаще всего — всё по 2
  ONE_CHEAP: 2,  // иногда — один товар = 1
  ONE_EXP: 2,    // иногда — один товар = 3
  CHEAP_EXP: 1   // редко — один 1 и один 3
};

const boardEl = document.getElementById("board")!;
const btnUpdate = document.getElementById("btnUpdate") as HTMLButtonElement;
const btnRaid = document.getElementById("btnRaid") as HTMLButtonElement;
const raidResult = document.getElementById("raidResult")!;

const cityStates: CityState[] = CITIES.map(()=>({mode:"ALL2"}));

function randInt(max: number){ return Math.floor(Math.random()*max); }
function sampleDistinct(n: number, k: number): number[]{
  const arr = Array.from({length:n},(_,i)=>i);
  for(let i=n-1;i>0;i--){
    const j = randInt(i+1);
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
  return arr.slice(0,k);
}
function weightedPick<T extends string>(map: Record<T,number>): T{
  const entries = Object.entries(map) as [T,number][];
  const total = entries.reduce((s, [,w])=>s+w, 0);
  let r = Math.random()*total;
  for(const [k,w] of entries){
    if((r-=w) <= 0) return k;
  }
  return entries[entries.length-1][0];
}

function newState(mode: Mode): CityState{
  if(mode==="ALL2") return {mode};
  if(mode==="ONE_CHEAP"){
    return {mode, cheap:[randInt(GOODS.length)]};
  }
  if(mode==="ONE_EXP"){
    return {mode, exp:[randInt(GOODS.length)]};
  }
  // CHEAP_EXP
  const [i,j] = sampleDistinct(GOODS.length,2);
  return {mode, cheap:[i], exp:[j]};
}

function updateTwoCities(){
  const toUpdate = sampleDistinct(CITIES.length, 2);
  for(const idx of toUpdate){
    const mode = weightedPick(weights);
    cityStates[idx] = newState(mode);
  }
  render();
}

function render(){
  // первичный рендер карточек городов
  if(!boardEl.childElementCount){
    CITIES.forEach((name, idx)=>{
      const el = document.createElement("section");
      el.className = "city";
      el.id = `city-${idx}`;
      el.innerHTML = `
        <h2>${name} <span class="badge" id="badge-${idx}">все = 2</span></h2>
        <div class="row" id="row-${idx}"></div>
        <div class="note" id="note-${idx}"></div>
      `;
      boardEl.appendChild(el);
    });
  }
  // обновляем содержимое
  cityStates.forEach((st, idx)=>{
    const row = document.getElementById(`row-${idx}`)!;
    row.innerHTML = "";

    const badge = document.getElementById(`badge-${idx}`)!;
    const note = document.getElementById(`note-${idx}`)!;

    let label = "все = 2";
    const cheapSet = new Set(st.cheap ?? []);
    const expSet   = new Set(st.exp   ?? []);

    GOODS.forEach((g, i)=>{
      let cls = "token";
      let val = "2";
      if(cheapSet.has(i)){ cls += " cheap"; val = "1"; }
      else if(expSet.has(i)){ cls += " exp"; val = "3"; }

      const t = document.createElement("div");
      t.className = cls;
      t.textContent = g + " ";
      const sp = document.createElement("span");
      sp.className = "val"; sp.textContent = val;
      t.appendChild(sp);
      row.appendChild(t);
    });

    switch(st.mode){
      case "ALL2": label = "все = 2"; note.textContent = "—"; break;
      case "ONE_CHEAP": label = "есть 1× дешёвый (1)"; note.textContent = ""; break;
      case "ONE_EXP":   label = "есть 1× дорогой (3)";  note.textContent = ""; break;
      case "CHEAP_EXP": label = "1× дешёвый (1) и 1× дорогой (3)"; note.textContent=""; break;
    }
    badge.textContent = label;
  });
}

btnUpdate.addEventListener("click", updateTwoCities);

btnRaid.addEventListener("click", ()=>{
  const hit = Math.random() < 0.5;
  if(hit){
    raidResult.textContent = "Засада! Без охраны: потеряешь 2/3 стоимости груза. С охраной: заплати 1/3 и едешь безопасно.";
    raidResult.style.color = "#d7263d";
  }else{
    raidResult.textContent = "Чисто — проезжай.";
    raidResult.style.color = "green";
  }
});

// начальный рендер
render();
