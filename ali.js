// server.js
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv'); // For loading environment variables

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 by default

// Middleware to parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON bodies (if you were sending JSON)
app.use(express.json());

// Serve static files (your index.html, CSS, JS, images)
// Assuming index.html is in the same directory as server.js
app.use(express.static(path.join(__dirname, 'public')));
// If your index.html is directly in the root of 'ma_tailor_node_app', use:
// app.use(express.static(__dirname));

// --- Email Configuration (using environment variables) ---
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const SENDER_PASSWORD = process.env.SENDER_PASSWORD;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

// Create a Nodemailer transporter using SMTP for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD
    }
});

// Route to serve your index.html
// This will serve the index.html from the 'public' directory
// If you place index.html directly in the root of 'ma_tailor_node_app', you can uncomment the line below
// and modify app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
    // Or if index.html is in the root:
    // res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle form submissions
app.post('/submit', async (req, res) => {
    const { name, email, message } = req.body;

    // Simple validation
    if (!name || !email || !message) {
        console.error('All fields are required for submission.');
        // Instead of using Flask's flash, you'd handle UI feedback on the client-side
        // or redirect with query parameters for a simple message.
        return res.redirect('/?status=error&message=All fields are required!');
    }

    // Email content
    const mailOptions = {
        from: SENDER_EMAIL,
        to: RECIPIENT_EMAIL, // Your recipient email
        subject: 'New Contact Form Submission - Ma Tailor (Node.js)',
        html: `
            <p>New contact form submission from your Ma Tailor website!</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        // Redirect with success message
        res.redirect('/?status=success&message=Your message has been sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        // Redirect with error message
        res.redirect('/?status=error&message=Failed to send message. Please try again later.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
