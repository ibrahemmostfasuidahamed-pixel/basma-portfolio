// =====================================================
//   Admin Dashboard JavaScript - بصمة
//   Complete CRUD Operations for All Entities
// =====================================================

// Global Data
let usersData = [];
let portfolioData = [];
let settingsData = {};

// ===== Auth Check =====
(async () => {
    try {
        const session = localStorage.getItem('admin_session');
        if (!session) {
            window.location.href = 'index.html';
            return;
        }

        const user = JSON.parse(session);
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.textContent = user.email;

        loadDashboard();
    } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('admin_session');
        window.location.href = 'index.html';
    }
})();

// ===== Load Dashboard =====
async function loadDashboard() {
    await Promise.all([
        loadUsers(),
        loadPortfolio(),
        loadSettings()
    ]);
    updateStats();
}

// ===== Update Stats =====
function updateStats() {
    const stats = {
        usersCount: usersData.length,
        portfolioCount: portfolioData.length
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
    localStorage.removeItem('admin_session');
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
    const user = userId ? usersData.find(u => u.id === userId) : null;
    const isEdit = !!user;

    const modalHTML = `
        <div class="modal-overlay active" id="userModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
                    <button class="modal-close" onclick="closeModal('userModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="userForm" onsubmit="saveUser(event, '${userId || ''}')">
                    <div class="modal-body">
                        <div class="form-group">
                            <label>البريد الإلكتروني *</label>
                            <input type="email" name="email" class="form-control" value="${user?.email || ''}" required ${isEdit ? 'readonly' : ''}>
                        </div>
                        <div class="form-group">
                            <label>الاسم الكامل</label>
                            <input type="text" name="full_name" class="form-control" value="${user?.full_name || ''}">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>الصلاحية</label>
                                <select name="role" class="form-control">
                                    <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>مدير</option>
                                    <option value="super_admin" ${user?.role === 'super_admin' ? 'selected' : ''}>مدير عام</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 30px;">
                                    <input type="checkbox" name="is_active" ${user?.is_active !== false ? 'checked' : ''}>
                                    <span>نشط</span>
                                </label>
                            </div>
                        </div>
                        ${!isEdit ? `
                        <div class="form-group">
                            <label>كلمة المرور *</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">إلغاء</button>
                        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> حفظ</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
}

async function saveUser(event, userId) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const userData = {
        email: formData.get('email'),
        full_name: formData.get('full_name'),
        role: formData.get('role'),
        is_active: formData.get('is_active') === 'on',
        updated_at: new Date().toISOString()
    };

    if (!userId) {
        userData.password_hash = formData.get('password'); // Simple password storage
        userData.created_at = new Date().toISOString();
    }

    try {
        if (userId) {
            const { error } = await db.supabaseClient.from('admin_users').update(userData).eq('id', userId);
            if (error) throw error;
            showToast('تم تحديث المستخدم بنجاح', 'success');
        } else {
            const { error } = await db.supabaseClient.from('admin_users').insert([userData]);
            if (error) throw error;
            showToast('تم إضافة المستخدم بنجاح', 'success');
        }
        closeModal('userModal');
        loadUsers();
        updateStats();
    } catch (error) {
        console.error('Error saving user:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
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
// HELPER FUNCTIONS
// =====================================================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    document.body.style.overflow = '';
}

// Upload image to Supabase Storage
async function uploadImage(file, folder = 'portfolio') {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await db.supabaseClient.storage
            .from('images')
            .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: urlData } = db.supabaseClient.storage
            .from('images')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
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
    const item = itemId ? portfolioData.find(p => p.id === itemId) : null;
    const isEdit = !!item;

    const modalHTML = `
        <div class="modal-overlay active" id="portfolioModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">${isEdit ? 'تعديل عمل' : 'إضافة عمل جديد'}</h3>
                    <button class="modal-close" onclick="closeModal('portfolioModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="portfolioForm" onsubmit="savePortfolio(event, '${itemId || ''}')">
                    <div class="modal-body">
                        <div class="form-group">
                            <label>العنوان *</label>
                            <input type="text" name="title" class="form-control" value="${item?.title || ''}" required>
                        </div>

                        <div class="form-group">
                            <label>التصنيف</label>
                            <input type="text" name="category" class="form-control" value="${item?.category || ''}" placeholder="مثال: موشن جرافيك">
                        </div>

                        <div class="form-group">
                            <label>الوصف</label>
                            <textarea name="description" class="form-control" rows="3">${item?.description || ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label>الصورة ${isEdit ? '' : '*'}</label>
                            <input type="file" name="image_file" class="form-control" accept="image/*" ${isEdit ? '' : 'required'}>
                            ${item?.image_url ? `<small style="color: #666; margin-top: 5px; display: block;">الصورة الحالية: <a href="${item.image_url}" target="_blank">عرض</a></small>` : ''}
                        </div>

                        <div class="form-group">
                            <label>رابط الفيديو (YouTube)</label>
                            <input type="url" name="video_url" class="form-control" value="${item?.video_url || ''}" placeholder="https://youtube.com/watch?v=...">
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" name="is_published" ${item?.is_published !== false ? 'checked' : ''}>
                                <span>منشور (يظهر في الموقع)</span>
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('portfolioModal')">إلغاء</button>
                        <button type="submit" class="btn btn-primary" id="portfolioSubmitBtn">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const container = document.getElementById('modalContainer');
    container.innerHTML = modalHTML;
}

async function savePortfolio(event, itemId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('portfolioSubmitBtn');

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

    try {
        const portfolioItem = {
            title: formData.get('title'),
            category: formData.get('category'),
            description: formData.get('description'),
            video_url: formData.get('video_url'),
            is_published: formData.get('is_published') === 'on',
            updated_at: new Date().toISOString()
        };

        // Handle image upload
        const imageFile = formData.get('image_file');
        if (imageFile && imageFile.size > 0) {
            showToast('جاري رفع الصورة...', 'info');
            const imageUrl = await uploadImage(imageFile, 'portfolio');
            portfolioItem.image_url = imageUrl;
        } else if (itemId) {
            // Keep existing image if editing and no new image uploaded
            const existingItem = portfolioData.find(p => p.id === itemId);
            if (existingItem) {
                portfolioItem.image_url = existingItem.image_url;
            }
        }

        if (itemId) {
            const { error } = await db.supabaseClient
                .from('portfolio')
                .update(portfolioItem)
                .eq('id', itemId);

            if (error) throw error;
            showToast('تم تحديث العمل بنجاح', 'success');
        } else {
            portfolioItem.created_at = new Date().toISOString();
            const { error } = await db.supabaseClient
                .from('portfolio')
                .insert([portfolioItem]);

            if (error) throw error;
            showToast('تم إضافة العمل بنجاح', 'success');
        }

        closeModal('portfolioModal');
        loadPortfolio();
        updateStats();
    } catch (error) {
        console.error('Error saving portfolio:', error);
        showToast('حدث خطأ أثناء الحفظ: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
    }
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
