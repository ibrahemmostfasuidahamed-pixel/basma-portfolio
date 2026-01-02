// =====================================================
//   Admin Dashboard JavaScript - بصمة
//   Complete CRUD Operations for All Entities
// =====================================================

// Global Data
let usersData = [];
let servicesData = [];
let portfolioData = [];
let menuData = [];
let settingsData = {};

// ===== Auth Check =====
(async () => {
    try {
        const user = await db.getUser();
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.textContent = user.email;
        loadDashboard();
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'index.html';
    }
})();

// ===== Load Dashboard =====
async function loadDashboard() {
    await Promise.all([
        loadUsers(),
        loadServices(),
        loadPortfolio(),
        loadMenu(),
        loadSettings()
    ]);
    updateStats();
}

// ===== Update Stats =====
function updateStats() {
    const stats = {
        usersCount: usersData.length,
        servicesCount: servicesData.length,
        portfolioCount: portfolioData.length,
        menuCount: menuData.length
    };

    Object.keys(stats).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.textContent = stats[key];
    });
}

// ===== Section Navigation =====
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');

    // Show selected section
    const sectionEl = document.getElementById(`${section}-section`);
    if (sectionEl) sectionEl.style.display = 'block';

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event?.target?.closest('.nav-item')?.classList.add('active');
}

// ===== Logout =====
async function logout() {
    await db.signOut();
    window.location.href = 'index.html';
}

// =====================================================
// USERS MANAGEMENT
// =====================================================

async function loadUsers() {
    const loading = document.getElementById('usersLoading');
    const table = document.getElementById('usersTable');
    const tbody = document.getElementById('usersTableBody');

    if (!tbody) return;

    try {
        const { data, error } = await db.supabaseClient
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        usersData = data || [];

        tbody.innerHTML = usersData.map(user => `
            <tr>
                <td><strong>${user.full_name || '-'}</strong></td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.role === 'super_admin' ? 'danger' : 'info'}">${user.role}</span></td>
                <td><span class="badge badge-${user.is_active ? 'success' : 'warning'}">${user.is_active ? 'نشط' : 'معطل'}</span></td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleDateString('ar') : '-'}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (loading) loading.style.display = 'none';
        if (table) table.style.display = 'table';
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function openUserModal(userId = null) {
    // TODO: Implement user modal
    showToast('قريباً: نافذة إضافة/تعديل مستخدم', 'info');
}

function editUser(id) {
    openUserModal(id);
}

async function deleteUser(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;

    try {
        const { error } = await db.supabaseClient
            .from('admin_users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('تم حذف المستخدم بنجاح', 'success');
        loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('حدث خطأ أثناء الحذف', 'error');
    }
}

// =====================================================
// SERVICES MANAGEMENT
// =====================================================

async function loadServices() {
    const loading = document.getElementById('servicesLoading');
    const table = document.getElementById('servicesTable');
    const tbody = document.getElementById('servicesTableBody');

    if (!tbody) return;

    try {
        const { data, error } = await db.supabaseClient
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        servicesData = data || [];

        tbody.innerHTML = servicesData.map(service => `
            <tr>
                <td><img src="${service.image_url || 'https://via.placeholder.com/60x40'}" class="table-thumbnail" alt="${service.title}"></td>
                <td><strong>${service.title}</strong></td>
                <td><i class="${service.icon || 'fas fa-cog'}"></i></td>
                <td>${service.sort_order}</td>
                <td><span class="badge badge-${service.is_active ? 'success' : 'warning'}">${service.is_active ? 'نشط' : 'مخفي'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editService('${service.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteService('${service.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (loading) loading.style.display = 'none';
        if (table) table.style.display = 'table';
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

function openServiceModal(serviceId = null) {
    showToast('قريباً: نافذة إضافة/تعديل خدمة', 'info');
}

function editService(id) {
    openServiceModal(id);
}

async function deleteService(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    try {
        const { error } = await db.supabaseClient
            .from('services')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('تم حذف الخدمة بنجاح', 'success');
        loadServices();
    } catch (error) {
        console.error('Error deleting service:', error);
        showToast('حدث خطأ أثناء الحذف', 'error');
    }
}

// =====================================================
// PORTFOLIO MANAGEMENT
// =====================================================

async function loadPortfolio() {
    const loading = document.getElementById('portfolioLoading');
    const table = document.getElementById('portfolioTable');
    const tbody = document.getElementById('portfolioTableBody');

    if (!tbody) return;

    try {
        const { data, error } = await db.supabaseClient
            .from('portfolio')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        portfolioData = data || [];

        tbody.innerHTML = portfolioData.map(item => `
            <tr>
                <td><img src="${item.image_url || 'https://via.placeholder.com/60x40'}" class="table-thumbnail" alt="${item.title}"></td>
                <td><strong>${item.title}</strong></td>
                <td>${item.category || '-'}</td>
                <td><span class="badge badge-${item.is_published ? 'success' : 'warning'}">${item.is_published ? 'منشور' : 'مخفي'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editPortfolio('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePortfolio('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (loading) loading.style.display = 'none';
        if (table) table.style.display = 'table';
    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
}

function openPortfolioModal(itemId = null) {
    showToast('قريباً: نافذة إضافة/تعديل عمل', 'info');
}

function editPortfolio(id) {
    openPortfolioModal(id);
}

async function deletePortfolio(id) {
    if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;

    try {
        const { error } = await db.supabaseClient
            .from('portfolio')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('تم حذف العمل بنجاح', 'success');
        loadPortfolio();
    } catch (error) {
        console.error('Error deleting portfolio:', error);
        showToast('حدث خطأ أثناء الحذف', 'error');
    }
}

// =====================================================
// MENU MANAGEMENT
// =====================================================

async function loadMenu() {
    const loading = document.getElementById('menuLoading');
    const table = document.getElementById('menuTable');
    const tbody = document.getElementById('menuTableBody');

    if (!tbody) return;

    try {
        const { data, error } = await db.supabaseClient
            .from('menu_items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        menuData = data || [];

        tbody.innerHTML = menuData.map(item => `
            <tr>
                <td><strong>${item.label}</strong></td>
                <td>${item.url}</td>
                <td><span class="badge badge-${item.type === 'cta' ? 'primary' : 'secondary'}">${item.type}</span></td>
                <td>${item.sort_order}</td>
                <td><span class="badge badge-${item.is_active ? 'success' : 'warning'}">${item.is_active ? 'نشط' : 'مخفي'}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-sm btn-secondary" onclick="editMenu('${item.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMenu('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        if (loading) loading.style.display = 'none';
        if (table) table.style.display = 'table';
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

function openMenuModal(itemId = null) {
    showToast('قريباً: نافذة إضافة/تعديل عنصر قائمة', 'info');
}

function editMenu(id) {
    openMenuModal(id);
}

async function deleteMenu(id) {
    if (!confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;

    try {
        const { error } = await db.supabaseClient
            .from('menu_items')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('تم حذف العنصر بنجاح', 'success');
        loadMenu();
    } catch (error) {
        console.error('Error deleting menu item:', error);
        showToast('حدث خطأ أثناء الحذف', 'error');
    }
}

// =====================================================
// SETTINGS MANAGEMENT
// =====================================================

async function loadSettings() {
    try {
        const { data, error } = await db.supabaseClient
            .from('site_settings')
            .select('*');

        if (error) throw error;

        settingsData = {};
        (data || []).forEach(setting => {
            settingsData[setting.setting_key] = setting.setting_value;
            const input = document.getElementById(`setting_${setting.setting_key}`);
            if (input) input.value = setting.setting_value || '';
        });
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    const settingKeys = [
        'site_name', 'site_description', 'whatsapp_number',
        'youtube_url', 'instagram_url', 'tiktok_url', 'twitter_url'
    ];

    try {
        for (const key of settingKeys) {
            const input = document.getElementById(`setting_${key}`);
            if (!input) continue;

            const { error } = await db.supabaseClient
                .from('site_settings')
                .upsert({
                    setting_key: key,
                    setting_value: input.value,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'setting_key' });

            if (error) throw error;
        }

        showToast('تم حفظ الإعدادات بنجاح', 'success');
        loadSettings();
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
