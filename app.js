/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE1ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE0";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= STATE ================= */
let currentUser = null;
let userRole = "user";
let editingProjectId = null;
let editingMissionId = null;
let rejectFinanceId = null;
let editingZonkenId = null;
let editingContractId = null;
let currentChatGroup = "finance";
let chatPrivateUserId = null;

let projectPage = 1, missionPage = 1, staffPage = 1, financePage = 1;
let zonkenPage = 1, contractPage = 1;
const PAGE_SIZE = 5;

let allProjects = [];
let allMissions = [];
let allFinance = [];
let allZonkens = [];
let allContracts = [];

let autoRefreshInterval = null;

function isAdmin() { return userRole === "admin"; }
function isManager() { return userRole === "manager"; }
function isFinance() { return userRole === "finance"; }
function isTech() { return userRole === "tech"; }

const defaultStaff = [
    { name: "سید طاهر", lastname: "علوی", phone: "09121192271", nationalId: "5459703840" },
    { name: "اکبر", lastname: "کندی", phone: "09121044458", nationalId: "005125331" },
    { name: "علیرضا", lastname: "علوی", phone: "09123173681", nationalId: "0065088786" },
    { name: "سید امین", lastname: "امینی", phone: "09122307045", nationalId: "0080434657" },
    { name: "سید صمد", lastname: "حسینی", phone: "09123350694", nationalId: "2141044855" },
    { name: "احمد", lastname: "نقیبی", phone: "09122110268", nationalId: "4989547047" },
    { name: "نورمحمد", lastname: "اعرابی", phone: "09191075146", nationalId: "2249735875" },
    { name: "علیرضا", lastname: "فرجی", phone: "09122250939", nationalId: "0072152796" },
    { name: "علی", lastname: "پورعلی", phone: "09123960214", nationalId: "0410676411" },
    { name: "محمد", lastname: "کیخسروی", phone: "09159715528", nationalId: "0795163045" },
    { name: "وحید", lastname: "عزیزی", phone: "09902157573", nationalId: "4189899860" }
];

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 3000);
}

let loginUI, loginBtn, signupBtn, emailInput, passInput;
let pName, pSupervisor, pProgress, pBuildStatus, pAdjustment, pDescription;
let mName, mManager, mStatus;
let zNumber, zName, zDesc, cNumber, cName, cDesc;

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
    zNumber = document.getElementById("z-number");
    zName = document.getElementById("z-name");
    zDesc = document.getElementById("z-desc");
    cNumber = document.getElementById("c-number");
    cName = document.getElementById("c-name");
    cDesc = document.getElementById("c-desc");
}

function hideSplash() {
    const splash = document.getElementById("splash");
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = "0";
            splash.style.transition = "opacity 0.4s";
            setTimeout(() => splash.style.display = "none", 400);
        }, 1200);
    }
}

function startClock() {
    const canvas = document.getElementById("clock");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function drawHand(angle, length, width, color) {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
        ctx.save(); ctx.rotate(angle); ctx.moveTo(0, 8); ctx.lineTo(0, -length); ctx.stroke(); ctx.restore();
    }
    function draw() {
        const now = new Date(), r = canvas.width / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.translate(r, r);
        ctx.beginPath(); ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(0, 0, 5, 0, 0, r); grd.addColorStop(0, "#1e293b"); grd.addColorStop(1, "#0f172a");
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, r - 6, 0, Math.PI * 2); ctx.strokeStyle = "rgba(56,189,248,.35)"; ctx.lineWidth = 3; ctx.stroke();
        for (let i = 0; i < 12; i++) {
            const ang = i * Math.PI / 6;
            ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2;
            ctx.moveTo(Math.sin(ang) * (r - 16), -Math.cos(ang) * (r - 16));
            ctx.lineTo(Math.sin(ang) * (r - 26), -Math.cos(ang) * (r - 26)); ctx.stroke();
        }
        const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds();
        drawHand((h * Math.PI / 6) + (m * Math.PI / 360), r * 0.42, 5, "#ffffff");
        drawHand(m * Math.PI / 30, r * 0.58, 3, "#38bdf8");
        drawHand(s * Math.PI / 30, r * 0.68, 2, "#ef4444");
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.restore();
        const dateEl = document.getElementById("live-date");
        if (dateEl) dateEl.textContent = now.toLocaleDateString("fa-IR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
    draw(); setInterval(draw, 1000);
}

function initNav() {
    document.querySelectorAll(".bottom-nav button").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
            const pageEl = document.getElementById(btn.dataset.page);
            if (pageEl) pageEl.classList.add("active");
            btn.classList.add("active");
        });
    });
    const first = document.querySelector(".bottom-nav button");
    if (first) first.classList.add("active");
}

function initModals() {
    document.getElementById("open-project")?.addEventListener("click", () => document.getElementById("project-modal").style.display = "flex");
    document.getElementById("close-project")?.addEventListener("click", () => { document.getElementById("project-modal").style.display = "none"; editingProjectId = null; document.getElementById("add-project").textContent = "ثبت"; });
    document.getElementById("open-mission")?.addEventListener("click", () => document.getElementById("mission-modal").style.display = "flex");
    document.getElementById("close-mission")?.addEventListener("click", () => { document.getElementById("mission-modal").style.display = "none"; editingMissionId = null; document.getElementById("add-mission").textContent = "ثبت"; });
    document.getElementById("open-finance")?.addEventListener("click", () => document.getElementById("finance-modal").style.display = "flex");
    document.getElementById("close-finance")?.addEventListener("click", () => document.getElementById("finance-modal").style.display = "none");
    document.getElementById("open-zonken")?.addEventListener("click", () => document.getElementById("zonken-modal").style.display = "flex");
    document.getElementById("close-zonken")?.addEventListener("click", () => { document.getElementById("zonken-modal").style.display = "none"; editingZonkenId = null; document.getElementById("add-zonken").textContent = "ثبت"; });
    document.getElementById("open-contract")?.addEventListener("click", () => document.getElementById("contract-modal").style.display = "flex");
    document.getElementById("close-contract")?.addEventListener("click", () => { document.getElementById("contract-modal").style.display = "none"; editingContractId = null; document.getElementById("add-contract").textContent = "ثبت"; });
    document.querySelectorAll(".modal").forEach(modal => modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; }));
}

async function checkSession() { const { data } = await client.auth.getSession(); if (!data.session?.user) { showLogin(); return; } currentUser = data.session.user; await loadUserRole(); await startApp(); }
function showLogin() { if (loginUI) loginUI.style.display = "flex"; }

async function loadUserRole() {
    const { data, error } = await client.from("profiles").select("role").eq("id", currentUser.id).single();
    if (error) { userRole = "user"; return; }
    userRole = data.role || "user";
    const adminBtn = document.getElementById("admin-nav-btn");
    if (adminBtn && userRole === "admin") adminBtn.style.display = "block";
}

async function login() {
    const email = emailInput.value.trim(), password = passInput.value;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) { showToast(error.message, 'error'); return; }
    currentUser = data.session.user; await loadUserRole(); await startApp();
    showToast('خوش آمدید! 👋', 'success');
}

async function signup() {
    const email = emailInput.value.trim(), password = passInput.value;
    const { data: existing } = await client.from("profiles").select("id").eq("email", email).single();
    if (existing) { showToast('این ایمیل قبلاً ثبت شده ⚠️', 'error'); return; }
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) { showToast(error.message, 'error'); return; }
    if (data.user) await client.from("profiles").upsert({ id: data.user.id, email, role: "user" });
    showToast('ثبت‌نام با موفقیت انجام شد ✅', 'success');
}

async function startApp() {
    if (loginUI) loginUI.style.display = "none";
    await loadProjects(); await loadMissions(); renderStaff();
    await loadFinance(); await loadZonkens(); await loadContracts();
    loadChatMessages(); loadPrivateUsers();
    update(); showUserInfo();
    if (userRole === "admin") await loadAllUsers();
    startAutoRefresh();
    if (userRole !== "admin") {
        document.querySelectorAll("#open-zonken, #open-contract").forEach(b => b.style.display = "none");
    }
}

function bindEvents() {
    loginBtn?.addEventListener("click", login);
    signupBtn?.addEventListener("click", signup);

    document.getElementById("add-project")?.addEventListener("click", async () => {
        const name = pName.value.trim(); if (!name) return showToast("نام پروژه لازم است", 'error');
        let error;
        if (editingProjectId) {
            ({ error } = await client.from("projects").update({ name, supervisor: pSupervisor.value, progress: pProgress.value, buildStatus: pBuildStatus.value, adjustment: pAdjustment.value, description: pDescription.value }).eq("id", editingProjectId));
            editingProjectId = null; document.getElementById("add-project").textContent = "ثبت";
        } else {
            ({ error } = await client.from("projects").insert([{ name, supervisor: pSupervisor.value, progress: pProgress.value, buildStatus: pBuildStatus.value, adjustment: pAdjustment.value, description: pDescription.value, owner_id: currentUser.id }]));
        }
        if (error) return showToast(error.message, 'error');
        pName.value = ""; pSupervisor.value = ""; pProgress.value = ""; pBuildStatus.value = ""; pAdjustment.value = ""; pDescription.value = "";
        document.getElementById("project-modal").style.display = "none"; await loadProjects();
        showToast('پروژه ذخیره شد ✅', 'success');
    });

    document.getElementById("add-mission")?.addEventListener("click", async () => {
        const name = mName.value.trim(); if (!name) return showToast("نام ماموریت لازم است", 'error');
        let error;
        if (editingMissionId) {
            ({ error } = await client.from("missions").update({ name, manager: mManager.value, status: mStatus.value }).eq("id", editingMissionId));
            editingMissionId = null; document.getElementById("add-mission").textContent = "ثبت";
        } else {
            ({ error } = await client.from("missions").insert([{ name, manager: mManager.value, status: mStatus.value, owner_id: currentUser.id }]));
        }
        if (error) return showToast(error.message, 'error');
        mName.value = ""; mManager.value = ""; mStatus.value = "";
        document.getElementById("mission-modal").style.display = "none"; await loadMissions();
        showToast('ماموریت ذخیره شد ✅', 'success');
    });

    document.getElementById("add-finance")?.addEventListener("click", async () => {
        const title = document.getElementById("f-title").value;
        const amount = document.getElementById("f-amount").value.replace(/[^0-9]/g, '');
        const description = document.getElementById("f-desc").value;
        if (!title) return showToast("عنوان لازم است", 'error');
        const fileInput = document.getElementById("f-file"); const file = fileInput.files[0]; let fileUrl = null;
        if (file) {
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
            const { error: uploadError } = await client.storage.from("finance-files").upload(fileName, file);
            if (uploadError) { showToast(uploadError.message, 'error'); return; }
            const { data } = client.storage.from("finance-files").getPublicUrl(fileName); fileUrl = data.publicUrl;
        }
        const { error } = await client.from("financial_requests").insert([{ title, amount: Number(amount), description, file_url: fileUrl, owner_id: currentUser.id, status: "pending", payment_status: "unpaid" }]);
        if (error) return showToast(error.message, 'error');
        document.getElementById("finance-modal").style.display = "none";
        document.getElementById("f-title").value = ""; document.getElementById("f-amount").value = ""; document.getElementById("f-desc").value = ""; document.getElementById("f-file").value = "";
        await loadFinance(); showToast('درخواست مالی ثبت شد 💰', 'success');
    });

    document.getElementById("f-amount")?.addEventListener("input", (e) => e.target.value = e.target.value.replace(/[^0-9]/g, ""));

    // Zonken
    document.getElementById("add-zonken")?.addEventListener("click", async () => {
        const number = zNumber.value.trim(), name = zName.value.trim(), desc = zDesc.value.trim();
        if (!number || !name) return showToast("شماره و نام زونکن لازم است", 'error');
        let error;
        if (editingZonkenId) {
            ({ error } = await client.from("zonkens").update({ number, name, description: desc }).eq("id", editingZonkenId));
            editingZonkenId = null; document.getElementById("add-zonken").textContent = "ثبت";
        } else {
            ({ error } = await client.from("zonkens").insert([{ number, name, description: desc, owner_id: currentUser.id }]));
        }
        if (error) return showToast(error.message, 'error');
        zNumber.value = ""; zName.value = ""; zDesc.value = "";
        document.getElementById("zonken-modal").style.display = "none"; await loadZonkens();
        showToast('زونکن ثبت شد 🗄', 'success');
    });

    // Contract
    document.getElementById("add-contract")?.addEventListener("click", async () => {
        const number = cNumber.value.trim(), name = cName.value.trim(), desc = cDesc.value.trim();
        if (!number || !name) return showToast("شماره و نام قرارداد لازم است", 'error');
        let error;
        if (editingContractId) {
            ({ error } = await client.from("contracts").update({ number, name, description: desc }).eq("id", editingContractId));
            editingContractId = null; document.getElementById("add-contract").textContent = "ثبت";
        } else {
            ({ error } = await client.from("contracts").insert([{ number, name, description: desc, owner_id: currentUser.id }]));
        }
        if (error) return showToast(error.message, 'error');
        cNumber.value = ""; cName.value = ""; cDesc.value = "";
        document.getElementById("contract-modal").style.display = "none"; await loadContracts();
        showToast('قرارداد ثبت شد 📋', 'success');
    });

    // Chat
    document.getElementById("chat-group-finance")?.addEventListener("click", () => { currentChatGroup = "finance"; document.getElementById("chat-private-select").style.display = "none"; document.getElementById("chat-group-finance").classList.add("active-chat"); document.getElementById("chat-group-tech").classList.remove("active-chat"); document.getElementById("chat-private-btn").classList.remove("active-chat"); loadChatMessages(); });
    document.getElementById("chat-group-tech")?.addEventListener("click", () => { currentChatGroup = "tech"; document.getElementById("chat-private-select").style.display = "none"; document.getElementById("chat-group-tech").classList.add("active-chat"); document.getElementById("chat-group-finance").classList.remove("active-chat"); document.getElementById("chat-private-btn").classList.remove("active-chat"); loadChatMessages(); });
    document.getElementById("chat-private-btn")?.addEventListener("click", () => { currentChatGroup = "private"; document.getElementById("chat-private-select").style.display = "block"; document.getElementById("chat-private-btn").classList.add("active-chat"); document.getElementById("chat-group-finance").classList.remove("active-chat"); document.getElementById("chat-group-tech").classList.remove("active-chat"); loadChatMessages(); });
    document.getElementById("private-user-select")?.addEventListener("change", (e) => { chatPrivateUserId = e.target.value; loadChatMessages(); });
    document.getElementById("send-chat")?.addEventListener("click", async () => {
        const msg = document.getElementById("chat-input").value.trim(); if (!msg) return;
        let group = currentChatGroup, receiver_id = null;
        if (group === "private") { if (!chatPrivateUserId) return showToast("یک کاربر انتخاب کنید", "error"); receiver_id = chatPrivateUserId; group = "private"; }
        const { error } = await client.from("chat_messages").insert([{ sender_id: currentUser.id, sender_email: currentUser.email, receiver_id, group_name: group !== "private" ? group : null, message: msg }]);
        if (error) return showToast(error.message, "error");
        document.getElementById("chat-input").value = ""; loadChatMessages();
    });

    // Logout
    document.getElementById("logout-btn")?.addEventListener("click", () => document.getElementById("logout-modal").style.display = "flex");
    document.getElementById("cancel-logout")?.addEventListener("click", () => document.getElementById("logout-modal").style.display = "none");
    document.getElementById("confirm-logout")?.addEventListener("click", async () => { document.getElementById("logout-modal").style.display = "none"; stopAutoRefresh(); await client.auth.signOut(); location.reload(); });

    // Delete
    document.getElementById("cancel-delete")?.addEventListener("click", () => { document.getElementById("delete-modal").style.display = "none"; window._deleteId = null; window._deleteType = null; });
    document.getElementById("confirm-delete")?.addEventListener("click", async () => {
        const id = window._deleteId, type = window._deleteType;
        document.getElementById("delete-modal").style.display = "none"; window._deleteId = null; window._deleteType = null;
        if (type === "project") { await client.from("projects").delete().eq("id", id); await loadProjects(); showToast('پروژه حذف شد 🗑', 'info'); }
        else if (type === "mission") { await client.from("missions").delete().eq("id", id); await loadMissions(); showToast('ماموریت حذف شد 🗑', 'info'); }
        else if (type === "finance") { await client.from("financial_requests").delete().eq("id", id); await loadFinance(); showToast('درخواست حذف شد 🗑', 'info'); }
        else if (type === "zonken") { await client.from("zonkens").delete().eq("id", id); await loadZonkens(); showToast('زونکن حذف شد 🗑', 'info'); }
        else if (type === "contract") { await client.from("contracts").delete().eq("id", id); await loadContracts(); showToast('قرارداد حذف شد 🗑', 'info'); }
    });

    // Reject
    document.getElementById("reject-cancel-btn")?.addEventListener("click", () => { document.getElementById("reject-modal").style.display = "none"; rejectFinanceId = null; });
    document.getElementById("reject-confirm-btn")?.addEventListener("click", async () => { if (!rejectFinanceId) return; await client.from("financial_requests").delete().eq("id", rejectFinanceId); document.getElementById("reject-modal").style.display = "none"; rejectFinanceId = null; await loadFinance(); showToast('درخواست رد و حذف شد ❌', 'info'); });

    // Search
    document.getElementById("project-search")?.addEventListener("input", () => { projectPage = 1; renderProjects(); });
    document.getElementById("mission-search")?.addEventListener("input", () => { missionPage = 1; renderMissions(); });
    document.getElementById("staff-search")?.addEventListener("input", () => { renderStaff(); });
    document.getElementById("finance-search")?.addEventListener("input", () => { financePage = 1; renderFinance(); });
    document.getElementById("finance-filter")?.addEventListener("change", () => { financePage = 1; renderFinance(); });
    document.getElementById("zonken-search")?.addEventListener("input", () => { zonkenPage = 1; renderZonkens(); });
    document.getElementById("contract-search")?.addEventListener("input", () => { contractPage = 1; renderContracts(); });
}

function renderPagination(containerId, currentPage, totalItems, onPageChange) {
    const container = document.getElementById(containerId); if (!container) return;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE); if (totalPages <= 1) { container.innerHTML = ""; return; }
    let html = '<button ' + (currentPage === 1 ? 'disabled' : '') + '>◀ قبلی</button>';
    for (let i = 1; i <= totalPages; i++) html += `<button class="${i === currentPage ? 'active-page' : ''}" data-page="${i}">${i}</button>`;
    html += '<button ' + (currentPage === totalPages ? 'disabled' : '') + '>بعدی ▶</button>';
    container.innerHTML = html;
    container.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (!isNaN(page)) onPageChange(page);
        else if (btn.textContent.includes('قبلی') && currentPage > 1) onPageChange(currentPage - 1);
        else if (btn.textContent.includes('بعدی') && currentPage < totalPages) onPageChange(currentPage + 1);
    }));
}

/* ================= PROJECTS ================= */
async function loadProjects() { if (!currentUser) return; const { data, error } = await client.from("projects").select("*").eq("owner_id", currentUser.id).order("created_at", { ascending: false }); if (error) return; allProjects = data || []; projectPage = 1; renderProjects(); }
function renderProjects() {
    const searchTerm = document.getElementById("project-search")?.value.trim().toLowerCase() || "";
    let filtered = allProjects; if (searchTerm) filtered = allProjects.filter(p => p.name?.toLowerCase().includes(searchTerm) || p.supervisor?.toLowerCase().includes(searchTerm));
    const total = filtered.length, start = (projectPage - 1) * PAGE_SIZE, pageItems = filtered.slice(start, start + PAGE_SIZE);
    const list = document.getElementById("projects-list"); list.innerHTML = "";
    pageItems.forEach(p => list.innerHTML += `<div class="item"><b>${p.name}</b><br>👷 ${p.supervisor || "-"}<br>📈 ${p.progress || 0}%<div class="action-buttons"><button class="edit-btn" onclick="editProject('${p.id}')">✏️ اصلاح</button><button class="del-btn" onclick="deleteProject('${p.id}')">🗑 حذف</button></div></div>`);
    renderPagination("projects-pagination", projectPage, total, (page) => { projectPage = page; renderProjects(); }); update();
}
window.editProject = function (id) { const p = allProjects.find(x => x.id === id); if (!p) return; editingProjectId = id; pName.value = p.name || ""; pSupervisor.value = p.supervisor || ""; pProgress.value = p.progress || ""; pBuildStatus.value = p.buildStatus || ""; pAdjustment.value = p.adjustment || ""; pDescription.value = p.description || ""; document.getElementById("add-project").textContent = "💾 ذخیره"; document.getElementById("project-modal").style.display = "flex"; };
window.deleteProject = function (id) { window._deleteId = id; window._deleteType = "project"; document.getElementById("delete-modal").style.display = "flex"; };

/* ================= MISSIONS ================= */
async function loadMissions() { if (!currentUser) return; const { data } = await client.from("missions").select("*").eq("owner_id", currentUser.id).order("created_at", { ascending: false }); allMissions = data || []; missionPage = 1; renderMissions(); }
function renderMissions() {
    const searchTerm = document.getElementById("mission-search")?.value.trim().toLowerCase() || "";
    let filtered = allMissions; if (searchTerm) filtered = allMissions.filter(m => m.name?.toLowerCase().includes(searchTerm) || m.manager?.toLowerCase().includes(searchTerm));
    const total = filtered.length, start = (missionPage - 1) * PAGE_SIZE, pageItems = filtered.slice(start, start + PAGE_SIZE);
    const list = document.getElementById("missions-list"); list.innerHTML = "";
    pageItems.forEach(m => list.innerHTML += `<div class="item"><b>${m.name}</b><br>👤 ${m.manager || "-"}<br>📌 ${m.status || "-"}<div class="action-buttons"><button class="edit-btn" onclick="editMission('${m.id}')">✏️ اصلاح</button><button class="del-btn" onclick="deleteMission('${m.id}')">🗑 حذف</button></div></div>`);
    renderPagination("missions-pagination", missionPage, total, (page) => { missionPage = page; renderMissions(); }); update();
}
window.editMission = function (id) { const m = allMissions.find(x => x.id === id); if (!m) return; editingMissionId = id; mName.value = m.name || ""; mManager.value = m.manager || ""; mStatus.value = m.status || ""; document.getElementById("add-mission").textContent = "💾 ذخیره"; document.getElementById("mission-modal").style.display = "flex"; };
window.deleteMission = function (id) { window._deleteId = id; window._deleteType = "mission"; document.getElementById("delete-modal").style.display = "flex"; };

/* ================= STAFF ================= */
function renderStaff() {
    const searchTerm = document.getElementById("staff-search")?.value.trim().toLowerCase() || "";
    let filtered = defaultStaff; if (searchTerm) filtered = defaultStaff.filter(s => s.name?.toLowerCase().includes(searchTerm) || s.lastname?.toLowerCase().includes(searchTerm) || s.phone?.includes(searchTerm) || s.nationalId?.includes(searchTerm));
    const list = document.getElementById("staff-list"); list.innerHTML = "";
    filtered.forEach(s => list.innerHTML += `<div class="staff-card"><b>${s.name} ${s.lastname}</b><small>📱 ${s.phone}</small><small>🆔 ${s.nationalId || "-"}</small><a class="call-btn" href="tel:${s.phone}">📞 تماس مستقیم</a></div>`);
    document.getElementById("staff-pagination").innerHTML = ""; update();
}

function statusText(s) { switch (s) { case "pending": return "در انتظار"; case "approved": return "تایید شده"; case "rejected": return "رد شده"; default: return "نامشخص"; } }
function paymentText(s) { switch (s) { case "paid": return "پرداخت شده"; case "unpaid": return "پرداخت نشده"; default: return "نامشخص"; } }
function roleToFa(r) { switch (r) { case "admin": return "مدیر سیستم"; case "manager": return "مدیرعامل"; case "finance": return "امور مالی"; case "tech": return "فنی"; case "user": return "کاربر عادی"; default: return "نامشخص"; } }

/* ================= FINANCE ================= */
async function loadFinance() { if (!currentUser) return; const { data } = await client.from("financial_requests").select("*").order("id", { ascending: false }); allFinance = data || []; financePage = 1; renderFinance(); }
function renderFinance() {
    const searchTerm = document.getElementById("finance-search")?.value.trim().toLowerCase() || "";
    const filterValue = document.getElementById("finance-filter")?.value || "all";
    let filtered = allFinance; if (searchTerm) filtered = filtered.filter(f => f.title?.toLowerCase().includes(searchTerm) || f.description?.toLowerCase().includes(searchTerm));
    if (filterValue === "pending") filtered = filtered.filter(f => f.status === "pending"); else if (filterValue === "approved") filtered = filtered.filter(f => f.status === "approved"); else if (filterValue === "rejected") filtered = filtered.filter(f => f.status === "rejected"); else if (filterValue === "paid") filtered = filtered.filter(f => f.payment_status === "paid"); else if (filterValue === "unpaid") filtered = filtered.filter(f => f.payment_status === "unpaid");
    const total = filtered.length, start = (financePage - 1) * PAGE_SIZE, pageItems = filtered.slice(start, start + PAGE_SIZE);
    const list = document.getElementById("finance-list"); list.innerHTML = "";
    pageItems.forEach(f => {
        let actions = "";
        if (!f.status || f.status === "pending") { if (userRole === "admin" || userRole === "manager") actions += `<button class="glass-btn" onclick="approveFinance('${f.id}')">✔ تایید</button><button class="glass-btn danger" onclick="openRejectModal('${f.id}')">✖ رد</button>`; }
        if (f.status === "approved" && f.payment_status !== "paid") { if (userRole === "admin" || userRole === "finance") actions += `<button class="glass-btn success" onclick="confirmPayment('${f.id}')">💳 تایید پرداخت</button>`; }
        if (f.payment_status === "paid" && userRole === "admin") actions += `<button class="glass-btn danger" onclick="deleteFinance('${f.id}')">🗑 حذف</button>`;
        list.innerHTML += `<div class="glass-card"><b>${f.title || "-"}</b><br>💰 ${Number(f.amount || 0).toLocaleString()} تومان<br>📌 ${f.description || ""}${f.file_url ? `<br><br><a href="${f.file_url}" target="_blank" class="glass-btn">📎 ضمیمه</a>` : ""}<br><br><span>وضعیت: ${statusText(f.status)}</span><br><span>پرداخت: ${paymentText(f.payment_status)}</span><div class="action-buttons">${actions}</div></div>`;
    });
    renderPagination("finance-pagination", financePage, total, (page) => { financePage = page; renderFinance(); });
}
window.approveFinance = async (id) => { await client.from("financial_requests").update({ status: "approved" }).eq("id", id); await loadFinance(); showToast('تایید شد ✅', 'success'); };
window.confirmPayment = async (id) => { await client.from("financial_requests").update({ payment_status: "paid" }).eq("id", id); await loadFinance(); showToast('پرداخت تایید شد 💳', 'success'); };
window.deleteFinance = function (id) { window._deleteId = id; window._deleteType = "finance"; document.getElementById("delete-modal").style.display = "flex"; };
window.openRejectModal = function (id) { rejectFinanceId = id; document.getElementById("reject-modal").style.display = "flex"; };

/* ================= USER INFO ================= */
function showUserInfo() {
    if (!currentUser) return;
    document.getElementById("user-email").textContent = currentUser.email;
    document.getElementById("user-id").textContent = currentUser.id;
    const roleEl = document.getElementById("user-role"); roleEl.textContent = roleToFa(userRole);
    if (userRole === "admin") roleEl.style.color = "#ef4444"; else if (userRole === "manager") roleEl.style.color = "#3b82f6"; else if (userRole === "finance") roleEl.style.color = "#22c55e"; else if (userRole === "tech") roleEl.style.color = "#f59e0b"; else roleEl.style.color = "#a1a1aa";
}

/* ================= ADMIN PANEL ================= */
async function loadAllUsers() {
    const { data: profiles, error } = await client.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) { console.warn(error.message); return; }
    const table = document.getElementById("users-table"); if (!table) return;
    let html = '<div style="overflow-x:auto;">';
    profiles.forEach(profile => {
        html += `<div class="user-row"><div style="flex:1;"><div style="font-weight:bold;color:white;">📧 ${profile.email || 'بدون ایمیل'}</div><small style="opacity:0.5;">🆔 ${profile.id?.slice(0, 12)}...</small></div><span class="role-badge ${profile.role || 'user'}">${roleToFa(profile.role)}</span><select id="role-select-${profile.id}"><option value="user" ${profile.role === 'user' ? 'selected' : ''}>کاربر عادی</option><option value="manager" ${profile.role === 'manager' ? 'selected' : ''}>مدیرعامل</option><option value="finance" ${profile.role === 'finance' ? 'selected' : ''}>امور مالی</option><option value="tech" ${profile.role === 'tech' ? 'selected' : ''}>فنی</option><option value="admin" ${profile.role === 'admin' ? 'selected' : ''}>مدیر سیستم</option></select><button class="save-role-btn" onclick="updateUserRole('${profile.id}')">💾 ذخیره</button></div>`;
    });
    html += '</div>'; table.innerHTML = html;
}
window.updateUserRole = async function (userId) {
    const select = document.getElementById(`role-select-${userId}`); if (!select) return;
    const newRole = select.value;
    const { error } = await client.from("profiles").upsert({ id: userId, role: newRole });
    if (error) { showToast(error.message, 'error'); return; }
    if (userId === currentUser.id) { userRole = newRole; showUserInfo(); const ab = document.getElementById("admin-nav-btn"); if (ab) ab.style.display = newRole === "admin" ? "block" : "none"; }
    showToast('نقش به‌روزرسانی شد ✅', 'success'); await loadAllUsers();
};

/* ================= ZONKENS ================= */
async function loadZonkens() { if (!currentUser) return; const { data } = await client.from("zonkens").select("*").order("id", { ascending: false }); allZonkens = data || []; zonkenPage = 1; renderZonkens(); }
function renderZonkens() {
    const searchTerm = document.getElementById("zonken-search")?.value.trim().toLowerCase() || "";
    let filtered = allZonkens; if (searchTerm) filtered = allZonkens.filter(z => z.name?.toLowerCase().includes(searchTerm) || z.number?.toLowerCase().includes(searchTerm) || z.description?.toLowerCase().includes(searchTerm));
    const total = filtered.length, start = (zonkenPage - 1) * PAGE_SIZE, pageItems = filtered.slice(start, start + PAGE_SIZE);
    const list = document.getElementById("zonken-list"); list.innerHTML = "";
    pageItems.forEach(z => {
        const div = document.createElement("div"); div.className = "staff-card";
        div.innerHTML = `<b>${z.name}</b><small>🔢 شماره: ${z.number}</small>${z.description ? `<small style="opacity:0.7;">📝 ${z.description}</small>` : ""}${userRole === "admin" ? `<div class="action-buttons" style="margin-top:6px;"><button class="edit-btn">✏️</button><button class="del-btn">🗑</button></div>` : ""}`;
        div.querySelector(".edit-btn")?.addEventListener("click", () => editZonken(z.id));
        div.querySelector(".del-btn")?.addEventListener("click", () => deleteZonken(z.id));
        list.appendChild(div);
    });
    renderPagination("zonken-pagination", zonkenPage, total, (page) => { zonkenPage = page; renderZonkens(); });
}
window.editZonken = function (id) { const z = allZonkens.find(x => x.id === id); if (!z) return; editingZonkenId = id; document.getElementById("z-number").value = z.number || ""; document.getElementById("z-name").value = z.name || ""; document.getElementById("z-desc").value = z.description || ""; document.getElementById("add-zonken").textContent = "💾 ذخیره"; document.getElementById("zonken-modal").style.display = "flex"; };
window.deleteZonken = function (id) { window._deleteId = id; window._deleteType = "zonken"; document.getElementById("delete-modal").style.display = "flex"; };

/* ================= CONTRACTS ================= */
async function loadContracts() { if (!currentUser) return; const { data } = await client.from("contracts").select("*").order("id", { ascending: false }); allContracts = data || []; contractPage = 1; renderContracts(); }
function renderContracts() {
    const searchTerm = document.getElementById("contract-search")?.value.trim().toLowerCase() || "";
    let filtered = allContracts; if (searchTerm) filtered = allContracts.filter(c => c.name?.toLowerCase().includes(searchTerm) || c.number?.toLowerCase().includes(searchTerm) || c.description?.toLowerCase().includes(searchTerm));
    const total = filtered.length, start = (contractPage - 1) * PAGE_SIZE, pageItems = filtered.slice(start, start + PAGE_SIZE);
    const list = document.getElementById("contract-list"); list.innerHTML = "";
    pageItems.forEach(c => {
        const div = document.createElement("div"); div.className = "staff-card";
        div.innerHTML = `<b>${c.name}</b><small>🔢 شماره: ${c.number}</small>${c.description ? `<small style="opacity:0.7;">📝 ${c.description}</small>` : ""}${userRole === "admin" ? `<div class="action-buttons" style="margin-top:6px;"><button class="edit-btn">✏️</button><button class="del-btn">🗑</button></div>` : ""}`;
        div.querySelector(".edit-btn")?.addEventListener("click", () => editContract(c.id));
        div.querySelector(".del-btn")?.addEventListener("click", () => deleteContract(c.id));
        list.appendChild(div);
    });
    renderPagination("contract-pagination", contractPage, total, (page) => { contractPage = page; renderContracts(); });
}
window.editContract = function (id) { const c = allContracts.find(x => x.id === id); if (!c) return; editingContractId = id; document.getElementById("c-number").value = c.number || ""; document.getElementById("c-name").value = c.name || ""; document.getElementById("c-desc").value = c.description || ""; document.getElementById("add-contract").textContent = "💾 ذخیره"; document.getElementById("contract-modal").style.display = "flex"; };
window.deleteContract = function (id) { window._deleteId = id; window._deleteType = "contract"; document.getElementById("delete-modal").style.display = "flex"; };

/* ================= CHAT ================= */
async function loadChatMessages() {
    let query = client.from("chat_messages").select("*").order("created_at", { ascending: true }).limit(100);

    if (currentChatGroup === "private") {
        if (!chatPrivateUserId) {
            document.getElementById("chat-messages").innerHTML = "<p style='opacity:0.6;text-align:center;'>یک کاربر انتخاب کنید</p>";
            return;
        }
        // کوئری ساده‌تر
        query = query.or(`sender_id.eq.${currentUser.id},sender_id.eq.${chatPrivateUserId}`);
    } else {
        query = query.eq("group_name", currentChatGroup);
    }

    const { data } = await query;
    const box = document.getElementById("chat-messages");
    box.innerHTML = "";

    if (!data || data.length === 0) {
        box.innerHTML = "<p style='opacity:0.6;text-align:center;'>هنوز پیامی نیست</p>";
        return;
    }

    // فیلتر کردن پیام‌های خصوصی
    let filtered = data;
    if (currentChatGroup === "private") {
        filtered = data.filter(m =>
            (m.sender_id === currentUser.id && m.receiver_id === chatPrivateUserId) ||
            (m.sender_id === chatPrivateUserId && m.receiver_id === currentUser.id)
        );
    }

    filtered.forEach(m => {
        const isMe = m.sender_id === currentUser.id;
        box.innerHTML += `
        <div style="margin-bottom:8px;text-align:${isMe ? 'left' : 'right'};">
            <small style="opacity:0.6;">${m.sender_email?.split('@')[0] || 'ناشناس'}</small>
            <div style="display:inline-block;padding:8px 12px;border-radius:12px;max-width:80%;background:${isMe ? 'rgba(56,189,248,0.3)' : 'rgba(255,255,255,0.1)'};">
                ${m.message}
            </div>
        </div>`;
    });
    box.scrollTop = box.scrollHeight;
}
async function loadPrivateUsers() {
    const { data } = await client.from("profiles").select("*"); const select = document.getElementById("private-user-select");
    if (!select || !data) return;
    select.innerHTML = '<option value="">انتخاب کاربر...</option>';
    data.forEach(u => { if (u.id !== currentUser.id) select.innerHTML += `<option value="${u.id}">${u.email}</option>`; });
}

/* ================= DASH ================= */
function update() {
    document.getElementById("projects-count").textContent = allProjects.length;
    document.getElementById("missions-count").textContent = allMissions.length;
    document.getElementById("staff-count").textContent = defaultStaff.length;
    document.getElementById("finance-count").textContent = allFinance.length;
    document.getElementById("zonken-count").textContent = allZonkens.length;
    document.getElementById("contract-count").textContent = allContracts.length;
}

/* ================= AUTO REFRESH ================= */
function startAutoRefresh() { stopAutoRefresh(); autoRefreshInterval = setInterval(async () => { if (!currentUser) return; await loadProjects(); await loadMissions(); await loadFinance(); loadChatMessages(); update(); if (userRole === "admin") await loadAllUsers(); }, 60000); }
function stopAutoRefresh() { if (autoRefreshInterval) { clearInterval(autoRefreshInterval); autoRefreshInterval = null; } }

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", async () => { initDOM(); bindEvents(); initNav(); initModals(); startClock(); hideSplash(); await checkSession(); });
