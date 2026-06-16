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

let projects = get("projects");

const pModal = document.getElementById("project-modal");
const pName = document.getElementById("p-name");
const pProgress = document.getElementById("p-progress");
const pSupervisor = document.getElementById("p-supervisor");
const pBuildStatus = document.getElementById("p-build-status");
const pAdjustment = document.getElementById("p-adjustment");
const pDescription = document.getElementById("p-description");

/* auto resize textarea */
pDescription.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
});

/* open / close modal */
document.getElementById("open-project").onclick = () =>
    pModal.style.display = "flex";

document.getElementById("close-project").onclick = () =>
    pModal.style.display = "none";

/* ADD / UPDATE PROJECT */
let editProjectIndex = null;

document.getElementById("add-project").onclick = () => {

    if (!pName.value.trim()) {
        alert("نام پروژه الزامی است");
        return;
    }

    const data = {
        name: pName.value.trim(),
        supervisor: pSupervisor.value.trim(),
        progress: pProgress.value,
        buildStatus: pBuildStatus.value.trim(),
        adjustment: pAdjustment.value.trim(),
        description: pDescription.value.trim()
    };

    if (editProjectIndex === null) {
        projects.push(data);
    } else {
        projects[editProjectIndex] = data;
        editProjectIndex = null;
    }

    set("projects", projects);
    renderProjects();

    clearProjectForm();
    pModal.style.display = "none";
};

function clearProjectForm() {
    pName.value = "";
    pSupervisor.value = "";
    pProgress.value = "";
    pBuildStatus.value = "";
    pAdjustment.value = "";
    pDescription.value = "";
}

/* RENDER */
function renderProjects() {
    const list = document.getElementById("projects-list");
    list.innerHTML = "";

    projects.forEach((p, i) => {
        list.innerHTML += `
        <div class="item">

            <b>🏗 ${p.name}</b><br>

            ${p.supervisor ? `👷 سرپرست: ${p.supervisor}<br>` : ""}
            ${p.progress ? `📈 پیشرفت: ${p.progress}%<br>` : ""}
            ${p.buildStatus ? `🏢 ساخت: ${p.buildStatus}<br>` : ""}
            ${p.adjustment ? `💰 تعدیل: ${p.adjustment}<br>` : ""}
            ${p.description ? `📝 ${p.description}<br>` : ""}

            <button class="del-btn" onclick="editProject(${i})">✏️ اصلاح</button>
            <button class="del-btn" onclick="deleteProject(${i})">🗑 حذف</button>

        </div>`;
    });

    update();
}

/* EDIT */
window.editProject = function (i) {
    const p = projects[i];

    pName.value = p.name || "";
    pSupervisor.value = p.supervisor || "";
    pProgress.value = p.progress || "";
    pBuildStatus.value = p.buildStatus || "";
    pAdjustment.value = p.adjustment || "";
    pDescription.value = p.description || "";

    editProjectIndex = i;
    pModal.style.display = "flex";
};

/* DELETE */
window.deleteProject = function (i) {
    if (confirm("حذف پروژه؟")) {
        projects.splice(i, 1);
        set("projects", projects);
        renderProjects();
    }
};
/* mission*/
let missions = get("missions");

const mModal = document.getElementById("mission-modal");
const mName = document.getElementById("m-name");
const mManager = document.getElementById("m-manager");
const mStatus = document.getElementById("m-status");

/* open / close */
document.getElementById("open-mission").onclick = () =>
    mModal.style.display = "flex";

document.getElementById("close-mission").onclick = () =>
    mModal.style.display = "none";

/* ADD / UPDATE */
let editMissionIndex = null;

document.getElementById("add-mission").onclick = () => {

    if (!mName.value.trim()) {
        alert("نام ماموریت الزامی است");
        return;
    }

    const data = {
        name: mName.value.trim(),
        manager: mManager.value.trim(),
        status: mStatus.value.trim()
    };

    if (editMissionIndex === null) {
        missions.push(data);
    } else {
        missions[editMissionIndex] = data;
        editMissionIndex = null;
    }

    set("missions", missions);
    renderMissions();

    clearMissionForm();
    mModal.style.display = "none";
};

function clearMissionForm() {
    mName.value = "";
    mManager.value = "";
    mStatus.value = "";
}

/* RENDER */
function renderMissions() {
    const list = document.getElementById("missions-list");
    list.innerHTML = "";

    missions.forEach((m, i) => {
        list.innerHTML += `
        <div class="item">

            <b>📋 ${m.name}</b><br>

            ${m.manager ? `👤 مسئول: ${m.manager}<br>` : ""}
            ${m.status ? `📌 وضعیت: ${m.status}<br>` : ""}

            <button class="del-btn" onclick="editMission(${i})">✏️ اصلاح</button>
            <button class="del-btn" onclick="deleteMission(${i})">🗑 حذف</button>

        </div>`;
    });

    update();
}

/* EDIT */
window.editMission = function (i) {
    const m = missions[i];

    mName.value = m.name || "";
    mManager.value = m.manager || "";
    mStatus.value = m.status || "";

    editMissionIndex = i;
    mModal.style.display = "flex";
};

/* DELETE */
window.deleteMission = function (i) {
    if (confirm("حذف ماموریت؟")) {
        missions.splice(i, 1);
        set("missions", missions);
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

