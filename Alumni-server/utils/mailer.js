// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   }
// });

// export const sendResetEmail = async (to, resetLink) => {
//   const mailOptions = {
//     from: '"Alumni Support" <no-reply@alumni.com>',
//     to,
//     subject: 'Password Reset Link',
//     html: `<p>Click the link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
//   };

//   await transporter.sendMail(mailOptions);
// };
