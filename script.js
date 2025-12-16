// =====================================================
//   بصمة - Basma Portfolio Website
//   JavaScript - SaaS Style Interactions
//   With Supabase Dynamic Content Loading
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    // ===== Load Dynamic Content from Supabase =====
    loadDynamicContent();

    // ===== Mobile Navigation Toggle =====
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // ===== Header Scroll Effect =====
    const header = document.getElementById('header');

    const handleScroll = () => {
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ===== Active Navigation Link =====
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinksAll.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // ===== Smooth Scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const headerOffset = 80;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Scroll Reveal Animation =====
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Initial reveal elements
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ===== Insight Items Interactive =====
    const insightItems = document.querySelectorAll('.insight-item');

    insightItems.forEach(item => {
        item.addEventListener('click', () => {
            insightItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // ===== Hero Video Mouse Parallax =====
    const hero = document.querySelector('.hero');
    const heroVideo = document.querySelector('.hero-video');
    const heroContent = document.querySelector('.hero-content');

    if (hero && heroVideo) {
        let ticking = false;

        hero.addEventListener('mousemove', (e) => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = hero.getBoundingClientRect();
                    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
                    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;

                    heroVideo.style.transform = `scale(1.1) translate(${mouseX * 20}px, ${mouseY * 20}px)`;

                    if (heroContent) {
                        heroContent.style.transform = `translate(${mouseX * -10}px, ${mouseY * -10}px)`;
                    }

                    ticking = false;
                });
                ticking = true;
            }
        });

        hero.addEventListener('mouseleave', () => {
            heroVideo.style.transform = 'scale(1.1) translate(0, 0)';
            if (heroContent) {
                heroContent.style.transform = 'translate(0, 0)';
            }
        });
    }

    // ===== Testimonials Auto-scroll Pause on Hover =====
    const testimonialsTrack = document.querySelector('.testimonials-track');

    if (testimonialsTrack) {
        testimonialsTrack.addEventListener('mouseenter', () => {
            testimonialsTrack.style.animationPlayState = 'paused';
        });

        testimonialsTrack.addEventListener('mouseleave', () => {
            testimonialsTrack.style.animationPlayState = 'running';
        });
    }

    // ===== Button Ripple Effect =====
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: ${x}px;
                top: ${y}px;
                width: 100px;
                height: 100px;
                margin-left: -50px;
                margin-top: -50px;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple keyframe animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ===== Initialize =====
    console.log('🎨 بصمة Website Loaded Successfully - SaaS Style');
});

// =====================================================
//   Dynamic Content Loading from Supabase
// =====================================================

async function loadDynamicContent() {
    // Check if db is available (Supabase loaded)
    if (typeof db === 'undefined') {
        console.log('Supabase not loaded, using static content');
        return;
    }

    try {
        // Load all content in parallel
        await Promise.all([
            loadMenu(),
            loadServices(),
            loadCourses(),
            loadPortfolio(),
            loadTestimonials()
        ]);

        console.log('✅ Dynamic content loaded from Supabase');
    } catch (error) {
        console.error('Error loading dynamic content:', error);
    }
}

// ===== Load Menu Items =====
async function loadMenu() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    try {
        const menuItems = await db.getMenuItems();

        if (menuItems && menuItems.length > 0) {
            navLinks.innerHTML = menuItems.map(item => `
                <li>
                    <a href="${item.url}" class="nav-link ${item.type === 'cta' ? 'btn-primary' : ''}">
                        ${item.label}
                    </a>
                </li>
            `).join('');
        }
        // If no menu items, keep the static HTML
    } catch (error) {
        console.error('Error loading menu:', error);
        // Keep static menu on error
    }
}

// ===== Load Services =====
async function loadServices() {
    const featuresGrid = document.getElementById('featuresGrid');
    if (!featuresGrid) return;

    try {
        const { data: services, error } = await db.supabaseClient
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        if (services && services.length > 0) {
            // Store services globally for modal access
            window.servicesData = services;

            featuresGrid.innerHTML = services.map((service, index) => `
                <div class="feature-card animate-card" style="animation-delay: ${index * 0.1}s" onclick="openServiceDetails('${service.id}')">
                    <div class="feature-icon">
                        <i class="${service.icon || 'fas fa-cog'}"></i>
                    </div>
                    <h3 class="feature-title">${service.title}</h3>
                    <button class="btn-details">
                        <i class="fas fa-arrow-left"></i>
                        تفاصيل أكثر
                    </button>
                </div>
            `).join('');
        } else {
            // Show default services if none in database
            featuresGrid.innerHTML = `
                <div class="feature-card animate-card" style="animation-delay: 0s">
                    <div class="feature-icon"><i class="fas fa-robot"></i></div>
                    <h3 class="feature-title">AI Creative Workflow</h3>
                    <p class="feature-description">نستخدم أحدث تقنيات الذكاء الاصطناعي لتسريع عملية الإنتاج الإبداعي</p>
                </div>
                <div class="feature-card animate-card" style="animation-delay: 0.1s">
                    <div class="feature-icon"><i class="fas fa-palette"></i></div>
                    <h3 class="feature-title">التصميم الجرافيكي</h3>
                    <p class="feature-description">تصاميم احترافية تعكس هويتك البصرية</p>
                </div>
                <div class="feature-card animate-card" style="animation-delay: 0.2s">
                    <div class="feature-icon"><i class="fas fa-film"></i></div>
                    <h3 class="feature-title">المونتاج الاحترافي</h3>
                    <p class="feature-description">نحول لقطاتك إلى قصص مؤثرة</p>
                </div>
                <div class="feature-card animate-card" style="animation-delay: 0.3s">
                    <div class="feature-icon"><i class="fas fa-graduation-cap"></i></div>
                    <h3 class="feature-title">الكورسات التعليمية</h3>
                    <p class="feature-description">تعلم أسرار الموشن جرافيك والتصميم</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading services:', error);
        // Show default services on error
        featuresGrid.innerHTML = `
            <div class="feature-card animate-card">
                <div class="feature-icon"><i class="fas fa-robot"></i></div>
                <h3 class="feature-title">AI Creative Workflow</h3>
                <p class="feature-description">نستخدم أحدث تقنيات الذكاء الاصطناعي لتسريع عملية الإنتاج الإبداعي</p>
            </div>
            <div class="feature-card animate-card">
                <div class="feature-icon"><i class="fas fa-palette"></i></div>
                <h3 class="feature-title">التصميم الجرافيكي</h3>
                <p class="feature-description">تصاميم احترافية تعكس هويتك البصرية</p>
            </div>
        `;
    }
}

// ===== Open Service Details Modal =====
function openServiceDetails(serviceId) {
    const service = window.servicesData?.find(s => s.id === serviceId);
    if (!service) return;

    // Create or get modal
    let modal = document.getElementById('serviceDetailModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'serviceDetailModal';
        modal.className = 'service-modal-overlay';
        document.body.appendChild(modal);

        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeServiceModal();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeServiceModal();
        });
    }

    modal.innerHTML = `
        <div class="service-modal">
            <button class="service-modal-close" onclick="closeServiceModal()">
                <i class="fas fa-times"></i>
            </button>
            ${service.image_url ? `
                <div class="service-modal-image">
                    <img src="${service.image_url}" alt="${service.title}">
                </div>
            ` : ''}
            <div class="service-modal-content">
                <div class="service-modal-icon">
                    <i class="${service.icon || 'fas fa-cog'}"></i>
                </div>
                <h2 class="service-modal-title">${service.title}</h2>
                <p class="service-modal-description">${service.description || ''}</p>
                ${service.video_url ? `
                    <div class="service-modal-video">
                        <iframe src="${convertToEmbedUrl(service.video_url)}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceDetailModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}


// ===== Load Courses =====
async function loadCourses() {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!coursesGrid) return;

    try {
        const courses = await db.getCourses();

        if (courses && courses.length > 0) {
            coursesGrid.innerHTML = courses.map(course => {
                return `
                <a href="course.html?id=${course.id}" class="course-card reveal visible" style="text-decoration: none;">
                    <div class="course-thumbnail">
                        <div class="course-video-badge">
                            <i class="fas fa-play"></i>
                        </div>
                        <img src="${course.thumbnail_url || 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&h=338&fit=crop'}" 
                             alt="${course.title}">
                        ${course.badge ? `<span class="course-badge">${course.badge}</span>` : ''}
                    </div>
                    <div class="course-content">
                        <span class="course-category">${course.category || 'عام'}</span>
                        <h3 class="course-title">${course.title}</h3>
                        <div class="course-meta">
                            <span><i class="fas fa-clock"></i> ${course.duration || '---'}</span>
                            <span><i class="fas fa-users"></i> ${formatNumber(course.students_count)} طالب</span>
                        </div>
                    </div>
                </a>
            `}).join('');
        } else {
            coursesGrid.innerHTML = `
                <div style="grid-column: span 3; text-align: center; padding: 60px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-book-open fa-3x" style="margin-bottom: 20px;"></i>
                    <p>لا توجد كورسات متاحة حالياً</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        coursesGrid.innerHTML = `
            <div style="grid-column: span 3; text-align: center; padding: 60px; color: rgba(255,255,255,0.5);">
                <i class="fas fa-exclamation-triangle fa-2x" style="color: #ff6b35; margin-bottom: 16px;"></i>
                <p>حدث خطأ في تحميل الكورسات</p>
            </div>
        `;
    }
}

// ===== Load Portfolio =====
async function loadPortfolio() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    try {
        const items = await db.getPortfolio();

        if (items && items.length > 0) {
            portfolioGrid.innerHTML = items.map(item => createPortfolioCard(item)).join('');
        } else {
            portfolioGrid.innerHTML = `
                <div style="grid-column: span 3; text-align: center; padding: 60px; color: rgba(255,255,255,0.5);">
                    <i class="fas fa-folder-open fa-3x" style="margin-bottom: 20px;"></i>
                    <p>لا توجد أعمال متاحة حالياً</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading portfolio:', error);
    }
}

// ===== Create Portfolio Card =====
function createPortfolioCard(item) {
    const hasVideo = item.video_url && item.video_url.trim() !== '';
    const embedUrl = hasVideo ? convertToEmbedUrl(item.video_url) : null;

    return `
        <div class="portfolio-card reveal visible" onclick="${hasVideo ? `openVideoModal('${embedUrl}', '${item.title}')` : ''}">
            <div class="portfolio-thumbnail">
                ${hasVideo ? `
                    <div class="portfolio-video-badge">
                        <i class="fas fa-play"></i>
                    </div>
                ` : ''}
                <img src="${item.image_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop'}" 
                     alt="${item.title}">
            </div>
            <div class="portfolio-content">
                <span class="portfolio-category">${item.category || 'عام'}</span>
                <h3 class="portfolio-title">${item.title}</h3>
            </div>
        </div>
    `;
}

// ===== Convert Video URL to Embed =====
function convertToEmbedUrl(url) {
    if (!url) return null;

    url = url.trim();

    // YouTube URLs
    // https://www.youtube.com/watch?v=VIDEO_ID
    // https://youtu.be/VIDEO_ID  
    // https://www.youtube.com/embed/VIDEO_ID
    // https://www.youtube.com/watch?v=VIDEO_ID&list=...
    let youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo URLs
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Return null if not recognized
    return null;
}

// ===== Video Modal =====
function openVideoModal(embedUrl, title) {
    if (!embedUrl) {
        alert('رابط الفيديو غير صالح');
        return;
    }

    // Create modal if doesn't exist
    let modal = document.getElementById('videoModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'videoModal';
        modal.className = 'video-modal';
        modal.innerHTML = `
            <div class="video-modal-content">
                <button class="video-modal-close" onclick="closeVideoModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="video-modal-title"></div>
                <div class="video-container">
                    <iframe id="videoFrame" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeVideoModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeVideoModal();
        });
    }

    // Set video
    modal.querySelector('.video-modal-title').textContent = title || '';
    modal.querySelector('#videoFrame').src = embedUrl;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    if (modal) {
        modal.querySelector('#videoFrame').src = '';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===== Load Testimonials =====
async function loadTestimonials() {
    const testimonialsTrack = document.getElementById('testimonialsTrack');
    if (!testimonialsTrack) return;

    try {
        const testimonials = await db.getTestimonials();

        if (testimonials && testimonials.length > 0) {
            // Create testimonials HTML (duplicate for infinite scroll)
            const testimonialsHTML = testimonials.map(t => createTestimonialCard(t)).join('');

            // Duplicate for seamless infinite scroll
            testimonialsTrack.innerHTML = testimonialsHTML + testimonialsHTML;
        } else {
            testimonialsTrack.innerHTML = `
                <div style="padding: 60px; text-align: center; color: rgba(255,255,255,0.5); width: 100%;">
                    <i class="fas fa-comments fa-3x" style="margin-bottom: 20px;"></i>
                    <p>لا توجد آراء متاحة حالياً</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
        testimonialsTrack.innerHTML = `
            <div style="padding: 60px; text-align: center; color: rgba(255,255,255,0.5); width: 100%;">
                <i class="fas fa-exclamation-triangle fa-2x" style="color: #ff6b35; margin-bottom: 16px;"></i>
                <p>حدث خطأ في تحميل الآراء</p>
            </div>
        `;
    }
}

// ===== Create Testimonial Card HTML =====
function createTestimonialCard(t) {
    return `
        <div class="testimonial-card">
            <p class="testimonial-content">"${t.content}"</p>
            <div class="testimonial-author">
                <div class="testimonial-avatar">${t.avatar_initial || t.author_name.charAt(0)}</div>
                <div class="testimonial-info">
                    <h5>${t.author_name}</h5>
                    <span>${t.author_role || ''}</span>
                </div>
            </div>
        </div>
    `;
}

// ===== Utility: Format Number =====
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// ===== Utility Functions =====
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
