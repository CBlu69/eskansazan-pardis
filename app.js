/* SPLASH */
window.addEventListener("load", () => {
    setTimeout(() => { 
        const s = document.getElementById("splash");
        if (s) s.style.display = "none";
    }, 1200);
});

/* NAV */
const pages = document.querySelectorAll(".page");
const nav = document.querySelectorAll(".bottom-nav button");

nav.forEach(b => {
    b.onclick = () => {
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(b.dataset.page).classList.add("active");

        nav.forEach(x => x.classList.remove("active"));
        b.classList.add("active");
    };
});

/* STORAGE */
const get = k => JSON.parse(localStorage.getItem(k) || "[]");
const set = (k,v)=>localStorage.setItem(k,JSON.stringify(v));

/* PROJECTS */
let projects = get("projects");

const pModal = document.getElementById("project-modal");
const pName = document.getElementById("p-name");
const pManager = document.getElementById("p-manager");
const pProgress = document.getElementById("p-progress");

document.getElementById("open-project").onclick=()=>pModal.style.display="flex";
document.getElementById("close-project").onclick=()=>pModal.style.display="none";

document.getElementById("add-project").onclick=()=>{
    if(!pName.value) return;

    projects.push({
        name:pName.value,
        manager:pManager.value,
        progress:pProgress.value
    });

    set("projects",projects);
    renderProjects();
    pModal.style.display="none";
};

function renderProjects(){
    const list=document.getElementById("projects-list");
    list.innerHTML="";

    projects.forEach((p,i)=>{
        list.innerHTML+=`
        <div class="item">
            <b>${p.name}</b><br>
            ${p.manager}<br>
            ${p.progress}%

            <button class="del-btn" onclick="deleteProject(${i})">
                حذف پروژه
            </button>
        </div>`;
    });

    update();
}

window.deleteProject=function(i){
    if(confirm("حذف پروژه؟")){
        projects.splice(i,1);
        set("projects",projects);
        renderProjects();
    }
};

/* MISSIONS (COPY PROJECTS) */
let missions = get("missions");

const mModal = document.getElementById("mission-modal");
const mName = document.getElementById("m-name");
const mManager = document.getElementById("m-manager");
const mProgress = document.getElementById("m-progress");

document.getElementById("open-mission").onclick=()=>mModal.style.display="flex";
document.getElementById("close-mission").onclick=()=>mModal.style.display="none";

document.getElementById("add-mission").onclick=()=>{
    if(!mName.value) return;

    missions.push({
        name:mName.value,
        manager:mManager.value,
        progress:mProgress.value
    });

    set("missions",missions);
    renderMissions();
    mModal.style.display="none";
};

function renderMissions(){
    const list=document.getElementById("missions-list");
    list.innerHTML="";

    missions.forEach((m,i)=>{
        list.innerHTML+=`
        <div class="item">
            <b>${m.name}</b><br>
            ${m.manager}<br>
            ${m.progress}%

            <button class="del-btn" onclick="deleteMission(${i})">
                حذف ماموریت
            </button>
        </div>`;
    });

    update();
}

window.deleteMission=function(i){
    if(confirm("حذف ماموریت؟")){
        missions.splice(i,1);
        set("missions",missions);
        renderMissions();
    }
};


/* STAFF */
let staff = [
    {name:"سید طاهر", lastname:"علوی", meli:"123", phone:"09121192271"},
    {name:"اکبر", lastname:"کندی داینی", meli:"456", phone:"09121044458"},
    {name:"علیرضا", lastname:"علوی", meli:"456", phone:"09123173681"},
    {name:"سید امین", lastname:"امینی", meli:"456", phone:"09122307045"}
];

function renderStaff(){
    const list=document.getElementById("staff-list");
    list.innerHTML="";

    staff.forEach(s=>{
        list.innerHTML+=`
        <div class="staff-card">

            <b>${s.name} ${s.lastname}</b>

            <small>کد ملی: ${s.meli}</small>
            <small>شماره: ${s.phone}</small>

            <a class="call-btn" href="tel:${s.phone}">
                📞 تماس مستقیم
            </a>

        </div>`;
    });

    update();
}

/* DASH */
function update(){
    document.getElementById("projects-count").textContent=projects.length;
    document.getElementById("missions-count").textContent=missions.length;
    document.getElementById("staff-count").textContent=staff.length;
}

/* INIT */
renderProjects();
renderMissions();
renderStaff();
update();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js")
    .then(() => console.log("SW registered"))
    .catch(err => console.log(err));
}
function updateClock() {
    const now = new Date();

    const time = now.toLocaleTimeString("fa-IR", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    const date = now.toLocaleDateString("fa-IR-u-ca-persian", {
        timeZone: "Asia/Tehran",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.getElementById("live-time").textContent = time;
    document.getElementById("live-date").textContent = date;

    document.getElementById("live-status").textContent =
        navigator.onLine ? "🟢 آنلاین" : "🔴 آفلاین";
}

updateClock();
setInterval(updateClock, 1000);

window.addEventListener("online", updateClock);
window.addEventListener("offline", updateClock);

