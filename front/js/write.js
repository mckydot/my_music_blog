// ========================== 
// 🔥 설정값
// ==========================
const API_URL = "http://localhost:3000";

const token = localStorage.getItem("token");
const uid = localStorage.getItem("uid");

if (!token || !uid) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
}

// ==========================
// 🔐 토큰 검증
// ==========================
async function verifyToken() {
    try {
        const res = await fetch(`${API_URL}/verify-token`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            alert("세션이 만료되었습니다.");
            localStorage.clear();
            window.location.href = "login.html";
        }
    } catch (err) {
        console.error(err);
    }
}
verifyToken();


// ==========================
// 🎵 iTunes 검색 기능
// ==========================
document.querySelector('.search-btn').addEventListener('click', searchSongs);

async function searchSongs() {
    const query = document.getElementById("music-search").value.trim();
    if (!query) return alert("검색어를 입력하세요!");

    const resultsBox = document.getElementById("search-results");
    resultsBox.innerHTML = "<p>검색 중...</p>";

    try {
        const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (!data.results || data.results.length === 0) {
            resultsBox.innerHTML = "<p>검색 결과가 없습니다.</p>";
            return;
        }

        renderSearchResults(data.results);

    } catch (err) {
        console.error("Search Error:", err);
        resultsBox.innerHTML = "<p>오류가 발생했습니다.</p>";
    }
}


// 🎨 검색 결과 렌더링
function renderSearchResults(items) {
    const resultsBox = document.getElementById("search-results");
    resultsBox.innerHTML = "";

    items.forEach(item => {
        const image = item.artworkUrl100?.replace("100x100bb", "300x300bb") || "";
        const title = item.trackName || "제목 없음";
        const artist = item.artistName || "아티스트 정보 없음";

        const card = document.createElement("div");
        card.className = "song-card";

        card.innerHTML = `
            <img src="${image}">
            <div class="info">
                <p class="title">${title}</p>
                <p class="artist">${artist}</p>
            </div>
        `;

        card.addEventListener("click", () => selectSong(image, title, artist));

        resultsBox.appendChild(card);
    });
}


// ==========================
// 🎵 선택된 노래 UI
// ==========================
function selectSong(img, title, artist) {
    const selected = document.getElementById("selected-song");

    selected.innerHTML = `
        <div class="chosen">
            <img src="${img}">
            <div>
              <p class="chosen-title">${title}</p>
              <p class="chosen-artist">${artist}</p>
            </div>
        </div>
        <button class="remove-song-btn">선택 취소</button>
    `;

    document.querySelector(".remove-song-btn").addEventListener("click", removeSelectedSong);
}

function removeSelectedSong() {
    const selected = document.getElementById("selected-song");
    selected.innerHTML = `<p class="placeholder">🔎 노래를 검색해서 선택하세요.</p>`;
}


// ==========================
// 👤 닉네임 / 로그아웃
// ==========================
document.addEventListener("DOMContentLoaded", () => {
    const nickname = localStorage.getItem("nickname");
    const profileName = document.querySelector(".profile-name");

    if (nickname) profileName.textContent = nickname;

    const logoutBtn = document.querySelector(".dropdown-item:last-child");
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        alert("로그아웃 되었습니다.");
        window.location.href = "login.html";
    });
});

function toggleDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    dropdown.classList.toggle("show");
}
