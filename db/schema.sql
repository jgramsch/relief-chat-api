CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(1024) NOT NULL,
    rut VARCHAR(15) NOT NULL UNIQUE,
    lastMessageAt TIMESTAMP -- This column is optional
);

CREATE TABLE debts (
    id SERIAL PRIMARY KEY,
    institution VARCHAR(512) NOT NULL,
    amount INT NOT NULL,
    dueDate TIMESTAMP NOT NULL,
    clientId INT REFERENCES clients(id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    role VARCHAR(10) NOT NULL CHECK (role IN ('client', 'agent')),
    sentAt TIMESTAMP NOT NULL,
    clientId INT REFERENCES clients(id)
);
