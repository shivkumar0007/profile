document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);

  const title = params.get("title");
  const description = params.get("description");
  const url = params.get("url");
  const type = params.get("type");
  const date = params.get("date");

  const mediaBox = document.getElementById("media-box");

  // ===== SHOW MEDIA BASED ON TYPE =====

  if (type === "image") {
    mediaBox.innerHTML = `<img src="${url}" alt="${title}">`;
  }

  else if (type === "audio") {
    mediaBox.innerHTML = `
      <audio controls autoplay>
        <source src="${url}">
        Your browser does not support audio.
      </audio>
    `;
  }

  else {
    // default = video
    mediaBox.innerHTML = `
      <video controls autoplay>
        <source src="${url}">
        Your browser does not support video.
      </video>
    `;
  }

  // ===== SET INFO =====
  document.getElementById("video-title").textContent = title || "";
  document.getElementById("video-description").textContent = description || "";
  document.getElementById("video-date").textContent = date || "";
});
