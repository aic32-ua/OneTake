CREATE DATABASE IF NOT EXISTS OneTake;
USE OneTake;

CREATE TABLE USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    nick VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    video BOOLEAN DEFAULT 0,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE TABLE PETICION_AMISTAD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_emisor INT NOT NULL,
    id_receptor INT NOT NULL,
    FOREIGN KEY (id_emisor) REFERENCES USUARIO(id),
    FOREIGN KEY (id_receptor) REFERENCES USUARIO(id),
    UNIQUE (id_emisor, id_receptor),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE TABLE RELACION_AMISTAD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario1 INT NOT NULL,
    id_usuario2 INT NOT NULL,
    FOREIGN KEY (id_usuario1) REFERENCES USUARIO(id),
    FOREIGN KEY (id_usuario2) REFERENCES USUARIO(id),
    UNIQUE (id_usuario1, id_usuario2),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);