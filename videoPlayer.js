import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBdVgeMqQKtuJEQxrPFz8xB7XmUN6cFlMQ",
    authDomain: "kh-donghua.firebaseapp.com",
    databaseURL: "https://kh-donghua-default-rtdb.firebaseio.com",
    projectId: "kh-donghua",
    storageBucket: "kh-donghua.appspot.com",
    messagingSenderId: "119897892431",
    appId: "1:119897892431:web:ad31196e8a9692b63e6c3a"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('playlistId');
    const episodeNumber = parseInt(urlParams.get('episode'), 10) || 1; // Default to 1 if no episode parameter
    const videoContainer = document.querySelector('.video-container');
    const videoTitle = document.getElementById('videoTitle');
    const episodeTitle = document.getElementById('episodeTitle');
    const episodeList = document.getElementById('episodeList');
    const episodeDropdown = document.getElementById('episodeDropdown');
    const prevEpisodeBtn = document.getElementById('prevEpisodeBtn');
    const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');
    const backButton = document.getElementById('backButton');
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';
    videoContainer.appendChild(paginationControls);
    let episodes = [];
    let currentEpisodeIndex = 0;
    let currentPage = 1;
    const itemsPerPage = 6; // 3 columns * 2 rows

    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    function fetchEpisodes() {
        const episodesRef = ref(database, `videoDetails`);
        onValue(episodesRef, (snapshot) => {
            episodeList.innerHTML = '';
            episodeDropdown.innerHTML = '';
            episodes = [];
            snapshot.forEach((childSnapshot) => {
                const video = childSnapshot.val();
                if (video.playList === playlistId) {
                    episodes.push(video);
                    const episodeOption = document.createElement('option');
                    episodeOption.value = episodes.length - 1;
                    episodeOption.textContent = `Episode ${video.videoEpisode}`;
                    episodeDropdown.appendChild(episodeOption);
                }
            });

            // Sort episodes by episode number
            episodes.sort((a, b) => a.videoEpisode - b.videoEpisode);

            // Find the episode index based on the episode number from the URL
            currentEpisodeIndex = episodes.findIndex(episode => episode.videoEpisode === episodeNumber);

            // Default to the first episode if the specified episode is not found
            if (currentEpisodeIndex === -1) {
                currentEpisodeIndex = 0;
            }

            // Play the specified episode by default
            if (episodes.length > 0) {
                displayVideo(episodes[currentEpisodeIndex]);
            }
            renderEpisodes();
            renderPaginationControls();
        });
    }

    function displayVideo(video) {
        videoContainer.querySelector('iframe')?.remove(); // Remove existing iframe if any
        const iframe = document.createElement('div');
        iframe.innerHTML = video.videoLink;
        videoContainer.insertBefore(iframe.firstChild, videoContainer.firstChild);
        videoTitle.textContent = `Now you're watching: Episode ${video.videoEpisode}`;
        episodeTitle.textContent = `Episode Title: ${video.videoTitle}`;
        episodeDropdown.value = currentEpisodeIndex; // Update dropdown selection
        updateButtonState();
    }

    function updateButtonState() {
        prevEpisodeBtn.disabled = currentEpisodeIndex === 0;
        nextEpisodeBtn.disabled = currentEpisodeIndex === episodes.length - 1;
    }

    prevEpisodeBtn.addEventListener('click', () => {
        if (currentEpisodeIndex > 0) {
            currentEpisodeIndex--;
            displayVideo(episodes[currentEpisodeIndex]);
        }
    });

    nextEpisodeBtn.addEventListener('click', () => {
        if (currentEpisodeIndex < episodes.length - 1) {
            currentEpisodeIndex++;
            displayVideo(episodes[currentEpisodeIndex]);
        }
    });

    episodeDropdown.addEventListener('change', () => {
        currentEpisodeIndex = parseInt(episodeDropdown.value, 10);
        displayVideo(episodes[currentEpisodeIndex]);
    });

    function renderEpisodes() {
        episodeList.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, episodes.length);
        for (let i = startIndex; i < endIndex; i++) {
            const video = episodes[i];
            const episodeItem = document.createElement('div');
            episodeItem.classList.add('episode-item');
            episodeItem.innerHTML = `
                <img src="${video.videoProfile}" alt="Episode ${video.videoEpisode}" loading="lazy">
                <div class="episode-details">
                    <span class="episode-number">Episode ${video.videoEpisode}</span>
                    <span class="episode-title">${video.videoTitle}</span>
                </div>
            `;
            episodeItem.addEventListener('click', () => {
                currentEpisodeIndex = i;
                displayVideo(video);
            });
            episodeList.appendChild(episodeItem);
        }
    }

    function renderPaginationControls() {
        paginationControls.innerHTML = '';

        const prevPageButton = document.createElement('button');
        prevPageButton.className = 'page-button-icon';
        prevPageButton.innerHTML = '&laquo;';
        prevPageButton.disabled = currentPage === 1;
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderEpisodes();
                renderPaginationControls();
            }
        });
        paginationControls.appendChild(prevPageButton);

        const totalPages = Math.ceil(episodes.length / itemsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'page-button';
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                renderEpisodes();
                renderPaginationControls();
            });
            paginationControls.appendChild(pageButton);
        }

        const nextPageButton = document.createElement('button');
        nextPageButton.className = 'page-button-icon';
        nextPageButton.innerHTML = '&raquo;';
        nextPageButton.disabled = currentPage === totalPages;
        nextPageButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderEpisodes();
                renderPaginationControls();
            }
        });
        paginationControls.appendChild(nextPageButton);
    }

    if (playlistId) {
        fetchEpisodes();
    } else {
        console.error('No playlist ID provided.');
    }
});
