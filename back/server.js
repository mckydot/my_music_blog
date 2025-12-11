const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const { connect, sql } = require("./db");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

/* 🔐 비밀번호 유효성 검사 */
function validatePassword(password) {
  const lengthOK = password.length >= 8;
  const digitOK = /[0-9]/.test(password);
  const specialOK = /[^a-zA-Z0-9]/.test(password);
  return lengthOK && digitOK && specialOK;
}

/* =========================================================
   📝 회원가입
========================================================= */
app.post("/register", async (req, res) => {
  const { name, nickname, email, password, marketing } = req.body;

  if (!name || !nickname || !email || !password) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "비밀번호는 8자 이상이며 숫자와 특수문자를 포함해야 합니다."
    });
  }

  const hashed = await bcrypt.hash(password, 10);
  const uid = uuidv4();

  const pool = await connect();

  try {
    await pool.request()
      .input("uid", sql.VarChar, uid)
      .input("name", sql.NVarChar, name)
      .input("nickname", sql.NVarChar, nickname)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashed)
      .input("marketing", sql.Bit, marketing)
      .query(`
        INSERT INTO users (uid, name, nickname, email, password, marketing)
        VALUES (@uid, @name, @nickname, @email, @password, @marketing)
      `);

    res.json({ message: "회원가입 성공", uid });

  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    console.error("DB Insert Error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});


/* =========================================================
   🔐 로그인
========================================================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await connect();

    const result = await pool.request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM users WHERE email = @email");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.recordset[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        uid: user.uid,
        nickname: user.nickname,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


/* =========================================================
   🔐 토큰 인증
========================================================= */
app.get("/verify-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, error: "Invalid token" });
  }
});


/* =========================================================
   🎵 iTunes 검색 API
========================================================= */
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicTrack&limit=10`
    );

    const json = await response.json();
    res.json(json);

  } catch (err) {
    console.error("iTunes Search Error:", err);
    res.status(500).json({ error: "iTunes API error" });
  }
});


/* =========================================================
   📝 게시물 저장 API
========================================================= */
app.post("/posts", async (req, res) => {
  const { uid, title, artist, thumbnail, content, tags } = req.body;

  if (!uid || !title || !content) {
    return res.status(400).json({ message: "필수 값 누락" });
  }

  try {
    const pool = await connect();

    const insertPost = await pool.request()
      .input("uid", sql.VarChar, uid)
      .input("title", sql.NVarChar, title)
      .input("artist", sql.NVarChar, artist)
      .input("thumbnail", sql.VarChar, thumbnail)
      .input("content", sql.NVarChar, content)
      .query(`
        INSERT INTO posts (author_uid, title, artist, thumbnail, content)
        VALUES (@uid, @title, @artist, @thumbnail, @content);

        SELECT SCOPE_IDENTITY() AS post_id;
      `);

    const postId = insertPost.recordset[0].post_id;

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        await pool.request()
          .input("post_id", sql.Int, postId)
          .input("tag", sql.NVarChar, tag)
          .query(`
            INSERT INTO post_tags (post_id, tag)
            VALUES (@post_id, @tag)
          `);
      }
    }

    res.json({ message: "게시물 저장 성공", postId });

  } catch (err) {
    console.error("Post Insert Error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});


/* =========================================================
   📌 게시물 조회 API (thumbnail 포함)
========================================================= */
app.get("/posts", async (req, res) => {
  try {
    const pool = await connect();

    const posts = await pool.request().query(`
      SELECT 
          p.id,
          p.title,
          p.artist,
          p.thumbnail,
          p.content,
          p.created_at,
          u.nickname AS author,
          (
            SELECT tag
            FROM post_tags t
            WHERE t.post_id = p.id
            FOR JSON PATH
          ) AS tags
      FROM posts p
      JOIN users u ON p.author_uid = u.uid
      ORDER BY p.id DESC
    `);

    const formatted = posts.recordset.map(p => {
      return {
        id: p.id,
        title: p.title,
        artist: p.artist,
        thumbnail: p.thumbnail,
        content: p.content,
        author: p.author,
        created_at: p.created_at,
        tags: p.tags ? JSON.parse(p.tags).map(t => t.tag) : []
      };
    });

    res.json(formatted);

  } catch (err) {
    console.error("Post Read Error:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});


/* =========================================================
   🚀 서버 실행
========================================================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API 서버 실행됨: http://localhost:${PORT}`);
});
