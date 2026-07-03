# Project Setup & Architecture Guide

This project requires **Node.js** and **Webpack** to function properly. Follow the steps below to set up the database and deploy the application.

---

## Database Configuration

To run the project properly, you need to create a MySQL database and initialize the \`heroes\` table. Run the following SQL script in your MySQL instance:

```sql
CREATE TABLE heroes (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,    
    name VARCHAR(255) NOT NULL,
    attack INT NOT NULL,
    defense INT NOT NULL,
    specialSkillId VARCHAR(255) NOT NULL
);
```

## Authentication & Authorization Model

* **Password Security:** Users register with a username and password. Passwords are never stored in plain text; they are hashed using \`bcrypt\` before database insertion. Login attempts are validated by comparing the incoming password against this stored hash.
* **Traffic Encryption:** HTTPS is enforced to secure all communication and data transfer between the client and the server, preventing man-in-the-middle attacks.

## Docker Deployment

From the project root directory, run the following command:

```bash
docker compose up --build
```

## Deploying the Frontend

Frontend deployment happens with the following command: 

```bash
webpack
```

The generated `bundle.js` file and `index.html` from the templates folder are copied to the backend's public folder.