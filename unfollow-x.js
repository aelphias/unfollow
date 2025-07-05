function currentTime() {
  return new Date().toLocaleTimeString();
}
(async function () {
  const MAX_PER_DAY = 400;                  // Max unfollows per day
  const PAUSE_AFTER_BATCH = 10;             // Pause after every 10 unfollows
  const PAUSE_DURATION = 10 * 60 * 1000;    // Pause duration: 10 minutes (ms)
  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Find the "Following" button exactly by text or aria-label
  const findFollowingButton = () => {
    const buttons = [...document.querySelectorAll('div[role="button"], button')];
    return buttons.find(btn =>
      btn.innerText.trim() === "Following" ||
      (btn.getAttribute('aria-label') && btn.getAttribute('aria-label').includes('Following'))
    );
  };

  // Store progress in localStorage keyed by date
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `unfollowed_${today}`;
  const alreadyUnfollowed = parseInt(localStorage.getItem(storageKey) || "0");

  if (alreadyUnfollowed >= MAX_PER_DAY) {
    console.log(`🛑 Daily limit of ${MAX_PER_DAY} unfollows reached.`);
    return;
  }

  window.STOP_UNFOLLOW = false;
  let unfollowed = alreadyUnfollowed;

  console.log(`[${currentTime()}]🚀 Starting unfollow process (${unfollowed}/${MAX_PER_DAY} done today)`);

  while (unfollowed < MAX_PER_DAY) {
    if (window.STOP_UNFOLLOW) {
      console.log("🛑 Unfollow script stopped manually.");
      break;
    }

    const btn = findFollowingButton();
    if (!btn) {
      console.log("❗ 'Following' button not found — maybe all unfollowed.");
      break;
    }

    // Randomly skip ~20% to mimic human behavior
    if (Math.random() < 0.2) {
      console.log("🤔 Skipped this one (random choice).");
      window.scrollBy(0, 100);
      await delay(randomDelay(1000, 2000));
      continue;
    }

    btn.scrollIntoView({behavior: "smooth", block: "center"});
    btn.click();
    await delay(500);

    // Find the confirm unfollow button by data-testid
    const confirmBtn = document.querySelector('button[data-testid="confirmationSheetConfirm"]');
    if (confirmBtn) {
      confirmBtn.click();
      unfollowed++;
      localStorage.setItem(storageKey, unfollowed);
      console.log(`✅ Unfollowed #${unfollowed} today`);
    } else {
      console.log("⚠️ Confirm 'Unfollow' button not found");
    }

    window.scrollBy(0, randomDelay(50, 150));

    const waitTime = randomDelay(5000, 20000);
    console.log(`[${currentTime()}]⏳ Waiting ${Math.floor(waitTime / 1000)} seconds...`);
    await delay(waitTime);

    if (unfollowed % PAUSE_AFTER_BATCH === 0 && unfollowed !== 0) {
      console.log(`[${currentTime()}]😴 Pausing for ${PAUSE_DURATION / 60000} minutes after ${unfollowed} unfollows.`);
      await delay(PAUSE_DURATION);
    }
  }

  console.log(`🏁 Session complete. Total unfollowed today: ${unfollowed}`);
})();