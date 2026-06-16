/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE1ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE0";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= STATE ================= */
let currentUser = null;
let userRole = "user";

/* ================= AUTH ELEMENTS ================= */
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");

/* ================= SESSION CHECK ================= */
async function checkSession() {
    const { data } = await client.auth.getSession();

    const session = data?.session;

    if (!session?.user) {
        document.getElementById("login-ui").style.display = "flex";
        return;
    }

    currentUser = session.user;

    document.getElementById("login-ui").style.display = "none";

    startApp();
}

/* ================= ROLE SYSTEM ================= */
async function loadUserRole() {
    const { data } = await client
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

    userRole = data?.role || "user";
}

/* ================= LOGIN ================= */
loginBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    if (error) return alert(error.message);

    currentUser = data.user;

    await loadUserRole();
    startApp();
};

/* ================= SIGNUP ================= */
signupBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passInput.value;

    const { data, error } = await client.auth.signUp({
        email,
        password
    });

    if (error) return alert(error.message);

    // ساخت پروفایل پیشفرض
    await client.from("profiles").insert([
        {
            id: data.user.id,
            role: "user"
        }
    ]);

    alert("ثبت نام شد - ایمیل را تایید کنید");
};

/* ================= START APP ================= */
function startApp() {
    document.getElementById("login-ui").style.display = "none";

    loadProjects();
    loadMissions();
    renderStaff();
    update();
}

/* ================= PROJECTS ================= */
let projects = [];

document.getElementById("add-project").onclick = async () => {

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
};

async function loadProjects() {
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

            <button onclick="deleteProject('${p.id}')">حذف</button>
        </div>`;
    });

    update();
}

window.deleteProject = async (id) => {
    await client.from("projects").delete().eq("id", id);
    loadProjects();
};

/* ================= MISSIONS ================= */
let missions = [];

document.getElementById("add-mission").onclick = async () => {

    const name = mName.value.trim();
    if (!name) return alert("نام ماموریت لازم است");

    await client.from("missions").insert([{
        name,
        manager: mManager.value,
        status: mStatus.value,
        owner_id: currentUser.id
    }]);

    loadMissions();
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

    missions.forEach(m => {
        list.innerHTML += `
        <div class="item">
            <b>${m.name}</b><br>
            ${m.status || ""}
            <button onclick="deleteMission('${m.id}')">حذف</button>
        </div>`;
    });

    update();
}

window.deleteMission = async (id) => {
    await client.from("missions").delete().eq("id", id);
    loadMissions();
};

/* ================= STAFF ================= */
let staff = [
    { name: "سید طاهر", lastname: "علوی", phone: "0912" }
];

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
checkSession();
async function debugAuth(){
    const session = await client.auth.getSession();
    console.log("SESSION CHECK:", session);
}

debugAuth();
