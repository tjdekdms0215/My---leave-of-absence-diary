const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // 🌟 새로 추가된 부분: 가입하는 사람의 등급을 정해줍니다! 기본값은 'user(일반 회원)'
    role: { type: String, default: 'user' } 
});

module.exports = mongoose.model('User', userSchema);