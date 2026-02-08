/*************** CONFIG ***************/
const API_BASE =
  "https://script.google.com/macros/s/AKfycbx49VJP6Nf5SwOBUGjIOCaQMN7puMyCzROAb1tyT57M0jYh1T3JwlBErM90YxigS0sd/exec";

/*************** HELPERS ***************/
function showMessage(id, msg, success = false) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.color = success ? "#4caf50" : "#ff5252";
}

function showLoader(show) {
  document.getElementById("loader").classList.toggle("hidden", !show);
}

async function post(action, data = {}) {
  const form = new FormData();
  form.append("action", action);

  Object.keys(data).forEach((k) => form.append(k, data[k]));

  const res = await fetch(API_BASE, {
    method: "POST",
    mode: "cors",
    body: form,
  });

  return res.json();
}

/*************** LOGIN ***************/
document
  .getElementById("loginForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    showLoader(true);

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const data = await post("login", { email, password });

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
      } else {
        showMessage("message", data.message);
      }
    } catch {
      showMessage("message", "Server error");
    }

    showLoader(false);
  });

/*************** REGISTER ***************/
document.getElementById("registerLink").onclick = () =>
  (document.getElementById("registerModal").style.display = "block");

function closeRegisterModal() {
  document.getElementById("registerModal").style.display = "none";
}

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    showLoader(true);

    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    try {
      const data = await post("register", { username, email, password });

      if (data.success) {
        alert("Registered successfully! Please login.");
        closeRegisterModal();
      } else {
        showMessage("regMessage", data.message);
      }
    } catch {
      showMessage("regMessage", "Server error");
    }

    showLoader(false);
  });

/*************** FORGOT PASSWORD MODAL ***************/
document.getElementById("forgotLink").onclick = () =>
  (document.getElementById("forgotModal").style.display = "block");

function closeForgotModal() {
  document.getElementById("forgotModal").style.display = "none";
}

/*************** OTP FLOW ***************/
let forgotEmail = "";

// STEP 1 → SEND OTP
async function sendOTP() {
  forgotEmail = document.getElementById("forgotEmail").value;

  if (!forgotEmail) return showMessage("forgotMessage", "Enter email");

  showLoader(true);

  const data = await post("sendOTP", { email: forgotEmail });

  if (data.success) {
    showMessage("forgotMessage", "OTP sent to email", true);
    document.getElementById("stepEmail").style.display = "none";
    document.getElementById("stepOTP").style.display = "block";
  } else {
    showMessage("forgotMessage", data.message);
  }

  showLoader(false);
}

// STEP 2 → VERIFY OTP
async function verifyOTP() {
  const otp = document.getElementById("otp").value;

  if (!otp) return showMessage("forgotMessage", "Enter OTP");

  showLoader(true);

  const data = await post("verifyOTP", { email: forgotEmail, otp });

  if (data.success) {
    showMessage("forgotMessage", "OTP verified", true);
    document.getElementById("stepOTP").style.display = "none";
    document.getElementById("stepPassword").style.display = "block";
  } else {
    showMessage("forgotMessage", data.message);
  }

  showLoader(false);
}

// STEP 3 → RESET PASSWORD
async function resetPassword() {
  const newPassword = document.getElementById("newPassword").value;

  if (!newPassword) return showMessage("forgotMessage", "Enter new password");

  showLoader(true);

  const data = await post("resetPassword", {
    email: forgotEmail,
    newPassword,
  });

  if (data.success) {
    showMessage("forgotMessage", "Password updated!", true);
    setTimeout(() => {
      closeForgotModal();
      window.location.reload();
    }, 1500);
  } else {
    showMessage("forgotMessage", data.message);
  }

  showLoader(false);
}

/*************** AUTO LOGIN CHECK ***************/
if (localStorage.getItem("user")) {
  window.location.href = "dashboard.html";
}
