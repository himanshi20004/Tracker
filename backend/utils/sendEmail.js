const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
    const smtpUser = process.env.SMTP_EMAIL || process.env.SMTP_MAIL;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpService = process.env.SMTP_SERVICE || 'gmail';

    if (!smtpUser || !smtpPass || smtpPass === 'your_smtp_password' || smtpUser === 'your_email@gmail.com') {
        throw new Error('Email service is not configured. Please set valid SMTP_EMAIL and SMTP_PASSWORD environment variables.');
    }

    const transporter = nodeMailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        service: smtpService,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    const mailOptions = {
        from: smtpUser,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
