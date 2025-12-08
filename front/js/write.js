// 예시: 검색 결과 카드 생성 (API 연동 전 UI용)
        document.querySelector('.search-btn').addEventListener('click', () => {
            const results = document.getElementById('search-results');
            results.innerHTML = `
        <div class="song-card">
          <img src="https://i.scdn.co/image/ab67616d0000b27303ff6a95e8eac2ffb5f062e7">
          <div class="info">
            <p class="title">예시 노래 제목 Example Track Title</p>
            <p class="artist">Artist Name</p>
          </div>
        </div>
      `;

            document.querySelector('.song-card').addEventListener('click', () => {
                document.getElementById('selected-song').innerHTML = `
          <div class="chosen">
            <img src="https://i.scdn.co/image/ab67616d0000b27303ff6a95e8eac2ffb5f062e7">
            <div>
              <p class="chosen-title">예시 노래 제목 Example Track Title</p>
              <p class="chosen-artist">Artist Name</p>
            </div>
          </div>
        `;
            });
        });