/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE1ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE0";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= STATE ================= */
let currentUser = null;
let userRole = "user";

/* ================= DOM ELEMENTS ================= */
let loginUI, loginBtn, signupBtn, emailInput, passInput;
let pName, pSupervisor, pProgress, pBuildStatus, pAdjustment, pDescription;
let mName, mManager, mStatus;

/* ================= PROJECTS ================= */
let projects = [];

/* ================= MISSIONS ================= */
let missions = [];

/* ================= STAFF ================= */
let staff = [
    { name: "سید طاهر", lastname: "علوی", phone: "0912" }
];

/* ================= INIT DOM ================= */
function initDOM() {
    loginUI = document.getElementById("login-ui");
    loginBtn = document.getElementById("loginBtn");
    signupBtn = document.getElementById("signupBtn");
    emailInput = document.getElementById("email");
    passInput = document.getElementById("password");

    pName = document.getElementById("p-name");
    pSupervisor = document.getElementById("p-supervisor");
    pProgress = document.getElementById("p-progress");
    pBuildStatus = document.getElementById("p-build-status");
    pAdjustment = document.getElementById("p-adjustment");
    pDescription = document.getElementById("p-description");

    mName = document.getElementById("m-name");
    mManager = document.getElementById("m-manager");
    mStatus = document.getElementById("m-status");
}

/* ================= SESSION ================= */
async function checkSession() {
    const { data } = await client.auth.getSession();

    if (!data.session?.user) {
        showLogin();
        return;
    }

    currentUser = data.session.user;
    await loadUserRole();
    startApp();
}

function showLogin() {
    if (loginUI) loginUI.style.display = "flex";
}

/* ================= ROLE ================= */
async function loadUserRole() {
    try {
        const { data, error } = await client
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .maybeSingle();

        if (error) {
            console.warn("profiles error:", error.message);
            userRole = "user";
            return;
        }

        userRole = data?.role || "user";
    } catch (e) {
        console.warn("loadUserRole exception:", e);
        userRole = "user";
    }
}

/* ================= LOGIN ================= */
async function login() {
    const email = emailInput.value.trim();
    const password = passInput.value;

    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error) return alert(error.message);

    currentUser = data.user;
    await loadUserRole();
    startApp();
}

/* ================= SIGNUP ================= */
async function signup() {
    const email = emailInput.value.trim();
    const password = passInput.value;

    const { error } = await client.auth.signUp({ email, password });

    if (error) return alert(error.message);

    alert("ایمیل تایید ارسال شد");
}

/* ================= START APP ================= */
function startApp() {
    if (loginUI) loginUI.style.display = "none";

    loadProjects();
    loadMissions();
    renderStaff();
    update();
}

/* ================= EVENTS ================= */
function bindEvents() {
    loginBtn?.addEventListener("click", login);
    signupBtn?.addEventListener("click", signup);

    document.getElementById("add-project")?.addEventListener("click", async () => {
        const name = pName.value.trim();
        if (!name) return alert("نام پروژه لازم است");

        const { error } = await client.from("projects").insert([{
            name,
            supervisor: pSupervisor.value,
            progress: pProgress.value,
            buildStatus: pBuildStatus.value,
            adjustment: pAdjustment.value,
            description: pDescription.value,
            owner_id: currentUser.id
        }]);

        if (error) return alert(error.message);

        loadProjects();
    });

    document.getElementById("add-mission")?.addEventListener("click", async () => {
        const name = mName.value.trim();
        if (!name) return alert("نام ماموریت لازم است");

        const { error } = await client.from("missions").insert([{
            name,
            manager: mManager.value,
            status: mStatus.value,
            owner_id: currentUser.id
        }]);

        if (error) return alert(error.message);

        loadMissions();
    });
}

/* ================= LOAD PROJECTS ================= */
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

function renderProjects() {
    const list = document.getElementById("projects-list");
    list.innerHTML = "";

    projects.forEach(p => {
        list.innerHTML += `
        <div class="item">
            <b>${p.name}</b><br>
            ${p.supervisor || ""}<br>
            ${p.progress || ""}%
            <button class="del-btn" onclick="deleteProject('${p.id}')">حذف</button>
        </div>`;
    });

    update();
}

window.deleteProject = async (id) => {
    await client.from("projects").delete().eq("id", id);
    loadProjects();
};

/* ================= LOAD MISSIONS ================= */
async function loadMissions() {
    if (!currentUser) return;

    const { data } = await client
        .from("missions")
        .select("*")
        .eq("owner_id", currentUser.id);

    missions = data || [];
    renderMissions();
}

function renderMissions() {
    const list = document.getElementById("missions-list");
    list.innerHTML = "";

    missions.forEach(m => {
        list.innerHTML += `
        <div class="item">
            <b>${m.name}</b><br>
            ${m.status || ""}
            <button class="del-btn" onclick="deleteMission('${m.id}')">حذف</button>
        </div>`;
    });

    update();
}

window.deleteMission = async (id) => {
    await client.from("missions").delete().eq("id", id);
    loadMissions();
};

/* ================= STAFF ================= */
function renderStaff() {
    const list = document.getElementById("staff-list");
    list.innerHTML = "";

    staff.forEach(s => {
        list.innerHTML += `
        <div class="staff-card">
            <b>${s.name} ${s.lastname}</b>
            <small>${s.phone}</small>
        </div>`;
    });

    update();
}

/* ================= DASH ================= */
function update() {
    document.getElementById("projects-count").textContent = projects.length;
    document.getElementById("missions-count").textContent = missions.length;
    document.getElementById("staff-count").textContent = staff.length;
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", async () => {
    initDOM();
    bindEvents();
    await checkSession();
});
