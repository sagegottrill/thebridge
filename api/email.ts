import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // CORS configuration
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: '"Daniel @ The Bridge" <danielnicholasdibal@gmail.com>',
            to: email,
            subject: 'Quick question before I send your access',
            text: `Hi there,

You are on the list for The Bridge.

I’m manually rolling out access to the first 50 people today. I want to make sure the version I send you works perfectly with your setup.

Quick question: Which browser do you use?

Chrome

Brave

Edge

Arc

Just reply with the name.

As soon as I see your reply, I’ll tag your email for the next drop.

Talk soon,

Daniel Founder @ The Bridge`,
            html: `<p>Hi there,</p>
<p>You are on the list for The Bridge.</p>
<p>I’m manually rolling out access to the first 50 people today. I want to make sure the version I send you works perfectly with your setup.</p>
<p><strong>Quick question: Which browser do you use?</strong></p>
<ul>
<li>Chrome</li>
<li>Brave</li>
<li>Edge</li>
<li>Arc</li>
</ul>
<p>Just reply with the name.</p>
<p>As soon as I see your reply, I’ll tag your email for the next drop.</p>
<p>Talk soon,</p>
<p>Daniel<br>Founder @ The Bridge</p>`
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Email sent successfully' });
    } catch (error: any) {
        console.error('Email error:', error);
        return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
}
