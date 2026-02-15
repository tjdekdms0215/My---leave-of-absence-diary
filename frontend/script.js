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