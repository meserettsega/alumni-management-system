import express from "express";
import axios from "axios";
import con from "../utils/db.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"; // Updated import for nodemailer
// import sendEmail from "../utils/mailer.js";
import dotenv from "dotenv";
import { getAlumnusDetailsById } from "../utils/dbconnection.js";
dotenv.config(); // Load environment variables

const router = express.Router();
const CHAPA_SECRET_KEY = 'CHASECK_TEST-v9YpfCU6akh0cYgRQ6tELGYupMd30s2t';

let users = []; // Simulated database

const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        // Check if the email exists in the database
        const sql = `SELECT id FROM users WHERE email = ?`;
        con.query(sql, [email], async (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Database error.' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Email not found.' });
            }

            const userId = result[0].id;

            // Generate a password reset token
            const resetToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
                  // Save the reset token in the database
                  const updateSql = `UPDATE users SET reset_token = ? WHERE id = ?`;
                  con.query(updateSql, [resetToken, userId], (err) => {
                      if (err) {
                          console.error('Error saving reset token:', err);
                          return res.status(500).json({ message: 'Failed to save reset token.' });
                      }
      
                      // Send the reset token via email
                      const mailOptions = {
                          from: process.env.EMAIL_USER,
                          to: email,
                          subject: 'Password Reset Request',
                          html: `
                              <p>You requested a password reset. Click the link below to reset your password:</p>
                              <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
                              <p>This link will expire in 1 hour.</p>
                          `,
                      };
      
                      transporter.sendMail(mailOptions, (err, info) => {
                          if (err) {
                              console.error('Error sending email:', err);
                              return res.status(500).json({ message: 'Failed to send email.' });
                          }
      
                          res.status(200).json({ message: 'Password reset email sent successfully.' });
                      });
                    });
                });
            } catch (error) {
                console.error('Error in /forgot-password:', error);
                res.status(500).json({ message: 'An error occurred. Please try again.' });
            }
        });

        router.post('/reset-password', async (req, res) => {
            const { token, newPassword } = req.body;
        
            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required.' });
            }
        
            try {
                // Verify the reset token
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        console.error('Invalid or expired token:', err);
                        return res.status(400).json({ message: 'Invalid or expired token.' });
                    }
        
                    const userId = decoded.id;
                          // Hash the new password
            const hashedPassword = bcrypt.hashSync(newPassword, 10);

            // Update the user's password and clear the reset token
            const updateSql = `UPDATE users SET password = ?, reset_token = NULL WHERE id = ?`;
            con.query(updateSql, [hashedPassword, userId], (err) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ message: 'Failed to update password.' });
                }

                res.status(200).json({ message: 'Password reset successfully.' });
            });
        });
    } catch (error) {
        console.error('Error in /reset-password:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});
        

router.get('/api/alumni_stats', async (req, res) => {
    try {
        const totalAlumni = await new Promise((resolve, reject) => {
            con.query('SELECT COUNT(*) AS total FROM alumnus_bio', (err, result) => {
                if (err) reject(err);
                else resolve(result[0].total);
            });
        });

        const activeAlumni = await new Promise((resolve, reject) => {
            con.query("SELECT COUNT(*) AS active FROM alumnus_bio WHERE status = 'active'", (err, result) => {
                if (err) reject(err);
                else resolve(result[0].active);
            });
        });

        const inactiveAlumni = await new Promise((resolve, reject) => {
            con.query("SELECT COUNT(*) AS inactive FROM alumnus_bio WHERE status = 'inactive'", (err, result) => {
                if (err) reject(err);
                else resolve(result[0].inactive);
            });
        });

        res.json({
            total: totalAlumni,
            active: activeAlumni,
            inactive: inactiveAlumni
        });
    } catch (err) {
        console.error("Error fetching alumni stats:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'Public/Images');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     }
// });
// const upload = multer({ storage: storage });
// Multer storage configuration for avatar
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Avatar');
    },
    filename: (req, file, cb) => {
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const avatarUpload = multer({ storage: avatarStorage });

router.put('/upaccount', avatarUpload.single('image'), async (req, res) => {
    console.log('Received request to update account'); // Debugging log
    try {
        const { name, connected_to, course_id, email, gender, batch, password, alumnus_id, user_id } = req.body;
        console.log('Request body:', req.body); // Debugging log
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        // Update alumnus_bio table
        const asql = 'UPDATE alumnus_bio SET name = ?, connected_to = ?, course_id = ?, email = ?, gender = ?, batch = ? WHERE id = ?';
        const avalues = [name, connected_to, course_id, email, gender, batch, alumnus_id];
        con.query(asql, avalues, (err, result) => {
            if (err) {
                console.error('Error updating alumnus_bio:', err);
                res.status(500).json({ error: 'An error occurred' });
                return;
            }

            if (req.file) {
                const avsql = 'UPDATE alumnus_bio SET avatar = ? WHERE id = ?';
                const avvalues = [req.file.path, alumnus_id];
                con.query(avsql, avvalues, (err, result) => {
                    if (err) {
                        console.error('Error updating avatar:', err);
                        return;
                    }
                });
            }
            const usql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
            const uvalues = [name, email, user_id];
            con.query(usql, uvalues, (err, result) => {
                if (err) {
                    console.error('Error updating users:', err);
                    res.status(500).json({ error: 'An error occurred' });
                    return;
                }
                if (hashedPassword) {
                    const psql = 'UPDATE users SET password = ? WHERE id = ?';
                    const pvalues = [hashedPassword, user_id];
                    con.query(psql, pvalues, (err, result) => {
                        if (err) {
                            console.error('Error updating password:', err);
                            res.status(500).json({ error: 'An error occurred' });
                            return;
                        }
                        res.json({ message: 'Account updated successfully' });
                    });
                } else {
                    res.json({ message: 'Account updated successfully' });
                }
            });
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

router.get('/alumni_stats', async (req, res) => {
    try {
        const totalAlumni = await new Promise((resolve, reject) => {
            con.query('SELECT COUNT(*) AS total FROM alumnus_bio', (err, result) => {
                if (err) reject(err);
                else resolve(result[0].total);
            });
        });

        const activeAlumni = await new Promise((resolve, reject) => {
            con.query("SELECT COUNT(*) AS active FROM alumnus_bio WHERE statu = 'active'", (err, result) => {
                if (err) reject(err);
                else resolve(result[0].active);
            });
        });

        const inactiveAlumni = await new Promise((resolve, reject) => {
            con.query("SELECT COUNT(*) AS inactive FROM alumnus_bio WHERE statu = 'inactive'", (err, result) => {
                if (err) reject(err);
                else resolve(result[0].inactive);
            });
        });

        console.log({ total: totalAlumni, active: activeAlumni, inactive: inactiveAlumni }); // Debugging
        res.json({
            total: totalAlumni,
            active: activeAlumni,
            inactive: inactiveAlumni
        });
    } catch (err) {
        console.error("Error fetching alumni stats:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Admin credentials from .env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminId = process.env.ADMIN_ID;
    const jwtSecret = process.env.JWT_SECRET;

    // Admin Login Check
    if (email === adminEmail && password === adminPassword) {
        const token = jwt.sign({ role: 'admin', email }, jwtSecret, { expiresIn: "1d" });
        res.cookie('token', token);

        return res.json({
            loginStatus: true,
            userType: 'admin',
            userId: adminId,
            userName: 'Admin',
            email: adminEmail,
            alumnus_id: null,
            isVerified: true
        });
    }

    // Regular user login
    const sql = `
        SELECT u.*, a.status as isVerified, a.isActive
        FROM users u
        LEFT JOIN alumnus_bio a ON u.alumnus_id = a.id
        WHERE u.email = ?`;

    con.query(sql, [email], (err, result) => {
        if (err) return res.json({ loginStatus: false, Error: "Query Error" });

        if (result.length > 0) {
            bcrypt.compare(password, result[0].password, (bcryptErr, bcryptResult) => {
                if (bcryptErr) return res.json({ loginStatus: false, Error: "Bcrypt Error" });

                if (bcryptResult) {
                    if (result[0].isActive === 0) {
                        return res.json({ loginStatus: false, Error: "Your account has been deactivated by the admin. Please contact the admin." });
                    }

                    const token = jwt.sign({ role: result[0].type, email }, jwtSecret, { expiresIn: "1d" });
                    res.cookie('token', token);

                    return res.json({
                        loginStatus: true,
                        userType: result[0].type,
                        userId: result[0].id,
                        userName: result[0].name,
                        email: result[0].email,
                        alumnus_id: result[0].alumnus_id,
                        isVerified: result[0].isVerified
                    });
                } else {
                    return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
                }
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
        }
    });
});



router.get('/auth/alumnusdetails', (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Alumnus ID is required' });
    }

    const sql = 'SELECT * FROM alumnus_bio WHERE id = ?';
    con.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json(result);
    });
});





router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout Success' });
});

router.get("/counts", (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM forum_topics) AS forumCount,
            (SELECT COUNT(*) FROM careers) AS jobCount,
            (SELECT COUNT(*) FROM eventes) AS eventCount,
            (SELECT COUNT(*) FROM eventes WHERE schedule >= CURDATE()) AS upeventCount,
            (SELECT COUNT(*) FROM alumnus_bio) AS alumniCount;
    `;

    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }

        // Extract counts from the result
        const counts = {
            forums: result[0].forumCount,
            jobs: result[0].jobCount,
            events: result[0].eventCount,
            upevents: result[0].upeventCount,
            alumni: result[0].alumniCount
        };

        // Send the counts to the client
        res.json(counts);
    });
});

router.get('/jobs', (req, res) => {
    // const sql = `
    //     SELECT c.*, u.name
    //     FROM careers c
    //     INNER JOIN users u ON u.id = c.user_id
    //     ORDER BY c.id DESC
    // `;
    const sql = `
    SELECT careers.*, users.name
    FROM careers
    INNER JOIN users ON careers.user_id = users.id
    WHERE careers.status = 'approved' OR careers.status = 'no need approve'
    ORDER BY careers.id DESC       
    `;

    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Query Error' });
        }
        // Send the fetched job data to the client
        res.json(result);
    });
});


router.post('/managejob', (req, res) => {
    const { company, job_title, location, description, user_id, status } = req.body;
    // Use the provided status, default to 'pending' if not set
    const jobStatus = status || 'pending';
    // Always set status to 'pending' on creation
    const sql = 'INSERT INTO careers (company, job_title, location, description, user_id, status) VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, [company, job_title, location, description, user_id, jobStatus], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json({ message: 'Job submitted and pending admin approval.', jobId: result.insertId });
    });
});
// 2. Admin approves a job (set status to 'approved')

router.post('/jobs/approve/:id', (req, res) => {
    const jobId = req.params.id;
    const sql = 'UPDATE careers SET status = ? WHERE id = ?';
    con.query(sql, ['approved', jobId], (err, result) => {
        if (err) {
            console.error('Error approving job:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json({ message: 'Job approved successfully.' });
    });
});

router.get('/jobs/all', (req, res) => {
    const sql = `
        SELECT careers.*, users.name 
        FROM careers 
        LEFT JOIN users ON careers.user_id = users.id 
        ORDER BY careers.id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Query Error' });
        }

        // Fallback: if name is NULL, label it "Admin"
        const resultWithNameFallback = result.map(job => ({
            ...job,
            name: job.name || 'Admin'
        }));

        res.json(resultWithNameFallback);
    });
});


router.get('/jobs/myjobs/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT careers.*, users.name 
        FROM careers 
        INNER JOIN users ON careers.user_id = users.id 
        WHERE careers.user_id = ?
        ORDER BY careers.id DESC
    `;
    con.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Query Error' });
        }
        res.json(result);
    });
});

router.delete('/jobs/:id', (req, res) => {
    const jid = req.params.id;
    const sql = 'DELETE FROM careers WHERE id= ?';
    con.query(sql, [jid], (err, result) => {
        if (err) { return res.json({ Error: "Query Error" }) }
        return res.json({ message: 'Job deleted successfully' });
    });
});

router.put('/managejob', (req, res) => {
    const { id, company, job_title, location, description, status, user_type } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Invalid Request: No ID provided for update' });
    }

    // Determine the correct status
    const updateStatus = (user_type === 'admin') ? status : undefined;

    const baseFields = [company, job_title, location, description];
    const sqlFields = updateStatus !== undefined
        ? [...baseFields, updateStatus, id]
        : [...baseFields, id];

    const sql = updateStatus !== undefined
        ? 'UPDATE careers SET company=?, job_title=?, location=?, description=?, status=? WHERE id=?'
        : 'UPDATE careers SET company=?, job_title=?, location=?, description=? WHERE id=?';

    con.query(sql, sqlFields, (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json({ message: 'Job updated successfully' });
    });
});

router.delete('/jobs/:id', (req, res) => {
    const jid = req.params.id;

    const sql = 'DELETE FROM careers WHERE id= ?';

    con.query(sql, [req.params.id], (err, result) => {
        if (err) { return res.json({ Error: "Query Error" }) }
        return res.json({ message: 'Job deleted successfully' });
    })

});
router.get('/courses', (req, res) => {
    const sql = "SELECT * FROM courses";
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Query Error' });
        }
        return res.json(result);
    });
});

router.post('/courses', (req, res) => {
    const sql = "INSERT INTO courses(course) VALUES(?)";
    con.query(sql, [req.body.course], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Query Error' });
        }
        return res.json(result.insertId);
    });
});

router.put('/courses', (req, res) => {
    const { id, course } = req.body;
    if (id) {
        const sql = 'UPDATE courses SET course=? WHERE id=?';
        con.query(sql, [course, id], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ error: 'Query Error' });
            }
            return res.json({ message: 'Course Updated Successfully' });
        });
    } else {
        return res.status(400).json({ error: 'Invalid Request: No ID provided for update' });
    }
});


router.delete('/courses/:id', (req, res) => {
    const sql = 'DELETE FROM courses WHERE id=?';
    con.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Query Error' });
        }
        return res.json({ message: 'Course deleted successfully' });
    });
});
// router.post("/courses", (req, res) => {
//     const sql = "INSERT INTO courses(course) VALUES(?)";
//     con.query(sql, [req.body.course], (err, result) => {
//         if (err) {
//             console.error('Error executing SQL query:', err);

//             return res.json({ Error: "Query Error" })
//         }
//         return res.json(result.insertId);
//     })
// })

// router.put('/courses', (req, res) => {
//     const { id, course } = req.body;
//     if (id != "") {
//         const sql = 'UPDATE courses SET course=? WHERE id=?';
//         con.query(sql, [course, id], (err, result) => {
//             if (err) {
//                 console.error('Error executing SQL query:', err);
//                 return res.status(500).json({ error: 'Database Error' });
//             }
//             return res.json({ message: 'Course Updated Successfully' });
//         });
//     } else {
//         return res.status(400).json({ error: 'Invalid Request: No ID provided for update' });
//     }
// });

// Fetch messages for a specific user
// Fetch messages for a specific user
router.get('/messages/:user_id', (req, res) => {
    const userId = req.params.user_id;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

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
    con.query(sql, [userId, userId], (err, result) => {
        if (err) {
            console.error("Error fetching messages:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(result);
    });
});

// Send a message
router.post('/messages', (req, res) => {
    const { sender_id, receiver_id, message_text } = req.body;
    if (!sender_id || !receiver_id || !message_text) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const sql = 'INSERT INTO messages (sender_id, receiver_id, message_text, sent_at) VALUES (?, ?, ?, NOW())';
    con.query(sql, [sender_id, receiver_id, message_text], (err, result) => {
        if (err) {
            console.error('Error sending message:', err);
            return res.status(500).json({ error: 'Database error.' });
        }
        return res.json({
            id: result.insertId,
            sender_id,
            receiver_id,
            message_text,
            sent_at: new Date()
        });
    });
});

// Update message status (e.g., mark as read)
// router.put("/edit_message/:id", (req, res) => {
//     const { status } = req.body;
//     const messageId = req.params.id;

//     // Validate the status parameter
//     if (!status) {
//         return res.status(400).json({ error: "Status is required" });
//     }

//     const sql = "UPDATE messages SET status=? WHERE id=?";
//     con.query(sql, [status, messageId], (err, result) => {
//         if (err) {
//             console.error("Error executing SQL query:", err);
//             return res.status(500).json({ error: "Query Error" });
//         }
//         return res.json({ message: "Message Status Updated Successfully" });
//     });
// });


// Delete a message
// router.delete("/messages/:id", (req, res) => {
//     const messageId = req.params.id;

//     const sql = "DELETE FROM messages WHERE id=?";
//     con.query(sql, [messageId], (err, result) => {
//         if (err) {
//             console.error("Error executing SQL query:", err);
//             return res.status(500).json({ error: "Query Error" });
//         }
//         return res.json({ message: "Message Deleted Successfully" });
//     });
// });


router.put('/edit_message/:id', async (req, res) => {
    const { id } = req.params;
    const { message_text } = req.body;

    try {
        await con.query('UPDATE messages SET message_text = ? WHERE id = ?', [message_text, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to edit message:', err);
        res.status(500).json({ error: 'Failed to edit message' });
    }
});
// Delete a message
router.delete('/delete_message/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await con.query('DELETE FROM messages WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Failed to delete message:', err);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});


router.get('/events', (req, res) => {
    const sql = 'SELECT * FROM eventes'; // This will include createdBy if the column exists
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            res.status(500).json({ error: 'An error occurred' });
            return;
        }
        res.json(results);
    });
});


// router.get('/events', (req, res) => {
//     const sql = 'SELECT * FROM eventes';
//     con.query(sql, (err, results) => {
//         if (err) {
//             console.error('Error fetching events:', err);
//             res.status(500).json({ error: 'An error occurred' });
//             return;
//         }
//         res.json(results);
//     });
// });

router.post('/events', avatarUpload.single('image'), async (req, res) => {
    const { title, schedule, content, location, host, createdBy } = req.body; // <-- add createdBy
    const sql = 'INSERT INTO eventes (title, schedule, content, location, host, createdBy) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [title, schedule, content, location, host, createdBy];
    con.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error creating event:', err);
            res.status(500).json({ error: 'An error occurred' });
            return;
        }
        res.json({ message: 'Event created successfully' });
    });
});



// router.post("/events", (req, res) => {
//     const { title, content, schedule } = req.body;
//     const sql = 'INSERT INTO eventes (title, schedule, content, location, host) VALUES (?, ?, ?, ?, ?)';
//     con.query(sql, [title, content, schedule], (err, result) => {
//         if (err) {
//             console.error("Error executing SQL query:", err);
//             return res.status(500).json({ error: "Query Error" });
//         }
//         return res.json({ message: "Event Added Successfully" });
//     });
// });

router.put("/events", (req, res) => {
    const { id, title, content, schedule, location, host } = req.body;
    if (id) {
        const sql = "UPDATE eventes SET title=?, schedule=?, content=?, location=?, host=? WHERE id=?";
        con.query(sql, [title, schedule, content, location, host, id], (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                return res.status(500).json({ error: "Query Error" });
            }
            return res.json({ message: "Event Updated Successfully" });
        });
    } else {
        return res.status(400).json({ error: "No event ID provided" });
    }
});

router.delete("/events/:id", (req, res) => {
    const eid = req.params.id;
    const sql = 'DELETE FROM eventes WHERE id=?';
    con.query(sql, [eid], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json({ message: 'Event Deleted Successfully' });
    })
})

router.post("/events/participate", (req, res) => {
    const { event_id, user_id } = req.body;
    const sql = "INSERT INTO event_commits (event_id,user_id) VALUES (?, ?)";
    con.query(sql, [event_id, user_id], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json({ message: "Participated" });
    });
});
router.post("/eventcommits/check", (req, res) => {
    const { event_id, user_id } = req.body;
    const sql = "SELECT * FROM event_commits where event_id=? AND user_id=?";
    con.query(sql, [event_id, user_id], (err, result) => {
        if (err) return res.json({ eventCommit: false, Error: "Query Error" })
        if (result.length > 0) {
            return res.json({ eventCommit: true })
        } else {
            return res.json({ eventCommit: false })
        }
    });
});

router.get("/forums", (req, res) => {
    const sql = `
        SELECT forum_topics.*, 
               COUNT(forum_comments.id) AS comments_count, 
               forum_topics.user_id AS created_by,
               users.name AS creator_name
        FROM forum_topics 
        LEFT JOIN forum_comments ON forum_topics.id = forum_comments.topic_id 
        LEFT JOIN users ON forum_topics.user_id = users.id 
        GROUP BY forum_topics.id 
        ORDER BY forum_topics.id DESC
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json(result);
    });
});
// Delete a forum topic
router.delete("/forum/:id", (req, res) => {
    const eid = req.params.id;
    const sql = 'DELETE FROM forum_topics WHERE id=?';
    con.query(sql, [eid], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json({ message: 'Forum Deleted Successfully' });
    });
});

router.post("/topiccomments", (req, res) => {
    const { topic_id } = req.body;
    // const sql = "SELECT * FROM forum_comments WHERE topic_id = ?";
    const sql = "SELECT forum_comments.*, users.name AS name FROM forum_comments LEFT JOIN users ON forum_comments.user_id = users.id WHERE topic_id = ?";
    con.query(sql, [topic_id], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json(result);
    });
});

router.put("/view_forum/:id", (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    if (id) {
        const sql = "UPDATE forum_comments SET comment=? WHERE id=?";
        con.query(sql, [comment, id], (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                return res.status(500).json({ error: "Query Error" });
            }
            return res.json({ message: "Comment Updated Successfully" });
        });
    } else {
        return res.status(400).json({ error: "Invalid request" });
    }
});

router.post("/view_forum", (req, res) => {
    const { c, user_id, topic_id } = req.body;
    const sql = "INSERT INTO forum_comments (topic_id, comment, user_id) VALUES (?, ?, ?)";
    con.query(sql, [topic_id, c, user_id], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json(result);
    });
});


router.delete('/view_forum/:id', (req, res) => {
    // const cid = req.params.id;
    const sql = 'DELETE FROM forum_comments WHERE id= ?';
    con.query(sql, [req.params.id], (err, result) => {
        if (err) { return res.json({ Error: "Query Error" }) }
        return res.json({ message: 'Comment deleted successfully' });
    })
});


router.post('/manageforum', (req, res) => {
    const { title, user_id, description } = req.body;

    if (!title || !user_id || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = 'INSERT INTO forum_topics (title, user_id, description) VALUES (?, ?, ?)';
    con.query(sql, [title, user_id, description], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json({ message: 'New Forum added successfully', forumId: result.insertId });
    });
});

router.put('/manageforum', (req, res) => {
    const { id, title, user_id, description } = req.body;

    if (!id || !title || !user_id || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const sql = 'UPDATE forum_topics SET title=?, description=? WHERE id=? AND user_id=?';
    con.query(sql, [title, description, id, user_id], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json({ message: 'Forum updated successfully' });
    });
});

router.get("/users", (req, res) => {
    const sql = "SELECT * FROM users order by name asc";
    con.query(sql, (err, result) => {
        if (err) return res.json({ eventCommit: false, Error: "Query Error" })
        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.json({ message: "No User Available" })
        }
    });
});


// router.post('/manageuser', (req, res) => {
//     const { name, email, password } = req.body;

//     const sql = 'INSERT INTO forum_topics (name, email, password) VALUES (?, ?, ?)';
//     con.query(sql, [title, userId, description], (err, result) => {
//         if (err) {
//             console.error('Error executing SQL query:', err);
//             return res.status(500).json({ error: 'Database Error' });
//         }
//         return res.json({ message: 'New Forum added successfully', jobId: result.insertId });
//     });
// });

// Add a new user (admin)
router.post('/adduser', async (req, res) => {
    const { name, email, password, type, currentUser } = req.body;

    // Super admin credentials
    const superAdmin = {
        id: "admin123",
        email: "admin@gmail.com"
    };

    // Debugging logs
    console.log("Received request to add user:", req.body);
    console.log("Current User in Backend:", currentUser);

    // Check if the logged-in user is the super admin
    if (!currentUser || currentUser.id !== superAdmin.id ) {
        console.error("Unauthorized access attempt by:", currentUser);
        return res.status(403).json({ error: 'Only the super admin can add sub-admins.' });
    }

    // Validate input
    if (!name || !email || !password || type !== 'admin') {
        console.error("Invalid input:", { name, email, password, type });
        return res.status(400).json({ error: 'Invalid input. Name, email, password, and type (admin) are required.' });
    }

    // Check if the email already exists
    const checkEmailQuery = `SELECT id FROM users WHERE email = ?`;
    con.query(checkEmailQuery, [email], async (err, result) => {
        if (err) {
            console.error("Error checking email:", err);
            return res.status(500).json({ error: 'Database error.' });
        }

        if (result.length > 0) {
            console.error("Email already exists:", email);
            return res.status(400).json({ error: 'Email already exists.' });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new admin user into the database
        const insertUserQuery = `
            INSERT INTO users (name, email, password, type)
            VALUES (?, ?, ?, ?)
        `;
        con.query(insertUserQuery, [name, email, hashedPassword, type], (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: 'Failed to add user.' });
            }

            console.log("Admin user added successfully:", result);
            return res.status(201).json({ message: 'Admin user added successfully.' });
        });
    });
});

// Fetch all users
router.get('/auth/users', (req, res) => {
    const sql = "SELECT * FROM users ORDER BY name ASC";
    con.query(sql, (err, result) => {
        if (err) {
            console.error("Error fetching users:", err);
            return res.status(500).json({ error: 'Database error.' });
        }
        return res.json(result);
    });
});


// router.post('/manageuser', async (req, res) => {
//     const { id, name, email, password, type } = req.body;

//     // Validate input
//     if (!id || !name || !email || !type) {
//         return res.status(400).json({ error: 'All fields are required.' });
//     }

//     // Check if the password has been updated
//     let hashedPassword = password;
//     if (!password.startsWith('$2b$')) { // Check if the password is already hashed
//         hashedPassword = await bcrypt.hash(password, 10);
//     }

//     // Update user in the database
//     const updateUserQuery = `
//         UPDATE users
//         SET name = ?, email = ?, password = ?, type = ?
//         WHERE id = ?
//     `;
//     con.query(updateUserQuery, [name, email, hashedPassword, type, id], (err, result) => {
//         if (err) {
//             console.error("Error updating user:", err);
//             return res.status(500).json({ error: 'Failed to update user.' });
//         }

//         return res.status(200).json({ message: 'User updated successfully.' });
//     });
// });

router.put('/manageuser', async (req, res) => {
    try {

        const { name, email, id, password, type } = req.body;
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        if (id) {
            const sql = 'UPDATE users SET name=?, email=?,type=? WHERE id=?';
            con.query(sql, [name, email, type, id], (err, result) => {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    return res.status(500).json({ error: 'Database Error' });
                }
                if (hashedPassword) {
                    const psql = 'UPDATE users SET password = ? WHERE id =?';
                    const pvalues = [hashedPassword, id];
                    con.query(psql, pvalues, (err, result) => {
                        if (err) {
                            console.error('Error updating password:', err);
                            res.status(500).json({ error: 'An error occurred' });
                            return;
                        }
                        res.json({ message: 'User updated successfully' });
                    });
                } else {
                    res.json({ message: 'User updated successfully' });
                }
            });
        } else {
            return res.status(400).json({ error: 'Invalid Request: No ID provided for update' });
        }

    } catch (error) {
        console.error('Error updating User:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

router.delete('/user/:id', (req, res) => {
    const searchsql = 'Select alumnus_id from users where id=?'
    con.query(searchsql, [req.params.id], (serr, sresult) => {
        if (serr) { return res.json({ Error: "Query Error" }) }
        if (sresult[0].alumnus_id !== 0) {
            const asql = 'DELETE FROM alumnus_bio WHERE id=?';
            con.query(asql, [sresult[0].alumnus_id], (aerr, aresult) => {
                if (aerr) {
                    console.error("Error executing SQL query:", aerr);
                }
            })
        }

        const usql = 'DELETE FROM users WHERE id= ?';
        con.query(usql, [req.params.id], (uerr, uresult) => {
            if (uerr) { return res.json({ Error: "Query Error" }) }
            return res.json({ message: 'User deleted successfully' });
        })

    })

});
router.post('/donations', async (req, res) => {
    try {
        const {
            name, email, phone, graduationYear,
            department, amount
        } = req.body;

        const [first_name, ...rest] = name.split(' ');
        const last_name = rest.join(' ') || 'Alumni';

        const tx_ref = 'tx-' + Date.now();

        const chapaRes = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
    amount,
    currency: 'ETB',
    email,
    first_name,
    last_name,
    phone_number: phone,
    tx_ref,
    callback_url: 'http://localhost:5173/payment-success',
    return_url: 'http://localhost:5173/payment-success',
    customization: {
        title: 'Alumni Donate',
        description: `Donation by ${first_name}`,
        logo: 'https://seeklogo.com/images/A/alumni-logo-8B6B7B2B3B-seeklogo.com.png',
    },
    metadata: {
        graduationYear,
        department,
        name,
        phone
    }
}, {
    headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
});
        const checkoutUrl = chapaRes.data?.data?.checkout_url;

        if (!checkoutUrl) {
            return res.status(400).json({ error: 'Failed to get Chapa checkout link' });
        }

        // Optionally store the donor in your database here

        return res.json({ checkoutUrl });

    } catch (error) {
        console.error('Chapa error:', error?.response?.data || error.message);
        return res.status(500).json({ error: 'Payment initialization failed' });
    }
});

const CHAPA_WEBHOOK_SECRET = '43eVVtyVE42YcKPfskhCZO7Z';

router.post('/chapa/webhook', express.json(), (req, res) => {
    const signature = req.headers['chapa-signature'];
    if (!signature || signature !== CHAPA_WEBHOOK_SECRET) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('✅ Webhook received:', req.body);
    const data = req.body;

    // Handle only successful payments
    if (data.event === 'charge.success' && data.status === 'success') {
        const name = `${data.first_name} ${data.last_name}`;
        const email = data.email;
        const phone = data.mobile || '';
        const graduationYear = ''; // Chapa doesn't send this; you can add it through metadata in frontend
        const department = '';     // Same here
        const amount = data.amount;
        const tx_ref = data.tx_ref;

        const sql = `
            INSERT INTO donations 
            (name, email, phone, graduationYear, department, amount, tx_ref) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        con.query(sql, [
            name, email, phone, graduationYear, department, amount, tx_ref
        ], (err, result) => {
            if (err) {
                console.error('❌ DB insert error:', err);
                return res.status(500).json({ error: 'DB insert failed' });
            }
            console.log('✅ Donation added:', result.insertId);
            return res.json({ message: 'Donation added successfully', id: result.insertId });
        });
    } else {
        res.status(200).json({ message: 'Event ignored' });
    }
});

// router.post('/donations', (req, res) => {
//     const { name, email, phone, graduationYear, department, amount, paymentMethod, accountNumber, telebirrPhoneNumber } = req.body;

//     const sql = 'INSERT INTO donations (name, email, phone, graduationYear, department, amount, paymentMethod, accountNumber, telebirrPhoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
//     con.query(sql, [name, email, phone, graduationYear, department, amount, paymentMethod, accountNumber, telebirrPhoneNumber], (err, result) => {
//         if (err) {
//             console.error('Error inserting into donations:', err);
//             return res.status(500).json({ error: 'An error occurred' });
//         }
//         const insertedId = result.insertId;
//         return res.json({ message: 'Donation added successfully', id: insertedId });
//     });
// });

router.put('/donations/:id', (req, res) => {
    const id = req.params.id;
    const { name, email, phone, graduationYear, department, amount, paymentMethod, accountNumber, telebirrPhoneNumber } = req.body;

    const sql = 'UPDATE donations SET name = ?, email = ?, phone = ?, graduationYear = ?, department = ?, amount = ?, paymentMethod = ?, accountNumber = ?, telebirrPhoneNumber = ? WHERE id = ?';
    con.query(sql, [name, email, phone, graduationYear, department, amount, paymentMethod, accountNumber, telebirrPhoneNumber, id], (err, result) => {
        if (err) {
            console.error('Error updating donation:', err);
            return res.status(500).json({ error: 'An error occurred' });
        }
        return res.json({ message: 'Donation updated successfully' });
    });
});



router.get("/alumni", (req, res) => {
    const sql = "SELECT a.*,c.course,a.name as name from alumnus_bio a inner join courses c on c.id = a.course_id order by a.name asc";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Error: "Query Error" })
        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.json({ message: "No Data Available" })
        }
    });
});

router.delete("/alumni/:id", (req, res) => {
    const eid = req.params.id;
    const sql = 'DELETE FROM alumnus_bio WHERE id=?';
    con.query(sql, [eid], (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return res.status(500).json({ error: "Query Error" });
        }
        return res.json({ message: 'Alumnus Deleted Successfully' });
    })

})

router.put('/viewalumni', (req, res) => {
    const { status, id } = req.body;
    const sql = 'UPDATE alumnus_bio SET status=? WHERE id=?';
    con.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
        return res.json({ message: 'Status Updated Successfully' });
    });
});


router.get("/settings", (req, res) => {
    const sql = "SELECT * FROM system_settings";
    con.query(sql, (err, result) => {
        if (err) return res.json({ Error: "Query Error" })
        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.json({ message: "No Data Available" })
        }
    });
});



//frontend

router.get("/up_events", (req, res) => {
    const sql = `SELECT * FROM eventes WHERE schedule >= CURDATE() ORDER BY schedule ASC`;
    con.query(sql, (err, result) => {
        if (err){
            console.log("Database Query Error:", err);
            return res.json({Error: `DB Query Error ${err}`})
            // return res.json({ Error: "DB Query Error" , })
        } 
        if (result.length > 0) {
            return res.json(result);
        } else {
            return res.json({ message: "Still there are no upcoming Events" })
        }
    });
});

router.get("/alumni_list", (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 records per page
    const offset = (page - 1) * limit;

    const sql = `
        SELECT a.*, c.course, a.name as name
        FROM alumnus_bio a
        INNER JOIN courses c ON c.id = a.course_id
        ORDER BY a.name ASC
        LIMIT ? OFFSET ?
    `;
    con.query(sql, [parseInt(limit), parseInt(offset)], (err, result) => {
        if (err) {
            console.error("Error fetching alumni list:", err);
            return res.status(500).json({ error: "Database query failed" });
        }
        return res.json(result);
    });
});
router.get('/auth/alumnusdetails', async (req, res) => {
    const alumnusId = req.query.id;
    if (!alumnusId) {
        return res.status(400).json({ error: 'Alumnus ID is required' });
    }

    try {
        const alumnusDetails = await db.getAlumnusDetailsById(alumnusId); // Assuming you have a function to get alumnus details
        if (!alumnusDetails) {
            return res.status(404).json({ error: 'Alumnus not found' });
        }
        res.json(alumnusDetails);
    } catch (error) {
        console.error('Error fetching alumnus details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/auth/upaccount', avatarUpload.single('image'), async (req, res) => {
    console.log('Received request to update account'); // Debugging log
    try {
        const { name, connected_to, course_id, email, gender, batch, password, alumnus_id, user_id } = req.body;
        console.log('Request body:', req.body); // Debugging log
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }
        // Update alumnus_bio table
        const asql = 'UPDATE alumnus_bio SET name = ?, connected_to = ?, course_id = ?, email = ?, gender = ?, batch = ? WHERE id = ?';
        const avalues = [name, connected_to, course_id, email, gender, batch, alumnus_id];
        con.query(asql, avalues, (err, result) => {
            if (err) {
                console.error('Error updating alumnus_bio:', err);
                res.status(500).json({ error: 'An error occurred' });
                return;
            }

            // Update avatar if file is provided
            if (req.file) {
                const avsql = 'UPDATE alumnus_bio SET avatar = ? WHERE id = ?';
                const avvalues = [req.file.path, alumnus_id];
                con.query(avsql, avvalues, (err, result) => {
                    if (err) {
                        console.error('Error updating avatar:', err);
                        return;
                    }
                });
            }

            // Update users table
            const usql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
            const uvalues = [name, email, user_id];
            con.query(usql, uvalues, (err, result) => {
                if (err) {
                    console.error('Error updating users:', err);
                    res.status(500).json({ error: 'An error occurred' });
                    return;
                }
                // Update password in users table if provided
                if (hashedPassword) {
                    const psql = 'UPDATE users SET password = ? WHERE id = ?';
                    const pvalues = [hashedPassword, user_id];
                    con.query(psql, pvalues, (err, result) => {
                        if (err) {
                            console.error('Error updating password:', err);
                            res.status(500).json({ error: 'An error occurred' });
                            return;
                        }
                        res.json({ message: 'Account updated successfully' });
                    });
                } else {
                    res.json({ message: 'Account updated successfully' });
                }
            });
        });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// router.put('/upaccount', avatarUpload.single('image'), (req, res) => {
//     try {
//         // const avatar = req.file.path ;

//         const { name, connected_to, course_id, email, gender, batch, password, alumnus_id } = req.body;

//         // Update alumnus_bio table
//         const asql = 'UPDATE alumnus_bio SET name = ?, connected_to = ?, course_id = ?, email = ?, gender = ?, batch = ? WHERE id = ?';
//         const avalues = [name, connected_to, course_id, email, gender, batch, alumnus_id];
//         con.query(asql, avalues, (err, result) => {
//             if (err) {
//                 console.error('Error updating alumnus_bio:', err);
//                 res.status(500).json({ error: 'An error occurred' });
//                 return;
//             }

//             // avatr
//             if (req.file) {
//                 const avsql = 'UPDATE alumnus_bio SET avatar = ? WHERE id = ?';
//                 const avvalues = [req.file.path, alumnus_id];
//                 con.query(avsql, avvalues, (err, result) => {
//                     if (err) {
//                         console.error('Error updating pic:', err);
//                         // res.status(500).json({ error: 'pic error occurred' });
//                         return;
//                     }
//                     // res.json({ message: 'pic updated successfully' });
//                 });
//             }

//             // Update users table
//             const usql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
//             const uvalues = [name, email, alumnus_id];
//             con.query(usql, uvalues, (err, result) => {
//                 if (err) {
//                     console.error('Error updating users:', err);
//                     res.status(500).json({ error: 'An error occurred' });
//                     return;
//                 }
//                 // Update password in users table
//                 if (password) {
//                     const psql = 'UPDATE users SET password = ? WHERE id = ?';
//                     const pvalues = [password, alumnus_id];
//                     con.query(psql, pvalues, (err, result) => {
//                         if (err) {
//                             console.error('Error updating password:', err);
//                             res.status(500).json({ error: 'An error occurred' });
//                             return;
//                         }
//                         res.json({ message: 'Account updated successfully' });
//                     });
//                 } else {
//                     res.json({ message: 'Account updated successfully' });
//                 }
//             });
//         });
//     } catch (error) {
//         console.error('Error updating account:', error);
//         res.status(500).json({ error: 'An error occurred' });
//     }
// });




const getAllStudentEmails = () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT email FROM alumnus_bio";
      con.query(sql, (err, results) => {
        if (err) {
          reject(err);
        } else {
          const emails = results.map(row => row.email);
          resolve(emails);
        }
      });
    });
  };
  
//   router.post('/managejob', async (req, res) => {
//     const { company, job_title, location, description, user_id } = req.body;
//     const sql = 'INSERT INTO careers (company, job_title, location, description, user_id) VALUES (?, ?, ?, ?, ?)';
  
//     con.query(sql, [company, job_title, location, description, user_id], async (err, result) => {
//       if (err) {
//         console.error('Error executing SQL query:', err);
//         return res.status(500).json({ error: 'Database Error' });
//       }
  
//       try {
//         const emails = await getAllStudentEmails();
//         const subject = `New Job Posted: ${job_title}`;
//         const html = `A new job has been posted:<br><br>Company: ${company}<br>Title: ${job_title}<br>Location: ${location}<br>Description: ${description}`;
  
//         await Promise.all(emails.map(email => sendEmail(email, subject, html)));
  
//         return res.json({ message: 'New job added successfully and emails sent', jobId: result.insertId });
//       } catch (error) {
//         console.error('Error fetching emails or sending email:', error);
//         if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
//           return res.status(500).json({ error: 'Network Error: Unable to send emails' });
//         } else {
//           return res.status(500).json({ error: 'Error sending emails' });
//         }
//       }
//     });
//   });


//   router.post('/managejob', async (req, res) => {
//     try {
//         const newJob = new Job(req.body);
//         await newJob.save();
//         res.status(201).json({ message: 'Job created successfully', job: newJob });
//     } catch (error) {
//         console.error('Error creating job:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // Update an existing job
// router.put('/managejob', async (req, res) => {
//     try {
//         const updatedJob = await Job.findByIdAndUpdate(req.body.id, req.body, { new: true });
//         if (!updatedJob) {
//             return res.status(404).json({ message: 'Job not found' });
//         }
//         res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
//     } catch (error) {
//         console.error('Error updating job:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });
// Reset Password Endpoint
// Backend: Reset Password Endpoint
// router.post('/alumni/resetpassword', async (req, res) => {
//     try {
//         const { id, newPassword } = req.body;

//         if (!id || !newPassword) {
//             return res.status(400).json({ message: 'Alumni ID and new password are required.' });
//         }

//         // Hash the new password
//         const hashedPassword = bcrypt.hashSync(newPassword, 10);

//         // Update the password in the database
//         const sql = `
//             UPDATE alumnus_bio 
//             SET password = ? 
//             WHERE id = ?
//         `;
//         con.query(sql, [hashedPassword, id], (err, result) => {
//             if (err) {
//                 console.error('Error resetting password:', err);
//                 return res.status(500).json({ message: 'Database error while resetting password.' });
//             }

//             if (result.affectedRows === 0) {
//                 return res.status(404).json({ message: 'Alumni not found.' });
//             }

//             res.status(200).json({ message: 'Password reset successfully.' });
//         });
//     } catch (error) {
//         console.error('Error in /alumni/resetpassword:', error);
//         res.status(500).json({ message: 'Failed to reset password.' });
//     }
// });
  // Restrict Alumni Endpoint
// Backend: Restrict Alumni Endpoint
router.patch('/alumni/restrict/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Alumni ID is required.' });
        }

        // Update the alumni's status to "Not Verified"
        const sql = `
            UPDATE alumnus_bio 
            SET status = 0 
            WHERE id = ?
        `;
        con.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error restricting alumni:', err);
                return res.status(500).json({ message: 'Database error while restricting alumni.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Alumni not found.' });
            }

            res.status(200).json({ message: 'Alumni restricted successfully.' });
        });
    } catch (error) {
        console.error('Error in /alumni/restrict/:id:', error);
        res.status(500).json({ message: 'Failed to restrict alumni.' });
    }
});
// Reset Password for Users
router.post('/alumni/resetpassword', async (req, res) => {
    try {
        const { id, newPassword } = req.body;

        if (!id || !newPassword) {
            return res.status(400).json({ message: 'User ID and new password are required.' });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update the password in the users table
        const sql = `
            UPDATE users 
            SET password = ? 
            WHERE id = ?
        `;
        con.query(sql, [hashedPassword, id], (err, result) => {
            if (err) {
                console.error('Error resetting password:', err);
                return res.status(500).json({ message: 'Database error while resetting password.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(200).json({ message: 'Password reset successfully.' });
        });
    } catch (error) {
        console.error('Error in /user/resetpassword:', error);
        res.status(500).json({ message: 'Failed to reset password.' });
    }
});


// ...existing code...

// Activate/Deactivate Alumni Account
router.patch('/alumni/activation/:id', (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive === 'undefined') {
        return res.status(400).json({ message: 'isActive value is required.' });
    }

    const sql = 'UPDATE alumnus_bio SET isActive = ? WHERE id = ?';
    con.query(sql, [isActive, id], (err, result) => {
        if (err) {
            console.error('Error updating activation status:', err);
            return res.status(500).json({ message: 'Database error while updating activation status.' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Alumni not found.' });
        }
        res.status(200).json({ message: isActive ? 'Alumni activated successfully.' : 'Alumni deactivated successfully.' });
    });
});

// ...existing code...

// router.post('/forgot-password', async (req, res) => {
//     const { email } = req.body;

//     if (!email) {
//         return res.status(400).json({ message: 'Email is required.' });
//     }

//     try {
//         // Check if the email exists in the database
//         const sql = `SELECT id FROM users WHERE email = ?`;
//         con.query(sql, [email], async (err, result) => {
//             if (err) {
//                 console.error('Database error:', err);
//                 return res.status(500).json({ message: 'Database error.' });
//             }

//             if (result.length === 0) {
//                 return res.status(404).json({ message: 'Email not found.' });
//             }

//             const userId = result[0].id;

//             // Generate a password reset token (e.g., a random string or JWT)
//             const resetToken = Math.random().toString(36).substr(2);

//             // Save the reset token in the database (optional: add an expiration time)
//             const updateSql = `UPDATE users SET reset_token = ? WHERE id = ?`;
//             con.query(updateSql, [resetToken, userId], (err) => {
//                 if (err) {
//                     console.error('Error saving reset token:', err);
//                     return res.status(500).json({ message: 'Failed to save reset token.' });
//                 }

//                 // Send the reset token via email
//                 const transporter = nodemailer.createTransport({
//                     service: 'gmail',
//                     auth: {
//                         user: 'your-email@gmail.com', // Replace with your email
//                         pass: 'your-email-password', // Replace with your email password
//                     },
//                 });

//                 const mailOptions = {
//                     from: 'your-email@gmail.com',
//                     to: email,
//                     subject: 'Password Reset Request',
//                     html: `
//                         <p>You requested a password reset. Click the link below to reset your password:</p>
//                         <a href="http://localhost:3000/reset-password/${resetToken}">Reset Password</a>
//                     `,
//                 };

//                 transporter.sendMail(mailOptions, (err, info) => {
//                     if (err) {
//                         console.error('Error sending email:', err);
//                         return res.status(500).json({ message: 'Failed to send email.' });
//                     }

//                     res.status(200).json({ message: 'Password reset email sent successfully.' });
//                 });
//             });
//         });
//     } catch (error) {
//         console.error('Error in /forgot-password:', error);
//         res.status(500).json({ message: 'An error occurred. Please try again.' });
//     }
// });
// router.post('/reset-password', async (req, res) => {
//     const { token, newPassword } = req.body;

//     if (!token || !newPassword) {
//         return res.status(400).json({ message: 'Token and new password are required.' });
//     }

//     try {
//         // Verify the reset token
//         const sql = `SELECT id FROM users WHERE reset_token = ?`;
//         con.query(sql, [token], async (err, result) => {
//             if (err) {
//                 console.error('Database error:', err);
//                 return res.status(500).json({ message: 'Database error.' });
//             }

//             if (result.length === 0) {
//                 return res.status(400).json({ message: 'Invalid or expired token.' });
//             }

//             const userId = result[0].id;

//             // Hash the new password
//             const hashedPassword = bcrypt.hashSync(newPassword, 10);

//             // Update the user's password and clear the reset token
//             const updateSql = `UPDATE users SET password = ?, reset_token = NULL WHERE id = ?`;
//             con.query(updateSql, [hashedPassword, userId], (err) => {
//                 if (err) {
//                     console.error('Error updating password:', err);
//                     return res.status(500).json({ message: 'Failed to update password.' });
//                 }

//                 res.status(200).json({ message: 'Password reset successfully.' });
//             });
//         });
//     } catch (error) {
//         console.error('Error in /reset-password:', error);
//         res.status(500).json({ message: 'An error occurred. Please try again.' });
//     }
// });
export { router as adminRouter }
