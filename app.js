/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= AUTH STATE ================= */
let currentUser = null;

/* ================= LOGIN UI ================= */
const loginUI = document.createElement("div");
loginUI.id = "login-ui";
loginUI.style = `
position:fixed;inset:0;
display:flex;flex-direction:column;
justify-content:center;align-items:center;
background:#0b1220;z-index:99999;gap:10px;
`;

loginUI.innerHTML = `
<h2>ورود</h2>
<input id="email" placeholder="ایمیل" style="padding:10px">
<input id="password" type="password" placeholder="رمز" style="padding:10px">
<button id="loginBtn">ورود</button>
<button id="signupBtn">ثبت نام</button>
`;

document.body.appendChild(loginUI);

/* ================= SESSION CHECK ================= */
async function checkSession() {
    const { data } = await client.auth.getSession();

    if (data.session?.user) {
        currentUser = data.session.user;
        startApp();
    } else {
        showLogin();
    }
}

function showLogin() {
    loginUI.style.display = "flex";
}

/* ================= LOGIN ================= */
document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) return alert(error.message);

    currentUser = data.user;
    startApp();
};

/* ================= SIGNUP ================= */
document.getElementById("signupBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await client.auth.signUp({
        email,
        password
    });

    if (error) return alert(error.message);

    alert("ثبت شد، حالا وارد شو");
};

/* ================= START APP ================= */
function startApp() {
    if (!currentUser) return;

    loginUI.style.display = "none";

    loadProjects();
    loadMissions();
    renderStaff();
    update();
}

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

document.getElementById("open-project").onclick = () =>
    pModal.style.display = "flex";

document.getElementById("close-project").onclick = () =>
    pModal.style.display = "none";

/* ADD / UPDATE */
document.getElementById("add-project").onclick = async () => {

    if (!currentUser) return alert("ابتدا وارد شوید");
    if (!pName.value.trim()) return alert("نام پروژه الزامی است");

    const data = {
        name: pName.value.trim(),
        supervisor: pSupervisor.value.trim(),
        progress: pProgress.value,
        buildStatus: pBuildStatus.value.trim(),
        adjustment: pAdjustment.value.trim(),
        description: pDescription.value.trim(),
        owner_id: currentUser.id
    };

    let result;

    if (editProjectIndex === null) {
        result = await client.from("projects").insert([data]).select();
    } else {
        const id = projects[editProjectIndex].id;
        result = await client.from("projects").update(data).eq("id", id).select();
        editProjectIndex = null;
    }

    if (result.error) return alert(result.error.message);

    clearProjectForm();
    loadProjects();
    pModal.style.display = "none";
};

/* LOAD PROJECTS (USER ONLY) */
async function loadProjects() {
    if (!currentUser) return;

    const { data } = await client
        .from("projects")
        .select("*")
        .eq("owner_id", currentUser.id)
        .order("created_at", { ascending: false });

    projects = data || [];
    renderProjects();
}

/* RENDER PROJECTS */
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
    if (!currentUser) return;

    await client.from("projects").delete().eq("id", id);
    loadProjects();
};

/* ================= MISSIONS ================= */
let missions = [];
let editMissionIndex = null;

const mModal = document.getElementById("mission-modal");
const mName = document.getElementById("m-name");
const mManager = document.getElementById("m-manager");
const mStatus = document.getElementById("m-status");

document.getElementById("open-mission").onclick = () =>
    mModal.style.display = "flex";

document.getElementById("close-mission").onclick = () =>
    mModal.style.display = "none";

/* ADD */
document.getElementById("add-mission").onclick = async () => {

    if (!currentUser) return alert("ابتدا وارد شوید");
    if (!mName.value.trim()) return alert("نام ماموریت الزامی است");

    const data = {
        name: mName.value.trim(),
        manager: mManager.value.trim(),
        status: mStatus.value.trim(),
        owner_id: currentUser.id
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

/* LOAD MISSIONS */
function loadMissions() {
    if (!currentUser) return;

    client.from("missions")
        .select("*")
        .eq("owner_id", currentUser.id)
        .then(({ data }) => {
            missions = data || [];
            renderMissions();
        });
}

/* RENDER MISSIONS */
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

/* EDIT / DELETE */
window.editMission = function (i) {
    const m = missions[i];
    mName.value = m.name || "";
    mManager.value = m.manager || "";
    mStatus.value = m.status || "";

    editMissionIndex = i;
    mModal.style.display = "flex";
};

window.deleteMission = async function (id) {
    await client.from("missions").delete().eq("id", id);
    loadMissions();
};

/* ================= STAFF ================= */
let staff = [
    {name:"سید طاهر", lastname:"علوی", phone:"09121192271"},
    {name:"اکبر", lastname:"کندی", phone:"09121044458"},
];

function renderStaff(){
    const list=document.getElementById("staff-list");
    list.innerHTML="";

    staff.forEach(s=>{
        list.innerHTML+=`
        <div class="staff-card">
            <b>${s.name} ${s.lastname}</b>
            <small>${s.phone}</small>
            <a class="call-btn" href="tel:${s.phone}">تماس</a>
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

/* ================= UTIL ================= */
function clearProjectForm(){
    pName.value = "";
    pSupervisor.value = "";
    pProgress.value = "";
    pBuildStatus.value = "";
    pAdjustment.value = "";
    pDescription.value = "";
}

function clearMissionForm(){
    mName.value = "";
    mManager.value = "";
    mStatus.value = "";
}

/* ================= INIT ================= */
checkSession();

/* ================= CLOCK ================= */
setInterval(() => {
    const now = new Date();

    document.getElementById("live-time").textContent =
        now.toLocaleTimeString("fa-IR", { timeZone: "Asia/Tehran" });

    document.getElementById("live-date").textContent =
        now.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" });

    document.getElementById("live-status").textContent =
        navigator.onLine ? "🟢 آنلاین" : "🔴 آفلاین";
}, 1000);
