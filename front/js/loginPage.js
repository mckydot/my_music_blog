const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

const API_URL = "http://localhost:3000";

// 에러 출력 함수
function showError(message) {
    errorMessage.innerText = message;
    errorMessage.classList.add('show');
    setTimeout(() => errorMessage.classList.remove('show'), 3000);
}

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
        showError("이메일과 비밀번호를 입력하세요.");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        // HTTP 상태 코드 기반 분기
        if (res.status === 404) {
            showError("존재하지 않는 이메일입니다.");
            return;
        }
        if (res.status === 401) {
            showError("비밀번호가 올바르지 않습니다.");
            return;
        }
        if (!res.ok) {
            showError("서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
            return;
        }

        // ⭐ 로그인 성공 → 토큰 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("uid", data.user.uid);
        localStorage.setItem("nickname", data.user.nickname);

        alert("로그인 성공!");
        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        showError("네트워크 오류가 발생했습니다.");
    }
});

// 입력 시 에러 메시지 숨기기
document.getElementById('email').addEventListener('input', () => errorMessage.classList.remove('show'));
document.getElementById('password').addEventListener('input', () => errorMessage.classList.remove('show'));
