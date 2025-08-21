import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import { adminRouter } from "./Routes/AdminRoutes.js";
import dotenv from "dotenv";
import mysql from "mysql";
import bodyParser from "body-parser"; 
import path from "path";
import { fileURLToPath } from "url";

const messageRouter = express.Router();

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create a MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 40,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://alumni-client.vercel.app'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));

app.use(express.json()); // Ensure this is placed before defining routes
app.use(bodyParser.json());  // Middleware for parsing JSON bodies

// Routes
app.get("/", (req, res) => {
    res.send("Hello from Alumni Server!");
});

app.use("/auth", adminRouter);


app.use('/Public', express.static('Public'));

// Fetch messages for a specific user
messageRouter.get("/:user_id", (req, res) => {
    const userId = req.params.user_id;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const sql = `
        SELECT messages.*, 
               sender.name AS sender_name, 
               receiver.name AS receiver_name 
        FROM messages 
        JOIN users AS sender ON messages.sender_id = sender.id 
        JOIN users AS receiver ON messages.receiver_id = receiver.id 
        WHERE sender_id = ? OR receiver_id = ? 
        ORDER BY sent_at DESC
    `;

    pool.query(sql, [userId, userId], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Database error" });
        }
        return res.json(result);
    });
});
app.use("/messages", messageRouter);


app.use(express.static(path.join(__dirname, "../Alumni-client/dist")));


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Alumni-client/dist', 'index.html'));
});

// Serve static files from the React app

// Fallback route to serve React app
// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../Alumni-client/dist", "index.html"));
// });

// message sending route
app.post('/messages/send', (req, res) => {
    const { sender_id, receiver_id, message_text } = req.body;

    // Check if all required fields are provided
    if (!sender_id || !receiver_id || !message_text) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate if sender and receiver exist in the database
    const validateQuery = `
        SELECT id 
        FROM users 
        WHERE alumnus_id IN (?, ?) OR id IN (?, ?)
    `;
    pool.query(validateQuery, [sender_id, receiver_id, sender_id, receiver_id], (err, result) => {
        if (err) {
            console.error("Error validating sender or receiver:", err);
            return res.status(500).json({ error: 'Database error.' });
        }

        // Check if both sender and receiver exist
        if (result.length < 2) {
            return res.status(400).json({ error: 'Sender or receiver does not exist. Please select valid users.' });
        }

        // Insert message into the database
        const insertQuery = `
            INSERT INTO messages (sender_id, receiver_id, message_text) 
            VALUES (?, ?, ?)
        `;
        pool.query(insertQuery, [sender_id, receiver_id, message_text], (err, result) => {
            if (err) {
                console.error("Error inserting message:", err);
                return res.status(500).json({ error: 'Failed to send message.' });
            }

            // Fetch the newly inserted message
            const fetchMessageQuery = `
                SELECT messages.*, 
                       sender.name AS sender_name, 
                       receiver.name AS receiver_name 
                FROM messages 
                JOIN users AS sender ON messages.sender_id = sender.id 
                JOIN users AS receiver ON messages.receiver_id = receiver.id 
                WHERE messages.id = ?
            `;
            pool.query(fetchMessageQuery, [result.insertId], (err, messageResult) => {
                if (err) {
                    console.error("Error fetching new message:", err);
                    return res.status(500).json({ error: 'Failed to fetch new message.' });
                }

                // Return the newly inserted message
                return res.status(200).json({
                    message: 'Message sent successfully.',
                    data: messageResult[0], // Return the newly inserted message
                });
            });
        });
    });
});
app.put('/messages/:id', (req, res) => {
    const { id } = req.params;
    const { message_text } = req.body;
    const sql = 'UPDATE messages SET message_text = ? WHERE id = ?';
    pool.query(sql, [message_text, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update message' });
        res.json({ message_text });
    });
});
app.delete('/messages/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM messages WHERE id = ?';
    pool.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete message' });
        res.json({ message: 'Message deleted successfully' });
    });
});
// User registration route
app.post('/auth/signup', (req, res) => {
    const { name, email, password, type, course_id } = req.body;

    console.log("Received signup request with values:", req.body); // Debugging log

    // Check if all required fields are provided
    if (!name || !email || !password || !type) {
        console.error("Missing required fields"); // Debugging log
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if the email already exists
    const checkEmailQuery = `SELECT id FROM users WHERE email = ?`;
    pool.query(checkEmailQuery, [email], (err, result) => {
        if (err) {
            console.error("Error checking email:", err); // Debugging log
            return res.status(500).json({ error: 'Database error.' });
        }
        
        if (result.length > 0) {
            console.log("Email already exists:", email); // Debugging log
            return res.status(400).json({ error: 'Email already exists.' });
        }

        // Hash the password before storing it
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Determine the value of alumnus_id
        if (type === 'alumnus') {
            // Insert user into the users table with alumnus_id initially set to NULL
            const insertUserQuery = `
                INSERT INTO users (name, email, password, type, alumnus_id)
                VALUES (?, ?, ?, ?, NULL)
            `;
            pool.query(insertUserQuery, [name, email, hashedPassword, type], (err, userResult) => {
                if (err) {
                    console.error("Error inserting user:", err); // Debugging log
                    return res.status(500).json({ error: 'Failed to sign up user.' });
                }
                
                // Update alumnus_id to match the id of the newly inserted user
                const updateAlumnusIdQuery = `
                    UPDATE users
                    SET alumnus_id = id
                    WHERE id = ?
                `;
                pool.query(updateAlumnusIdQuery, [userResult.insertId], (err) => {
                    if (err) {
                        console.error("Error updating alumnus_id:", err); // Debugging log
                        return res.status(500).json({ error: 'Failed to update alumnus_id.' });
                    }

                    // Insert user into the alumnus_bio table
                    const insertAlumnusBioQuery = `
                        INSERT INTO alumnus_bio (id, name, course_id, email)
                        VALUES (?, ?, ?, ?)
                    `;
                    pool.query(insertAlumnusBioQuery, [userResult.insertId, name, course_id, email], (err, bioResult) => {
                        if (err) {
                            console.error("Error inserting alumnus bio:", err); // Debugging log
                            return res.status(500).json({ error: 'Failed to sign up user.' });
                        }
                        console.log("User and alumnus bio inserted successfully:", bioResult); // Debugging log
                        return res.status(200).json({ signupStatus: true, message: 'Signup successful.' });
                    });
                });
            });
        } else {
            // Insert user into the users table without alumnus_id
            const insertUserQuery = `
                INSERT INTO users (name, email, password, type)
                VALUES (?, ?, ?, ?)
            `;
            pool.query(insertUserQuery, [name, email, hashedPassword, type], (err, result) => {
                if (err) {
                    console.error("Error inserting user:", err); // Debugging log
                    return res.status(500).json({ error: 'Failed to sign up user.' });
                }

                console.log("Admin user inserted successfully:", result); // Debugging log
                return res.status(200).json({ signupStatus: true, message: 'Signup successful.' });
            });
        }
    });
});
// app.get("/auth/user/:id", (req, res) => {
//     const userId = req.params.id;
//     const sql = "SELECT * FROM users WHERE id = ?";
//     pool.query(sql, [userId], (err, result) => {
//         if (err) {
//             console.error("Error fetching user:", err);
//             return res.status(500).json({ error: "Database error" });
//         }
//         if (result.length === 0) {
//             return res.status(404).json({ error: "User not found" });
//         }
//         res.json(result[0]);
//     });
// });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});