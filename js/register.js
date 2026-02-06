// register.js - Handle registration form submission
const BACKEND_URL = "https://script.google.com/macros/s/AKfycby3c8CiqxUXtmt_yXiTzPJglw6xo1PR1POm6MQUIJcHjHP5PNaDAFeRe-xOGNP7s2gY/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      // ⭐ Form-data use kar rahe hain (JSON nahi)
      const formData = new URLSearchParams();
      formData.append("action", "register");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert("Registration successful! Please log in.");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed");
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("Backend se response nahi mil raha.");
    }
  });
});
