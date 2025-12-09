const signupForm = document.getElementById('signupForm');
const nameInput = document.getElementById('name');
const nickNameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const strengthBar = document.getElementById('strengthBar');
const successMessage = document.getElementById('successMessage');
const submitBtn = document.getElementById('submitBtn');

const API_URL = "http://localhost:3000";

// =======================
// 비밀번호 강도 체크
// =======================
passwordInput.addEventListener('input', function () {
    const password = this.value;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++; // 소문자만
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++; // 특수문자

    strengthBar.className = 'password-strength-bar';
    if (strength <= 2) strengthBar.classList.add('weak');
    else if (strength === 3) strengthBar.classList.add('medium');
    else if (strength === 4) strengthBar.classList.add('strong');
});

// =======================
// 유효성 검사 함수
// =======================
function validateName() {
    const name = nameInput.value.trim();
    if (name.length < 2) {
        showError(nameInput, 'nameError');
        return false;
    }
    hideError(nameInput, 'nameError');
    return true;
}

function validateNickName() {
    const name = nickNameInput.value.trim();
    if (name.length < 1) {
        showError(nickNameInput, 'nicknameError');
        return false;
    }
    hideError(nickNameInput, 'nicknameError');
    return true;
}

function validateEmail() {
    const email = emailInput.value.trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
        showError(emailInput, 'emailError');
        return false;
    }
    hideError(emailInput, 'emailError');
    return true;
}

function validatePassword() {
    const password = passwordInput.value;
    if (password.length < 8) {
        showError(passwordInput, 'passwordError');
        return false;
    }
    hideError(passwordInput, 'passwordError');
    return true;
}

function validatePasswordConfirm() {
    const password = passwordInput.value;
    const confirm = passwordConfirmInput.value;

    if (password !== confirm) {
        showError(passwordConfirmInput, 'passwordConfirmError');
        return false;
    }
    hideError(passwordConfirmInput, 'passwordConfirmError');
    return true;
}

function showError(input, id) {
    input.classList.add('error');
    document.getElementById(id).classList.add('show');
}

function hideError(input, id) {
    input.classList.remove('error');
    document.getElementById(id).classList.remove('show');
}

// 입력 blur 이벤트 등록
nameInput.addEventListener('blur', validateName);
nickNameInput.addEventListener('blur', validateNickName);
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);
passwordConfirmInput.addEventListener('blur', validatePasswordConfirm);

// =======================
// 회원가입 요청
// =======================
signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const isNameValid = validateName();
    const isNickValid = validateNickName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isPasswordConfirmValid = validatePasswordConfirm();
    const termsChecked = document.getElementById('terms').checked;
    const marketingChecked = document.getElementById('marketing').checked;

    if (!termsChecked) {
        alert("이용약관에 동의해야 합니다.");
        return;
    }

    if (isNameValid && isNickValid && isEmailValid && isPasswordValid && isPasswordConfirmValid) {
        submitBtn.disabled = true;
        submitBtn.textContent = "가입 중...";

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: nameInput.value,
                    nickname: nickNameInput.value,
                    email: emailInput.value,
                    password: passwordInput.value,
                    marketing: marketingChecked ? 1 : 0
                })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message);
                submitBtn.disabled = false;
                submitBtn.textContent = "회원가입";
                return;
            }

            successMessage.classList.add("show");
            signupForm.style.display = "none";

            setTimeout(() => window.location.href = "login.html", 2000);

        } catch (err) {
            console.error(err);
            alert("서버와 연결할 수 없습니다.");
        }

        submitBtn.disabled = false;
        submitBtn.textContent = "회원가입";
    }
});
