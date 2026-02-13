// 1. 서버(백엔드) 주소
const API_URL = "http://localhost:3000/api/timeline";

// 2. 화면에 그려줄 상자 찾기
const list = document.getElementById('timeline-list');

// 3. 서버에서 데이터를 가져오는 마법의 함수 (fetch)
async function getTimelineData() {
    try {
        // 서버에 "데이터 줘!" 요청 보내기
        const response = await fetch(API_URL);
        const data = await response.json(); // 받은 데이터를 자바스크립트 객체로 변환

        // 기존 내용을 비우고 새로 그리기
        list.innerHTML = '';

        // 서버에서 받아온 데이터를 하나씩 꺼내서 화면에 그리기
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <span class="date">${item.date}</span>
                <div class="title">${item.title}</div>
                <p class="desc">${item.desc}</p>
            `;
            list.appendChild(div);
        });
    } catch (error) {
        console.error("데이터를 가져오는 데 실패했어요:", error);
        list.innerHTML = "<p>서버가 꺼져있는 것 같아요! 😢</p>";
    }
}

// 4. 페이지가 열릴 때 함수 실행!
getTimelineData();