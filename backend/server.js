// 1. 숨겨둔 .env 파일의 비밀번호를 읽어오기 위한 마법의 주문
require('dotenv').config(); 

const express = require('express');
const Post = require('./models/Timeline');
const cors = require('cors');
// 2. 몽고DB와 연결해주는 번역기 불러오기
const mongoose = require('mongoose'); 

const bcrypt = require('bcrypt'); // 비밀번호 암호화 도구
const User = require('./models/User'); // 아까 만든 유저 설계도
const jwt = require('jsonwebtoken');
const Timeline = require('./models/Timeline');
const Comment = require('./models/Comment');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(express.json()); // 프론트엔드에서 오는 JSON 데이터를 읽을 수 있게 해주는 마법의 코드
const port = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://tjdekdms0215.github.io', // 다은님의 웹사이트 주소!
    credentials: true // 나중에 로그인 유지할 때 필요해요
}));

// 4. 🌟 몽고DB(우리의 금고)와 실제로 연결하는 코드
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ 몽고DB 금고에 무사히 연결되었습니다!'))
  .catch((err) => console.log('❌ 몽고DB 연결 실패:', err));

  // ==========================================
// ☁️ 클라우디너리(사진/영상 창고) 세팅
// ==========================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 배달부(multer)에게 창고 주소와 규칙 알려주기
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'diary_media', // 클라우디너리에 'diary_media'라는 폴더가 생기고 저장됩니다!
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4','heic', 'webp', 'mov'], // 사진과 동영상 모두 허용!
        resource_type: 'auto' // 파일 종류(사진/영상)를 자동으로 파악하게 합니다.
    }
});

const upload = multer({ storage: storage }); // 최종 택배 수령인 'upload' 완성!
// ==========================================
// 🌟 회원가입 API (POST 요청)
// ==========================================
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "이미 사용 중인 아이디입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 🌟 핵심 로직: 다은님의 전용 아이디를 정해주세요! (예: 'daeun123')
        // 이 아이디로 가입하면 무조건 'admin(관리자)'이 됩니다.
        let userRole = 'user'; 
        if (username === 'tjdekdms') { 
            userRole = 'admin';
        }

        const newUser = new User({
            username: username,
            password: hashedPassword,
            role: userRole // 등급 정보도 금고에 같이 저장!
        });

        await newUser.save();
        res.status(201).json({ message: "회원가입 성공! 환영합니다 🎉" });
        
    } catch (error) {
        console.error("회원가입 에러:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});
// ==========================================
// 🌟 로그인 API (POST 요청)
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "아이디를 찾을 수 없습니다." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "비밀번호가 틀렸습니다." });
        }

        // 입장권(JWT)에 유저의 고유 ID와 '등급(role)'을 함께 적어서 발급합니다!
        const token = jwt.sign(
            { userId: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // 🌟 프론트엔드에 답장할 때 등급(role) 정보도 같이 보내줍니다.
        res.json({ message: "로그인 성공!", token: token, role: user.role });

    } catch (error) {
        console.error("로그인 에러:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
    }
});

// ==========================================
// 🛡️ 토큰 검사원 (인증 미들웨어)
// ==========================================
const authenticateToken = (req, res, next) => {
    // 1. 방문자가 제시한 입장권(토큰) 확인하기
    const authHeader = req.headers['authorization'];
    // 보통 토큰은 "Bearer eyJhbG..." 형태로 오기 때문에 뒤의 진짜 토큰만 쏙 빼냅니다.
    const token = authHeader && authHeader.split(' ')[1];

    // 2. 토큰이 아예 없으면 쫓아내기
    if (!token) {
        return res.status(401).json({ message: "입장권(토큰)이 없습니다. 로그인이 필요합니다." });
    }

    // 3. 토큰이 진짜인지(위조되지 않았는지) 우리가 아까 만든 비밀 도장으로 확인하기
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "입장권이 가짜이거나 유효기간이 지났습니다." });
        }
        
        // 4. 무사히 통과했다면 유저 정보를 다음 단계로 넘겨주기
        req.user = user;
        next(); // "통과!" 하고 문을 열어주는 역할
    });
};

// ==========================================
// 💎 VIP 전용 구역 테스트 (토큰이 있어야만 접근 가능)
// ==========================================
// 주소 중간에 'authenticateToken' 검사원이 서 있는 거 보이시죠?
app.get('/api/vip-only', authenticateToken, (req, res) => {
    res.json({ 
        message: "환영합니다! VIP 구역에 무사히 입장하셨습니다 💎",
        userId: req.user.userId 
    });
});

// ==========================================
// 📦 데이터 한 번에 금고로 이사하기 (초기 세팅용)
// ==========================================
app.get('/api/init-timeline', async (req, res) => {
    try {
        // 1. 혹시 금고에 옛날 데이터가 남아있다면 싹 비워줍니다. (중복 방지)
        await Timeline.deleteMany({});

        // 2. timelineData 배열에 있던 14개의 데이터를 금고에 한 번에 집어넣습니다!
        await Timeline.insertMany(timelineData);

        // 3. 성공 메시지 보내기
        res.send("✅ 14개의 일기 데이터가 몽고DB 금고로 무사히 이사 완료되었습니다! 🎉");
        console.log("데이터 초기화 완료!");
    } catch (error) {
        console.error("데이터 이사 에러:", error);
        res.status(500).send("이사 중 에러가 발생했습니다.");
    }
});

app.get('/', (req, res) => {
    res.send('다은님의 백엔드 서버가 잘 돌아가고 있어요!');
});

// 전체 일기 목록을 DB에서 가져오기
app.get('/api/timeline', async (req, res) => {
  try {
    // Post 모델을 사용해 DB에 있는 모든 데이터를 찾음
    const posts = await Post.find(); 
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "데이터를 불러오는 데 실패했습니다." });
  }
});

// 특정 ID의 일기만 DB에서 가져오기
app.get('/api/timeline/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    // URL에서 넘겨받은 id로 DB에서 해당 일기를 찾음 (MongoDB의 _id 기준)
    const post = await Post.findById(postId);

    if (post) {
      res.json(post); // 찾으면 그 일기만 보내줌
    } else {
      res.status(404).json({ error: "일기를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
});


// ==========================================
// 🌟 새로운 일기 쓰기 (POST) - 클라우디너리 기절 방지 안전망 추가!
// ==========================================
app.post('/api/timeline', (req, res, next) => {
    // 1. 배달부(multer)가 클라우디너리에 먼저 사진을 올리도록 시도합니다.
    const uploadMiddleware = upload.array('media', 10);
    
    uploadMiddleware(req, res, (err) => {
        if (err) {
            // 🚨 여기서 [object Object] 대신 진짜 에러의 속살을 까발립니다!
            console.error("🚨 [긴급] 클라우디너리(사진 창고) 업로드 에러 발생! 🚨");
            console.error(err); 
            return res.status(400).json({ message: "사진 업로드에 실패했습니다. 렌더 로그를 확인하세요!" });
        }
        // 에러 없이 사진이 잘 올라갔다면 다음 단계(DB 저장)로 넘어갑니다.
        next(); 
    });

}, async (req, res) => {
    // 2. 사진이 잘 올라갔으니, 이제 금고(DB)에 주소와 글을 저장합니다.
    try {
        const { title, date, desc, content } = req.body;
        let imageUrls = [];
        
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(file => file.path);
        }

        const newTimeline = new Timeline({
            title: title,
            date: date,
            desc: desc,
            content: content,
            images: imageUrls
        });

        await newTimeline.save();
        res.status(201).json({ message: "일기와 사진이 성공적으로 기록되었습니다!", data: newTimeline });
        
    } catch (error) {
        console.error("🚨 [긴급] DB 금고 저장 에러 🚨", error);
        res.status(500).json({ error: "일기 저장에 실패했습니다." });
    }
});

// ==========================================
// 📸 2단계: 에디터 전용 '사진 1장' 업로드 고속도로 (POST)
// ==========================================
// 주의: 여기서는 여러 장이 아니라 에디터에서 올린 '딱 1장'만 받습니다.
app.post('/api/upload/image', upload.single('image'), (req, res) => {
    try {
        // 1. 배달부(multer)가 사진을 못 받았을 때
        if (!req.file) {
            return res.status(400).json({ message: "업로드된 파일이 없습니다." });
        }
        
        // 2. 클라우디너리에 잘 올라갔다면, 그 사진의 주소(path)를 프론트엔드에 돌려줍니다!
        console.log("✅ 에디터 사진 업로드 성공! 주소:", req.file.path);
        res.status(200).json({ url: req.file.path });
        
    } catch (error) {
        console.error("🚨 에디터 이미지 업로드 에러:", error);
        res.status(500).json({ error: "이미지 업로드에 실패했습니다." });
    }
});

// ==========================================
// 💬 특정 일기의 댓글 불러오기 API (누구나 볼 수 있음)
// ==========================================
app.get('/api/comments/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        // 해당 postId를 가진 댓글만 전부 찾아서, 최신순(createdAt: -1)으로 정렬!
        const comments = await Comment.find({ postId: postId }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        console.error("댓글 불러오기 에러:", error);
        res.status(500).json({ error: "댓글을 불러오는 데 실패했습니다." });
    }
});

// ==========================================
// 🗑️ 특정 일기 삭제 API
// ==========================================
app.delete('/api/timeline/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const deletedPost = await Timeline.findByIdAndDelete(postId); // 몽고DB에서 찾아서 바로 삭제!
        
        if (!deletedPost) {
            return res.status(404).json({ message: "삭제할 일기를 찾을 수 없습니다." });
        }
        res.json({ message: "일기가 성공적으로 삭제되었습니다." });
    } catch (error) {
        console.error("삭제 에러:", error);
        res.status(500).json({ error: "서버 오류로 삭제하지 못했습니다." });
    }
});

// ==========================================
// ✍️ 새로운 댓글 작성 API (로그인한 회원만 작성 가능!)
// ==========================================
// 'authenticateToken' 검사원이 서있기 때문에 입장권(토큰)이 있어야만 통과됩니다.
app.post('/api/comments', authenticateToken, async (req, res) => {
    try {
        // 프론트엔드에서 보낸 일기 번호(postId)와 댓글 내용(content) 받기
        const { postId, content } = req.body;

        // 토큰을 검사한 'authenticateToken'이 req.user에 유저 정보를 담아줬어요!
        // 이 유저의 고유 ID로 DB에서 진짜 아이디(username)를 찾아옵니다.
        const user = await User.findById(req.user.userId);

        // 새로운 댓글 덩어리 만들기
        const newComment = new Comment({
            postId: postId,
            author: user.username, // DB에서 찾은 진짜 아이디 넣기
            content: content
        });

        // 금고에 저장!
        await newComment.save();
        res.status(201).json({ message: "댓글이 성공적으로 등록되었습니다!", comment: newComment });
        
    // server.js의 일기 저장 API 맨 아랫부분 수정
    } catch (error) {
        // 에러의 정체를 낱낱이 파헤쳐서 로그에 보여주는 마법의 코드!
        console.error("🚨 서버 기절 원인 파악 중 🚨");
        console.dir(error); // [object Object] 대신 에러의 속살을 다 보여줍니다.
        console.error("에러 메시지:", error.message);
        
        res.status(500).json({ error: "일기 저장에 실패했습니다." });
    }
});

app.listen(port, () => {
    console.log(`서버 실행 완료: http://localhost:${port}`);
});