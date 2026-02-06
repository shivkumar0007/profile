// ================= CONFIG =================
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxRQ9Kn2HFlOdlPzPY1mvpojN6B_6j93v3cFc71hVXeA4xKfVe-THuhy9UxQ0lQYdRv/exec";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // 🔐 Not logged in → redirect
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // ================= LOAD USER MEDIA =================
  try {
    const formData = new URLSearchParams();
    formData.append("action", "getUserMedia");
    formData.append("token", token);

    const res = await fetch(BACKEND_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Media API:", data);

    // ❌ Session invalid → ONLY show message (no auto logout)
    if (!data.success) {
      showMessage("Session issue. Please login again.");
      return;
    }

    renderMedia(data.media || []);
  } catch (error) {
    console.error("Load media error:", error);
    showMessage("Media load nahi ho raha. Network issue ho sakta hai.");
  }

  // ================= LOGOUT BUTTON =================
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ================= UPLOAD NAV =================
  document.getElementById("upload-btn")?.addEventListener("click", () => {
    window.location.href = "upload.html";
  });

  // ================= MODAL HANDLING =================
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("close-modal");

  closeModal?.addEventListener("click", () => (modal.style.display = "none"));

  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });
});

// ================= RENDER MEDIA =================
function renderMedia(media) {
  const videoGrid = document.getElementById("video-grid");
  const imageGrid = document.getElementById("image-grid");
  const audioGrid = document.getElementById("audio-grid");

  if (!videoGrid || !imageGrid || !audioGrid) return;

  videoGrid.innerHTML = "";
  imageGrid.innerHTML = "";
  audioGrid.innerHTML = "";

  if (!media.length) {
    showMessage("Abhi tak koi media upload nahi hua.");
    return;
  }

  media.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    if (item.type === "video") {
      card.innerHTML = `
        <video src="${item.fileURL}" muted></video>
        <p>${item.title}</p>
      `;
      const video = card.querySelector("video");
      card.addEventListener("mouseenter", () => video.play());
      card.addEventListener("mouseleave", () => video.pause());
      videoGrid.appendChild(card);

    } else if (item.type === "image") {
      card.innerHTML = `
        <img src="${item.fileURL}" alt="${item.title}">
        <p>${item.title}</p>
      `;
      imageGrid.appendChild(card);

    } else if (item.type === "audio") {
      card.innerHTML = `
        <audio src="${item.fileURL}" controls></audio>
        <p>${item.title}</p>
      `;
      audioGrid.appendChild(card);
    }

    card.addEventListener("click", () => openModal(item));
  });
}

// ================= OPEN MODAL =================
function openModal(item) {
  const modal = document.getElementById("modal");
  const player = document.getElementById("media-player");

  if (!modal || !player) return;

  player.innerHTML = "";

  if (item.type === "video") {
    player.innerHTML = `<video controls autoplay src="${item.fileURL}"></video>`;
  } else if (item.type === "image") {
    player.innerHTML = `<img src="${item.fileURL}" alt="${item.title}">`;
  } else {
    player.innerHTML = `<audio controls autoplay src="${item.fileURL}"></audio>`;
  }

  modal.style.display = "block";
}

// ================= MESSAGE =================
function showMessage(msg) {
  const container = document.getElementById("video-grid");
  if (container) container.innerHTML = `<p style="padding:20px;">${msg}</p>`;
}
