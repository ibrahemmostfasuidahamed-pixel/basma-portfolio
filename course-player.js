// =====================================================
//   Course Player JavaScript
//   بصمة - Basma Portfolio
// =====================================================

// State
let currentCourse = null;
let lessons = [];
let currentLessonIndex = 0;
let completedLessons = new Set();
let player = null;

// DOM Elements
const videoPlayer = document.getElementById('videoPlayer');
const lessonsList = document.getElementById('lessonsList');
const courseTitle = document.getElementById('courseTitle');
const lessonTitle = document.getElementById('lessonTitle');
const lessonDuration = document.getElementById('lessonDuration');
const lessonOrder = document.getElementById('lessonOrder');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const completeBtn = document.getElementById('completeBtn');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.querySelector('.course-sidebar');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Get course ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    if (!courseId) {
        showError('لم يتم تحديد الكورس');
        return;
    }

    // Load YouTube IFrame API
    loadYouTubeAPI();

    // Load course data
    await loadCourse(courseId);

    // Setup event listeners
    setupEventListeners();

    // Load saved progress
    loadProgress();
});

// Load YouTube IFrame API
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// YouTube API Ready Callback
window.onYouTubeIframeAPIReady = function () {
    console.log('YouTube API Ready');
};

// Load Course Data
async function loadCourse(courseId) {
    try {
        // Fetch course info
        const { data: course, error } = await db.supabaseClient
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (error) throw error;

        currentCourse = course;
        courseTitle.textContent = course.title;
        document.title = `${course.title} - بصمة`;

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await db.supabaseClient
            .from('course_lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        lessons = lessonsData || [];

        if (lessons.length === 0) {
            // If no lessons, use single video from course
            if (course.video_url) {
                lessons = [{
                    id: 'main',
                    title: course.title,
                    video_url: course.video_url,
                    duration: course.duration || '',
                    sort_order: 1
                }];
            }
        }

        // Render lessons
        renderLessons();

        // Load first available lesson
        if (lessons.length > 0) {
            const firstUnlocked = findFirstUnlockedLesson();
            playLesson(firstUnlocked);
        }

    } catch (error) {
        console.error('Error loading course:', error);
        showError('حدث خطأ في تحميل الكورس');
    }
}

// Render Lessons List
function renderLessons() {
    if (lessons.length === 0) {
        lessonsList.innerHTML = `
            <div class="loading-lessons">
                <i class="fas fa-video-slash"></i>
                <p>لا توجد دروس في هذا الكورس</p>
            </div>
        `;
        return;
    }

    lessonsList.innerHTML = lessons.map((lesson, index) => {
        const isCompleted = completedLessons.has(lesson.id);
        const isLocked = !isLessonUnlocked(index);
        const isActive = index === currentLessonIndex;

        let statusIcon = '';
        if (isCompleted) {
            statusIcon = '<i class="fas fa-check-circle"></i>';
        } else if (isLocked) {
            statusIcon = '<i class="fas fa-lock"></i>';
        } else {
            statusIcon = '<i class="fas fa-play"></i>';
        }

        const classes = [
            'lesson-item',
            isActive ? 'active' : '',
            isCompleted ? 'completed' : '',
            isLocked ? 'locked' : ''
        ].filter(Boolean).join(' ');

        return `
            <div class="${classes}" data-index="${index}" onclick="handleLessonClick(${index})">
                <div class="lesson-icon">
                    ${isCompleted ? '<i class="fas fa-check"></i>' :
                isLocked ? '<i class="fas fa-lock"></i>' :
                    isActive ? '<i class="fas fa-play"></i>' :
                        `<span>${index + 1}</span>`}
                </div>
                <div class="lesson-content">
                    <div class="lesson-name">${lesson.title}</div>
                    <div class="lesson-duration">${lesson.duration || ''}</div>
                </div>
                <div class="lesson-status">
                    ${statusIcon}
                </div>
            </div>
        `;
    }).join('');

    updateProgress();
}

// Handle Lesson Click
function handleLessonClick(index) {
    if (!isLessonUnlocked(index)) {
        showToast('أكمل الدروس السابقة أولاً', 'warning');
        return;
    }
    playLesson(index);
}

// Check if lesson is unlocked
function isLessonUnlocked(index) {
    if (index === 0) return true; // First lesson always unlocked

    // Check if previous lesson is completed
    const prevLesson = lessons[index - 1];
    return completedLessons.has(prevLesson.id);
}

// Find first unlocked incomplete lesson
function findFirstUnlockedLesson() {
    for (let i = 0; i < lessons.length; i++) {
        if (!completedLessons.has(lessons[i].id) && isLessonUnlocked(i)) {
            return i;
        }
    }
    return 0;
}

// Play Lesson
function playLesson(index) {
    if (index < 0 || index >= lessons.length) return;

    currentLessonIndex = index;
    const lesson = lessons[index];

    // Update UI
    lessonTitle.textContent = lesson.title;
    lessonDuration.innerHTML = `<i class="fas fa-clock"></i> ${lesson.duration || 'غير محدد'}`;
    lessonOrder.innerHTML = `<i class="fas fa-list-ol"></i> الدرس ${index + 1} من ${lessons.length}`;

    // Update navigation buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === lessons.length - 1 || !isLessonUnlocked(index + 1);

    // Update complete button
    if (completedLessons.has(lesson.id)) {
        completeBtn.innerHTML = '<i class="fas fa-check"></i><span>تم الإكمال</span>';
        completeBtn.classList.add('completed');
    } else {
        completeBtn.innerHTML = '<i class="fas fa-check"></i><span>إكمال ومتابعة</span>';
        completeBtn.classList.remove('completed');
    }

    // Embed video
    embedVideo(lesson.video_url);

    // Update lessons list
    renderLessons();

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        sidebar.classList.remove('active');
    }
}

// Embed Video
function embedVideo(url) {
    const embedUrl = convertToEmbedUrl(url);

    if (!embedUrl) {
        videoPlayer.innerHTML = `
            <div class="video-placeholder">
                <i class="fas fa-exclamation-triangle"></i>
                <p>رابط الفيديو غير صالح</p>
            </div>
        `;
        return;
    }

    videoPlayer.innerHTML = `
        <iframe 
            src="${embedUrl}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
        </iframe>
    `;
}

// Convert Video URL to Embed
function convertToEmbedUrl(url) {
    if (!url) return null;

    url = url.trim();

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/);
    if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return null;
}

// Complete Current Lesson
function completeCurrentLesson() {
    const lesson = lessons[currentLessonIndex];

    if (!completedLessons.has(lesson.id)) {
        completedLessons.add(lesson.id);
        saveProgress();
        renderLessons();
        showToast('تم إكمال الدرس! 🎉', 'success');

        // Auto-advance to next lesson
        if (currentLessonIndex < lessons.length - 1 && isLessonUnlocked(currentLessonIndex + 1)) {
            setTimeout(() => playLesson(currentLessonIndex + 1), 1000);
        } else if (currentLessonIndex === lessons.length - 1) {
            showToast('🎊 مبروك! أكملت الكورس بالكامل', 'success');
        }
    }

    // Update button
    completeBtn.innerHTML = '<i class="fas fa-check"></i><span>تم الإكمال</span>';
    completeBtn.classList.add('completed');
}

// Update Progress
function updateProgress() {
    const completed = completedLessons.size;
    const total = lessons.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}%`;
}

// Save Progress to localStorage
function saveProgress() {
    if (!currentCourse) return;

    const progressData = {
        courseId: currentCourse.id,
        completed: Array.from(completedLessons),
        lastLesson: currentLessonIndex,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`course_progress_${currentCourse.id}`, JSON.stringify(progressData));
}

// Load Progress from localStorage
function loadProgress() {
    if (!currentCourse) return;

    const saved = localStorage.getItem(`course_progress_${currentCourse.id}`);

    if (saved) {
        try {
            const progressData = JSON.parse(saved);
            completedLessons = new Set(progressData.completed || []);
            renderLessons();

            // If there's a last watched lesson, continue from there
            if (progressData.lastLesson !== undefined) {
                playLesson(progressData.lastLesson);
            }
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentLessonIndex > 0) {
            playLesson(currentLessonIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentLessonIndex < lessons.length - 1 && isLessonUnlocked(currentLessonIndex + 1)) {
            playLesson(currentLessonIndex + 1);
        }
    });

    completeBtn.addEventListener('click', completeCurrentLesson);

    // Sidebar toggle
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar on outside click (mobile)
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && !prevBtn.disabled) {
            playLesson(currentLessonIndex - 1);
        } else if (e.key === 'ArrowLeft' && !nextBtn.disabled) {
            playLesson(currentLessonIndex + 1);
        }
    });
}

// Show Error
function showError(message) {
    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg-primary); color: var(--text-primary); text-align: center; padding: 20px;">
            <div>
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ff6b35; margin-bottom: 20px;"></i>
                <h2 style="margin-bottom: 16px;">${message}</h2>
                <a href="index.html" style="color: #ff6b35;">العودة للرئيسية</a>
            </div>
        </div>
    `;
}

// Show Toast
function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-circle' : 'times-circle'}"></i>
        <span>${message}</span>
    `;

    // Add styles
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: inherit;
        font-size: 1rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        animation: slideInUp 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
