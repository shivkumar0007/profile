// ================= CONFIG =================
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxRQ9Kn2HFlOdlPzPY1mvpojN6B_6j93v3cFc71hVXeA4xKfVe-THuhy9UxQ0lQYdRv/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const submitBtn = form?.querySelector("button");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // ================= VALIDATION =================
    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;

      // ================= LOGIN REQUEST =================
      const formData = new URLSearchParams();
      formData.append("action", "login");
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error during login");

      const data = await response.json();
      console.log("Login API:", data);

      if (!data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      // ================= SAVE SESSION (FINAL SIMPLE) =================
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", email);
      localStorage.setItem("name", data.name);

      // ⭐ small delay to ensure storage write
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 100);

    } catch (err) {
      console.error("Login error:", err);
      alert("❌ " + err.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
