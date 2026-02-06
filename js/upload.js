// upload.js - Upload to Cloudinary → Save to Apps Script backend
const BACKEND_URL = "https://script.google.com/macros/s/AKfycby3c8CiqxUXtmt_yXiTzPJglw6xo1PR1POm6MQUIJcHjHP5PNaDAFeRe-xOGNP7s2gY/exec";
const CLOUD_NAME = "dqhovacnx";
const UPLOAD_PRESET = "video_upload";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("upload-form");
  const progress = document.getElementById("progress");
  const token = localStorage.getItem("token");

  // 🔐 Not logged in
  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = document.getElementById("file").files[0];
    if (!file) return alert("Please select a file.");

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();

    const type = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
      ? "image"
      : "audio";

    try {
      // ================= CLOUDINARY UPLOAD =================
      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("upload_preset", UPLOAD_PRESET);

      progress.textContent = "Uploading to cloud...";

      const cloudResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: cloudForm,
        }
      );

      const cloudData = await cloudResponse.json();
      if (!cloudData.secure_url) throw new Error("Cloud upload failed");

      const fileURL = cloudData.secure_url;

      const thumbnailURL =
        type === "video"
          ? cloudData.secure_url.replace("/upload/", "/upload/w_300,h_150,c_fill/")
          : fileURL;

      // ================= SAVE TO BACKEND =================
      progress.textContent = "Saving to server...";

      const formData = new URLSearchParams();
      formData.append("action", "addMedia");
      formData.append("token", token);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("thumbnailURL", thumbnailURL);
      formData.append("fileURL", fileURL);
      formData.append("type", type);

      const backendResponse = await fetch(BACKEND_URL, {
        method: "POST",
        body: formData,
      });

      const backendData = await backendResponse.json();

      if (backendData.success) {
        alert("Upload successful!");
        window.location.href = "dashboard.html";
      } else {
        alert(backendData.message || "Save failed.");
      }

    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      progress.textContent = "";
    }
  });
});
