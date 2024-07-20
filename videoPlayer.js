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

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const playlistId = urlParams.get('playlistId');
    const episode = urlParams.get('episode');

    const videoPlayerContainer = document.getElementById('videoPlayerContainer');
    const playlistTitleElement = document.getElementById('playlistTitle');
    const episodeTitleElement = document.getElementById('episodeTitle');
    const videoTitleElement = document.getElementById('videoTitle');
    const videoDescriptionElement = document.getElementById('videoDescription');
    const relatedVideosList = document.getElementById('relatedVideosList');
    const allEpisodesBtn = document.getElementById('allEpisodesBtn');
    const allEpisodesPopup = document.getElementById('allEpisodesPopup');
    const closeAllEpisodesPopup = document.getElementById('closeAllEpisodesPopup');
    const allEpisodesList = document.getElementById('allEpisodesList');
    const prevEpisodeBtn = document.getElementById('prevEpisodeBtn');
    const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');

    let videos = [];
    let currentVideoIndex = 0;

    allEpisodesBtn.addEventListener('click', function () {
        allEpisodesPopup.style.display = 'flex';
    });

    closeAllEpisodesPopup.addEventListener('click', function () {
        allEpisodesPopup.style.display = 'none';
    });

    function fetchVideoDetails() {
        const videoDetailsRef = ref(database, 'videoDetails');
        onValue(videoDetailsRef, (snapshot) => {
            videos = [];
            snapshot.forEach((childSnapshot) => {
                const video = childSnapshot.val();
                if (video.playList === playlistId) {
                    videos.push(video);
                }
            });
            videos.sort((a, b) => a.videoEpisode - b.videoEpisode);
            if (episode) {
                currentVideoIndex = videos.findIndex(video => video.videoEpisode == episode);
            }
            displayVideo();
            displayRelatedEpisodes();
            displayAllEpisodes();
        });
    }

    function displayVideo() {
        if (videos.length > 0) {
            const video = videos[currentVideoIndex];
            videoPlayerContainer.innerHTML = video.videoLink;
            playlistTitleElement.textContent = videos[0].title;
            episodeTitleElement.textContent = `Episode ${video.videoEpisode}`;
            videoTitleElement.textContent = video.videoTitle;
            videoDescriptionElement.textContent = video.description || '';
        }
    }

    function displayRelatedEpisodes() {
        relatedVideosList.innerHTML = '';
        videos.forEach(video => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <img src="${video.videoProfile}" alt="${video.videoTitle}">
                <div class="video-title">${video.videoTitle} - Episode ${video.videoEpisode}</div>
            `;
            listItem.addEventListener('click', () => {
                window.location.href = `videoPlayer.html?playlistId=${playlistId}&episode=${video.videoEpisode}`;
            });
            relatedVideosList.appendChild(listItem);
        });
    }

    function displayAllEpisodes() {
        allEpisodesList.innerHTML = '';
        videos.forEach(video => {
            const listItem = document.createElement('li');
            listItem.textContent = `${video.videoTitle} - Episode ${video.videoEpisode}`;
            listItem.addEventListener('click', () => {
                window.location.href = `videoPlayer.html?playlistId=${playlistId}&episode=${video.videoEpisode}`;
            });
            allEpisodesList.appendChild(listItem);
        });
    }

    prevEpisodeBtn.addEventListener('click', () => {
        if (currentVideoIndex > 0) {
            currentVideoIndex--;
            window.location.href = `videoPlayer.html?playlistId=${playlistId}&episode=${videos[currentVideoIndex].videoEpisode}`;
        }
    });

    nextEpisodeBtn.addEventListener('click', () => {
        if (currentVideoIndex < videos.length - 1) {
            currentVideoIndex++;
            window.location.href = `videoPlayer.html?playlistId=${playlistId}&episode=${videos[currentVideoIndex].videoEpisode}`;
        }
    });

    fetchVideoDetails();
});
