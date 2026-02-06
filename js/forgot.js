// ================= CONFIG =================
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxRQ9Kn2HFlOdlPzPY1mvpojN6B_6j93v3cFc71hVXeA4xKfVe-THuhy9UxQ0lQYdRv/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("forgot-form");
  const emailInput = document.getElementById("email");
  const otpBox = document.getElementById("otp-box");
  const otpInput = document.getElementById("otp");
  const newPasswordInput = document.getElementById("newPassword");
  const submitBtn = form?.querySelector("button");

  if (!form || !emailInput || !otpBox || !otpInput || !newPasswordInput) return;

  let emailValue = "";
  let step = 1; // 1 = send OTP, 2 = reset password

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      submitBtn.disabled = true;

      // ================= STEP 1 → SEND OTP =================
      if (step === 1) {
        emailValue = emailInput.value.trim();

        if (!emailValue) {
          alert("Please enter your email.");
          return;
        }

        const formData = new URLSearchParams();
        formData.append("action", "forgotPassword");
        formData.append("email", emailValue);

        const res = await fetch(BACKEND_URL, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Server error while sending OTP");

        const data = await res.json();
        console.log("Forgot API:", data);

        if (!data.success) {
          throw new Error(data.message || "OTP send failed");
        }

        alert("✅ OTP email par bhej diya gaya.");

        // show OTP section
        otpBox.style.display = "block";
        emailInput.disabled = true;

        step = 2;
        return;
      }

      // ================= STEP 2 → RESET PASSWORD =================
      const otp = otpInput.value.trim();
      const newPassword = newPasswordInput.value.trim();

      if (!otp || !newPassword) {
        alert("OTP aur new password dono dalo.");
        return;
      }

      if (newPassword.length < 6) {
        alert("Password kam se kam 6 characters ka hona chahiye.");
        return;
      }

      const formData = new URLSearchParams();
      formData.append("action", "resetPassword");
      formData.append("email", emailValue);
      formData.append("token", otp);
      formData.append("newPassword", newPassword);

      const res = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error while resetting password");

      const data = await res.json();
      console.log("Reset API:", data);

      if (!data.success) {
        throw new Error(data.message || "Invalid or expired OTP");
      }

      alert("✅ Password reset ho gaya. Ab login karo.");
      window.location.href = "login.html";

    } catch (err) {
      console.error("Forgot/Reset error:", err);
      alert("❌ " + err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });
});