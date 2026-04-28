const cassandra = require("cassandra-driver");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { OAuth2Client } = require("google-auth-library");
const { sendVerificationEmail } = require("./mailer");
const jwt = require("jsonwebtoken");
const clientGoogle = new OAuth2Client("265133578144-5f5451bubriovfe9i9d1kg3um1t1crb4.apps.googleusercontent.com");

const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "demo",
});

async function register(req, res) {
  const { fullName, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    
    const token = jwt.sign(
      {
        fullName,
        email,
        password: hashedPassword,
      },
      "verify_secret",
      { expiresIn: "1555555d" }
    );
    await sendVerificationEmail(email, token);

    res.json({
      message: "Vui lòng kiểm tra email để xác nhận đăng ký",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await client.execute(
      "SELECT * FROM users WHERE username = ? ALLOW FILTERING",
      [email],
      { prepare: true }
    );

    if (result.rowLength === 0) {
      return res.status(400).json({ message: "User không tồn tại" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      {
        username: user.username,
        fullName: user.full_name,
      },
      "secret_key_123",
      { expiresIn: "777777d" }
    );

    res.json({
      token,
      username: user.username,
      fullName: user.full_name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function verifyEmail(req, res) {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, "verify_secret");

    const { email, fullName, password } = decoded;
    await client.execute(
      `INSERT INTO users (id, username, email, full_name, password, created_at)
       VALUES (?, ?, ?, ?, ?, toTimestamp(now()))`,
      [uuidv4(), email, email, fullName, password],
      { prepare: true }
    );

    // 👉 redirect về login + message
    res.redirect("http://localhost:5173/login?success=1");
  } catch (err) {
    res.send("Link hết hạn hoặc không hợp lệ");
  }
}
async function googleLogin(req, res) {
  const { credential } = req.body;

  try {
    const ticket = await clientGoogle.verifyIdToken({
      idToken: credential,
      audience:
        "265133578144-5f5451bubriovfe9i9d1kg3um1t1crb4.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;

    const result = await client.execute(
      "SELECT * FROM users WHERE username = ? ALLOW FILTERING",
      [email],
      { prepare: true }
    );

    let user;

    if (result.rowLength === 0) {
      await client.execute(
        `INSERT INTO users (id, username, email, full_name, password, created_at)
         VALUES (?, ?, ?, ?, ?, toTimestamp(now()))`,
        [uuidv4(), email, email, name, ""],
        { prepare: true }
      );

      user = {
        username: email,
        full_name: name,
      };
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign(
      {
        username: user.username,
        fullName: user.full_name,
      },
      "secret_key_123",
      { expiresIn: "77777d" }
    );

    res.json({
      token,
      username: user.username,
      fullName: user.full_name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
module.exports = { register, login, googleLogin,verifyEmail };
