const API_URL = "https://my-leave-of-absence-diary.onrender.com/api/timeline";
const list = document.getElementById('timeline-list');

async function getTimelineData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        list.innerHTML = '';

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            
            // 🌟 이 부분이 팝업창 대신 새 페이지(post.html)로 넘겨주는 핵심 코드입니다!
            div.onclick = () => {
                window.location.href = `post.html?id=${item.id}`;
            };

            const imageHtml = item.img ? `<img src="${item.img}" class="diary-photo" alt="일기 사진">` : '';

            div.innerHTML = `
                <span class="date">${item.date}</span>
                <div class="title" style="font-size: 20px; font-weight: bold; margin-top: 10px;">${item.title}</div>
                <p class="desc" style="color: #666; margin-top: 8px;">${item.desc}</p>
                ${imageHtml}
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error("데이터 가져오기 실패:", error);
    }
}

getTimelineData();

// ==========================================
// 🔐 로그인 상태 확인 및 버튼 변경 로직
// ==========================================
function checkLoginStatus() {
    // 1. 창고(localStorage)에서 입장권(token) 꺼내보기
    const token = localStorage.getItem('token');
    
    // 2. HTML에서 만들어둔 버튼들 찾아오기
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const writeBtn = document.getElementById('write-btn');

    // 3. 입장권이 있다면? (로그인 상태)
    if (token) {
        if (loginBtn) loginBtn.style.display = 'none'; // 로그인 버튼 숨기기
        if (logoutBtn) logoutBtn.style.display = 'inline-block'; // 로그아웃 버튼 보여주기
        if (writeBtn) writeBtn.style.display = 'inline-block'; // 글쓰기 버튼 보여주기
    } 
    // 4. 입장권이 없다면? (로그아웃 상태)
    else {
        if (loginBtn) loginBtn.style.display = 'inline-block'; // 로그인 버튼 보여주기
        if (logoutBtn) logoutBtn.style.display = 'none'; // 로그아웃 버튼 숨기기
        if (writeBtn) writeBtn.style.display = 'none'; // 글쓰기 버튼 숨기기
    }
}

// ==========================================
// 🚪 로그아웃 기능
// ==========================================
function logout() {
    // 1. 창고에서 입장권(token) 불태워버리기(삭제)
    localStorage.removeItem('token');
    
    // 2. 알림창 띄우기
    alert("로그아웃 되었습니다. 안녕히 가세요! 👋");
    
    // 3. 화면 새로고침해서 변경된 버튼 상태 반영하기
    window.location.reload(); 
}

// 웹페이지가 열릴 때 가장 먼저 'checkLoginStatus' 함수를 실행하라는 뜻!
checkLoginStatus();