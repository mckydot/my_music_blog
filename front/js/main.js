function toggleDropdown() {
        const dropdown = document.getElementById('profileDropdown');
        dropdown.classList.toggle('show');
    }
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', function (event) {
        const profile = document.querySelector('.profile');
        const dropdown = document.getElementById('profileDropdown');

        if (!profile.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });