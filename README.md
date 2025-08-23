2. Install Dependencies
Client
cd Alumni-client
npm install

Server
cd ../Alumni-server
npm install

3. Configure Environment Variables

Create a .env file in Alumni-server with the following:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=alumni_db
PORT=5000
JWT_SECRET=your_jwt_secret

4. Run the Application
Start the Server
cd Alumni-server
node index.js

Start the Client

Open a new terminal:

cd Alumni-client
npm run dev


Client runs at: http://localhost:5173

Server runs at: http://localhost:5000

Usage

Alumni register (require admin verification before login)

Faculty officers register directly

Admin verifies alumni accounts

Post/manage jobs, events, forums, and donations

Alumni and faculty officers can chat via the messaging system

Contributing

Fork the repository

Create your feature branch (git checkout -b feature/YourFeature)

Commit your changes (git commit -m 'Add new feature')

Push to the branch (git push origin feature/YourFeature)

Open a Pull Request

License

This project is licensed under the MIT License.

Contact

GitHub: meserettsega

Telegram (for full SRS Document): @meseret_tsega


✅ Now your README will **display all the screenshots** from your `screenshots/` folder correctly on GitHub.  

Do you want me to also **rename your screenshot files** (remove spaces and uppercase letters) to avoid possible GitHub path issues?
