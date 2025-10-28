import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, html }) {
  // SMTP 연결 설정
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER, // 보내는 이메일 주소
      pass: process.env.SMTP_PASS, // 앱 비밀번호
    },
  });

  const mailOptions = {
    from: `"창업가2기1팀" <${process.env.SMTP_USER}>`,
    to, // 수신자 이메일
    subject,
    html,
  };

  // 전송
  const info = await transporter.sendMail(mailOptions);
  return info;
}
