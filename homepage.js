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
    const filterBar = document.getElementById('filterBar');
    const videoPlaylistElement = document.querySelector('.video-playlist');
    const pageNumberElement = document.getElementById('pageNumber');
    const headerTitle = document.querySelector('h2');
    const sortIcon = document.getElementById('sortIcon');
    const swiperContainer = document.getElementById('swiper-container');
    const swiperWrapper = document.getElementById('swiper-wrapper');
    const swiperOverlay = document.getElementById('swiper-overlay');
    const swiperTitle = document.getElementById('swiper-title');
    let currentPage = 1;
    const itemsPerPage = 6;
    let playlists = [];
    let videos = [];
    let filteredPlaylists = [];
    let filteredVideos = [];
    let currentFilter = 'all';
    let sortOrder = 'desc'; // default sort order

    searchBtn.addEventListener('click', function(event) {
        event.preventDefault();
        filterPlaylists();
    });

    clearBtn.addEventListener('click', function(event) {
        event.preventDefault();
        searchInput.value = '';
        filterPlaylists();
    });

    document.getElementById('previousBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayItems();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage * itemsPerPage < filteredPlaylists.length || currentPage * itemsPerPage < filteredVideos.length) {
            currentPage++;
            displayItems();
        }
    });

    sortIcon.addEventListener('click', function() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        sortIcon.classList.toggle('desc');
        filterPlaylists();
    });

    function filterPlaylists() {
        const query = searchInput.value.toLowerCase();
        filteredPlaylists = playlists.filter(playlist => {
            const matchesSearch = playlist.title.toLowerCase().includes(query);
            const matchesFilter = currentFilter === 'all' || playlist.type === currentFilter;
            return matchesSearch && matchesFilter;
        });

        filteredVideos = videos.filter(video => {
            const matchesSearch = video.videoTitle.toLowerCase().includes(query);
            return matchesSearch;
        });

        filteredVideos.sort((a, b) => {
            const dateA = new Date(a.postingDate);
            const dateB = new Date(b.postingDate);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        displayItems();
        displaySwiperBackground();
        updateHeaderTitle();
    }

    function fetchPlaylists() {
        const videoPlaylistsRef = ref(database, 'videoPlaylists');
        onValue(videoPlaylistsRef, (snapshot) => {
            playlists = [];
            const playlistTypes = new Set();
            snapshot.forEach((childSnapshot) => {
                const playlist = childSnapshot.val();
                playlist.id = childSnapshot.key;
                playlists.push(playlist);
                playlistTypes.add(playlist.type);
            });
            fetchAndGenerateFilterButtons();
            fetchEpisodeCounts();
        });
    }

    function fetchVideos() {
        const videoDetailsRef = ref(database, 'videoDetails');
        onValue(videoDetailsRef, (snapshot) => {
            videos = [];
            snapshot.forEach((childSnapshot) => {
                const video = childSnapshot.val();
                video.id = childSnapshot.key;
                videos.push(video);
            });
            filterPlaylists();
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
            filterPlaylists();
        });
    }

    function displayItems() {
        videoPlaylistElement.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        if (currentFilter === 'video') {
            const paginatedVideos = filteredVideos.slice(startIndex, endIndex);
            paginatedVideos.forEach((video, index) => {
                const videoItem = document.createElement('div');
                videoItem.classList.add('playlist-item');
                videoItem.style.animationDelay = `${index * 0.1}s`;
                videoItem.innerHTML = `
                    <img src="${video.videoProfile}" alt="${video.videoTitle}">
                    <h3>${video.videoTitle}</h3>
                    <p>Episode: ${video.videoEpisode}</p>
                `;
                videoItem.addEventListener('click', () => {
                    window.location.href = `videoPlayer.html?videoId=${video.id}`;
                });
                videoPlaylistElement.appendChild(videoItem);
            });
        } else {
            const paginatedPlaylists = filteredPlaylists.slice(startIndex, endIndex);
            paginatedPlaylists.forEach((playlist, index) => {
                const playlistItem = document.createElement('div');
                playlistItem.classList.add('playlist-item');
                playlistItem.style.animationDelay = `${index * 0.1}s`;
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
        }

        pageNumberElement.textContent = currentPage;
    }

    function displaySwiperBackground() {
        let currentIndex = 0;
        function changeBackground() {
            if (currentFilter === 'video' && filteredVideos.length > 0) {
                const video = filteredVideos[currentIndex];
                swiperContainer.style.backgroundImage = `url(${video.videoProfile})`;
                swiperTitle.textContent = video.videoTitle;
                swiperOverlay.onclick = () => {
                    window.location.href = `videoPlayer.html?videoId=${video.id}`;
                };
                currentIndex = (currentIndex + 1) % filteredVideos.length;
            } else if (filteredPlaylists.length > 0) {
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
        setInterval(changeBackground, 3000);
    }

    function fetchAndGenerateFilterButtons() {
        const typesRef = ref(database, 'playlistTypes');
        onValue(typesRef, (snapshot) => {
            const playlistTypes = new Set();
            snapshot.forEach((childSnapshot) => {
                const type = childSnapshot.val().name;
                if (type) {
                    playlistTypes.add(type);
                }
            });
            generateFilterButtons(playlistTypes);
        });
    }

    function generateFilterButtons(playlistTypes) {
        filterBar.innerHTML = ''; // Clear existing buttons

        const allBtn = document.createElement('button');
        allBtn.id = 'filterAllBtn';
        allBtn.textContent = 'Home';
        allBtn.addEventListener('click', function() {
            currentFilter = 'all';
            filterPlaylists();
        });
        filterBar.appendChild(allBtn);

        const videoBtn = document.createElement('button');
        videoBtn.id = 'filterVideoBtn';
        videoBtn.textContent = 'Video';
        videoBtn.addEventListener('click', function() {
            currentFilter = 'video';
            filterPlaylists();
        });
        filterBar.appendChild(videoBtn);

        playlistTypes.forEach(type => {
            if (type) { // Check if type is not null or undefined
                const btn = document.createElement('button');
                btn.id = `filter${type}Btn`;
                btn.textContent = type;
                btn.addEventListener('click', function() {
                    currentFilter = type;
                    filterPlaylists();
                });
                filterBar.appendChild(btn);
            }
        });
    }

    function updateHeaderTitle() {
        if (currentFilter === 'all') {
            headerTitle.textContent = 'Home';
        } else if (currentFilter === 'video') {
            headerTitle.textContent = 'Video';
        } else {
            headerTitle.textContent = currentFilter;
        }
    }

    // Initial fetch and display of playlists, types, and videos
    fetchPlaylists();
    fetchVideos();

    // Enable dragging for Swiper images
    let isDragging = false;
    let startY;
    let scrollTop;

    swiperContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.pageY - swiperContainer.offsetTop;
        scrollTop = swiperContainer.scrollTop;
        swiperContainer.style.cursor = 'grabbing';
    });

    swiperContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        swiperContainer.style.cursor = 'grab';
    });

    swiperContainer.addEventListener('mouseup', () => {
        isDragging = false;
        swiperContainer.style.cursor = 'grab';
    });

    swiperContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const y = e.pageY - swiperContainer.offsetTop;
        const walk = (y - startY) * 1.5; // scroll-fast
        swiperContainer.scrollTop = scrollTop - walk;
    });

    swiperContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startY = e.touches[0].pageY - swiperContainer.offsetTop;
        scrollTop = swiperContainer.scrollTop;
    });

    swiperContainer.addEventListener('touchend', () => {
        isDragging = false;
    });

    swiperContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const y = e.touches[0].pageY - swiperContainer.offsetTop;
        const walk = (y - startY) * 1.5; // scroll-fast
        swiperContainer.scrollTop = scrollTop - walk;
    });

    // Pop-up functionality
    const donateLink = document.getElementById('donateLink');
    const donatePopup = document.getElementById('donatePopup');
    const closePopup = document.getElementById('closePopup');

    donateLink.addEventListener('click', (event) => {
        event.preventDefault();
        donatePopup.style.display = 'flex';
    });

    closePopup.addEventListener('click', () => {
        donatePopup.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === donatePopup) {
            donatePopup.style.display = 'none';
        }
    });
});
