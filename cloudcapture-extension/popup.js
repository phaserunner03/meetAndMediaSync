document.addEventListener("DOMContentLoaded", function () {
  const captureButton = document.getElementById("capture-btn");
  const previewImg = document.getElementById("screenshot-preview");
  const uploadButton = document.getElementById("upload-btn");

  let screenshotData = null;

  // Capture Screenshot
  captureButton.addEventListener("click", function () {
      console.log("Capture button clicked");

      chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
          if (response.success) {
              screenshotData = response.image;
              previewImg.src = screenshotData; // Show preview
              previewImg.style.display = "block";
              uploadButton.style.display = "block";
          } else {
              console.error("Screenshot failed:", response.message);
          }
      });
  });

  // Upload Screenshot with Meeting ID
  uploadButton.addEventListener("click", function () {
    if (!screenshotData) {
        console.error("No screenshot to upload!");
        return;
    }

    // ✅ Auto-fetch Meet ID instead of prompting user
    chrome.runtime.sendMessage({ action: "fetch_meet_id" }, (response) => {
        console.log(response)
        const meetingId = response.meetId || prompt("Enter Meeting ID (if not detected):");
        if (!meetingId) {
            alert("Meeting ID is required!");
            return;
        }

        console.log("Uploading screenshot...");
        chrome.runtime.sendMessage({ action: "upload_screenshot", image: screenshotData, meetingId }, (uploadResponse) => {
            if (uploadResponse.success) {
                alert("Screenshot uploaded successfully!");
            } else {
                console.error("Upload failed:", uploadResponse.message);
                alert("Upload failed!");
            }
        });
    });
});

});
