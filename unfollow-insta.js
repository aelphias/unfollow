(async function () {
  const MAX_PER_DAY = 400;                  // Maximum number of unfollows allowed per day
  const PAUSE_AFTER_BATCH = 10;             // Pause after every 10 unfollows
  const PAUSE_DURATION = 10 * 60 * 1000;    // Pause duration: 10 minutes (in ms)
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const findButton = (txt) => [...document.querySelectorAll("button")].find(btn => btn.innerText === txt);

  // Helper to get current clock time as string
  function currentTime() {
    return new Date().toLocaleTimeString();
  }

  // Detect internal "Sorry, something went wrong" error
  function checkDTSGErrorMessage() {
    return [...document.querySelectorAll("*")].some(el =>
      el.innerText?.includes("Sorry, something went wrong")
    );
  }

  // Use localStorage to track today's date and unfollow count
  const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
  const key = `unfollowed_${today}`;
  const alreadyUnfollowed = parseInt(localStorage.getItem(key) || "0");

  // If daily limit reached, stop immediately
  if (alreadyUnfollowed >= MAX_PER_DAY) {
    console.log(`🛑 Daily limit of ${MAX_PER_DAY} unfollows already reached.`);
    return;
  }
    if (checkDTSGErrorMessage()) {
      console.error("❌ Instagram internal error detected: 'Sorry, something went wrong'. Halting script.");
      alert("❌ Instagram returned an error: 'Something went wrong'. Try reloading the page or waiting a few hours.");
      return;
    }
  window.STOP_UNFOLLOW = false;
  // Create a visible STOP button
const stopBtn = document.createElement("button");
stopBtn.innerText = "🛑 STOP";
stopBtn.style.position = "fixed";
stopBtn.style.top = "20px";
stopBtn.style.right = "20px";
stopBtn.style.padding = "10px 15px";
stopBtn.style.zIndex = "9999";
stopBtn.style.backgroundColor = "#e74c3c";
stopBtn.style.color = "#fff";
stopBtn.style.border = "none";
stopBtn.style.borderRadius = "6px";
stopBtn.style.cursor = "pointer";
stopBtn.style.fontSize = "16px";
stopBtn.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

// When clicked, set STOP_UNFOLLOW to true
stopBtn.onclick = () => {
  window.STOP_UNFOLLOW = true;
  stopBtn.innerText = "⏸️ Stopping...";
  stopBtn.disabled = true;

  // Wait a bit and update UI after loop exits
  setTimeout(() => {
    stopBtn.innerText = "✅ Stopped";
    stopBtn.style.backgroundColor = "#2ecc71"; // green
  }, 2000); // slight delay to sync with the end of the loop
};

// Add to page
document.body.appendChild(stopBtn);
  let unfollowed = alreadyUnfollowed;

  console.log(`🚀 Start unfollow session (${unfollowed}/${MAX_PER_DAY} already unfollowed today)`);

  for (let i = 0; unfollowed < MAX_PER_DAY; i++) {
    if (window.STOP_UNFOLLOW) {
      console.log("🛑 Unfollow process manually stopped.");
      break;	
    }

    const nextButton = findButton("Following");
    if (!nextButton) {
      console.log("❗ No more 'Following' buttons found.");
      break;
    }

    // 20% chance to "change mind" and skip unfollow (human-like randomness)
    if (Math.random() < 0.2) {
      console.log("🤔 Skipped this one (random 'changed mind')");
      window.scrollBy(0, 100);
      await delay(randomDelay(1000, 2000));
      continue;
    }

    nextButton.scrollIntoViewIfNeeded();
    nextButton.click();
    await delay(300);

    const confirmButton = findButton("Unfollow");
    if (confirmButton) {
      confirmButton.click();
      unfollowed++;
      localStorage.setItem(key, unfollowed); // Save progress in localStorage
      console.log(`✅ Unfollowed #${unfollowed} today`);
    } else {
      console.log(`[${currentTime()}]⚠️ Confirm button not found`);
    }

    window.scrollBy(0, randomDelay(50, 150)); // Simulate human scrolling

    const waitTime = randomDelay(5000, 20000); // Wait 5–20 seconds randomly
    console.log(`[${currentTime()}]⏳ Waiting ${Math.floor(waitTime / 1000)} seconds...`);
    await delay(waitTime);

    // After every batch, take a longer break
    if (unfollowed % PAUSE_AFTER_BATCH === 0 && unfollowed !== 0) {
      console.log(`[${currentTime()}]😴 Pausing for ${PAUSE_DURATION / 60000} minutes after ${unfollowed} unfollows`);
      await delay(PAUSE_DURATION);
    }
  }

  console.log(`[${currentTime()}]🏁 Finished session. Total unfollowed today: ${unfollowed}`);
})();