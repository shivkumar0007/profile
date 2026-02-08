/**************** CONFIG ****************/
const API_BASE =
  "https://script.google.com/macros/s/AKfycbx49VJP6Nf5SwOBUGjIOCaQMN7puMyCzROAb1tyT57M0jYh1T3JwlBErM90YxigS0sd/exec";

let user = JSON.parse(localStorage.getItem("user"));
let heroItem = null;
let allMedia = [];

/**************** INIT ****************/
document.addEventListener("DOMContentLoaded", () => {
  if (!user) return (window.location.href = "index.html");

  document.getElementById("profileImg").src =
    user.profileImg ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username,
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
    // MEDIA
    const res = await fetch(`${API_BASE}?action=fetchMedia`);
    const data = await res.json();

    if (data.success) {
      allMedia = data.media;
      renderRows(allMedia);
    }

    // HERO
    const heroRes = await fetch(`${API_BASE}?action=getHero`);
    const heroData = await heroRes.json();

    if (heroData.success) setHeroFromSheet(heroData.hero);
    else setHeroFallback(allMedia);
  } catch (err) {
    console.error("Dashboard load error:", err);
  }

  showLoader(false);
}

/**************** HERO FROM SHEET ****************/
/**************** HERO FROM SHEET ****************/
function setHeroFromSheet(hero) {
  if (!hero || !hero.url) return;
  const isVideo = hero.url.match(/\.(mp4|webm|ogg)$/i);
  heroItem = { ...hero, type: isVideo ? "video" : "image" };
  const heroImg = document.getElementById("heroImg");

  if (isVideo) {
    const thumb = hero.url.replace("/video/upload/", "/video/upload/so_1/").replace(/\.(mp4|webm|ogg)$/i, ".jpg");
    heroImg.src = thumb + "?t=" + Date.now();
  } else {
    heroImg.src = hero.url + "?t=" + Date.now();
  }

  // ⭐ FIX: Single click ko hata diya (onclick = null)
  heroImg.onclick = null; 

  // ⭐ EDIT OPTION: Ab sirf DOUBLE CLICK par hi replace window khulegi
  heroImg.style.cursor = "pointer";
  heroImg.ondblclick = openHeroEditor; 

  document.getElementById("heroTitle").textContent = hero.title || user.username + " Featured";
  document.getElementById("heroDesc").textContent = "Welcome " + user.username;

  // Play button logic same rahega (First video from list)
  document.getElementById("heroPlayBtn").onclick = () => {
    const firstVideo = allMedia.find(m => m.type === "video");
    if (firstVideo) openPlayer(firstVideo);
    else alert("No videos found!");
  };
}
/**************** HERO FALLBACK ****************/
function setHeroFallback(media) {
  heroItem = media.find((m) => m.type === "video") || media[0];
  if (!heroItem) return;

  document.getElementById("heroTitle").textContent =
    user.username + "’s Featured";
  document.getElementById("heroDesc").textContent = "Enjoy your media";
  document.getElementById("heroImg").src =
    heroItem.thumbnailUrl || heroItem.url;

  // ⭐ CHANGE: Banner video ko bypass karke list ka pehla video play karega
  document.getElementById("heroPlayBtn").onclick = () => {
    const firstVideo = allMedia.find((m) => m.type === "video");
    if (firstVideo) openPlayer(firstVideo);
    else alert("No videos found!");
  };
}

/**************** HERO REPLACE (RESTORED) ****************/
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

      // Cloudinary upload
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: fd },
      );

      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Upload failed");

      // App Script update
      const form = new FormData();
      form.append("action", "setHero");
      form.append("url", cloudData.secure_url);
      form.append("title", user.username + " Featured");

      await fetch(API_BASE, { method: "POST", body: form });

      loadDashboard(); // Refresh UI
      alert("Hero Banner Updated! ✅");
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
  renderCards(
    "videosCards",
    media.filter((m) => m.type === "video"),
  );
  renderCards(
    "audiosCards",
    media.filter((m) => m.type === "audio"),
  );
  renderCards(
    "imagesCards",
    media.filter((m) => m.type === "image"),
  );
}

/**************** CARDS ****************/
function renderCards(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item) => {
    const thumb =
      item.thumbnailUrl ||
      (item.type === "video" ? item.url + "#t=1" : item.url);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
  ${
    item.type === "video"
      ? `<video src="${item.url}" muted></video>`
      : `<img src="${item.thumbnailUrl || item.url}">`
  }
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

// 🔹 Global variables

/**************** NETFLIX POPUP PLAYER ****************/

// 🔹 Global variables
let currentPlayingId = null;
let playerListBuilt = false;
let resumeTimes = {};

function openPlayer(startItem) {
  const modal = document.getElementById("playerModal");
  const view = document.getElementById("playerView");
  const list = document.getElementById("playerList");

  document.body.style.overflow = "hidden";
  modal.style.display = "flex";

  /** ================= PLAY FUNCTION ================= **/
  function play(item, isAutoNext = false) {
    currentPlayingId = item.id;

    if (!isAutoNext) {
      resumeTimes[item.id] = 0;
    }

    // Yahan sirf video hi chalega
    view.innerHTML = `<video controls autoplay src="${item.url}" class="main-media"></video>`;

    const media = view.querySelector(".main-media");
    media.currentTime = resumeTimes[item.id] || 0;

    media.ontimeupdate = () => {
      resumeTimes[item.id] = media.currentTime;
    };

    media.onended = () => {
      resumeTimes[item.id] = 0;
      // ⭐ FILTER CHANGE: Ab auto-next sirf videos par jayega
      const playable = allMedia.filter((m) => m.type === "video");
      const index = playable.findIndex((m) => m.id === item.id);

      if (index !== -1 && index < playable.length - 1) {
        play(playable[index + 1], true);
      }
    };

    document.querySelectorAll(".player-item").forEach((el) => {
      el.classList.toggle("active-playing", el.dataset.id === item.id);
    });
  }

  /** ================= BUILD LIST ================= **/
  // Har baar list refresh hogi taaki agar filter badle toh sahi dikhe
  list.innerHTML = "";

  allMedia.forEach((m) => {
    // ⭐ FILTER CHANGE: Audio aur Image dono ko hata diya, sirf Video dikhega
    if (m.type !== "video") return;

    const div = document.createElement("div");
    div.className = "player-item";
    div.dataset.id = m.id;

    let thumb = m.thumbnailUrl;
    if (m.url.includes("/video/upload/")) {
      thumb = m.url
        .replace("/video/upload/", "/video/upload/so_1/")
        .replace(".mp4", ".jpg");
    }

    div.innerHTML = `
      <img src="${thumb}" onerror="this.src='https://dummyimage.com/300x170/000/fff&text=Video'">
      <div class="item-info">
        <div class="item-title">${m.title}</div>
        <small>${m.type.toUpperCase()}</small>
      </div>
    `;

    div.onclick = () => play(m, false);
    list.appendChild(div);
  });

  play(startItem, false);
}

function closePlayer() {
  document.getElementById("playerModal").style.display = "none";
  document.getElementById("playerView").innerHTML = "";
  document.body.style.overflow = "";
}
