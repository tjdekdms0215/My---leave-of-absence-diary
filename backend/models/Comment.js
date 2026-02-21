const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    // 1. 어떤 일기에 달린 댓글인지 (일기의 ID)
    postId: { type: String, required: true }, 
    
    // 2. 누가 썼는지 (작성자 아이디)
    author: { type: String, required: true }, 
    
    // 3. 댓글 내용
    content: { type: String, required: true }, 
    
    // 4. 작성된 시간 (안 적어도 알아서 현재 시간으로 저장됨!)
    createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('Comment', commentSchema);