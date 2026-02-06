// index.js - Landing page: Check if user is logged in and redirect to dashboard
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    if (token && email) {
        // User is logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
    // Otherwise, stay on landing page
});