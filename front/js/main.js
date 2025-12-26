const API_URL = "http://localhost:3000";

// 1️⃣ 토큰·UID 로컬스토리지 존재 여부 확인
const token = localStorage.getItem("token");
const uid = localStorage.getItem("uid");

if (!token || !uid) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
}

// 2️⃣ 서버에 토큰 유효성 검사 요청
async function verifyToken() {
    try {
        const res = await fetch(`${API_URL}/verify-token`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        // 서버에서 토큰이 유효하지 않다고 응답한 경우
        if (res.status === 401 || res.status === 403) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.clear();
            window.location.href = "login.html";
            return;
        }

        // 서버 에러
        if (!res.ok) {
            console.warn("토큰 검증 중 서버 오류:", await res.text());
            return; // 서버 문제일 수 있으니 바로 로그아웃시키지는 않음
        }

        // 정상 → 유저 정보 가져올 수 있으면 여기서 가능
        const data = await res.json();
        console.log("토큰 검증 완료:", data);

    } catch (err) {
        console.error("토큰 검증 에러:", err);
    }
}

verifyToken();

// UI 관련 코드 (드롭다운 유지)
function toggleDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
}

document.addEventListener('click', function (event) {
    const profile = document.querySelector('.profile');
    const dropdown = document.getElementById('profileDropdown');

    if (!profile.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// 🔓 로그아웃 기능
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    const nickname = localStorage.getItem("nickname");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        localStorage.removeItem("nickname");

        alert("로그아웃 되었습니다.");
        window.location.href = "login.html";
    });
    myPage.addEventListener("click", ()=>{
        window.location.href = "mypage.html";
    })



    const profileNameElement = document.querySelector(".profile-name");
    if (nickname && profileNameElement) {
        profileNameElement.textContent = nickname;
    }
});

// ✨ 게시물 불러오기
async function loadPosts() {
    try {
        const res = await fetch(`${API_URL}/my-posts`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        const data = await res.json();

        // 🚨 배열이 아닐 경우 대비
        const posts = Array.isArray(data) ? data : [];

        // ❌ 더 이상 필터링 필요 없음
        renderPosts(posts);

    } catch (err) {
        console.error("게시물 로딩 실패:", err);
        renderPosts([]); 
    }
}

// ✨ 카드 렌더링 함수
function renderPosts(posts) {
    const grid = document.getElementById("postGrid");
    grid.innerHTML = ""; // 초기화

    posts.forEach(post => {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div class="thumb" style="background-image:url('${post.thumbnail || "https://via.placeholder.com/200"}');"></div>
            <div class="info">
                <p class="title card-title">${post.title}</p>
                <p class="artist">${post.artist || "알 수 없음"}</p>
                <p class="preview card-desc">${post.content.slice(0, 80)}...</p>
                <div class="tags">
                    ${post.tags.map(t => `<span>#${t}</span>`).join("")}
                </div>
            </div>
        `;

        grid.appendChild(card);
        card.addEventListener("click", () => openPostModal(post));
    });
}

loadPosts();

function openPostModal(post) {
    document.getElementById("modalThumb").style.backgroundImage =
        `url('${post.thumbnail || "https://via.placeholder.com/400"}')`;

    document.getElementById("modalTitle").textContent = post.title;
    document.getElementById("modalArtist").textContent = post.artist || "";
    document.getElementById("modalContent").textContent = post.content;

    const tagBox = document.getElementById("modalTags");
    tagBox.innerHTML = post.tags.map(t => `<span>#${t}</span>`).join("");

    document.getElementById("postModal").classList.remove("hidden");
}

function closePostModal() {
    document.getElementById("postModal").classList.add("hidden");
}
