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
// 🔐 로그인 상태 및 권한(Role) 확인
// ==========================================
// script.js 에서 checkLoginStatus 함수 안을 이렇게 고쳐주세요!
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); 
    
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const writeBtn = document.getElementById('write-btn');
    const signupBtn = document.getElementById('signup-btn'); // 🌟 회원가입 버튼 찾아오기

    if (token) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none'; // 🌟 로그인했으면 회원가입 버튼 숨기기
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        
        if (role === 'admin') {
            if (writeBtn) writeBtn.style.display = 'inline-block';
        } else {
            if (writeBtn) writeBtn.style.display = 'none';
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block'; // 🌟 로그아웃 상태면 회원가입 버튼 보여주기
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (writeBtn) writeBtn.style.display = 'none';
    }
}
// ==========================================
// 🚪 로그아웃 기능
// ==========================================
function logout() {
    // 로그아웃 할 때는 입장권과 등급표를 모두 버려야 합니다!
    localStorage.removeItem('token');
    localStorage.removeItem('role'); 
    
    alert("로그아웃 되었습니다. 안녕히 가세요! 👋");
    window.location.reload(); 
}

// 스크립트가 로드되자마자 상태 확인!
checkLoginStatus();