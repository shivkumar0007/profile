const BACKEND_URL = "https://script.google.com/macros/s/AKfycby3c8CiqxUXtmt_yXiTzPJglw6xo1PR1POm6MQUIJcHjHP5PNaDAFeRe-xOGNP7s2gY/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-form");

  const otpBox = document.getElementById("otp-box"); // hidden section
  const otpInput = document.getElementById("otp");
  const newPasswordInput = document.getElementById("newPassword");

  let emailValue = "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // FIRST STEP → send OTP
    if (!otpBox.style.display || otpBox.style.display === "none") {
      emailValue = document.getElementById("email").value.trim();
      if (!emailValue) return alert("Email dalo");

      const formData = new URLSearchParams();
      formData.append("action", "forgotPassword");
      formData.append("email", emailValue);

      const res = await fetch(BACKEND_URL, { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        alert("OTP email par bhej diya gaya");

        // show OTP section
        otpBox.style.display = "block";
      } else {
        alert(data.message);
      }

      return;
    }

    // SECOND STEP → reset password
    const otp = otpInput.value.trim();
    const newPassword = newPasswordInput.value.trim();

    if (!otp || !newPassword) return alert("OTP aur new password dalo");

    const formData = new URLSearchParams();
    formData.append("action", "resetPassword");
    formData.append("email", emailValue);
    formData.append("token", otp);
    formData.append("newPassword", newPassword);

    const res = await fetch(BACKEND_URL, { method: "POST", body: formData });
    const data = await res.json();

    if (data.success) {
      alert("Password reset ho gaya. Ab login karo.");
      window.location.href = "login.html";
    } else {
      alert(data.message);
    }
  });
});
