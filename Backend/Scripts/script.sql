CREATE DATABASE IF NOT EXISTS OneTake;
USE OneTake;

CREATE TABLE USUARIO (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    nick VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    foto VARCHAR(50) UNIQUE,
    video BOOLEAN DEFAULT 0,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE TABLE PETICION_AMISTAD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_emisor INT NOT NULL,
    id_receptor INT NOT NULL,
    FOREIGN KEY (id_emisor) REFERENCES USUARIO(id) ON DELETE CASCADE,
    FOREIGN KEY (id_receptor) REFERENCES USUARIO(id) ON DELETE CASCADE,
    UNIQUE (id_emisor, id_receptor),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE TABLE RELACION_AMISTAD (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario1 INT NOT NULL,
    id_usuario2 INT NOT NULL,
    FOREIGN KEY (id_usuario1) REFERENCES USUARIO(id) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario2) REFERENCES USUARIO(id) ON DELETE CASCADE,
    UNIQUE (id_usuario1, id_usuario2),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

INSERT INTO USUARIO (email, nick, password, video, createdAt, updatedAt)
VALUES
('usuario1@example.com', 'ElenaGonzalez', 'contraseña1', 0, NOW(), NOW()),
('usuario2@example.com', 'DiegoHernandez', 'contraseña2', 0, NOW(), NOW()),
('usuario3@example.com', 'PedroLopez', 'contraseña3', 0, NOW(), NOW()),
('usuario4@example.com', 'GabrielaMartinez', 'contraseña4', 0, NOW(), NOW()),
('usuario5@example.com', 'EstebanRodriguez', 'contraseña5', 0, NOW(), NOW()),
('usuario6@example.com', 'MercedesSanchez', 'contraseña6', 0, NOW(), NOW()),
('usuario7@example.com', 'EmilioPerez', 'contraseña7', 0, NOW(), NOW()),
('usuario8@example.com', 'IsabelGomez', 'contraseña8', 0, NOW(), NOW()),
('usuario9@example.com', 'FelipeDiaz', 'contraseña9', 0, NOW(), NOW()),
('usuario10@example.com', 'LuciaTorres', 'contraseña10', 0, NOW(), NOW()),
('usuario11@example.com', 'EmanuelJimenez', 'contraseña11', 0, NOW(), NOW()),
('usuario12@example.com', 'RenataVazquez', 'contraseña12', 0, NOW(), NOW()),
('usuario13@example.com', 'RebecaSerrano', 'contraseña13', 0, NOW(), NOW()),
('usuario14@example.com', 'SebastianCastro', 'contraseña14', 0, NOW(), NOW()),
('usuario15@example.com', 'EmiliaRamirez', 'contraseña15', 0, NOW(), NOW()),
('alex@example.com', 'AlexIbarra', '$argon2id$v=19$m=65536,t=3,p=4$QS5phV3Cy+qBOpqlKNHp9Q$Hu5+QX80JjDKd7fx4COmFBnzhQv0pXBBsqYlR0bJv+4', 0, NOW(), NOW()),
('usuario17@example.com', 'ManuelFernandez', 'contraseña17', 0, NOW(), NOW()),
('usuario18@example.com', 'CeciliaMorales', 'contraseña18', 0, NOW(), NOW()),
('usuario19@example.com', 'EleonoraOrtega', 'contraseña19', 0, NOW(), NOW()),
('usuario20@example.com', 'EduardoNunez', 'contraseña20', 0, NOW(), NOW());

INSERT INTO RELACION_AMISTAD (id_usuario1, id_usuario2, createdAt, updatedAt)
SELECT 16, id, NOW(), NOW() FROM USUARIO WHERE id <> 16 ORDER BY RAND() LIMIT 15;

INSERT INTO PETICION_AMISTAD (id_emisor, id_receptor, createdAt, updatedAt)
SELECT id, 16, NOW(), NOW() FROM USUARIO WHERE id NOT IN (16) ORDER BY RAND() LIMIT 3;