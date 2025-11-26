const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 간단한 유효성 검사 (실제로는 서버에서 처리)
            if (email && password) {
                // 로그인 성공 시뮬레이션
                console.log('로그인 시도:', { email, password });
                // 실제로는 서버로 요청을 보내고 응답을 처리
                // window.location.href = 'index.html';
                alert('로그인 성공! (데모)');
            } else {
                errorMessage.classList.add('show');
                setTimeout(() => {
                    errorMessage.classList.remove('show');
                }, 3000);
            }
        });

        function socialLogin(provider) {
            console.log(`${provider} 로그인 시도`);
            alert(`${provider} 소셜 로그인 (데모)`);
        }

        // 입력 시 에러 메시지 숨기기
        document.getElementById('email').addEventListener('input', function() {
            errorMessage.classList.remove('show');
        });

        document.getElementById('password').addEventListener('input', function() {
            errorMessage.classList.remove('show');
        });