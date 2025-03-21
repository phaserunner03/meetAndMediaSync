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

    // ✅ Capture Screenshot with Authorization Check
    screenshotButton.addEventListener("click", async () => {
        const meetId = meetIdElement.textContent;

        if (!meetId || meetId === "No Meet Found") {
            statusText.textContent = "❌ No active Meet found. Cannot take screenshot.";
            return;
        }

        statusText.textContent = "🔄 Checking authorization...";

        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
            if (chrome.runtime.lastError) {
                statusText.textContent = "❌ Authentication failed.";
                console.error("OAuth Error:", chrome.runtime.lastError.message);
                return;
            }

            console.log("✅ OAuth Token obtained:", token);

            // ✅ Verify if user is authorized for the meeting
            const response = await fetch("http://localhost:8000/api/meetings/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingCode: meetId, token }),
            });

            const data = await response.json();
            if (!data.success) {
                statusText.textContent = `❌ Unauthorized: ${data.message}`;
                return;
            }

            // ✅ Authorized: Take Screenshot
            statusText.textContent = "📸 Taking screenshot...";
            chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
                if (response.success) {
                    const fileName = prompt("Enter a file name for the screenshot:", `screenshot_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}`);
                    statusText.textContent = "Uploading screenshot...";
                    uploadScreenshot(response.image, fileName, token, meetId);
                } else {
                    statusText.textContent = "❌ Failed to capture screenshot.";
                }
            });
        });
    });

    // ✅ Upload Screenshot to Google Drive
    function uploadScreenshot(image, fileName, token, meetId) {
        chrome.runtime.sendMessage(
            { action: "upload_screenshot", image, fileName, token, meetingId: meetId },
            (response) => {
                if (response.success) {
                    statusText.innerHTML = `✅ Uploaded! <a href="${response.fileUrl}" target="_blank" class="text-blue-600 underline">View File</a>`;
                } else {
                    statusText.textContent = `❌ Upload failed: ${response.message}`;
                }
            }
        );
    }
});
