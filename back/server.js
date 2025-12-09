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

/* 📝 회원가입 */
app.post("/register", async (req, res) => {
  const { name, nickname, email, password, marketing } = req.body; // ⭐ 추가

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
      .input("marketing", sql.Bit, marketing) // ⭐ 추가
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

/* 🚀 서버 실행 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API 서버 실행됨: http://localhost:${PORT}`);
});
