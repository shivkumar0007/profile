// ================= CONFIG =================
const BACKEND_URL =
  "https://script.google.com/macros/s/AKfycbxRQ9Kn2HFlOdlPzPY1mvpojN6B_6j93v3cFc71hVXeA4xKfVe-THuhy9UxQ0lQYdRv/exec";

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
      progress.textContent = "Uploading to Cloudinary...";

      const cloudForm = new FormData();
      cloudForm.append("file", file);
      cloudForm.append("upload_preset", UPLOAD_PRESET);

      const cloudResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        { method: "POST", body: cloudForm }
      );

      const cloudData = await cloudResponse.json();
      console.log("Cloudinary response:", cloudData);

      if (!cloudResponse.ok || !cloudData.secure_url) {
        throw new Error(cloudData.error?.message || "Cloudinary upload failed");
      }

      const fileURL = cloudData.secure_url;

      const thumbnailURL =
        type === "video"
          ? fileURL.replace("/upload/", "/upload/w_300,h_150,c_fill/")
          : fileURL;

      // ================= SAVE TO APPS SCRIPT =================
      progress.textContent = "Saving media to server...";

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
      console.log("Backend response:", backendData);

      if (!backendData.success) {
        throw new Error(backendData.message || "Backend save failed");
      }

      alert("✅ Upload successful!");
      window.location.href = "dashboard.html";

    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Upload failed:\n" + error.message);
    } finally {
      progress.textContent = "";
    }
  });
});
