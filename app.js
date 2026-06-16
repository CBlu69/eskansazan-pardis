/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE1ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE01ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE0";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= SPLASH ================= */
window.addEventListener("load", () => {
    setTimeout(() => {
        const s = document.getElementById("splash");
        if (s) s.style.display = "none";
    }, 1200);
});

/* ================= NAV ================= */
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

/* ================= PROJECTS ================= */
let projects = [];
let editProjectIndex = null;

const pModal = document.getElementById("project-modal");
const pName = document.getElementById("p-name");
const pProgress = document.getElementById("p-progress");
const pSupervisor = document.getElementById("p-supervisor");
const pBuildStatus = document.getElementById("p-build-status");
const pAdjustment = document.getElementById("p-adjustment");
const pDescription = document.getElementById("p-description");

/* modal */
document.getElementById("open-project").onclick = () =>
    pModal.style.display = "flex";

document.getElementById("close-project").onclick = () =>
    pModal.style.display = "none";

/* ADD / UPDATE */
document.getElementById("add-project").onclick = async () => {

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

    let result;

    if (editProjectIndex === null) {
        result = await client.from("projects").insert([data]).select();
    } else {
        const id = projects[editProjectIndex].id;
        result = await client.from("projects").update(data).eq("id", id).select();
        editProjectIndex = null;
    }

    console.log("SUPABASE RESULT:", result);

    if (result.error) {
        alert("خطا: " + result.error.message);
        return;
    }

    clearProjectForm();
    loadProjects();
    pModal.style.display = "none";
};

/* LOAD */
async function loadProjects() {
    let { data } = await client
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

    projects = data || [];
    renderProjects();
}

/* RENDER */
function renderProjects() {
    const list = document.getElementById("projects-list");
    list.innerHTML = "";

    projects.forEach((p, i) => {
        list.innerHTML += `
        <div class="item">

            <b>🏗 ${p.name}</b><br>

            ${p.supervisor ? `👷 ${p.supervisor}<br>` : ""}
            ${p.progress ? `📈 ${p.progress}%<br>` : ""}
            ${p.buildStatus ? `🏢 ${p.buildStatus}<br>` : ""}
            ${p.adjustment ? `💰 ${p.adjustment}<br>` : ""}
            ${p.description ? `📝 ${p.description}<br>` : ""}

            <button class="del-btn" onclick="editProject(${i})">✏️ اصلاح</button>
            <button class="del-btn" onclick="deleteProject('${p.id}')">🗑 حذف</button>

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
window.deleteProject = async function (id) {
    if (confirm("حذف پروژه؟")) {
        await client.from("projects").delete().eq("id", id);
        loadProjects();
    }
};

/* ================= MISSIONS ================= */
let missions = [];
let editMissionIndex = null;

const mModal = document.getElementById("mission-modal");
const mName = document.getElementById("m-name");
const mManager = document.getElementById("m-manager");
const mStatus = document.getElementById("m-status");

/* modal */
document.getElementById("open-mission").onclick = () =>
    mModal.style.display = "flex";

document.getElementById("close-mission").onclick = () =>
    mModal.style.display = "none";

/* ADD / UPDATE */
document.getElementById("add-mission").onclick = async () => {

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
        await client.from("missions").insert([data]);
    } else {
        const id = missions[editMissionIndex].id;
        await client.from("missions").update(data).eq("id", id);
        editMissionIndex = null;
    }

    clearMissionForm();
    loadMissions();
    mModal.style.display = "none";
};

function clearMissionForm() {
    mName.value = "";
    mManager.value = "";
    mStatus.value = "";
}

/* LOAD */
async function loadMissions() {
    let { data } = await client
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

    missions = data || [];
    renderMissions();
}

/* RENDER */
function renderMissions() {
    const list = document.getElementById("missions-list");
    list.innerHTML = "";

    missions.forEach((m, i) => {
        list.innerHTML += `
        <div class="item">

            <b>📋 ${m.name}</b><br>

            ${m.manager ? `👤 ${m.manager}<br>` : ""}
            ${m.status ? `📌 ${m.status}<br>` : ""}

            <button class="del-btn" onclick="editMission(${i})">✏️ اصلاح</button>
            <button class="del-btn" onclick="deleteMission('${m.id}')">🗑 حذف</button>

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
window.deleteMission = async function (id) {
    if (confirm("حذف ماموریت؟")) {
        await client.from("missions").delete().eq("id", id);
        loadMissions();
    }
};

/* ================= STAFF (STATIC) ================= */
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

/* ================= DASH ================= */
function update(){
    document.getElementById("projects-count").textContent = projects.length;
    document.getElementById("missions-count").textContent = missions.length;
    document.getElementById("staff-count").textContent = staff.length;
}

/* ================= INIT ================= */
renderStaff();
loadProjects();
loadMissions();
update();

/* ================= SW ================= */
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}

/* ================= CLOCK ================= */
function updateClock() {
    const now = new Date();

    document.getElementById("live-time").textContent =
        now.toLocaleTimeString("fa-IR", { timeZone: "Asia/Tehran" });

    document.getElementById("live-date").textContent =
        now.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" });

    document.getElementById("live-status").textContent =
        navigator.onLine ? "🟢 آنلاین" : "🔴 آفلاین";
}

updateClock();
setInterval(updateClock, 1000);
window.addEventListener("online", updateClock);
window.addEventListener("offline", updateClock);
