import con from '../utils/db.js'; // Assuming you have a database connection module

// Function to get alumnus details by ID
export const getAlumnusDetailsById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM alumnus_bio WHERE id = ?';
        con.query(query, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results[0]);
        });
    });
};