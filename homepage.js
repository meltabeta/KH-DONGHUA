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
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');
    const filterAllBtn = document.getElementById('filterAllBtn');
    const filterAnimeBtn = document.getElementById('filterAnimeBtn');
    const filterDonghuaBtn = document.getElementById('filterDonghuaBtn');
    const videoPlaylistElement = document.querySelector('.video-playlist');
    const pageNumberElement = document.getElementById('pageNumber');
    const swiperContainer = document.getElementById('swiper-container');
    const swiperWrapper = document.getElementById('swiper-wrapper');
    const swiperOverlay = document.getElementById('swiper-overlay');
    const swiperTitle = document.getElementById('swiper-title');
    let currentPage = 1;
    const itemsPerPage = 6;
    let playlists = [];
    let filteredPlaylists = [];
    let currentFilter = 'all';

    searchBtn.addEventListener('click', function(event) {
        event.preventDefault();
        filterPlaylists();
    });

    clearBtn.addEventListener('click', function(event) {
        event.preventDefault();
        searchInput.value = '';
        filterPlaylists();
    });

    filterAllBtn.addEventListener('click', function() {
        currentFilter = 'all';
        filterPlaylists();
    });

    filterAnimeBtn.addEventListener('click', function() {
        currentFilter = 'Anime';
        filterPlaylists();
    });

    filterDonghuaBtn.addEventListener('click', function() {
        currentFilter = 'Donghua';
        filterPlaylists();
    });

    document.getElementById('previousBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPlaylists();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredPlaylists.length) {
            currentPage++;
            displayPlaylists();
        }
    });

    function filterPlaylists() {
        const query = searchInput.value.toLowerCase();
        filteredPlaylists = playlists.filter(playlist => {
            const matchesSearch = playlist.title.toLowerCase().includes(query);
            const matchesFilter = currentFilter === 'all' || playlist.type === currentFilter;
            return matchesSearch && matchesFilter;
        });
        displayPlaylists();
        displaySwiperBackground();
    }

    function fetchPlaylists() {
        const videoPlaylistsRef = ref(database, 'videoPlaylists');
        onValue(videoPlaylistsRef, (snapshot) => {
            playlists = [];
            snapshot.forEach((childSnapshot) => {
                const playlist = childSnapshot.val();
                playlist.id = childSnapshot.key;
                playlists.push(playlist);
            });
            fetchEpisodeCounts(); // After fetching playlists, fetch episode counts
        });
    }

    function fetchEpisodeCounts() {
        const videoDetailsRef = ref(database, 'videoDetails');
        onValue(videoDetailsRef, (snapshot) => {
            playlists.forEach(playlist => {
                let totalEpisodes = 0;
                snapshot.forEach((childSnapshot) => {
                    const video = childSnapshot.val();
                    if (video.playList === playlist.id) {
                        totalEpisodes++;
                    }
                });
                playlist.totalEpisodes = totalEpisodes;
            });
            filterPlaylists(); // Apply initial filter and display
        });
    }

    function displayPlaylists() {
        videoPlaylistElement.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPlaylists = filteredPlaylists.slice(startIndex, endIndex);

        paginatedPlaylists.forEach((playlist, index) => {
            const playlistItem = document.createElement('div');
            playlistItem.classList.add('playlist-item');
            playlistItem.style.animationDelay = `${index * 0.1}s`; // Add delay for staggered animation
            playlistItem.innerHTML = `
                <img src="${playlist.profile}" alt="${playlist.title}">
                <h3>${playlist.title}</h3>
                <p>Total Episodes: ${playlist.totalEpisodes}</p>
            `;
            playlistItem.addEventListener('click', () => {
                window.location.href = `videoPlayer.html?playlistId=${playlist.id}`;
            });
            videoPlaylistElement.appendChild(playlistItem);
        });

        pageNumberElement.textContent = currentPage;
    }

    function displaySwiperBackground() {
        let currentIndex = 0;
        function changeBackground() {
            if (filteredPlaylists.length > 0) {
                const playlist = filteredPlaylists[currentIndex];
                swiperContainer.style.backgroundImage = `url(${playlist.profile})`;
                swiperTitle.textContent = playlist.title;
                swiperOverlay.onclick = () => {
                    window.location.href = `videoPlayer.html?playlistId=${playlist.id}`;
                };
                currentIndex = (currentIndex + 1) % filteredPlaylists.length;
            }
        }
        changeBackground();
        setInterval(changeBackground, 3000); // Change background every 3 seconds
    }

    // Initial fetch and display of playlists
    fetchPlaylists();

});
