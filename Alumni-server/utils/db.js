import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();


const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // port: process.env.DB_PORT 
})
// "port: process.env.PORT" remove this line to run offline on xampp

con.connect((err) => {
    if (err) {
        console.log("Connection Error", err)
    } else {
        console.log("connected")
    }
})


export default con;