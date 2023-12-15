const token = new URLSearchParams(window.location.search).get('token');

const playlist_name = document.querySelector('#playlist-name');
const playlist_img = document.querySelector('#playlist-img');

function fetchAPI(token, endpoint, method) {
    const currentUrl = window.location.href.split('connected')[0];
    const url = currentUrl + "fetchAPI";

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            token: token,
            endpoint: endpoint,
            method: method,
        })
    };

    return fetch(url, options);
}

var playlist_poster;
var isLiked = false;
var ids_liked_index = 0;
const playlist_section = document.querySelector('#playlists-section')
const main_section = document.querySelector('#main-section')

// WORK IN PROGRESS
const liked_song_div = document.querySelector('#liked_song');
fetchAPI(token, "https://api.spotify.com/v1/me/tracks?limit=50", "GET").then(response => response.json())
.then(data => {
    let ids = data.items;
    ids_liked_array = [];
    ids.forEach(data => {
        ids_liked_array.push(data.track.id)
        ids_liked_array = ids_liked_array.sort((a, b) => 0.5 - Math.random());
    });

    liked_song_div.addEventListener('click', () => {
        isLiked = true;
        // PUT NEXT SONG TO QUEUE
        fetchAPI(token, "https://api.spotify.com/v1/me/player/queue?uri=spotify:track:" + ids_liked_array[ids_liked_index], "POST").then(() => {
            // Hide playlists section
            playlist_section.className = "hidden"
            main_section.classList.remove('hidden')

            // Update Main Page
            playlist_name.textContent = "Titres Likés";
            playlist_img.src = "src/liked_song.jpg";
            playlist_poster = "src/liked_song.jpg";

            document.body.className = "min-h-screen grid place-content-center bg-[#141414]"

            // PLAY THE SONG
            fetchAPI(token, "https://api.spotify.com/v1/me/player/next", "POST")

        })
    })
})

// Show Playlists
fetchAPI(token, "https://api.spotify.com/v1/me/playlists", "GET").then(response => response.json())
.then(data => {
    // Pause eventual song
    fetchAPI(token, "https://api.spotify.com/v1/me/player", "GET").then(response => response.json())
    .then(player => {
        if(player.is_playing) {
            fetchAPI(token, "https://api.spotify.com/v1/me/player/pause", "PUT")
        }
    })

    const playlists = data.items;
    const playlistPosters = document.querySelector('#playlistPosters')

    playlists.forEach(playlist => {
        let poster;
        try {
            poster = playlist.images[0].url;
          } catch {
            poster = "https://i.pinimg.com/1200x/04/54/bf/0454bf6aa9d73d317769a5efcca3e958.jpg";
          }
        
        let name = playlist.name;
        let id = playlist.id;
        
        if (name.length >= 15) {
            name = name.slice(0, 15)
        }
        if (name.length === 0) {
            name = "..."
        }

        const div = document.createElement('div');
        div.className = "playlist"
        playlistPosters.appendChild(div);

        const img = document.createElement('img')
        img.src = poster;
        img.className = "w-[146px] object-cover h-[146px]";
        div.appendChild(img);

        const h2 = document.createElement('h2');
        h2.textContent = name;
        h2.className = "text-white font-spotify text-center mt-2";
        div.appendChild(h2)

        div.addEventListener('click', () => {
            const url = "https://api.spotify.com/v1/me/player/play";

            const options = {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "context_uri": "spotify:playlist:" + id,
                    "position_ms": 0
                }),
                json: true
            };
        
            fetch(url, options).then(() => {
                // Hide playlists section
                playlist_section.className = "hidden"
                main_section.classList.remove('hidden')

                // Update Main Page
                if (playlist.name.length >= 13) {
                    playlist.name = playlist.name.slice(0, 13) + "..."
                }
                playlist_name.textContent = playlist.name;
                playlist_img.src = poster
                playlist_poster = poster;

                document.body.className = "min-h-screen grid place-content-center bg-[#141414]"
            })
        })
    });
})

// Hide "Selectionner une playlist" on scroll
const h1Playlist = document.querySelector('#h1Playlist');
document.addEventListener("scroll", (event) => {
    y = window.scrollY;
    var positionMax = 80;
    var positionMin = 0;

    var opacity = 1 - (y - positionMin) / (positionMax - positionMin);

    opacity = Math.min(1, Math.max(0, opacity));

    h1Playlist.style.opacity = opacity;
});

const input_title = document.querySelector('#input-title');
const input_artist = document.querySelector('#input-artist');
const verify_btn = document.querySelector('#verify_btn');
const skip_btn = document.querySelector('#skip_btn');

const blank_indicator = document.querySelector('#blank_indicator')
const one_error_indicator = document.querySelector('#one_error_indicator')
const two_error_indicator = document.querySelector('#two_error_indicator')
const three_error_indicator = document.querySelector('#three_error_indicator')

const first_shot_indicator = document.querySelector('#first_shot_indiactor')
const snd_shot_indicator = document.querySelector('#snd_shot_indicator')
const trd_shot_indicator = document.querySelector('#trd_shot_indicator')

var count_error = 0;

verify_btn.addEventListener('click', verifyEvent);

function verifyEvent() {
    fetchAPI(token, 'https://api.spotify.com/v1/me/player/queue', 'GET').then(response => response.json())
    .then(data => {
        // VERIFY TITLE
        let answer_title = input_title.value.toLowerCase().replace(/\s/g, "");
        let response_title = data.currently_playing.name.toLowerCase().replace(/\s/g, "");
        let img = data.currently_playing.album.images[1].url

        if (response_title.includes("(")) {
            response_title = response_title.replace(/\(.*?\)/g, "");
            response_title = response_title.trim();
        }
        if (response_title.includes("[")) {
            response_title = response_title.replace(/\[.*?\]/g, "");
            response_title = response_title.trim();
        }
        if (response_title.includes("-")) {
            array = response_title.split('-')
            response_title = array[0]
            response_title = response_title.trim();
        }
        if (response_title.includes(",")) {
            response_title = response_title.replace(/,/g, "");
        }

        var correct_title = false;
        if (answer_title == response_title) {
            correct_title = true;
            // Add border green color
            input_title.className = "text-center bg-[#242424] text-xl p-3 rounded-[13px] font-spotify text-white focus:outline-none border-4 border-[#568A6B]"
        } else {
            correct_title = false;
            // Add border red color
            input_title.className = "text-center bg-[#242424] text-xl p-3 rounded-[13px] font-spotify text-white focus:outline-none border-4 border-[#EF5757]"
        }
        
        // VERIFY ARTIST
        let response_artist = data.currently_playing.artists;
        let answer_artist = input_artist.value.toLowerCase().trim()
        
        let artists_array = []
        response_artist.forEach(artist => {
            artists_array.push(artist.name.toLowerCase());
        });

        var correct_artist = false;
        if (artists_array.includes(answer_artist)) {
            correct_artist = true;
            // Add border green color
            input_artist.className = "text-center bg-[#242424] text-xl p-3 rounded-[13px] font-spotify text-white focus:outline-none border-4 border-[#568A6B]"
        } else {
            correct_artist = false;
            // Add border red color
            input_artist.className = "text-center bg-[#242424] text-xl p-3 rounded-[13px] font-spotify text-white focus:outline-none border-4 border-[#EF5757]"
        }

        // CHANGE BOTTOM INDICATOR
        if (correct_title === true && correct_artist === true) {
            input_title.value = data.currently_playing.name;
            input_artist.value = data.currently_playing.album.artists[0].name;
            
            if (count_error == 0) {
                blank_indicator.classList.add('hidden')
                first_shot_indicator.classList.remove('hidden')

                verify_btn.removeEventListener('click', verifyEvent);
                verify_btn.addEventListener('click', clickHandler);
                
                skip_btn.disabled = true;

                playlist_img.src = img;
                verify_btn.textContent = "Suivant"
            } else if (count_error == 1) {
                one_error_indicator.classList.add('hidden')
                snd_shot_indicator.classList.remove('hidden')

                verify_btn.removeEventListener('click', verifyEvent);
                verify_btn.addEventListener('click', clickHandler);

                skip_btn.disabled = true;

                playlist_img.src = img;
                verify_btn.textContent = "Suivant"
            } else if (count_error == 2) {
                two_error_indicator.classList.add('hidden')
                trd_shot_indicator.classList.remove('hidden')

                verify_btn.removeEventListener('click', verifyEvent);
                verify_btn.addEventListener('click', clickHandler);

                skip_btn.disabled = true;

                playlist_img.src = img;
                verify_btn.textContent = "Suivant"
            }
        } else {
            count_error++;
            if (count_error == 1) {
                blank_indicator.classList.add('hidden')
                one_error_indicator.classList.remove('hidden')
                skip_btn.disabled = true;
            }
            if (count_error == 2) {
                one_error_indicator.classList.add('hidden')
                two_error_indicator.classList.remove('hidden')
                skip_btn.disabled = true;
            }
            if (count_error == 3) {
                two_error_indicator.classList.add('hidden')
                three_error_indicator.classList.remove('hidden')
                verify_btn.textContent = "Suivant"

                input_title.value = data.currently_playing.name;
                input_artist.value = data.currently_playing.album.artists[0].name;
                playlist_img.src = img;

                skip_btn.disabled = true;

                verify_btn.removeEventListener('click', verifyEvent);
                verify_btn.addEventListener('click', clickHandler);
            }
        }
    })
}

document.querySelector('#back_playlist_btn').addEventListener('click', () => {
    location.reload();
})

skip_btn.addEventListener('click', () => {
    fetchAPI(token, 'https://api.spotify.com/v1/me/player/queue', 'GET').then(response => response.json())
    .then(data => {
        blank_indicator.classList.add('hidden')
        three_error_indicator.classList.remove('hidden')
        verify_btn.textContent = "Suivant"

        input_title.value = data.currently_playing.name;
        input_artist.value = data.currently_playing.album.artists[0].name;
        playlist_img.src = data.currently_playing.album.images[1].url;

        skip_btn.disabled = true;

        verify_btn.removeEventListener('click', verifyEvent);
        verify_btn.addEventListener('click', clickHandler);
    });
})

function clickHandler() {
    count_error = 0;
    verify_btn.textContent = "VERIFIER"
    blank_indicator.classList.remove('hidden');
    one_error_indicator.classList.add('hidden');
    two_error_indicator.classList.add('hidden');
    three_error_indicator.classList.add('hidden');

    first_shot_indicator.classList.add('hidden');
    snd_shot_indicator.classList.add('hidden');
    trd_shot_indicator.classList.add('hidden');

    playlist_img.src = playlist_poster;

    if (isLiked) {
        ids_liked_index++;
        fetchAPI(token, "https://api.spotify.com/v1/me/player/queue?uri=spotify:track:" + ids_liked_array[ids_liked_index], "POST")
    }

    fetchAPI(token, 'https://api.spotify.com/v1/me/player/next', 'POST').then(() => {
        input_title.className = "text-center bg-[#242424] text-xl p-3 rounded-[13px] font-spotify text-white focus:outline-none"
        input_artist.className = "text-center bg-[#242424] text-xl p-3 rounded-[13px] font-spotify text-white focus:outline-none"
        
        input_title.value = "";
        input_artist.value = "";
    })
    
    // Remove the event listener after the click event
    verify_btn.removeEventListener('click', clickHandler);
    verify_btn.addEventListener('click', verifyEvent);

    skip_btn.disabled = false;
}