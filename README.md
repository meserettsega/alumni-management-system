# alumni-management-system
The Alumni Management System is a web-based platform for Arba Minch University that connects alumni with the university. It enables registration, job postings, events, forums, donations, and messaging, fostering networking, professional growth, and lifelong engagement.
 # Alumni Management System for Arba Minch University CS

A web-based platform for managing alumni information, job postings, and networking for the Computer Science department at Arba Minch University.

---

## Features

- Alumni registration and profile management
- Search and filter alumni by name, department, or batch
- Job/career posting and management
- Admin dashboard for managing users and content

---

## Demo

<!-- Uncomment and update the link below when your demo is ready -->
<!-- [Live Demo](https://your-demo-link.com) -->

---

## Screenshots

<!-- Add screenshots or GIFs here -->
<!-- ![Screenshot](./screenshots/homepage.png) -->

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (for backend)

---

### 1. Clone the Repository

```sh
git clone https://github.com/meserettsega/alumni-management-system.git
cd alumni-management-system
```

---

### 2. Install Dependencies

#### For the Client

```sh
cd Alumni-client
npm install
```

#### For the Server

```sh
cd ../Alumni-server
npm install
```

---

### 3. Configure Environment Variables

- Create a `.env` file in `Alumni-server` and add your MongoDB URI and other secrets as needed.

Example:
```
MONGO_URI=mongodb://localhost:27017/alumni_db
PORT=5000
JWT_SECRET=your_jwt_secret
```

---

### 4. Run the Application

#### Start the Server

```sh
cd Alumni-server
npm start
```

#### Start the Client

Open a new terminal, then:

```sh
cd Alumni-client
npm start
```

The client will usually run at [http://localhost:3000](http://localhost:3000) and the server at [http://localhost:5000](http://localhost:5000).

---

## Usage

- Register as an alumnus/alumna
- Search for alumni by name, department, or batch
- Post and manage job opportunities (admin)
- Update your profile and connect with others

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, contact [meserettsega](https://github.com/meserettsega).
to get the document(clear SRS Document) contact me on telegram username  @meseret_tsega
