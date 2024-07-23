// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdVgeMqQKtuJEQxrPFz8xB7XmUN6cFlMQ",
    authDomain: "kh-donghua.firebaseapp.com",
    databaseURL: "https://kh-donghua-default-rtdb.firebaseio.com",
    projectId: "kh-donghua",
    storageBucket: "kh-donghua.appspot.com",
    messagingSenderId: "119897892431",
    appId: "1:119897892431:web:ad31196e8a9692b63e6c3a"
};
firebase.initializeApp(firebaseConfig);

let header = document.querySelector('header');

window.addEventListener('scroll', () => {
    header.classList.toggle('shadow', window.scrollY > 0);
});

let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('bx-x');
    navbar.classList.toggle('active');
}
window.onscroll = () => {
    menu.classList.remove('bx-x');
    navbar.classList.remove('active');
}

// Dark Mode Toggle
const toggleDarkMode = document.getElementById('toggleDarkMode');
toggleDarkMode.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleDarkMode.classList.toggle('bx-moon');
    toggleDarkMode.classList.toggle('bx-sun');
});

var swiper = new Swiper(".home", {
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
});
var swiperAnime = new Swiper(".anime-container", {
    spaceBetween: 20,
    loop: true,
    centeredSlides: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 2,
        },
        568: {
            slidesPerView: 3,
        },
        768: {
            slidesPerView: 4,
        },
        968: {
            slidesPerView: 5,
        },
    }
});
var swiperDonghua = new Swiper(".donghua-container", {
    spaceBetween: 20,
    loop: true,
    centeredSlides: true,
    autoplay: {
        delay: 2000,
        disableOnInteraction: false,
    },
    breakpoints: {
        0: {
            slidesPerView: 2,
        },
        568: {
            slidesPerView: 3,
        },
        768: {
            slidesPerView: 4,
        },
        968: {
            slidesPerView: 5,
        },
    }
});

// Get the modal
var modal = document.getElementById("donateModal");

// Get the button that opens the modal
var btn = document.getElementById("donateBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Copy link function
document.getElementById("copyLink").onclick = function() {
    var copyText = "https://firebasestorage.googleapis.com/v0/b/kh-donghua.appspot.com/o/bakong.jpg?alt=media&token=b7b3de62-76e4-4887-a0af-bc7728eebb32";
    navigator.clipboard.writeText(copyText).then(function() {
        alert("Link copied to clipboard");
    }, function(err) {
        console.error("Could not copy text: ", err);
    });
}

// Share function (using Web Share API)
document.getElementById("shareImage").onclick = function() {
    if (navigator.share) {
        navigator.share({
            title: 'Donate Image',
            text: 'Check out this image!',
            url: 'https://firebasestorage.googleapis.com/v0/b/kh-donghua.appspot.com/o/bakong.jpg?alt=media&token=b7b3de62-76e4-4887-a0af-bc7728eebb32'
        }).then(() => {
            console.log('Thanks for sharing!');
        }).catch(err => {
            console.error('Error sharing: ', err);
        });
    } else {
        alert("Web Share API is not supported in your browser.");
    }
}
document.addEventListener('DOMContentLoaded', function () {
    // Reference to the Firebase database
    const dbRef = firebase.database().ref();
    const itemsPerPage = 10; // Number of items per page
    let currentPage = 1;
    let totalPages = 1;
    let allPlaylists = [];

    const fetchAndDisplayPlaylists = () => {
        dbRef.child('videoPlaylists').once('value').then(snapshot => {
            const videoPlaylists = snapshot.val();
            const videoDetails = dbRef.child('videoDetails');
            const moviesContainer = document.querySelector('.movies-container');

            // Create a map to count episodes and get the latest submission date per playlist
            const episodesCount = {};
            const latestSubmissionDate = {};
            videoDetails.once('value').then(videoDetailsSnapshot => {
                const videoDetails = videoDetailsSnapshot.val();
                for (const videoKey in videoDetails) {
                    const video = videoDetails[videoKey];
                    const playlistId = video.playList;
                    if (episodesCount[playlistId]) {
                        episodesCount[playlistId]++;
                        if (new Date(video.lastSubmittedDate) > new Date(latestSubmissionDate[playlistId])) {
                            latestSubmissionDate[playlistId] = video.lastSubmittedDate;
                        }
                    } else {
                        episodesCount[playlistId] = 1;
                        latestSubmissionDate[playlistId] = video.lastSubmittedDate;
                    }
                }

                // Generate an array of playlists with the latest submission date for sorting and filtering
                allPlaylists = Object.keys(videoPlaylists).map(key => {
                    return {
                        ...videoPlaylists[key],
                        totalEpisodes: episodesCount[key] || 0,
                        lastSubmittedDate: latestSubmissionDate[key] || new Date(0),
                        id: key
                    };
                });

                // Initial display of all playlists sorted by last submission date
                allPlaylists.sort((a, b) => new Date(b.lastSubmittedDate) - new Date(a.lastSubmittedDate));
                totalPages = Math.ceil(allPlaylists.length / itemsPerPage);
                updatePaginationControls();
                displayPlaylists(getCurrentPagePlaylists());
            });
        });
    };

    const displayPlaylists = (playlists) => {
        const moviesContainer = document.querySelector('.movies-container');
        moviesContainer.innerHTML = ''; // Clear any existing content
        playlists.forEach(playlist => {
            const box = document.createElement('div');
            box.classList.add('box');
            const boxImg = document.createElement('div');
            boxImg.classList.add('box-img');
            const img = document.createElement('img');
            img.src = playlist.profile;
            img.alt = playlist.title;
            boxImg.appendChild(img);

            const title = document.createElement('h3');
            title.textContent = playlist.title;

            const details = document.createElement('span');
            details.textContent = `${playlist.totalEpisodes} episodes | ${playlist.type || 'Genre'}`;

            box.appendChild(boxImg);
            box.appendChild(title);
            box.appendChild(details);
            box.addEventListener('click', () => {
                window.location.href = `videoPlayer.html?playlistId=${playlist.id}`;
            });
            moviesContainer.appendChild(box);
        });
    };

    const getCurrentPagePlaylists = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allPlaylists.slice(startIndex, startIndex + itemsPerPage);
    };

    const updatePaginationControls = () => {
        document.getElementById('current-page').textContent = currentPage;
        document.getElementById('total-pages').textContent = totalPages;
        document.getElementById('prev-page').disabled = currentPage === 1;
        document.getElementById('next-page').disabled = currentPage === totalPages;
    };

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPlaylists(getCurrentPagePlaylists());
            updatePaginationControls();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPlaylists(getCurrentPagePlaylists());
            updatePaginationControls();
        }
    });

    const filterPlaylists = () => {
        const selectedType = document.getElementById('playlist-type-filter').value;
        const searchText = document.getElementById('search-box').value.toLowerCase();
        const filteredPlaylists = allPlaylists.filter(playlist => {
            const matchesType = selectedType ? playlist.type === selectedType : true;
            const matchesSearch = playlist.title.toLowerCase().includes(searchText);
            return matchesType && matchesSearch;
        });
        totalPages = Math.ceil(filteredPlaylists.length / itemsPerPage);
        currentPage = 1;
        displayPlaylists(filteredPlaylists.slice(0, itemsPerPage));
        updatePaginationControls();
    };

    document.getElementById('playlist-type-filter').addEventListener('change', filterPlaylists);
    document.getElementById('search-box').addEventListener('input', filterPlaylists);
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('playlist-type-filter').value = '';
        document.getElementById('search-box').value = '';
        totalPages = Math.ceil(allPlaylists.length / itemsPerPage);
        currentPage = 1;
        displayPlaylists(getCurrentPagePlaylists());
        updatePaginationControls();
    });

    // Call the function to fetch and display playlists on page load
    fetchAndDisplayPlaylists();
});

document.addEventListener('DOMContentLoaded', function () {
    // Reference to the Firebase database
    const dbRef = firebase.database().ref();

    // Fetch slides data from Firebase
    dbRef.child('slides').once('value').then(snapshot => {
        const slides = snapshot.val();
        const swiperWrapper = document.querySelector('.home .swiper-wrapper');
        for (const key in slides) {
            const slide = slides[key];
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide', 'container');

            const img = document.createElement('img');
            img.src = slide.imageUrl;
            img.alt = slide.title;

            const homeText = document.createElement('div');
            homeText.classList.add('home-text');

            const span = document.createElement('span');
            span.textContent = 'KH-Donghua';

            const h1 = document.createElement('h1');
            h1.innerHTML = `${slide.title}`;

            const btn = document.createElement('div');
            btn.classList.add('btn', 'fixed-white');
            btn.textContent = 'Watch Now';
            btn.addEventListener('click', () => {
                const searchBox = document.getElementById('search-box');
                searchBox.value = slide.title;
                const playlistSection = document.getElementById('playlists');
                playlistSection.scrollIntoView({ behavior: 'smooth' });
                searchBox.dispatchEvent(new Event('input'));
            });

            homeText.appendChild(span);
            homeText.appendChild(h1);
            homeText.appendChild(btn);
            swiperSlide.appendChild(img);
            swiperSlide.appendChild(homeText);
            swiperWrapper.appendChild(swiperSlide);
        }

        swiper.update();
    });

    // Event listener to filter playlists based on search box input
    const searchBox = document.getElementById('search-box');
    searchBox.addEventListener('input', () => {
        const filterValue = searchBox.value.toLowerCase();
        const moviesContainer = document.querySelector('.movies-container');
        const movieBoxes = moviesContainer.querySelectorAll('.box');
        movieBoxes.forEach(box => {
            const title = box.querySelector('h3').textContent.toLowerCase();
            if (title.includes(filterValue)) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    });

    // Fetching playlist types to populate the filter dropdown
    dbRef.child('playlistTypes').once('value').then(snapshot => {
        const playlistTypes = snapshot.val();
        const playlistTypeFilter = document.getElementById('playlist-type-filter');
        for (const key in playlistTypes) {
            const option = document.createElement('option');
            option.value = playlistTypes[key].name;
            option.textContent = playlistTypes[key].name;
            playlistTypeFilter.appendChild(option);
        }
    });

    // Fetching and displaying playlists
    dbRef.child('videoPlaylists').once('value').then(snapshot => {
        const videoPlaylists = snapshot.val();
        const videoDetails = dbRef.child('videoDetails');
        const moviesContainer = document.querySelector('.movies-container');
        let filteredPlaylists = [];

        // Create a map to count episodes and get the latest submission date per playlist
        const episodesCount = {};
        const latestSubmissionDate = {};
        videoDetails.once('value').then(videoDetailsSnapshot => {
            const videoDetails = videoDetailsSnapshot.val();
            for (const videoKey in videoDetails) {
                const video = videoDetails[videoKey];
                const playlistId = video.playList;
                if (episodesCount[playlistId]) {
                    episodesCount[playlistId]++;
                    if (new Date(video.lastSubmittedDate) > new Date(latestSubmissionDate[playlistId])) {
                        latestSubmissionDate[playlistId] = video.lastSubmittedDate;
                    }
                } else {
                    episodesCount[playlistId] = 1;
                    latestSubmissionDate[playlistId] = video.lastSubmittedDate;
                }
            }

            // Generate an array of playlists with the latest submission date for sorting and filtering
            const allPlaylists = Object.keys(videoPlaylists).map(key => {
                return {
                    ...videoPlaylists[key],
                    totalEpisodes: episodesCount[key] || 0,
                    lastSubmittedDate: latestSubmissionDate[key] || new Date(0),
                    id: key
                };
            });

            // Function to display playlists
            const displayPlaylists = (playlists) => {
                moviesContainer.innerHTML = ''; // Clear any existing content
                playlists.forEach(playlist => {
                    const box = document.createElement('div');
                    box.classList.add('box');
                    const boxImg = document.createElement('div');
                    boxImg.classList.add('box-img');
                    const img = document.createElement('img');
                    img.src = playlist.profile;
                    img.alt = playlist.title;
                    boxImg.appendChild(img);

                    const title = document.createElement('h3');
                    title.textContent = playlist.title;

                    const details = document.createElement('span');
                    details.textContent = `${playlist.totalEpisodes} episodes | ${playlist.type || 'Genre'}`;

                    box.appendChild(boxImg);
                    box.appendChild(title);
                    box.appendChild(details);
                    box.addEventListener('click', () => {
                        window.location.href = `videoPlayer.html?playlistId=${playlist.id}`;
                    });
                    moviesContainer.appendChild(box);
                });
            };

            // Initial display of all playlists sorted by last submission date
            allPlaylists.sort((a, b) => new Date(b.lastSubmittedDate) - new Date(a.lastSubmittedDate));
            displayPlaylists(allPlaylists);

            // Event listeners for filters
            const playlistTypeFilter = document.getElementById('playlist-type-filter');
            const searchBox = document.getElementById('search-box');

            const filterPlaylists = () => {
                const selectedType = playlistTypeFilter.value;
                const searchText = searchBox.value.toLowerCase();

                filteredPlaylists = allPlaylists.filter(playlist => {
                    const matchesType = selectedType ? playlist.type === selectedType : true;
                    const matchesSearch = playlist.title.toLowerCase().includes(searchText);
                    return matchesType && matchesSearch;
                });

                displayPlaylists(filteredPlaylists);
            };

            playlistTypeFilter.addEventListener('change', filterPlaylists);
            searchBox.addEventListener('input', filterPlaylists);
        });
    });

    // Fetching upcoming animes for the "Anime" section
    dbRef.child('videoPlaylists').once('value').then(snapshot => {
        const videoPlaylists = snapshot.val();
        const animeContainer = document.querySelector('.anime-container .swiper-wrapper');
        animeContainer.innerHTML = ''; // Clear any existing content

        // Filter and display upcoming animes
        const animePlaylists = Object.keys(videoPlaylists).filter(key => videoPlaylists[key].type === 'Anime').map(key => videoPlaylists[key]);
        animePlaylists.forEach(anime => {
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide', 'box');

            const boxImg = document.createElement('div');
            boxImg.classList.add('box-img');
            const img = document.createElement('img');
            img.src = anime.profile;
            img.alt = anime.title;
            boxImg.appendChild(img);

            const title = document.createElement('h3');
            title.textContent = anime.title;

            swiperSlide.appendChild(boxImg);
            swiperSlide.appendChild(title);
            swiperSlide.addEventListener('click', () => {
                window.location.href = `videoPlayer.html?playlistId=${anime.id}`;
            });
            animeContainer.appendChild(swiperSlide);
        });

        // Reinitialize swiper for new content
        swiperAnime.update();
    });

    // Fetching upcoming donghua for the "Donghua" section
    dbRef.child('videoPlaylists').once('value').then(snapshot => {
        const videoPlaylists = snapshot.val();
        const donghuaContainer = document.querySelector('.donghua-container .swiper-wrapper');
        donghuaContainer.innerHTML = ''; // Clear any existing content

        // Filter and display upcoming donghua
        const donghuaPlaylists = Object.keys(videoPlaylists).filter(key => videoPlaylists[key].type === 'Donghua').map(key => videoPlaylists[key]);
        donghuaPlaylists.forEach(donghua => {
            const swiperSlide = document.createElement('div');
            swiperSlide.classList.add('swiper-slide', 'box');

            const boxImg = document.createElement('div');
            boxImg.classList.add('box-img');
            const img = document.createElement('img');
            img.src = donghua.profile;
            img.alt = donghua.title;
            boxImg.appendChild(img);

            const title = document.createElement('h3');
            title.textContent = donghua.title;

            swiperSlide.appendChild(boxImg);
            swiperSlide.appendChild(title);
            swiperSlide.addEventListener('click', () => {
                window.location.href = `videoPlayer.html?playlistId=${donghua.id}`;
            });
            donghuaContainer.appendChild(swiperSlide);
        });

        // Reinitialize swiper for new content
        swiperDonghua.update();
    });
});
