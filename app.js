/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE1ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE0";
const client = supabase.createClient(supabaseUrl, supabaseKey);
/* ================= AUTH UI (بدون تغییر ظاهر اصلی) ================= */
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

/* ================= APP STATE ================= */
let currentUser = null;

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
    initApp();
};

document.getElementById("signupBtn").onclick = async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await client.auth.signUp({
        email,
        password
    });

    if (error) return alert(error.message);

    alert("ثبت نام شد، حالا وارد شو");
};

/* ================= INIT SESSION ================= */
async function checkSession() {
    const { data } = await client.auth.getSession();

    if (data.session) {
        currentUser = data.session.user;
        initApp();
    }
}

checkSession();

/* ================= START APP ================= */
function initApp() {
    loginUI.style.display = "none";
    document.getElementById("dashboard-page").style.display = "block";

    loadProjects();
    loadMissions();
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

    if (editProjectIndex === null) {
        await client.from("projects").insert([data]);
    } else {
        const id = projects[editProjectIndex].id;
        await client.from("projects").update(data).eq("id", id);
        editProjectIndex = null;
    }

    clearProjectForm();
    loadProjects();
    pModal.style.display = "none";
};

/* LOAD (فقط مال این کاربر) */
async function loadProjects() {
    let { data } = await client
        .from("projects")
        .select("*")
        .eq("owner_id", currentUser.id)
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

window.deleteProject = async function (id) {
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

document.getElementById("add-mission").onclick = async () => {

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

function loadMissions() {
    client.from("missions")
        .select("*")
        .eq("owner_id", currentUser.id)
        .then(({ data }) => {
            missions = data || [];
            renderMissions();
        });
}

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

/* ================= INIT ================= */
renderStaff();

/* ================= CLEAR ================= */
function clearProjectForm(){
    pName.value="";
    pSupervisor.value="";
    pProgress.value="";
    pBuildStatus.value="";
    pAdjustment.value="";
    pDescription.value="";
}

function clearMissionForm(){
    mName.value="";
    mManager.value="";
    mStatus.value="";
}
