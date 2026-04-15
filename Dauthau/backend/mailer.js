const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "chuthanh1310@gmail.com",
    pass: "ggbfhpmfsvfdxjni", 
  },
});

async function sendVerificationEmail(to, token) {
  const link = `http://localhost:8000/api/verify?token=${token}`;

  await transporter.sendMail({
    from: '"BidWinner" <chuthanh1310@gmail.com>',
    to,
    subject: "Xác nhận đăng ký tài khoản",
    html: `
      <h3>Xác nhận tài khoản</h3>
      <p>Click vào link bên dưới để hoàn tất đăng ký:</p>
      <a href="${link}">${link}</a>
    `,
  });
}

module.exports = { sendVerificationEmail };