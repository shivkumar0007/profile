/**************** CONFIG ****************/
const API_BASE =
  "https://script.google.com/macros/s/AKfycbwhPEpBkI7PrmQDPr6ARWUlK4ZDhacc2O7CyL5y0HL9Xf8vRbMmynxWJ5wN-csPF4xI/exec";

let user = JSON.parse(localStorage.getItem("user"));
let heroItem = null;
let allMedia = [];

/**************** INIT ****************/
document.addEventListener("DOMContentLoaded", () => {
  if (!user) return (window.location.href = "index.html");

  document.getElementById("profileImg").src =
    user.profileImg ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username
    )}&background=E50914&color=fff`;

  loadDashboard();
});

/**************** UI ****************/
function showLoader(show) {
  document.getElementById("loader").classList.toggle("hidden", !show);
}

function toggleProfileMenu() {
  document.getElementById("profileDropdown").classList.toggle("hidden");
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function showUploadModal() {
  document.getElementById("uploadModal").style.display = "block";
}

function closeUploadModal() {
  document.getElementById("uploadModal").style.display = "none";
}

/**************** LOAD DASHBOARD ****************/
async function loadDashboard() {
  showLoader(true);

  try {
    // media fetch
    const res = await fetch(`${API_BASE}?action=fetchMedia`);
    const data = await res.json();

    if (data.success) {
      allMedia = data.media;
      renderRows(allMedia);
    }

    // ⭐ HERO FETCH (ye missing hai tumhare code me)
    const heroRes = await fetch(`${API_BASE}?action=fetchHero`);
    const heroData = await heroRes.json();

    if (heroData.success) {
      setHeroFromSheet(heroData.hero);
    } else {
      setHeroFallback(allMedia);
    }

  } catch (err) {
    console.error("Dashboard load error:", err);
  }

  showLoader(false);
}


/**************** HERO FROM SHEET ****************/
function setHeroFromSheet(hero) {
  if (!hero || !hero.url) return;

  // ⭐ detect type automatically
  const isVideo = hero.url.match(/\.(mp4|webm|ogg)$/i);

  heroItem = {
    ...hero,
    type: isVideo ? "video" : "image"
  };

  // ⭐ cache breaker (important)
  const noCacheUrl = hero.url + "?t=" + Date.now();

  document.getElementById("heroTitle").textContent = hero.title || "Featured";
  document.getElementById("heroDesc").textContent = "Featured media";
  document.getElementById("heroImg").src = noCacheUrl;

  // ⭐ play button behaviour
  document.getElementById("heroPlayBtn").onclick = () => {
    if (heroItem.type === "image") {
      openViewer(heroItem);   // image viewer
    } else {
      openPlayer(heroItem);   // video/audio player
    }
  };
}





/**************** HERO ****************/
function setHeroFallback(media) {
  heroItem = media.find((m) => m.type === "video") || media[0];
  if (!heroItem) return;

  document.getElementById("heroTitle").textContent = heroItem.title;
  document.getElementById("heroDesc").textContent = "Featured media";
  document.getElementById("heroImg").src =
    heroItem.thumbnailUrl || heroItem.url;

  document.getElementById("heroPlayBtn").onclick = () =>
    openPlayer(heroItem);
}



/**************** HERO REPLACE (PENCIL) ****************/
function openHeroEditor() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "video/*,image/*";

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    showLoader(true);

    try {
      const cloudName = "dqhovacnx";
      const preset = "netflix_media";

      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", preset);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: fd }
      );

      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Upload failed");

      const form = new FormData();
      form.append("action", "setHero");
      form.append("url", cloudData.secure_url);
      form.append("title", "Featured");

      await fetch(API_BASE, { method: "POST", body: form });

      loadDashboard(); // reload UI
    } catch (err) {
      console.error(err);
      alert("Hero replace failed ❌");
    }

    showLoader(false);
  };

  input.click();
}

/**************** RENDER ROWS ****************/
function renderRows(media) {
  renderCards("videosCards", media.filter((m) => m.type === "video"));
  renderCards("audiosCards", media.filter((m) => m.type === "audio"));
  renderCards("imagesCards", media.filter((m) => m.type === "image"));
}

/**************** CARDS ****************/
function renderCards(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${item.thumbnailUrl || item.url}">
      <h3>${item.title}</h3>
      <button class="delete-btn" onclick="deleteMedia('${item.id}')">✕</button>
    `;

    card.onclick = (e) => {
      if (e.target.classList.contains("delete-btn")) return;
      openViewer(item);
    };

    container.appendChild(card);
  });
}

/**************** SIMPLE VIEWER ****************/
function openViewer(item) {
  const modal = document.getElementById("viewerModal");
  const viewer = document.getElementById("mediaViewer");

  if (item.type === "video")
    viewer.innerHTML = `<video controls autoplay src="${item.url}"></video>`;
  else if (item.type === "audio")
    viewer.innerHTML = `<audio controls autoplay src="${item.url}"></audio>`;
  else viewer.innerHTML = `<img src="${item.url}">`;

  modal.style.display = "block";
}

function closeViewer() {
  document.getElementById("viewerModal").style.display = "none";
  document.getElementById("mediaViewer").innerHTML = "";
}

/**************** DELETE MEDIA ****************/
async function deleteMedia(id) {
  if (!confirm("Delete this media?")) return;

  showLoader(true);

  try {
    const form = new FormData();
    form.append("action", "deleteMedia");
    form.append("id", id);
    form.append("user", user.username);

    const res = await fetch(API_BASE, { method: "POST", body: form });
    const data = await res.json();

    if (data.success) loadDashboard();
    else alert("Delete failed ❌");
  } catch (err) {
    console.error(err);
    alert("Server error ❌");
  }

  showLoader(false);
}

/**************** NETFLIX POPUP PLAYER ****************/
function openPlayer(startItem) {
  const modal = document.getElementById("playerModal");
  const view = document.getElementById("playerView");
  const list = document.getElementById("playerList");

  if (!modal || !view || !list) {
    alert("Player modal missing in HTML");
    return;
  }

  modal.style.display = "flex";

  function play(item) {
    if (item.type === "video")
      view.innerHTML = `<video controls autoplay src="${item.url}"></video>`;
    else
      view.innerHTML = `<audio controls autoplay src="${item.url}"></audio>`;
  }

  play(startItem);

  list.innerHTML = "";
  allMedia.forEach((m) => {
    if (m.type === "image") return;

    const div = document.createElement("div");
    div.className = "player-item";

    div.innerHTML = `
      <img src="${m.thumbnailUrl || m.url}">
      <div>
        <div>${m.title}</div>
        <small>${m.type.toUpperCase()}</small>
      </div>
   `;

    div.onclick = () => play(m);
    list.appendChild(div);
  });
}

function closePlayer() {
  document.getElementById("playerModal").style.display = "none";
}
