function showTime() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Format the time
    let time = hours + ":" + minutes + ":" + seconds;

    // Display the time in the clock div
    document.getElementById("clock").innerHTML = time;

    // Format the date
    let formattedDate = formatDate(date);

    // Display the date in the date div
    document.getElementById("date").innerHTML = formattedDate;
}

function formatDate(date) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();

    return months[monthIndex] + " " + day + ", " + year;
}
// Digital Clock Functionality
function updateClock() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const time = `${hours}:${minutes}:${seconds}`;

    document.getElementById('clock-date').textContent = date;
    document.getElementById('clock-time').textContent = time;
}

setInterval(updateClock, 1000);
updateClock(); // Initial call to set the clock immediately

// Call the showTime function every second
setInterval(showTime, 1000);
