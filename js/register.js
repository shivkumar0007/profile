// ================= CONFIG =================
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxRQ9Kn2HFlOdlPzPY1mvpojN6B_6j93v3cFc71hVXeA4xKfVe-THuhy9UxQ0lQYdRv/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // ================= BASIC VALIDATION =================
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      // ================= SEND FORM DATA (CORS SAFE) =================
      const formData = new URLSearchParams();
      formData.append("action", "register");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Register API:", data);

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      alert("✅ Registration successful! Please log in.");
      window.location.href = "login.html";

    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ " + error.message);
    }
  });
});
