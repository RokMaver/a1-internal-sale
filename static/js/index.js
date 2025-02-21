// Parse the deadline from the script tag
const targetDate = new Date(deadline).getTime();

function updateCountdown() {
    const now = new Date().getTime(); // Current time
    const timeLeft = targetDate - now; // Time remaining in milliseconds

    if (timeLeft <= 0) {
        document.getElementById("countdown").innerHTML = "Time's up! 🎉";
        clearInterval(interval);
        return;
    }

    // Calculate days, hours, minutes, seconds
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Display countdown
    document.getElementById("countdown").innerHTML =
        `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Update countdown every second
const interval = setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call to avoid 1s delay