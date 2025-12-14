// =====================================================
//   Supabase Configuration
//   بصمة - Basma Portfolio
// =====================================================

const SUPABASE_URL = 'https://iyqxegoofdygfxliqbhv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cXhlZ29vZmR5Z2Z4bGlxYmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0Njg1NDIsImV4cCI6MjA4MTA0NDU0Mn0.P3l8nyPSO4_1I9oecJ1yStOrm55pMwG3UMdA9hgn6tQ';

// Initialize Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Database Functions =====

// Courses
async function getCourses() {
    const { data, error } = await supabaseClient
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
    return data;
}

async function addCourse(course) {
    const { data, error } = await supabaseClient
        .from('courses')
        .insert([course])
        .select();

    if (error) throw error;
    return data;
}

async function updateCourse(id, updates) {
    const { data, error } = await supabaseClient
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

async function deleteCourse(id) {
    const { error } = await supabaseClient
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Portfolio
async function getPortfolio() {
    const { data, error } = await supabaseClient
        .from('portfolio')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching portfolio:', error);
        return [];
    }
    return data;
}

async function addPortfolioItem(item) {
    const { data, error } = await supabaseClient
        .from('portfolio')
        .insert([item])
        .select();

    if (error) throw error;
    return data;
}

async function updatePortfolioItem(id, updates) {
    const { data, error } = await supabaseClient
        .from('portfolio')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

async function deletePortfolioItem(id) {
    const { error } = await supabaseClient
        .from('portfolio')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Testimonials
async function getTestimonials() {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching testimonials:', error);
        return [];
    }
    return data;
}

async function addTestimonial(testimonial) {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .insert([testimonial])
        .select();

    if (error) throw error;
    return data;
}

async function updateTestimonial(id, updates) {
    const { data, error } = await supabaseClient
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

async function deleteTestimonial(id) {
    const { error } = await supabaseClient
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ===== Authentication =====
async function signIn(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) throw error;
    return data;
}

async function signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
}

async function getUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

// ===== Menu Items =====
async function getMenuItems() {
    const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
    return data;
}

async function getAllMenuItems() {
    const { data, error } = await supabaseClient
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching menu items:', error);
        return [];
    }
    return data;
}

async function addMenuItem(item) {
    const { data, error } = await supabaseClient
        .from('menu_items')
        .insert([item])
        .select();

    if (error) throw error;
    return data;
}

async function updateMenuItem(id, updates) {
    const { data, error } = await supabaseClient
        .from('menu_items')
        .update(updates)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
}

async function deleteMenuItem(id) {
    const { error } = await supabaseClient
        .from('menu_items')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// Export for use
// ===== Image Upload =====
async function uploadImage(file, folder = 'courses') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabaseClient.storage
        .from('images')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabaseClient.storage
        .from('images')
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}

async function deleteImage(imageUrl) {
    if (!imageUrl || !imageUrl.includes('supabase')) return;

    // Extract file path from URL
    const urlParts = imageUrl.split('/images/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];

    const { error } = await supabaseClient.storage
        .from('images')
        .remove([filePath]);

    if (error) console.error('Error deleting image:', error);
}

// Export for use
window.db = {
    getCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    getPortfolio,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    getTestimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getMenuItems,
    getAllMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    uploadImage,
    deleteImage,
    signIn,
    signOut,
    getUser,
    supabaseClient
};

