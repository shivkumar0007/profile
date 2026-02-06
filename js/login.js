const BACKEND_URL = "https://script.google.com/macros/s/AKfycby3c8CiqxUXtmt_yXiTzPJglw6xo1PR1POm6MQUIJcHjHP5PNaDAFeRe-xOGNP7s2gY/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const formData = new URLSearchParams();
      formData.append("action", "login");
      formData.append("email", email);
      formData.append("password", password);

      const response = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        localStorage.setItem("name", data.name);

        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Login failed");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Backend se response nahi mil raha.");
    }
  });
});
