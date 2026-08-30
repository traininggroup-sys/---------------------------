/* ================== DATA ================== */
const TASKS = ["مذاكرة/مشاهدة", "حل الاستفتاءات", "حل الاختبار بوقت"];
const DUAS = [
  { icon: "📚", text: "اللهم علّمني ما ينفعني وانفعني بما علّمتني وزدني علمًا" },
  { icon: "🌟", text: "اللهم افتح لي أبواب حكمتك وانشر عليّ رحمتك" },
  { icon: "✨", text: "اللهم اجعل هذا العلم حجة لي لا عليّ" },
  { icon: "💖", text: "اللهم صلِّ وسلم على نبينا محمد" },
  { icon: "🕊️", text: "اللهم ارزقني الفهم السليم والحفظ القوي" },
];

const moduleData = {
  "📘 معلومات عامة": { type: "models", count: 22, icon: "fa-lightbulb" },
  "💻 حاسب": { type: "list", icon: "fa-computer", items: [
      { title: "فيديو رقم 1", url: "https://youtu.be/aTGmvmeDJf8" },
      { title: "فيديو رقم 2", url: "https://youtu.be/9tye0LUQfYI" },
      { title: "فيديو رقم 3", url: "https://youtu.be/N3Z5p65om0o" },
      // أكملي بقية الفيديوهات حسب الحاجة
  ]},
  "🗣️ انجليزي": { type: "models", count: 16, icon: "fa-language" },
  "📙 عربي": { type: "models", count: 17, icon: "fa-book" },
};

/* ================== STATE ================== */
let username = "", userKey = "", userData = {}, completedSections = {}, selectedSection = "";

/* ================== FIREBASE ================== */
const firebaseConfig = {
  apiKey: "AIzaSyD8OVH4XP4AOCCRcEjp-BWLXuIBDzEbdcU",
  authDomain: "motivationapp-a3890.firebaseapp.com",
  databaseURL: "https://motivationapp-a3890-default-rtdb.firebaseio.com",
  projectId: "motivationapp-a3890",
  storageBucket: "motivationapp-a3890.appspot.com",
  messagingSenderId: "231712261826",
  appId: "1:231712261826:web:6285e51747ca8bb6b21d5b",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ================== HELPERS ================== */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => page.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
}

function saveUserData() {
  if (!username) return;
  localStorage.setItem(userKey, JSON.stringify(userData));
  localStorage.setItem(`${userKey}_completedSections`, JSON.stringify(completedSections));
  updateLeaderboardSnapshot();
}

function computeOverallProgress() {
  let grandTotal = 0, done = 0;
  for (const section in moduleData) {
    const md = moduleData[section];
    const items = md.type === "models" ? md.count : md.items.length;
    grandTotal += items * TASKS.length;
    for (const k in userData) if (userData[k] && k.startsWith(section + "_")) done++;
  }
  return { done, grandTotal, pct: grandTotal ? Math.round((done / grandTotal) * 100) : 0 };
}

function updateLeaderboardSnapshot() {
  if (!username) return;
  const { done, grandTotal, pct } = computeOverallProgress();
  db.ref("users/" + username).set({ name: username, done, total: grandTotal, pct, updatedAt: new Date().toISOString() });
}

/* ================== LEADERBOARD ================== */
function renderLeaderboard() {
  db.ref("users").once("value", snapshot => {
    const users = snapshot.val() || {};
    const tbody = document.getElementById("lbBody");
    tbody.innerHTML = "";
    Object.values(users).sort((a,b) => b.pct - a.pct).forEach((r,i) => {
      const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"—";
      const badge = r.pct>=90?"🎖️ بطل متفوّق":r.pct>=70?"⭐ متقدم":r.pct>=40?"💪 مثابر":"🚀 بداية قوية";
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${medal}</td><td>${r.name}</td><td><strong>${r.pct}%</strong> (${r.done}/${r.total})</td><td>${badge}</td><td>${new Date(r.updatedAt).toLocaleString("ar-EG")}</td>`;
      tbody.appendChild(tr);
    });
  });
}

/* ================== BOOTSTRAP ================== */
function bootstrap() {
  const saved = localStorage.getItem("savedName");
  if (saved) {
    username = saved;
    userKey = `centralUser_${username}`;
    userData = JSON.parse(localStorage.getItem(userKey) || "{}");
    completedSections = JSON.parse(localStorage.getItem(`${userKey}_completedSections`) || "{}");
    document.getElementById("nameInput").value = saved;
  }
}
bootstrap();

/* ================== EVENT LISTENERS ================== */
document.getElementById("btnStart").addEventListener("click", () => {
  const val = document.getElementById("nameInput").value.trim();
  if (!val) return alert("ادخل اسمك!");
  username = val;
  userKey = `centralUser_${username}`;
  localStorage.setItem("savedName", username);
  userData = JSON.parse(localStorage.getItem(userKey) || "{}");
  completedSections = JSON.parse(localStorage.getItem(`${userKey}_completedSections`) || "{}");
  showPage("screen-modules");
  renderModules();
});

document.getElementById("btnBackToStart").addEventListener("click", () => showPage("screen-start"));
document.getElementById("btnGoLB").addEventListener("click", () => { showPage("screen-lb"); renderLeaderboard(); });
document.getElementById("btnLeaderboard1").addEventListener("click", () => { showPage("screen-lb"); renderLeaderboard(); });
document.getElementById("btnLeaderboard2").addEventListener("click", () => { showPage("screen-lb"); renderLeaderboard(); });
document.getElementById("btnLBBackStart").addEventListener("click", () => showPage("screen-start"));
document.getElementById("btnLBBackModules").addEventListener("click", () => showPage("screen-modules"));
document.getElementById("btnBackToModules").addEventListener("click", () => showPage("screen-modules"));

/* ================== MODULES ================== */
function renderModules() {
  const container = document.getElementById("modules-container");
  container.innerHTML = "";
  for (const [key, val] of Object.entries(moduleData)) {
    const btn = document.createElement("div");
    btn.className = "module-button" + (completedSections[key] ? " done" : "");
    btn.innerHTML = `<i class="fa ${val.icon}"></i> ${key} <span class="module-check">✔️</span>`;
    btn.addEventListener("click", () => openModule(key));
    container.appendChild(btn);
  }
}

function openModule(section) {
  selectedSection = section;
  showPage("screen-main");
  const content = document.getElementById("content");
  content.innerHTML = "";
  content.classList.remove("invisible");
  const md = moduleData[section];

  if (md.type === "models") {
    for (let i=1;i<=md.count;i++){
      const div = document.createElement("div");
      div.className="model-title";
      div.textContent=`نموذج ${i}`;
      const taskList = document.createElement("div");
      TASKS.forEach(task=>{
        const tdiv = document.createElement("div");
        tdiv.className="task";
        tdiv.innerHTML=`<span>${task}</span><input type="checkbox" data-key="${section}_${i}_${task}"/>`;
        taskList.appendChild(tdiv);
      });
      div.appendChild(taskList);
      content.appendChild(div);
    }
  } else if (md.type==="list") {
    md.items.forEach((item,i)=>{
      const div=document.createElement("div");
      div.className="model-title";
      div.innerHTML=`<span>${item.title}</span> <a href="${item.url}" target="_blank" class="open-btn">شاهد</a>`;
      const taskList=document.createElement("div");
      TASKS.forEach(task=>{
        const tdiv=document.createElement("div");
        tdiv.className="task";
        tdiv.innerHTML=`<span>${task}</span><input type="checkbox" data-key="${section}_${i}_${task}"/>`;
        taskList.appendChild(tdiv);
      });
      div.appendChild(taskList);
      content.appendChild(div);
    });
  }

  content.querySelectorAll("input[type=checkbox]").forEach(cb=>{
    const k=cb.dataset.key;
    if(userData[k]) { cb.checked=true; cb.parentElement.classList.add("completed"); }
    cb.addEventListener("change", ()=>{
      userData[k]=cb.checked;
      if(cb.checked) cb.parentElement.classList.add("completed"); 
      else cb.parentElement.classList.remove("completed");
      updateProgress();
      saveUserData();
    });
  });

  updateProgress();
}

/* ================== PROGRESS + CELEBRATION ================== */
function updateProgress() {
  const md = moduleData[selectedSection];
  const total = md.type==="models"?md.count*TASKS.length:md.items.length*TASKS.length;
  let done=0;
  for(const k in userData) if(k.startsWith(selectedSection+"_") && userData[k]) done++;
  const pct = total ? Math.round((done/total)*100) : 0;
  document.getElementById("progress-count").textContent=`${done} / ${total}`;
  const bar=document.getElementById("progress-bar");
  bar.style.width=`${pct}%`;
  bar.textContent=`${pct}%`;
  const motiv=document.getElementById("motivator");
  motiv.textContent=DUAS[Math.floor(Math.random()*DUAS.length)].text;

  if(done===total && !completedSections[selectedSection]){
    completedSections[selectedSection]=true;
    showCelebration(`🎉 تم إنهاء محور ${selectedSection}!`);
  } else if(done<total) delete completedSections[selectedSection];

  saveUserData();
}

/* ================== CELEBRATION BANNER + CONFETTI ================== */
function showCelebration(text){
  const banner=document.querySelector(".celebrate-banner");
  if(!banner) return;
  banner.innerText=text;
  banner.classList.add("show");
  createConfetti();
  setTimeout(()=>banner.classList.remove("show"),2500);
}

function createConfetti(){
  const colors=['#FF0A54','#FF477E','#FF7096','#FF85A1','#FBB1B1','#FAE0E4','#00C0FF','#0BB4D8','#22C55E','#FFD700'];
  const confettiCount=25;
  for(let i=0;i<confettiCount;i++){
    const conf=document.createElement('div');
    conf.classList.add('confetti');
    conf.style.color=colors[Math.floor(Math.random()*colors.length)];
    conf.style.left=Math.random()*100+'vw';
    conf.style.fontSize=(10+Math.random()*20)+'px';
    conf.innerText='🎉';
    document.body.appendChild(conf);
    conf.style.animationDuration=(1+Math.random()*2)+'s';
    conf.style.animationDelay=Math.random()*0.5+'s';
    setTimeout(()=>conf.remove(),2500);
  }
}
