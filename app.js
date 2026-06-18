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

// Pagination state
let projectPage = 1, missionPage = 1, staffPage = 1, financePage = 1;
const PAGE_SIZE = 5;

// All data cache
let allProjects = [];
let allMissions = [];
let allStaff = [];
let allFinance = [];

function isAdmin() { return userRole === "admin"; }
function isManager() { return userRole === "manager"; }
function isFinance() { return userRole === "finance"; }

/* ================= STAFF DATA ================= */
const defaultStaff = [
    { name: "سید طاهر", lastname: "علوی", phone: "09121192271", nationalId: "5459703840" },
    { name: "اکبر", lastname: "کندی", phone: "09121044458", nationalId: "005125331" },
    { name: "علیرضا", lastname: "علوی", phone: "09123173681", nationalId: "0065088786" },
    { name: "سید امین", lastname: "امینی", phone: "09122307045", nationalId: "0080434657" },
    { name: "سید صمد", lastname: "حسینی", phone: "09123350694", nationalId: "2141044855" },
    { name: "احمد", lastname: "نقیبی", phone: "09122110268", nationalId: "4989547047" },
    { name: "نورمحمد", lastname: "اعرابی", phone: "09191075146", nationalId: "2249735875" }
];

/* ================= TOAST SYSTEM ================= */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => toast.classList.add('show'), 10);

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ================= DOM ELEMENTS ================= */
let loginUI, loginBtn, signupBtn, forgotBtn, emailInput, passInput;
let pName, pSupervisor, pProgress, pBuildStatus, pAdjustment, pDescription;
let mName, mManager, mStatus;

/* ================= INIT DOM ================= */
function initDOM() {
    loginUI = document.getElementById("login-ui");
    loginBtn = document.getElementById("loginBtn");
    signupBtn = document.getElementById("signupBtn");
    forgotBtn = document.getElementById("forgotBtn");
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
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function drawHand(angle, length, width, color) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.save();
        ctx.rotate(angle);
        ctx.moveTo(0, 8);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.restore();
    }

    function draw() {
        const now = new Date();
        const r = canvas.width / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(r, r);

        ctx.beginPath();
        ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
        const grd = ctx.createRadialGradient(0, 0, 5, 0, 0, r);
        grd.addColorStop(0, "#1e293b");
        grd.addColorStop(1, "#0f172a");
        ctx.fillStyle = grd;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, r - 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56,189,248,.35)";
        ctx.lineWidth = 3;
        ctx.stroke();

        for (let i = 0; i < 12; i++) {
            const ang = i * Math.PI / 6;
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255,255,255,.35)";
            ctx.lineWidth = 2;
            ctx.moveTo(Math.sin(ang) * (r - 16), -Math.cos(ang) * (r - 16));
            ctx.lineTo(Math.sin(ang) * (r - 26), -Math.cos(ang) * (r - 26));
            ctx.stroke();
        }

        const h = now.getHours() % 12;
        const m = now.getMinutes();
        const s = now.getSeconds();

        drawHand((h * Math.PI / 6) + (m * Math.PI / 360), r * 0.42, 5, "#ffffff");
        drawHand(m * Math.PI / 30, r * 0.58, 3, "#38bdf8");
        drawHand(s * Math.PI / 30, r * 0.68, 2, "#ef4444");

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();

        document.getElementById("live-date").textContent =
            now.toLocaleDateString("fa-IR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    }

    draw();
    setInterval(draw, 1000);
}

/* ================= NAV ================= */
function initNav() {
    const buttons = document.querySelectorAll(".bottom-nav button");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));

            const pageId = btn.dataset.page;
            const pageEl = document.getElementById(pageId);
            if (pageEl) pageEl.classList.add("active");
            btn.classList.add("active");
        });
    });

    const first = document.querySelector(".bottom-nav button");
    if (first) first.classList.add("active");
}

/* ================= MODALS ================= */
function initModals() {
    document.getElementById("open-project")?.addEventListener("click", () => {
        document.getElementById("project-modal").style.display = "flex";
    });
    document.getElementById("close-project")?.addEventListener("click", () => {
        document.getElementById("project-modal").style.display = "none";
        editingProjectId = null;
        document.getElementById("add-project").textContent = "ثبت";
    });

    document.getElementById("open-mission")?.addEventListener("click", () => {
        document.getElementById("mission-modal").style.display = "flex";
    });
    document.getElementById("close-mission")?.addEventListener("click", () => {
        document.getElementById("mission-modal").style.display = "none";
        editingMissionId = null;
        document.getElementById("add-mission").textContent = "ثبت";
    });

    document.getElementById("open-finance")?.addEventListener("click", () => {
        document.getElementById("finance-modal").style.display = "flex";
    });
    document.getElementById("close-finance")?.addEventListener("click", () => {
        document.getElementById("finance-modal").style.display = "none";
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.style.display = "none";
        });
    });
    // فراموشی رمز
setTimeout(() => {
    const fb = document.getElementById("forgotBtn");
    if (fb) {
        fb.onclick = () => {
            document.getElementById("reset-modal").style.display = "flex";
        };
        console.log("✅ forgotBtn وصل شد");
    } else {
        console.log("❌ forgotBtn پیدا نشد");
    }
}, 500);

    // دکمه‌های داخل مودال ریست
    const sr = document.getElementById("send-reset-btn");
    if (sr) {
        sr.onclick = sendResetPassword;
    }

    const cr = document.getElementById("close-reset-btn");
    if (cr) {
        cr.onclick = () => {
            document.getElementById("reset-modal").style.display = "none";
        };
    }
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

        // Show admin nav button
        const adminBtn = document.getElementById("admin-nav-btn");
        if (adminBtn && userRole === "admin") {
            adminBtn.style.display = "block";
        }
    }

    /* ================= LOGIN ================= */
    async function login() {
        const email = emailInput.value.trim();
        const password = passInput.value;

        const { data, error } = await client.auth.signInWithPassword({ email, password });

        if (error) {
            showToast(error.message, 'error');
            return;
        }

        currentUser = data.session.user;
        await loadUserRole();
        await startApp();
        showToast('خوش آمدید! 👋', 'success');
    }

    /* ================= SIGNUP ================= */
    async function signup() {
        const email = emailInput.value.trim();
        const password = passInput.value;

        const { data, error } = await client.auth.signUp({ email, password });

        if (error) {
            showToast(error.message, 'error');
            return;
        }

        // ذخیره ایمیل توی جدول profiles
        if (data.user) {
            await client.from("profiles").upsert({
                id: data.user.id,
                email: email,
                role: "user"
            });
        }

        showToast('ایمیل تایید ارسال شد 📧', 'success');
    }

    /* ================= FORGOT PASSWORD ================= */
    async function sendResetPassword() {
        const email = document.getElementById("reset-email").value.trim();
        if (!email) {
            showToast('لطفاً ایمیل را وارد کنید', 'error');
            return;
        }

        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });

        if (error) {
            showToast(error.message, 'error');
            return;
        }

        showToast('لینک بازیابی به ایمیل شما ارسال شد 📧', 'success');
        document.getElementById("reset-modal").style.display = "none";
    }

    /* ================= START APP ================= */
    async function startApp() {
        if (loginUI) loginUI.style.display = "none";

        await loadProjects();
        await loadMissions();
        renderStaff();
        await loadFinance();
        update();
        showUserInfo();

        if (userRole === "admin") {
            await loadAllUsers();
        }
    }

    /* ================= EVENTS ================= */
    function bindEvents() {
        loginBtn?.addEventListener("click", login);
        signupBtn?.addEventListener("click", signup);

        forgotBtn?.addEventListener("click", () => {
            document.getElementById("reset-modal").style.display = "flex";
        });

        document.getElementById("send-reset-btn")?.addEventListener("click", sendResetPassword);
        document.getElementById("close-reset-btn")?.addEventListener("click", () => {
            document.getElementById("reset-modal").style.display = "none";
        });

        // Project
        document.getElementById("add-project")?.addEventListener("click", async () => {
            const name = pName.value.trim();
            if (!name) return showToast("نام پروژه لازم است", 'error');

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

            if (error) return showToast(error.message, 'error');

            pName.value = "";
            pSupervisor.value = "";
            pProgress.value = "";
            pBuildStatus.value = "";
            pAdjustment.value = "";
            pDescription.value = "";

            document.getElementById("project-modal").style.display = "none";
            await loadProjects();
            showToast('پروژه با موفقیت ذخیره شد ✅', 'success');
        });

        // Mission
        document.getElementById("add-mission")?.addEventListener("click", async () => {
            const name = mName.value.trim();
            if (!name) return showToast("نام ماموریت لازم است", 'error');

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

            if (error) return showToast(error.message, 'error');

            mName.value = "";
            mManager.value = "";
            mStatus.value = "";

            document.getElementById("mission-modal").style.display = "none";
            await loadMissions();
            showToast('ماموریت با موفقیت ذخیره شد ✅', 'success');
        });

        // Finance
        document.getElementById("add-finance")?.addEventListener("click", async () => {
            const title = document.getElementById("f-title").value;
            const amount = document.getElementById("f-amount").value.replace(/[^0-9]/g, '');
            const description = document.getElementById("f-desc").value;

            if (!title) return showToast("عنوان لازم است", 'error');

            const fileInput = document.getElementById("f-file");
            const file = fileInput.files[0];
            let fileUrl = null;

            if (file) {
                const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
                const { error: uploadError } = await client
                    .storage
                    .from("finance-files")
                    .upload(fileName, file);

                if (uploadError) {
                    showToast(uploadError.message, 'error');
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

            if (error) return showToast(error.message, 'error');

            document.getElementById("finance-modal").style.display = "none";
            document.getElementById("f-title").value = "";
            document.getElementById("f-amount").value = "";
            document.getElementById("f-desc").value = "";
            document.getElementById("f-file").value = "";
            await loadFinance();
            showToast('درخواست مالی ثبت شد 💰', 'success');
        });

        // Amount validation
        document.getElementById("f-amount")?.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, "");
        });

        // Logout
        document.getElementById("logout-btn")?.addEventListener("click", () => {
            document.getElementById("logout-modal").style.display = "flex";
        });
        document.getElementById("cancel-logout")?.addEventListener("click", () => {
            document.getElementById("logout-modal").style.display = "none";
        });
        document.getElementById("confirm-logout")?.addEventListener("click", async () => {
            document.getElementById("logout-modal").style.display = "none";
            await client.auth.signOut();
            location.reload();
        });

        // Reject
        document.getElementById("reject-cancel-btn")?.addEventListener("click", () => {
            document.getElementById("reject-modal").style.display = "none";
            rejectFinanceId = null;
        });
        document.getElementById("reject-confirm-btn")?.addEventListener("click", async () => {
            if (!rejectFinanceId) return;
            const { error } = await client
                .from("financial_requests")
                .delete()
                .eq("id", rejectFinanceId);
            if (error) return showToast(error.message, 'error');
            document.getElementById("reject-modal").style.display = "none";
            rejectFinanceId = null;
            await loadFinance();
            showToast('درخواست حذف شد ❌', 'info');
        });

        // Search event listeners
        document.getElementById("project-search")?.addEventListener("input", () => {
            projectPage = 1;
            renderProjects();
        });
        document.getElementById("mission-search")?.addEventListener("input", () => {
            missionPage = 1;
            renderMissions();
        });
        document.getElementById("staff-search")?.addEventListener("input", () => {
            renderStaff(); // فقط renderStaff صدا زده بشه، بدون ریست کردن staffPage
        });
        document.getElementById("finance-search")?.addEventListener("input", () => {
            financePage = 1;
            renderFinance();
        });
        document.getElementById("finance-filter")?.addEventListener("change", () => {
            financePage = 1;
            renderFinance();
        });
    }

    /* ================= PAGINATION HELPER ================= */
    function renderPagination(containerId, currentPage, totalItems, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = Math.ceil(totalItems / PAGE_SIZE);
        if (totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = '<button ' + (currentPage === 1 ? 'disabled' : '') + ' onclick="void(0)">◀ قبلی</button>';

        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === currentPage ? 'active-page' : ''}" 
                    data-page="${i}">${i}</button>`;
        }

        html += '<button ' + (currentPage === totalPages ? 'disabled' : '') + ' onclick="void(0)">بعدی ▶</button>';

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (!isNaN(page)) {
                    onPageChange(page);
                } else if (btn.textContent.includes('قبلی') && currentPage > 1) {
                    onPageChange(currentPage - 1);
                } else if (btn.textContent.includes('بعدی') && currentPage < totalPages) {
                    onPageChange(currentPage + 1);
                }
            });
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
        allProjects = data || [];
        projectPage = 1;
        renderProjects();
    }

    function renderProjects() {
        const searchTerm = document.getElementById("project-search")?.value.trim().toLowerCase() || "";
        let filtered = allProjects;

        if (searchTerm) {
            filtered = allProjects.filter(p =>
                p.name?.toLowerCase().includes(searchTerm) ||
                p.supervisor?.toLowerCase().includes(searchTerm)
            );
        }

        const total = filtered.length;
        const start = (projectPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        const list = document.getElementById("projects-list");
        list.innerHTML = "";

        pageItems.forEach(p => {
            list.innerHTML += `
        <div class="item">
            <b>${p.name}</b><br>
            👷 ${p.supervisor || "-"}<br>
            📈 ${p.progress || 0}%
            <div class="action-buttons">
                <button class="edit-btn" onclick="editProject('${p.id}')">✏️ اصلاح</button>
                <button class="del-btn" onclick="deleteProject('${p.id}')">🗑 حذف</button>
            </div>
        </div>`;
        });

        renderPagination("projects-pagination", projectPage, total, (page) => {
            projectPage = page;
            renderProjects();
        });

        update();
    }

    window.editProject = function (id) {
        const project = allProjects.find(p => p.id === id);
        if (!project) return;
        editingProjectId = id;
        pName.value = project.name || "";
        pSupervisor.value = project.supervisor || "";
        pProgress.value = project.progress || "";
        pBuildStatus.value = project.buildStatus || "";
        pAdjustment.value = project.adjustment || "";
        pDescription.value = project.description || "";
        document.getElementById("add-project").textContent = "💾 ذخیره تغییرات";
        document.getElementById("project-modal").style.display = "flex";
    };

    window.deleteProject = async (id) => {
        if (!confirm("آیا از حذف این پروژه مطمئن هستید؟")) return;
        await client.from("projects").delete().eq("id", id);
        await loadProjects();
        showToast('پروژه حذف شد 🗑', 'info');
    };

    /* ================= MISSIONS ================= */
    async function loadMissions() {
        if (!currentUser) return;
        const { data } = await client
            .from("missions")
            .select("*")
            .eq("owner_id", currentUser.id)
            .order("created_at", { ascending: false });

        allMissions = data || [];
        missionPage = 1;
        renderMissions();
    }

    function renderMissions() {
        const searchTerm = document.getElementById("mission-search")?.value.trim().toLowerCase() || "";
        let filtered = allMissions;

        if (searchTerm) {
            filtered = allMissions.filter(m =>
                m.name?.toLowerCase().includes(searchTerm) ||
                m.manager?.toLowerCase().includes(searchTerm)
            );
        }

        const total = filtered.length;
        const start = (missionPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        const list = document.getElementById("missions-list");
        list.innerHTML = "";

        pageItems.forEach(m => {
            list.innerHTML += `
        <div class="item">
            <b>${m.name}</b><br>
            👤 ${m.manager || "-"}<br>
            📌 ${m.status || "-"}
            <div class="action-buttons">
                <button class="edit-btn" onclick="editMission('${m.id}')">✏️ اصلاح</button>
                <button class="del-btn" onclick="deleteMission('${m.id}')">🗑 حذف</button>
            </div>
        </div>`;
        });

        renderPagination("missions-pagination", missionPage, total, (page) => {
            missionPage = page;
            renderMissions();
        });

        update();
    }

    window.editMission = function (id) {
        const mission = allMissions.find(m => m.id === id);
        if (!mission) return;
        editingMissionId = id;
        mName.value = mission.name || "";
        mManager.value = mission.manager || "";
        mStatus.value = mission.status || "";
        document.getElementById("add-mission").textContent = "💾 ذخیره تغییرات";
        document.getElementById("mission-modal").style.display = "flex";
    };

    window.deleteMission = async (id) => {
        if (!confirm("آیا از حذف این ماموریت مطمئن هستید؟")) return;
        await client.from("missions").delete().eq("id", id);
        await loadMissions();
        showToast('ماموریت حذف شد 🗑', 'info');
    };

    /* ================= STAFF ================= */
    function renderStaff() {
        const searchTerm = document.getElementById("staff-search")?.value.trim().toLowerCase() || "";
        let filtered = defaultStaff;

        if (searchTerm) {
            filtered = defaultStaff.filter(s =>
                s.name?.toLowerCase().includes(searchTerm) ||
                s.lastname?.toLowerCase().includes(searchTerm) ||
                s.phone?.includes(searchTerm) ||
                s.nationalId?.includes(searchTerm)
            );
        }

        const list = document.getElementById("staff-list");
        list.innerHTML = "";

        filtered.forEach(s => {
            list.innerHTML += `
        <div class="staff-card">
            <b>${s.name} ${s.lastname}</b>
            <small>📱 ${s.phone}</small>
            <small>🆔 ${s.nationalId || "-"}</small>
            <a class="call-btn" href="tel:${s.phone}">📞 تماس مستقیم</a>
        </div>`;
        });

        // حذف صفحه‌بندی
        document.getElementById("staff-pagination").innerHTML = "";

        update();
    }

    /* ================= HELPERS ================= */
    function statusText(status) {
        switch (status) {
            case "pending": return "در انتظار بررسی";
            case "approved": return "تایید شده";
            case "rejected": return "رد شده";
            default: return "نامشخص";
        }
    }

    function paymentText(status) {
        switch (status) {
            case "paid": return "پرداخت شده";
            case "unpaid": return "پرداخت نشده";
            default: return "نامشخص";
        }
    }

    function roleToFa(role) {
        switch (role) {
            case "admin": return "مدیر سیستم";
            case "manager": return "مدیرعامل";
            case "finance": return "امور مالی";
            case "user": return "کاربر عادی";
            default: return "نامشخص";
        }
    }

    /* ================= FINANCE ================= */
    async function loadFinance() {
        if (!currentUser) return;
        const { data } = await client
            .from("financial_requests")
            .select("*")
            .order("id", { ascending: false });

        allFinance = data || [];
        financePage = 1;
        renderFinance();
    }

    function renderFinance() {
        const searchTerm = document.getElementById("finance-search")?.value.trim().toLowerCase() || "";
        const filterValue = document.getElementById("finance-filter")?.value || "all";

        let filtered = allFinance;

        // Search
        if (searchTerm) {
            filtered = filtered.filter(f =>
                f.title?.toLowerCase().includes(searchTerm) ||
                f.description?.toLowerCase().includes(searchTerm)
            );
        }

        // Filter
        if (filterValue === "pending") filtered = filtered.filter(f => f.status === "pending");
        else if (filterValue === "approved") filtered = filtered.filter(f => f.status === "approved");
        else if (filterValue === "rejected") filtered = filtered.filter(f => f.status === "rejected");
        else if (filterValue === "paid") filtered = filtered.filter(f => f.payment_status === "paid");
        else if (filterValue === "unpaid") filtered = filtered.filter(f => f.payment_status === "unpaid");

        const total = filtered.length;
        const start = (financePage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(start, start + PAGE_SIZE);

        const list = document.getElementById("finance-list");
        list.innerHTML = "";

        pageItems.forEach(f => {
            let actions = "";

            if (!f.status || f.status === "pending") {
                if (userRole === "admin" || userRole === "manager") {
                    actions += `
                <button class="glass-btn" onclick="approveFinance('${f.id}')">✔ تایید</button>
                <button class="glass-btn danger" onclick="openRejectModal('${f.id}')">✖ رد</button>`;
                }
            }

            if (f.status === "approved" && f.payment_status !== "paid") {
                if (userRole === "admin" || userRole === "finance") {
                    actions += `
                <button class="glass-btn success" onclick="confirmPayment('${f.id}')">💳 تایید پرداخت</button>`;
                }
            }

            if (f.payment_status === "paid" && userRole === "admin") {
                actions += `
            <button class="glass-btn danger" onclick="deleteFinance('${f.id}')">🗑 حذف</button>`;
            }

            list.innerHTML += `
        <div class="glass-card">
            <b>${f.title || "-"}</b><br>
            💰 ${Number(f.amount || 0).toLocaleString()} تومان<br>
            📌 ${f.description || ""}
            ${f.file_url ? `<br><br><a href="${f.file_url}" target="_blank" class="glass-btn">📎 ضمیمه</a>` : ""}
            <br><br>
            <span>وضعیت: ${statusText(f.status)}</span><br>
            <span>پرداخت: ${paymentText(f.payment_status)}</span>
            <div class="action-buttons">${actions}</div>
        </div>`;
        });

        renderPagination("finance-pagination", financePage, total, (page) => {
            financePage = page;
            renderFinance();
        });
    }

    /* ================= FINANCE ACTIONS ================= */
    window.approveFinance = async (id) => {
        await client.from("financial_requests").update({ status: "approved" }).eq("id", id);
        await loadFinance();
        showToast('درخواست تایید شد ✅', 'success');
    };

    window.confirmPayment = async (id) => {
        await client.from("financial_requests").update({ payment_status: "paid" }).eq("id", id);
        await loadFinance();
        showToast('پرداخت تایید شد 💳', 'success');
    };

    window.deleteFinance = async (id) => {
        if (!confirm("آیا از حذف این درخواست مطمئن هستید؟")) return;
        await client.from("financial_requests").delete().eq("id", id);
        await loadFinance();
        showToast('درخواست حذف شد 🗑', 'info');
    };

    window.openRejectModal = function (id) {
        rejectFinanceId = id;
        document.getElementById("reject-modal").style.display = "flex";
    };

    /* ================= USER INFO ================= */
    function showUserInfo() {
        if (!currentUser) return;
        document.getElementById("user-email").textContent = currentUser.email;
        document.getElementById("user-id").textContent = currentUser.id;

        const roleEl = document.getElementById("user-role");
        roleEl.textContent = roleToFa(userRole);

        if (userRole === "admin") roleEl.style.color = "#ef4444";
        else if (userRole === "manager") roleEl.style.color = "#3b82f6";
        else if (userRole === "finance") roleEl.style.color = "#22c55e";
        else roleEl.style.color = "#a1a1aa";
    }

    /* ================= ADMIN PANEL ================= */
    async function loadAllUsers() {
        // Get all profiles
        const { data: profiles, error } = await client
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.warn("loadAllUsers error:", error.message);
            return;
        }

        const table = document.getElementById("users-table");
        if (!table) return;

        let html = '<div style="overflow-x:auto;">';

        profiles.forEach(profile => {
            html += `
    <div class="user-row">
        <div style="flex:1;">
            <div style="font-weight:bold; color:white;">📧 ${profile.email || 'بدون ایمیل'}</div>
            <small style="opacity:0.5;">🆔 ${profile.id?.slice(0, 12)}...</small>
        </div>
        <span class="role-badge ${profile.role || 'user'}">${roleToFa(profile.role)}</span>
        <select id="role-select-${profile.id}">
            <option value="user" ${profile.role === 'user' ? 'selected' : ''}>کاربر عادی</option>
            <option value="manager" ${profile.role === 'manager' ? 'selected' : ''}>مدیرعامل</option>
            <option value="finance" ${profile.role === 'finance' ? 'selected' : ''}>امور مالی</option>
            <option value="admin" ${profile.role === 'admin' ? 'selected' : ''}>مدیر سیستم</option>
        </select>
        <button class="save-role-btn" onclick="updateUserRole('${profile.id}')">💾 ذخیره</button>
    </div>`;
        });

        html += '</div>';
        table.innerHTML = html;
    }

    window.updateUserRole = async function (userId) {
        const select = document.getElementById(`role-select-${userId}`);
        if (!select) return;

        const newRole = select.value;

        const { error } = await client
            .from("profiles")
            .upsert({ id: userId, role: newRole });

        if (error) {
            showToast(error.message, 'error');
            return;
        }

        // If changing own role, update
        if (userId === currentUser.id) {
            userRole = newRole;
            showUserInfo();

            // Show/hide admin nav
            const adminBtn = document.getElementById("admin-nav-btn");
            if (adminBtn) {
                adminBtn.style.display = newRole === "admin" ? "block" : "none";
            }
        }

        showToast('نقش کاربر به‌روزرسانی شد ✅', 'success');
        await loadAllUsers();
    };

    /* ================= DASH ================= */
    function update() {
        document.getElementById("projects-count").textContent = allProjects.length;
        document.getElementById("missions-count").textContent = allMissions.length;
        document.getElementById("staff-count").textContent = defaultStaff.length;
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
