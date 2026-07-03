Create MySQL database with heroes table for the project to run properly: 

CREATE TABLE heroes (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,    
    name VARCHAR(255) NOT NULL,
    attack INT NOT NULL,
    defense INT NOT NULL,
    specialSkillId VARCHAR(255) NOT NULL
);

Authentication/authorization model design:

User has a username and password, password is stored in the database as hash with bcrypt encryption and users 
password attempt is checked against that. Using HTTPS for securing the traffic between client and server.

Docker:

In project root run command: docker compose up --build
This starts the server on docker container.


Deploying the frontend: 

Frontend is compiles by using the 'webpack' command. Then the bundle.js and index.html are copied to the public folder of the server.