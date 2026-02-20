const mongoose = require('mongoose');

// 유저 정보 설계도 (Schema)
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, // 무조건 입력해야 함
        unique: true    // 중복된 아이디 금지 (동일한 아이디 가입 방지)
    },
    password: { 
        type: String, 
        required: true  // 비밀번호도 무조건 있어야 함
    }
});

// 이 설계도를 바탕으로 'User'라는 이름의 모델(틀)을 만들어서 밖으로 내보냄
module.exports = mongoose.model('User', userSchema);