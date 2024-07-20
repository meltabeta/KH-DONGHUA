document.addEventListener('DOMContentLoaded', function () {
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = now.getFullYear();

        const timeString = `${hours}:${minutes}:${seconds}`;
        const dateString = `${day}/${month}/${year}`;

        document.getElementById('clock').textContent = `${timeString} - ${dateString}`;
    }

    setInterval(updateClock, 1000);
    updateClock(); // Initial call to display the clock immediately
});
