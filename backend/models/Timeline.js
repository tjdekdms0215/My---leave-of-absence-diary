const mongoose = require('mongoose');

// 휴학 일기 정보 설계도 (Schema)
const timelineSchema = new mongoose.Schema({
    date: { 
        type: String, 
        required: true // 예: "2025.01" (무조건 있어야 함)
    },
    title: { 
        type: String, 
        required: true // 예: "릿치 프로모 촬영 📸"
    },
    desc: { 
        type: String, 
        required: true // 예: "나의 안무 창작..."
    },
    content: { 
        type: String, 
        default: "채워질 내용,," // 🌟 내용을 안 적으면 다은님이 원하신 이 문구가 자동으로 들어갑니다!
    }
});

// 이 설계도를 바탕으로 'Timeline'이라는 모델을 밖으로 내보냄
module.exports = mongoose.model('Timeline', timelineSchema);