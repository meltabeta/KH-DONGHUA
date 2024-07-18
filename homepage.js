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
    const clearBtn = document.getElementById('clearBtn');
    const filterBar = document.getElementById('filterBar');
    const sortOrderBtn = document.getElementById('sortOrderBtn');
    const sortIcon = document.getElementById('sortIcon');
    const videoPlaylistElement = document.querySelector('.video-playlist');
    const headerTitle = document.querySelector('h2');
    const swiperContainer = document.getElementById('swiper-container');
    const swiperWrapper = document.getElementById('swiper-wrapper');
    let currentPage = 1;
    const itemsPerPage = 6;
    let playlists = [];
    let videos = [];
    let filteredPlaylists = [];
    let filteredVideos = [];
    let currentFilter = 'all';
    let sortOrder = 'desc'; // default sort order

    searchInput.addEventListener('input', function() {
        filterPlaylists();
    });

    clearBtn.addEventListener('click', function(event) {
        event.preventDefault();
        searchInput.value = '';
        filterPlaylists();
    });

    sortOrderBtn.addEventListener('click', function(event) {
        event.preventDefault();
        toggleSortOrder();
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
            filteredVideos.slice(0, endIndex).forEach(video => {
                const videoItem = document.createElement('div');
                videoItem.classList.add('playlist-item');
                videoItem.innerHTML = `
                    <img src="${video.videoProfile}" alt="${video.videoTitle}">
                    <div class="playlist-info">
                        <h3>${video.videoTitle}</h3>
                        <p>Episode: ${video.videoEpisode}</p>
                    </div>
                `;
                videoItem.addEventListener('click', () => {
                    const associatedPlaylist = playlists.find(playlist => playlist.id === video.playList);
                    if (associatedPlaylist) {
                        window.location.href = `videoPlayer.html?playlistId=${associatedPlaylist.id}&episode=${video.videoEpisode}`;
                    }
                });
                videoPlaylistElement.appendChild(videoItem);
            });
        } else {
            filteredPlaylists.slice(0, endIndex).forEach(playlist => {
                const playlistItem = document.createElement('div');
                playlistItem.classList.add('playlist-item');
                playlistItem.innerHTML = `
                    <img src="${playlist.profile}" alt="${playlist.title}">
                    <div class="playlist-info">
                        <h3>${playlist.title}</h3>
                        <p>Total Episodes: ${playlist.totalEpisodes}</p>
                    </div>
                `;
                playlistItem.addEventListener('click', () => {
                    window.location.href = `videoPlayer.html?playlistId=${playlist.id}`;
                });
                videoPlaylistElement.appendChild(playlistItem);
            });
        }
    }

    function displaySwiperBackground() {
        const slidesRef = ref(database, 'slides');
        onValue(slidesRef, (snapshot) => {
            swiperWrapper.innerHTML = ''; // Clear existing slides
            snapshot.forEach((childSnapshot) => {
                const slide = childSnapshot.val();
                const slideElement = document.createElement('div');
                slideElement.classList.add('swiper-slide');
                slideElement.style.backgroundImage = `url(${slide.imageUrl})`;
                slideElement.style.backgroundSize = 'cover'; // Ensure the image covers the slide
                slideElement.style.overflow = 'auto'; // Allow scrolling within the slide

                const titleElement = document.createElement('div');
                titleElement.classList.add('swiper-title');
                titleElement.textContent = slide.title;

                slideElement.appendChild(titleElement);
                swiperWrapper.appendChild(slideElement);
            });

            // Re-initialize Swiper to recognize new slides
            const swiper = new Swiper('.swiper-container', {
                loop: snapshot.size > 1, // Only loop if more than one slide
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                autoplay: {
                    delay: 5000, // 5 seconds delay
                    disableOnInteraction: false,
                },
            });

            // Pause autoplay on mouse enter, resume on mouse leave
            swiperContainer.addEventListener('mouseenter', () => {
                swiper.autoplay.stop();
            });

            swiperContainer.addEventListener('mouseleave', () => {
                swiper.autoplay.start();
            });
        });
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
        allBtn.classList.add('filter-btn');
        allBtn.addEventListener('click', function() {
            currentFilter = 'all';
            filterPlaylists();
            setActiveButton(allBtn);
        });
        filterBar.appendChild(allBtn);

        const videoBtn = document.createElement('button');
        videoBtn.id = 'filterVideoBtn';
        videoBtn.textContent = 'Video';
        videoBtn.classList.add('filter-btn');
        videoBtn.addEventListener('click', function() {
            currentFilter = 'video';
            filterPlaylists();
            setActiveButton(videoBtn);
        });
        filterBar.appendChild(videoBtn);

        playlistTypes.forEach(type => {
            if (type) { // Check if type is not null or undefined
                const btn = document.createElement('button');
                btn.id = `filter${type}Btn`;
                btn.textContent = type;
                btn.classList.add('filter-btn');
                btn.addEventListener('click', function() {
                    currentFilter = type;
                    filterPlaylists();
                    setActiveButton(btn);
                });
                filterBar.appendChild(btn);
            }
        });
    }

    function toggleSortOrder() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        sortIcon.textContent = sortOrder === 'asc' ? '▲' : '▼';
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

    function setActiveButton(activeBtn) {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    // Initial fetch and display of playlists, types, and videos
    fetchPlaylists();
    fetchVideos();
    displaySwiperBackground();

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

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            loadMoreItems();
        }
    });

    function loadMoreItems() {
        const currentLength = currentFilter === 'video' ? filteredVideos.length : filteredPlaylists.length;
        if ((currentPage - 1) * itemsPerPage < currentLength) {
            currentPage++;
            displayItems();
        }
    }
});
