import { SMTPClient } from 'emailjs';

export const mailClient = new SMTPClient({
	user: process.env.MAIL_USER,
	password: process.env.MAIL_PASSWORD,
	host: process.env.MAIL_HOST,
	ssl: true,
	tls: false
});
