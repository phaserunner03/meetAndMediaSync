// ✅ Ask Background Script for the Meet ID
chrome.runtime.sendMessage({ action: "fetch_meet_id" }, (response) => {
    if (response && response.meetId) {
        console.log("Meet ID received from background:", response.meetId);
        
        // Send the Meet ID back to background.js for future reference
        chrome.runtime.sendMessage({ action: "store_meet_id", meetId: response.meetId });
    } else {
        console.warn("No Meet ID received.");
    }
});
