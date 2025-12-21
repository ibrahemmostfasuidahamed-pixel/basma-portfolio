// =====================================================
//   Admin Dashboard JavaScript
//   بصمة - Basma Portfolio
// =====================================================

// ===== Auth Check =====
(async () => {
    try {
        const user = await db.getUser();
        if (!user) {
            console.log('No user logged in, redirecting...');
            window.location.href = 'index.html';
            return;
        }
        document.getElementById('userEmail').textContent = user.email;
        console.log('User logged in:', user.email);
        loadDashboard();
    } catch (error) {
        console.error('Auth error:', error);
        // Still try to load dashboard for debugging
        loadDashboard();
    }
})();

// ===== Load Dashboard Data =====
async function loadDashboard() {
    console.log('Loading dashboard...');
    try {
        await Promise.all([
            loadMenu(),
            loadServices(),
            loadPortfolio()
        ]);
        console.log('Dashboard loaded successfully');
    } catch (error) {
        console.error('Dashboard load error:', error);
    }
}

// ===== Menu Items =====
let menuData = [];

async function loadMenu() {
    const loading = document.getElementById('menuLoading');
    const table = document.getElementById('menuTable');

    if (!loading || !table) return;

    try {
        const data = await db.getAllMenuItems();
        menuData = data || [];
        renderMenuTable();

        loading.style.display = 'none';
        table.style.display = 'table';
    } catch (error) {
        console.error('Error loading menu:', error);
        showToast('خطأ في تحميل القائمة', 'error');
    }
}

function renderMenuTable() {
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) return;

    tbody.innerHTML = menuData.map(item => `
        <tr>
            <td><strong>${item.sort_order || 1}</strong></td>
            <td>${item.label}</td>
            <td><code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px;">${item.url}</code></td>
            <td><span class="badge ${item.type === 'cta' ? 'badge-success' : 'badge-warning'}">${item.type === 'cta' ? 'زر CTA' : 'عادي'}</span></td>
            <td><span class="badge ${item.is_visible ? 'badge-success' : 'badge-warning'}">${item.is_visible ? 'ظاهر' : 'مخفي'}</span></td>
            <td>
                <div class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="editMenu('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMenuConfirm('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openMenuModal() {
    document.getElementById('menuForm').reset();
    document.getElementById('menuItemId').value = '';
    document.getElementById('menuModalTitle').textContent = 'إضافة رابط جديد';
    document.getElementById('menuVisible').checked = true;
    document.getElementById('menuModal').classList.add('active');
}

function editMenu(id) {
    const item = menuData.find(m => m.id === id);
    if (!item) return;

    document.getElementById('menuItemId').value = item.id;
    document.getElementById('menuLabel').value = item.label;
    document.getElementById('menuUrl').value = item.url;
    document.getElementById('menuOrder').value = item.sort_order || 1;
    document.getElementById('menuType').value = item.type || 'normal';
    document.getElementById('menuVisible').checked = item.is_visible;
    document.getElementById('menuModalTitle').textContent = 'تعديل الرابط';

    document.getElementById('menuModal').classList.add('active');
}

document.getElementById('menuForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('menuItemId').value;
    const itemData = {
        label: document.getElementById('menuLabel').value,
        url: document.getElementById('menuUrl').value,
        sort_order: parseInt(document.getElementById('menuOrder').value) || 1,
        type: document.getElementById('menuType').value,
        is_visible: document.getElementById('menuVisible').checked
    };

    try {
        if (id) {
            await db.updateMenuItem(id, itemData);
            showToast('تم تحديث الرابط بنجاح', 'success');
        } else {
            await db.addMenuItem(itemData);
            showToast('تم إضافة الرابط بنجاح', 'success');
        }

        closeModal('menuModal');
        loadMenu();
    } catch (error) {
        console.error('Error saving menu item:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
});

async function deleteMenuConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا الرابط؟')) {
        try {
            await db.deleteMenuItem(id);
            showToast('تم حذف الرابط', 'success');
            loadMenu();
        } catch (error) {
            showToast('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// ===== Services =====
let servicesData = [];

async function loadServices() {
    try {
        const { data, error } = await db.supabaseClient
            .from('services')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;
        servicesData = data || [];
        renderServicesTable();

        document.getElementById('servicesLoading').style.display = 'none';
        document.getElementById('servicesTable').style.display = 'table';
    } catch (error) {
        console.error('Error loading services:', error);
        document.getElementById('servicesLoading').innerHTML = '<p style="color: var(--text-secondary);">لا توجد خدمات</p>';
    }
}

function renderServicesTable() {
    const tbody = document.getElementById('servicesTableBody');
    tbody.innerHTML = servicesData.map(service => `
        <tr>
            <td><i class="${service.icon || 'fas fa-cog'}" style="font-size: 1.5rem; color: var(--accent-orange);"></i></td>
            <td>${service.title}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${service.description || ''}</td>
            <td><span class="badge ${service.is_active ? 'badge-success' : 'badge-secondary'}">${service.is_active ? 'نشط' : 'غير نشط'}</span></td>
            <td>
                <button class="btn-icon" onclick="editService('${service.id}')" title="تعديل">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon danger" onclick="deleteServiceConfirm('${service.id}')" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function openServiceModal() {
    document.getElementById('serviceModalTitle').textContent = 'إضافة خدمة جديدة';
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = '';
    document.getElementById('serviceIcon').value = 'fas fa-video';
    document.getElementById('serviceOrder').value = servicesData.length + 1;
    document.getElementById('serviceImage').value = '';
    document.getElementById('servicePreview').style.display = 'none';
    document.getElementById('servicePlaceholder').style.display = 'flex';
    document.getElementById('servicesModal').classList.add('active');
}

function editService(id) {
    const service = servicesData.find(s => s.id === id);
    if (!service) return;

    document.getElementById('serviceModalTitle').textContent = 'تعديل الخدمة';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceTitle').value = service.title;
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('serviceIcon').value = service.icon || 'fas fa-video';
    document.getElementById('serviceOrder').value = service.sort_order || 1;
    document.getElementById('serviceActive').value = service.is_active ? 'true' : 'false';

    // Handle image preview
    if (service.image_url) {
        document.getElementById('serviceImage').value = service.image_url;
        document.getElementById('servicePreviewImg').src = service.image_url;
        document.getElementById('servicePreview').style.display = 'block';
        document.getElementById('servicePlaceholder').style.display = 'none';
    } else {
        document.getElementById('serviceImage').value = '';
        document.getElementById('servicePreview').style.display = 'none';
        document.getElementById('servicePlaceholder').style.display = 'flex';
    }

    // Handle video URL
    document.getElementById('serviceVideo').value = service.video_url || '';

    document.getElementById('servicesModal').classList.add('active');
}

document.getElementById('serviceForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('serviceId').value;
    const serviceData = {
        title: document.getElementById('serviceTitle').value,
        description: document.getElementById('serviceDescription').value,
        icon: document.getElementById('serviceIcon').value,
        image_url: document.getElementById('serviceImage').value || null,
        video_url: document.getElementById('serviceVideo').value || null,
        sort_order: parseInt(document.getElementById('serviceOrder').value) || 1,
        is_active: document.getElementById('serviceActive').value === 'true'
    };

    try {
        if (id) {
            const { error } = await db.supabaseClient
                .from('services')
                .update(serviceData)
                .eq('id', id);
            if (error) throw error;
            showToast('تم تحديث الخدمة بنجاح');
        } else {
            const { error } = await db.supabaseClient
                .from('services')
                .insert([serviceData]);
            if (error) throw error;
            showToast('تم إضافة الخدمة بنجاح');
        }

        closeModal('servicesModal');
        loadServices();
    } catch (error) {
        console.error('Error saving service:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
});

async function deleteServiceConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
        try {
            const { error } = await db.supabaseClient
                .from('services')
                .delete()
                .eq('id', id);
            if (error) throw error;
            showToast('تم حذف الخدمة بنجاح');
            loadServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            showToast('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// ===== Courses =====
let coursesData = [];

async function loadCourses() {
    const loading = document.getElementById('coursesLoading');
    const table = document.getElementById('coursesTable');

    try {
        const { data, error } = await db.supabaseClient
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        coursesData = data || [];
        renderCoursesTable();
        updateStats();

        loading.style.display = 'none';
        table.style.display = 'table';
    } catch (error) {
        console.error('Error loading courses:', error);
        showToast('خطأ في تحميل الكورسات', 'error');
    }
}

function renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = coursesData.map(course => `
        <tr>
            <td><img src="${course.thumbnail_url || 'https://via.placeholder.com/60x40'}" class="table-thumbnail" alt="${course.title}"></td>
            <td><strong>${course.title}</strong></td>
            <td>${course.category || '-'}</td>
            <td>${course.duration || '-'}</td>
            <td>${course.students_count || 0}</td>
            <td><span class="badge ${course.is_published ? 'badge-success' : 'badge-warning'}">${course.is_published ? 'منشور' : 'مخفي'}</span></td>
            <td>
                <div class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="editCourse('${course.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCourseConfirm('${course.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openCourseModal(id = null) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('courseModalTitle');
    const form = document.getElementById('courseForm');

    form.reset();
    document.getElementById('courseId').value = '';
    title.textContent = 'إضافة كورس جديد';

    // Reset image preview
    removeCourseImage();

    modal.classList.add('active');
}

function editCourse(id) {
    const course = coursesData.find(c => c.id === id);
    if (!course) return;

    document.getElementById('courseId').value = course.id;
    document.getElementById('courseTitle').value = course.title;
    document.getElementById('courseCategory').value = course.category || '';
    document.getElementById('courseDuration').value = course.duration || '';
    document.getElementById('courseStudents').value = course.students_count || 0;
    document.getElementById('courseBadge').value = course.badge || '';
    document.getElementById('courseThumbnail').value = course.thumbnail_url || '';
    document.getElementById('courseVideo').value = course.video_url || '';
    document.getElementById('courseDescription').value = course.description || '';
    document.getElementById('courseModalTitle').textContent = 'تعديل الكورس';

    document.getElementById('courseModal').classList.add('active');
}

document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    submitBtn.disabled = true;

    const id = document.getElementById('courseId').value;

    try {
        // Upload new image if selected
        let thumbnailUrl = document.getElementById('courseThumbnail').value;
        if (courseImageFile) {
            thumbnailUrl = await uploadAndGetUrl(courseImageFile, 'courses');
            if (!thumbnailUrl) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
        }

        const courseData = {
            title: document.getElementById('courseTitle').value,
            category: document.getElementById('courseCategory').value,
            duration: document.getElementById('courseDuration').value,
            students_count: parseInt(document.getElementById('courseStudents').value) || 0,
            badge: document.getElementById('courseBadge').value,
            thumbnail_url: thumbnailUrl,
            video_url: document.getElementById('courseVideo').value,
            description: document.getElementById('courseDescription').value,
            is_published: true
        };

        if (id) {
            await db.updateCourse(id, courseData);
            showToast('تم تحديث الكورس بنجاح', 'success');
        } else {
            await db.addCourse(courseData);
            showToast('تم إضافة الكورس بنجاح', 'success');
        }

        courseImageFile = null;
        closeModal('courseModal');
        loadCourses();
    } catch (error) {
        console.error('Error saving course:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
});

async function deleteCourseConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا الكورس؟')) {
        try {
            await db.deleteCourse(id);
            showToast('تم حذف الكورس', 'success');
            loadCourses();
        } catch (error) {
            console.error('Error deleting course:', error);
            showToast('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// ===== Portfolio =====
let portfolioData = [];

async function loadPortfolio() {
    const loading = document.getElementById('portfolioLoading');
    const table = document.getElementById('portfolioTable');
    const tbody = document.getElementById('portfolioTableBody');

    if (!loading || !table || !tbody) {
        console.log('Portfolio elements not found');
        return;
    }

    try {
        // Direct query to Supabase
        const { data, error } = await db.supabaseClient
            .from('portfolio')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('Portfolio loaded:', data?.length || 0, 'items');

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        portfolioData = data || [];

        // Render table
        if (portfolioData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">لا توجد أعمال - اضغط على "إضافة عمل" لإضافة عمل جديد</td></tr>';
        } else {
            renderPortfolioTable();
        }

        updateStats();
        loading.style.display = 'none';
        table.style.display = 'table';

    } catch (error) {
        console.error('Error loading portfolio:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #ff6b35;">خطأ في تحميل الأعمال - تأكد من إعدادات قاعدة البيانات</td></tr>';
        loading.style.display = 'none';
        table.style.display = 'table';
    }
}

function renderPortfolioTable() {
    const tbody = document.getElementById('portfolioTableBody');
    tbody.innerHTML = portfolioData.map(item => `
        <tr>
            <td><img src="${item.image_url || 'https://via.placeholder.com/60x40'}" class="table-thumbnail" alt="${item.title}"></td>
            <td><strong>${item.title}</strong></td>
            <td>${item.category || '-'}</td>
            <td><span class="badge ${item.is_published ? 'badge-success' : 'badge-warning'}">${item.is_published ? 'منشور' : 'مخفي'}</span></td>
            <td>
                <div class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="editPortfolio('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deletePortfolioConfirm('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openPortfolioModal() {
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioId').value = '';
    document.getElementById('portfolioModalTitle').textContent = 'إضافة عمل جديد';

    // Reset image preview
    removePortfolioImage();

    document.getElementById('portfolioModal').classList.add('active');
}

function editPortfolio(id) {
    const item = portfolioData.find(p => p.id === id);
    if (!item) return;

    document.getElementById('portfolioId').value = item.id;
    document.getElementById('portfolioTitle').value = item.title;
    document.getElementById('portfolioCategory').value = item.category || '';
    document.getElementById('portfolioImage').value = item.image_url || '';
    document.getElementById('portfolioVideo').value = item.video_url || '';
    document.getElementById('portfolioDescription').value = item.description || '';
    document.getElementById('portfolioModalTitle').textContent = 'تعديل العمل';

    document.getElementById('portfolioModal').classList.add('active');
}

document.getElementById('portfolioForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    submitBtn.disabled = true;

    const id = document.getElementById('portfolioId').value;

    try {
        // Upload new image if selected
        let imageUrl = document.getElementById('portfolioImage').value;
        if (portfolioImageFile) {
            imageUrl = await uploadAndGetUrl(portfolioImageFile, 'portfolio');
            if (!imageUrl) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
        }

        const itemData = {
            title: document.getElementById('portfolioTitle').value,
            category: document.getElementById('portfolioCategory').value,
            image_url: imageUrl,
            video_url: document.getElementById('portfolioVideo').value,
            description: document.getElementById('portfolioDescription').value,
            is_published: true
        };

        if (id) {
            await db.updatePortfolioItem(id, itemData);
            showToast('تم تحديث العمل بنجاح', 'success');
        } else {
            await db.addPortfolioItem(itemData);
            showToast('تم إضافة العمل بنجاح', 'success');
        }

        portfolioImageFile = null;
        closeModal('portfolioModal');
        loadPortfolio();
    } catch (error) {
        console.error('Error saving portfolio:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }

    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
});

async function deletePortfolioConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا العمل؟')) {
        try {
            await db.deletePortfolioItem(id);
            showToast('تم حذف العمل', 'success');
            loadPortfolio();
        } catch (error) {
            showToast('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// ===== Testimonials =====
let testimonialsData = [];

async function loadTestimonials() {
    const loading = document.getElementById('testimonialsLoading');
    const table = document.getElementById('testimonialsTable');

    try {
        const { data, error } = await db.supabaseClient
            .from('testimonials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        testimonialsData = data || [];
        renderTestimonialsTable();
        updateStats();

        loading.style.display = 'none';
        table.style.display = 'table';
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

function renderTestimonialsTable() {
    const tbody = document.getElementById('testimonialsTableBody');
    tbody.innerHTML = testimonialsData.map(item => `
        <tr>
            <td><strong>${item.author_name}</strong></td>
            <td>${item.author_role || '-'}</td>
            <td style="max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.content}</td>
            <td><span class="badge ${item.is_published ? 'badge-success' : 'badge-warning'}">${item.is_published ? 'منشور' : 'مخفي'}</span></td>
            <td>
                <div class="actions">
                    <button class="btn btn-secondary btn-sm" onclick="editTestimonial('${item.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTestimonialConfirm('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openTestimonialModal() {
    document.getElementById('testimonialForm').reset();
    document.getElementById('testimonialId').value = '';
    document.getElementById('testimonialModalTitle').textContent = 'إضافة رأي جديد';
    document.getElementById('testimonialModal').classList.add('active');
}

function editTestimonial(id) {
    const item = testimonialsData.find(t => t.id === id);
    if (!item) return;

    document.getElementById('testimonialId').value = item.id;
    document.getElementById('testimonialName').value = item.author_name;
    document.getElementById('testimonialRole').value = item.author_role || '';
    document.getElementById('testimonialContent').value = item.content;
    document.getElementById('testimonialModalTitle').textContent = 'تعديل الرأي';

    document.getElementById('testimonialModal').classList.add('active');
}

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('testimonialId').value;
    const name = document.getElementById('testimonialName').value;
    const itemData = {
        author_name: name,
        author_role: document.getElementById('testimonialRole').value,
        content: document.getElementById('testimonialContent').value,
        avatar_initial: name.charAt(0),
        is_published: true
    };

    try {
        if (id) {
            await db.updateTestimonial(id, itemData);
            showToast('تم تحديث الرأي بنجاح', 'success');
        } else {
            await db.addTestimonial(itemData);
            showToast('تم إضافة الرأي بنجاح', 'success');
        }

        closeModal('testimonialModal');
        loadTestimonials();
    } catch (error) {
        console.error('Error saving testimonial:', error);
        showToast('حدث خطأ أثناء الحفظ', 'error');
    }
});

async function deleteTestimonialConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا الرأي؟')) {
        try {
            await db.deleteTestimonial(id);
            showToast('تم حذف الرأي', 'success');
            loadTestimonials();
        } catch (error) {
            showToast('حدث خطأ أثناء الحذف', 'error');
        }
    }
}

// ===== Stats =====
function updateStats() {
    // Only update elements that exist
    const coursesEl = document.getElementById('coursesCount');
    const portfolioEl = document.getElementById('portfolioCount');
    const testimonialsEl = document.getElementById('testimonialsCount');
    const studentsEl = document.getElementById('totalStudents');

    if (coursesEl) coursesEl.textContent = coursesData.length;
    if (portfolioEl) portfolioEl.textContent = portfolioData.length;
    if (testimonialsEl) testimonialsEl.textContent = testimonialsData.length;

    if (studentsEl) {
        const totalStudents = coursesData.reduce((sum, c) => sum + (c.students_count || 0), 0);
        studentsEl.textContent = totalStudents.toLocaleString();
    }
}

// ===== Section Navigation =====
function showSection(section) {
    document.querySelectorAll('.data-section').forEach(s => s.style.display = 'none');
    document.getElementById(`${section}-section`).style.display = 'block';

    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
}

// ===== Modal Helpers =====
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Logout =====
async function logout() {
    await db.signOut();
    window.location.href = 'index.html';
}

// =====================================================
//   Image Upload Handlers
// =====================================================

// Course Image Upload
let courseImageFile = null;

document.getElementById('courseImageFile')?.addEventListener('change', function (e) {
    handleImageSelect(e.target.files[0], 'course');
});

function handleImageSelect(file, type) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('يرجى اختيار صورة صالحة', 'error');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('حجم الصورة يجب أن يكون أقل من 5MB', 'error');
        return;
    }

    if (type === 'course') {
        courseImageFile = file;
        showImagePreview(file, 'coursePreviewImg', 'coursePreview', 'coursePlaceholder');
    } else if (type === 'portfolio') {
        portfolioImageFile = file;
        showImagePreview(file, 'portfolioPreviewImg', 'portfolioPreview', 'portfolioPlaceholder');
    } else if (type === 'service') {
        serviceImageFile = file;
        showImagePreview(file, 'servicePreviewImg', 'servicePreview', 'servicePlaceholder');
    }
}

function showImagePreview(file, imgId, previewId, placeholderId) {
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById(imgId).src = e.target.result;
        document.getElementById(previewId).style.display = 'block';
        document.getElementById(placeholderId).style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function removeCourseImage() {
    courseImageFile = null;
    document.getElementById('courseThumbnail').value = '';
    document.getElementById('coursePreview').style.display = 'none';
    document.getElementById('coursePlaceholder').style.display = 'flex';
    document.getElementById('courseImageFile').value = '';
}

// Portfolio Image Upload
let portfolioImageFile = null;

document.getElementById('portfolioImageFile')?.addEventListener('change', function (e) {
    handleImageSelect(e.target.files[0], 'portfolio');
});

function removePortfolioImage() {
    portfolioImageFile = null;
    document.getElementById('portfolioImage').value = '';
    document.getElementById('portfolioPreview').style.display = 'none';
    document.getElementById('portfolioPlaceholder').style.display = 'flex';
    document.getElementById('portfolioImageFile').value = '';
}

// Drag and Drop Support
function setupDragDrop(areaId, type) {
    const area = document.getElementById(areaId);
    if (!area) return;

    ['dragenter', 'dragover'].forEach(event => {
        area.addEventListener(event, (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(event => {
        area.addEventListener(event, (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
        });
    });

    area.addEventListener('drop', (e) => {
        const file = e.dataTransfer.files[0];
        handleImageSelect(file, type);
    });
}

// Initialize drag and drop
setTimeout(() => {
    setupDragDrop('courseUploadArea', 'course');
    setupDragDrop('portfolioUploadArea', 'portfolio');
    setupDragDrop('serviceUploadArea', 'service');

    // Service image upload click handler
    const serviceUploadArea = document.getElementById('serviceUploadArea');
    if (serviceUploadArea) {
        serviceUploadArea.addEventListener('click', () => {
            document.getElementById('serviceImageFile').click();
        });
    }
}, 100);

// Service Image Upload Handler
let serviceImageFile = null;

document.getElementById('serviceImageFile')?.addEventListener('change', function (e) {
    handleImageSelect(e.target.files[0], 'service');
});

function removeServiceImage() {
    serviceImageFile = null;
    document.getElementById('serviceImage').value = '';
    document.getElementById('servicePreview').style.display = 'none';
    document.getElementById('servicePlaceholder').style.display = 'flex';
    document.getElementById('serviceImageFile').value = '';
}

// Upload image and return URL
async function uploadAndGetUrl(file, folder) {
    if (!file) return null;

    try {
        const url = await db.uploadImage(file, folder);
        return url;
    } catch (error) {
        console.error('Upload error:', error);
        showToast('خطأ في رفع الصورة', 'error');
        return null;
    }
}
