
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "capture_screenshot") {
        if (!activeMeetId) {
            console.warn("❌ No active Meet ID found. Cannot capture screenshot.");
            sendResponse({ success: false, message: "No active Meet found." });
            return;
        }

        chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Screenshot error:", chrome.runtime.lastError.message);
                sendResponse({ success: false, message: "Screenshot failed" });
                return;
            }
            console.log("✅ Screenshot taken");
            sendResponse({ success: true, image: image });
        });

        return true;
    }

    if (request.action === "upload_screenshot") {
        const { token, image, fileName, meetingId } = request;
        if (!token || !meetingId) {
            sendResponse({ success: false, message: "❌ Missing required parameters." });
            return;
        }

        getOrCreateDriveFolder(token, "CloudCapture")
            .then((parentFolderId) => getOrCreateDriveFolder(token, meetingId, parentFolderId))
            .then((meetingFolderId) => uploadToDrive(token, image, meetingFolderId, fileName, sendResponse))
            .catch((error) => {
                console.error("❌ Drive folder error:", error);
                sendResponse({ success: false, message: "Failed to create/find folder" });
            });

        return true;
    }
});


let activeMeetId = null;

function fetchActiveMeetId() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0 || !tabs[0].url) {
            console.warn("⚠ No active Meet tab found.");
            return;
        }

        const url = tabs[0].url;
        const meetIdMatch = url.match(/meet\.google\.com\/([a-zA-Z0-9-]+)/);

        if (meetIdMatch) {
            const meetId = meetIdMatch[1].split("?")[0]; // Remove query params
            console.log("✅ Active Meet ID:", meetId);
            activeMeetId = meetId;
            chrome.runtime.sendMessage({ action: "update_popup", meetId: activeMeetId });
        } else {
            console.warn("❌ No Meet ID found in URL.");
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetch_meet_id") {
        sendResponse({ meetId: activeMeetId });
    }
    if (request.action === "refresh_meet_id") {
        fetchActiveMeetId();
    }

});

chrome.tabs.onActivated.addListener(fetchActiveMeetId);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        fetchActiveMeetId();
    }

});


// ✅ Function to Find or Create Folder in Google Drive
function getOrCreateDriveFolder(token, folderName, parentFolderId = null) {
  return new Promise((resolve, reject) => {
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentFolderId) {
          query += ` and '${parentFolderId}' in parents`;
      }

      fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`, {
          method: "GET",
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
          }
      })
      .then(response => response.json())
      .then(data => {
          if (data.files && data.files.length > 0) {
              console.log(`Folder "${folderName}" found:`, data.files[0].id);
              resolve(data.files[0].id);
          } else {
              fetch("https://www.googleapis.com/drive/v3/files", {
                  method: "POST",
                  headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                      name: folderName,
                      mimeType: "application/vnd.google-apps.folder",
                      parents: parentFolderId ? [parentFolderId] : []
                  })
              })
              .then(response => response.json())
              .then(folderData => {
                  resolve(folderData.id);
              })
              .catch(error => reject(error));
          }
      })
      .catch(error => reject(error));
  });
}

// ✅ Function to Convert Base64 Image to Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];
  for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
  }
  return new Blob([new Uint8Array(byteArrays)], { type: mimeType });
}

// ✅ Function to Upload Screenshot to Drive
function uploadToDrive(token, image, folderId, fileName, sendResponse) {
    const blob = base64ToBlob(image, "image/png");

    const metadata = {
        name: `${fileName}.png`,  // ✅ Use the filename received from popup.js
        parents: [folderId],
        mimeType: "image/png"
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", blob);

    fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role: "reader", type: "anyone" })
        })
        .then(() => {
            const fileUrl = `https://drive.google.com/uc?id=${data.id}`;
            sendResponse({ success: true, fileId: data.id, fileUrl: fileUrl });
            console.log("File is now viewable at:", fileUrl);

            notifyBackend(fileUrl, fileName, sendResponse);
        })
        .catch(error => {
            console.error("Permission error:", error);
            sendResponse({ success: false, message: "Failed to set permissions" });
        });
    })
    .catch(error => {
        console.error("Upload error:", error);
        sendResponse({ success: false, message: "Upload failed" });
    });
}

function notifyBackend(fileUrl, fileName, sendResponse) {
    const backendApiUrl = "http://localhost:8080/web/drive/v1/mediaLogs"; 
    const payload = {
        meetingID: activeMeetId,
        type: "screenshot",
        fileUrl: fileUrl,
        fileName: fileName,
        storedIn: "Google Drive",
        movedToGCP: false,
        timestamp: new Date().toISOString()
    };

    fetch(backendApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Backend API response:", data);
        sendResponse({ success: true, fileUrl: fileUrl });
    })
    .catch(error => {
        console.error("Backend API error:", error);
        sendResponse({ success: false, message: "Failed to notify backend" });
    });
}