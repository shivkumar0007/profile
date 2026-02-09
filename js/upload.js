/**************** SAFE INIT ****************/
document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const uploadMsg = document.getElementById("uploadMessage");

  if (!uploadForm) return; // page safety

  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const type = document.getElementById("mediaType").value;
    const title = document.getElementById("mediaTitle").value.trim();
    const file = document.getElementById("mediaFile").files[0];

    if (!file) return showUploadMsg("Select a file ❌");

    showLoader(true);
    showUploadMsg("Uploading...", true);

    try {
      const cloudName = "dqhovacnx";
      const preset = "netflix_media";

      /********** CLOUDINARY UPLOAD **********/
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", preset);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData }
      );

      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      const mediaUrl = cloudData.secure_url;

      /********** SAVE TO GOOGLE SHEET **********/
      const form = new FormData();
      form.append("action", "uploadMedia");
      form.append("type", type);
      form.append("title", title);
      form.append("url", mediaUrl);

      // thumbnail = same url (auto preview)
      form.append("thumbnailUrl", mediaUrl);

      form.append("uploader", user.email);

      const res = await fetch(API_BASE, { method: "POST", body: form });
      const data = await res.json();

      if (!data.success) throw new Error("Sheet save failed");

      /********** SUCCESS **********/
      showUploadMsg("Upload successful ✅", true);
      uploadForm.reset();
      closeUploadModal();
      loadDashboard();

    } catch (err) {
      console.error("Upload error:", err);
      showUploadMsg("Upload failed ❌");
    }

    showLoader(false);
  });

  function showUploadMsg(msg, ok = false) {
    uploadMsg.textContent = msg;
    uploadMsg.style.color = ok ? "#4caf50" : "#ff5252";
  }
});
