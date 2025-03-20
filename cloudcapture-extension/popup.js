document.addEventListener("DOMContentLoaded", () => {
    const meetIdElement = document.getElementById("meetId");
    const refreshButton = document.getElementById("refreshMeetId");
    const screenshotButton = document.getElementById("takeScreenshot");
    const statusText = document.getElementById("status");

    // ✅ Request the Active Meet ID from background.js
    chrome.runtime.sendMessage({ action: "fetch_meet_id" }, (response) => {
        if (response && response.meetId) {
            meetIdElement.textContent = response.meetId;
        } else {
            meetIdElement.textContent = "No Meet Found";
        }
    });

    // ✅ Refresh Meet ID
    refreshButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "refresh_meet_id" });
        meetIdElement.textContent = "Refreshing...";
    });

    // ✅ Listen for updates from background.js
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "update_popup" && request.meetId) {
            meetIdElement.textContent = request.meetId;
        }
    });

    // ✅ Capture Screenshot and Upload
    screenshotButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
            if (response.success) {
                const fileName = prompt("Enter a file name for the screenshot:", `screenshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`);
                statusText.textContent = "Uploading screenshot...";
                uploadScreenshot(response.image, fileName);
            } else {
                statusText.textContent = "Failed to capture screenshot.";
            }
        });
    });

    // ✅ Upload Screenshot to Google Drive
    function uploadScreenshot(image, fileName) {
        chrome.runtime.sendMessage({ action: "upload_screenshot", image: image, fileName: fileName, meetingId: meetIdElement.textContent }, (response) => {
            if (response.success) {
                statusText.innerHTML = `Uploaded! <a href="${response.fileUrl}" target="_blank" class="text-blue-600 underline">View File</a>`;
            } else {
                statusText.textContent = "Upload failed.";
            }
        });
    }
});
