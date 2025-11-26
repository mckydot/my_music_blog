const signupForm = document.getElementById('signupForm');
        const nameInput = document.getElementById('name');
        const nickNameInput = document.getElementById('nickname');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const passwordConfirmInput = document.getElementById('passwordConfirm');
        const strengthBar = document.getElementById('strengthBar');
        const successMessage = document.getElementById('successMessage');
        const submitBtn = document.getElementById('submitBtn');

        // 비밀번호 강도 체크
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;

            if (password.length >= 8) strength++;
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            strengthBar.className = 'password-strength-bar';
            if (strength === 1 || strength === 2) {
                strengthBar.classList.add('weak');
            } else if (strength === 3) {
                strengthBar.classList.add('medium');
            } else if (strength === 4) {
                strengthBar.classList.add('strong');
            }
        });

        // 실시간 유효성 검사
        nameInput.addEventListener('blur', function() {
            validateName();
        });
        nickNameInput.addEventListener('blur', function() {
            validateNickName();
        })
        emailInput.addEventListener('blur', function() {
            validateEmail();
        });

        passwordInput.addEventListener('blur', function() {
            validatePassword();
        });

        passwordConfirmInput.addEventListener('blur', function() {
            validatePasswordConfirm();
        });

        function validateName() {
            const name = nameInput.value.trim();
            if (name.length < 2) {
                showError(nameInput, 'nameError');
                return false;
            } else {
                hideError(nameInput, 'nameError');
                return true;
            }
        }
        function validateNickName() {
            const name = nickNameInput.value.trim();
            if (name.length < 1) {
                showError(nickNameInput, 'nicknameError');
                return false;
            } else {
                hideError(nickNameInput, 'nicknameError');
                return true;
            }
        }

        function validateEmail() {
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError(emailInput, 'emailError');
                return false;
            } else {
                hideError(emailInput, 'emailError');
                return true;
            }
        }

        function validatePassword() {
            const password = passwordInput.value;
            if (password.length < 8) {
                showError(passwordInput, 'passwordError');
                return false;
            } else {
                hideError(passwordInput, 'passwordError');
                return true;
            }
        }

        function validatePasswordConfirm() {
            const password = passwordInput.value;
            const passwordConfirm = passwordConfirmInput.value;
            if (password !== passwordConfirm) {
                showError(passwordConfirmInput, 'passwordConfirmError');
                return false;
            } else {
                hideError(passwordConfirmInput, 'passwordConfirmError');
                return true;
            }
        }

        function showError(input, errorId) {
            input.classList.add('error');
            input.classList.remove('success');
            document.getElementById(errorId).classList.add('show');
        }

        function hideError(input, errorId) {
            input.classList.remove('error');
            input.classList.add('success');
            document.getElementById(errorId).classList.remove('show');
        }

        // 폼 제출
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const isNameValid = validateName();
            const isEmailValid = validateEmail();
            const isPasswordValid = validatePassword();
            const isPasswordConfirmValid = validatePasswordConfirm();
            const termsChecked = document.getElementById('terms').checked;

            if (isNameValid && isEmailValid && isPasswordValid && isPasswordConfirmValid && termsChecked) {
                // 회원가입 성공 시뮬레이션
                submitBtn.disabled = true;
                submitBtn.textContent = '가입 중...';

                setTimeout(() => {
                    successMessage.classList.add('show');
                    signupForm.style.display = 'none';
                    
                    setTimeout(() => {
                        // 실제로는 로그인 페이지로 리다이렉트
                        // window.location.href = 'login.html';
                        alert('회원가입 완료! (데모)');
                        submitBtn.disabled = false;
                        submitBtn.textContent = '회원가입';
                        signupForm.style.display = 'block';
                        successMessage.classList.remove('show');
                        signupForm.reset();
                        strengthBar.className = 'password-strength-bar';
                    }, 2000);
                }, 1000);
            }
        });

        function socialSignup(provider) {
            console.log(`${provider} 회원가입 시도`);
            alert(`${provider} 소셜 회원가입 (데모)`);
        }