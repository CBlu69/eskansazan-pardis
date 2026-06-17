
/* ================= SUPABASE ================= */
const supabaseUrl = "https://zaesmxrlwqjapbkbrnmn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZXNteHJsd3FqYXBia2Jybm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1ODIwNzgsImV4cCI6MjA5NzE1ODA3OH0.FQu84hluK74Ze85p4spve_WGbwGvToiRwCs3ALP0GE0";
const client = supabase.createClient(supabaseUrl, supabaseKey);

/* ================= STATE ================= */
let currentUser = null;
let userRole = "user";
let editingProjectId = null;
let editingMissionId = null;

function isAdmin(){
  return userRole === "admin";
}

function isManager(){
  return userRole === "manager";
}

function isFinance(){
  return userRole === "finance";
}

/* ================= DATA ================= */
let projects = [];
let missions = [];
let financeRequests = [];
let staff = [
    { name: "سید طاهر", lastname: "علوی", phone: "09121192271", nationalId: "5459703840" },
    { name: "اکبر", lastname: "کندی", phone: "09121044458", nationalId: "005125331" },
    { name: "علیرضا", lastname: "علوی", phone: "09123173681", nationalId: "0065088786" },
    { name: "سید امین", lastname: "امینی", phone: "09122307045", nationalId: "0080434657" },
    { name: "سید صمد", lastname: "حسینی", phone: "09123350694", nationalId: "2141044855" },
    { name: "احمد", lastname: "نقیبی", phone: "09122110268", nationalId: "4989547047" },
    { name: "سید امین", lastname: "امینی", phone: "09122307045", nationalId: "0080434657" },
    { name: "نورمحمد", lastname: "اعرابی", phone: "09191075146", nationalId: "2249735875" }
];

/* ================= DOM ELEMENTS ================= */
let loginUI, loginBtn, signupBtn, emailInput, passInput;
let pName, pSupervisor, pProgress, pBuildStatus, pAdjustment, pDescription;
let mName, mManager, mStatus;

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

/* ================= SPLASH ================= */
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

/* ================= CLOCK ================= */
function startClock() {
    const canvas = document.getElementById("clock");
    const ctx = canvas.getContext("2d");

    function draw() {
        const now = new Date();

        const r = canvas.width / 2;
        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.save();
        ctx.translate(r,r);

        // پس‌زمینه
        ctx.beginPath();
        ctx.arc(0,0,r-5,0,Math.PI*2);
        ctx.fillStyle="#0f172a";
        ctx.fill();

        const h = now.getHours()%12;
        const m = now.getMinutes();
        const s = now.getSeconds();

        drawHand((h*Math.PI/6)+(m*Math.PI/360), r*0.5, 4, "#fff");
        drawHand(m*Math.PI/30, r*0.7, 3, "#fff");
        drawHand(s*Math.PI/30, r*0.8, 2, "red");

        ctx.restore();

        document.getElementById("live-date").textContent =
            now.toLocaleDateString("fa-IR", {
                weekday:"long",
                year:"numeric",
                month:"long",
                day:"numeric"
            });
    }

    function drawHand(angle, length, width, color){
        ctx.beginPath();
        ctx.strokeStyle=color;
        ctx.lineWidth=width;
        ctx.lineCap="round";

        ctx.save();
        ctx.rotate(angle);
        ctx.moveTo(0,0);
        ctx.lineTo(0,-length);
        ctx.stroke();
        ctx.restore();
    }

    draw();
    setInterval(draw,1000);
}
/* ================= NAV ================= */
function initNav() {
    const buttons = document.querySelectorAll(".bottom-nav button");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));

            const pageId = btn.dataset.page;
            document.getElementById(pageId)?.classList.add("active");
            btn.classList.add("active");
        });
    });

    // active اول
    const first = document.querySelector(".bottom-nav button");
    if (first) first.classList.add("active");
}

/* ================= MODALS ================= */
function initModals() {
    // project modal
    document.getElementById("open-project")?.addEventListener("click", () => {
        document.getElementById("project-modal").style.display = "flex";
    });

   document.getElementById("close-project")?.addEventListener("click", () => {
    document.getElementById("project-modal").style.display = "none";

    editingProjectId = null;
    document.getElementById("add-project").textContent = "ثبت";
});

    // mission modal
    document.getElementById("open-mission")?.addEventListener("click", () => {
        document.getElementById("mission-modal").style.display = "flex";
    });

   document.getElementById("close-mission")?.addEventListener("click", () => {
    document.getElementById("mission-modal").style.display = "none";

    editingMissionId = null;
    document.getElementById("add-mission").textContent = "ثبت";
});

    // بستن با کلیک بیرون از modal
    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    });
    document.getElementById("open-finance")?.addEventListener("click", () => {
    document.getElementById("finance-modal").style.display = "flex";
});

document.getElementById("close-finance")?.addEventListener("click", () => {
    document.getElementById("finance-modal").style.display = "none";
});
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
    await startApp();
}

function showLogin() {
    if (loginUI) loginUI.style.display = "flex";
}

/* ================= ROLE ================= */
async function loadUserRole() {
    const { data, error } = await client
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

    if (error) {
        console.warn("role error:", error.message);
        userRole = "user";
        return;
    }

    userRole = data.role || "user";

    console.log("FINAL ROLE:", userRole);
}

/* ================= LOGIN ================= */
async function login() {
    const email = emailInput.value.trim();
    const password = passInput.value;

    const { data, error } = await client.auth.signInWithPassword({
        email,
        password
    });

    console.log("LOGIN:", data, error);

    if (error) {
        alert(error.message);
        return;
    }

    currentUser = data.session.user;
    await loadUserRole();
    await startApp();
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
async function startApp() {
    if (loginUI) loginUI.style.display = "none";

    loadProjects();
    loadMissions();
    renderStaff();
    update();

    try {
        await loadFinance();
    } catch(e){
        console.warn("finance error", e);
    }
}

/* ================= EVENTS ================= */
function bindEvents() {
    loginBtn?.addEventListener("click", login);
    signupBtn?.addEventListener("click", signup);


document.getElementById("add-project")?.addEventListener("click", async () => {

    const name = pName.value.trim();
    if (!name) return alert("نام پروژه لازم است");

    let error;

    if (editingProjectId) {
        ({ error } = await client
            .from("projects")
            .update({
                name,
                supervisor: pSupervisor.value,
                progress: pProgress.value,
                buildStatus: pBuildStatus.value,
                adjustment: pAdjustment.value,
                description: pDescription.value
            })
            .eq("id", editingProjectId));

        editingProjectId = null;

        document.getElementById("add-project").textContent = "ثبت";
    } else {
        ({ error } = await client
            .from("projects")
            .insert([{
                name,
                supervisor: pSupervisor.value,
                progress: pProgress.value,
                buildStatus: pBuildStatus.value,
                adjustment: pAdjustment.value,
                description: pDescription.value,
                owner_id: currentUser.id
            }]));
    }

    if (error) return alert(error.message);

    pName.value = "";
    pSupervisor.value = "";
    pProgress.value = "";
    pBuildStatus.value = "";
    pAdjustment.value = "";
    pDescription.value = "";

    document.getElementById("project-modal").style.display = "none";
document.getElementById("f-amount")?.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
});
    loadProjects();
});



document.getElementById("add-mission")?.addEventListener("click", async () => {

    const name = mName.value.trim();
    if (!name) return alert("نام ماموریت لازم است");

    let error;

    if (editingMissionId) {
        ({ error } = await client
            .from("missions")
            .update({
                name,
                manager: mManager.value,
                status: mStatus.value
            })
            .eq("id", editingMissionId));

        editingMissionId = null;

        document.getElementById("add-mission").textContent = "ثبت";
    } else {
        ({ error } = await client
            .from("missions")
            .insert([{
                name,
                manager: mManager.value,
                status: mStatus.value,
                owner_id: currentUser.id
            }]));
    }

    if (error) return alert(error.message);

    mName.value = "";
    mManager.value = "";
    mStatus.value = "";

    document.getElementById("mission-modal").style.display = "none";

    loadMissions();
});

   document.getElementById("add-finance")?.addEventListener("click", async () => {

  const title = document.getElementById("f-title").value;
  const amount = document.getElementById("f-amount").value.replace(/[^0-9]/g, '');
  const description = document.getElementById("f-desc").value;

  if (!title) return alert("عنوان لازم است");

  const fileInput = document.getElementById("f-file");
  const file = fileInput.files[0];

  let fileUrl = null;

  if (file) {
    const fileName = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await client
      .storage
      .from("finance-files")
      .upload(fileName, file);

    if (uploadError) {
      alert("خطا در آپلود فایل");
      return;
    }

    const { data } = client
      .storage
      .from("finance-files")
      .getPublicUrl(fileName);

    fileUrl = data.publicUrl;
  }

  const { error } = await client
    .from("financial_requests")
    .insert([{
      title,
      amount: Number(amount),
      description,
      file_url: fileUrl,
      owner_id: currentUser.id,
      status: "pending",
      payment_status: "unpaid"
    }]);

  if (error) {
    alert(error.message);
    return;
  }

  document.getElementById("finance-modal").style.display = "none";
  loadFinance();
});
}
/* ================= PROJECTS ================= */
async function loadProjects() {
    if (!currentUser) return;

    const { data, error } = await client
        .from("projects")
        .select("*")
        .eq("owner_id", currentUser.id)
        .order("created_at", { ascending: false });

    if (error) return console.warn(error.message);

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
            👷 ${p.supervisor || "-"}<br>
            📈 ${p.progress || 0}%

            <div class="action-buttons">
                <button class="edit-btn"
                    onclick="editProject('${p.id}')">
                    ✏️ اصلاح
                </button>

                <button class="del-btn"
                    onclick="deleteProject('${p.id}')">
                    🗑 حذف
                </button>
            </div>
        </div>`;
    });

    update();
}

window.editProject = function(id) {
    const project = projects.find(p => p.id === id);
    if (!project) return;

    editingProjectId = id;

    pName.value = project.name || "";
    pSupervisor.value = project.supervisor || "";
    pProgress.value = project.progress || "";
    pBuildStatus.value = project.buildStatus || "";
    pAdjustment.value = project.adjustment || "";
    pDescription.value = project.description || "";

    document.getElementById("add-project").textContent =
        "💾 ذخیره تغییرات";

    document.getElementById("project-modal").style.display =
        "flex";
};

window.deleteProject = async (id) => {
    await client.from("projects")
        .delete()
        .eq("id", id);

    loadProjects();
};


/* ================= MISSIONS ================= */
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
            📌 ${m.status || "-"}

            <div class="action-buttons">
                <button class="edit-btn"
                    onclick="editMission('${m.id}')">
                    ✏️ اصلاح
                </button>

                <button class="del-btn"
                    onclick="deleteMission('${m.id}')">
                    🗑 حذف
                </button>
            </div>
        </div>`;
    });

    update();
}

window.editMission = function(id) {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    editingMissionId = id;

    mName.value = mission.name || "";
    mManager.value = mission.manager || "";
    mStatus.value = mission.status || "";

    document.getElementById("add-mission").textContent =
        "💾 ذخیره تغییرات";

    document.getElementById("mission-modal").style.display =
        "flex";
};

window.deleteMission = async (id) => {
    await client.from("missions")
        .delete()
        .eq("id", id);

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

            <small>📱 ${s.phone}</small>
            <small>🆔 ${s.nationalId || "-"}</small>

            <a class="call-btn" href="tel:${s.phone}">
                📞 تماس مستقیم
            </a>

        </div>`;
    });

    update();
}
/* ================= HELPERS ================= */

function statusText(status){
    switch(status){
        case "pending": return "در انتظار بررسی";
        case "approved": return "تایید شده";
        case "rejected": return "رد شده";
        default: return "نامشخص";
    }
}

function paymentText(status){
    switch(status){
        case "paid": return "پرداخت شده";
        case "unpaid": return "پرداخت نشده";
        default: return "نامشخص";
    }
}
/* ================= finance ================= */
function renderFinance(){
  const list = document.getElementById("finance-list");
  list.innerHTML = "";

  financeRequests.forEach(f => {

    let actions = "";

    if (!f.status || f.status === "pending") {
      if (userRole === "admin" || userRole === "manager") {
        actions += `
          <button class="glass-btn" onclick="approveFinance('${f.id}')">✔ تایید</button>
          <button class="glass-btn danger" onclick="rejectFinance('${f.id}')">✖ رد</button>
        `;
      }
    }

    if (f.status === "approved") {
      if (userRole === "admin" || userRole === "finance") {
        actions += `
          <button class="glass-btn success" onclick="confirmPayment('${f.id}')">💳 تایید پرداخت</button>
        `;
      }
    }
    if (f.payment_status === "paid") {

  if (userRole === "admin") {
    actions += `
      <button class="glass-btn danger"
        onclick="deleteFinance('${f.id}')">
        🗑 حذف
      </button>
    `;
  }
    }
    
    list.innerHTML += `
  <div class="glass-card">
    <b>${f.title || "-"}</b><br>
    💰 ${Number(f.amount || 0).toLocaleString()} تومان<br>
    📌 ${f.description || ""}

    ${f.file_url ? `
      <br><br>
      <a href="${f.file_url}" target="_blank" class="glass-btn">
        📎 ضمیمه
      </a>
    ` : ""}

    <br><br>

    <span>وضعیت: ${statusText(f.status)}</span><br>
    <span>پرداخت: ${paymentText(f.payment_status)}</span>

    <div class="action-buttons">
      ${actions}
    </div>
  </div>
`;
  });
}


/* ================= LOAD FINANCE ================= */
async function loadFinance(){
  const { data } = await client
    .from("financial_requests")
    .select("*")
    .order("id", { ascending:false });

  financeRequests = data || [];
  renderFinance();
}


/* ================= ACTIONS ================= */
window.approveFinance = async (id) => {
  await client
    .from("financial_requests")
    .update({ status: "approved" })
    .eq("id", id);

  loadFinance();
};

window.rejectFinance = async (id) => {
  await client
    .from("financial_requests")
    .update({ status: "rejected" })
    .eq("id", id);

  loadFinance();
};

window.confirmPayment = async (id) => {
  await client
    .from("financial_requests")
    .update({ payment_status: "paid" })
    .eq("id", id);

  loadFinance();
};

window.deleteFinance = async (id) => {
  await client
    .from("financial_requests")
    .delete()
    .eq("id", id);

  loadFinance();
};

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
    initNav();
    initModals();
    startClock();
    hideSplash();
    await checkSession();
});
