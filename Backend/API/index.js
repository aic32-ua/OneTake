var express = require('express')
var app = express()

const cors = require('cors');
app.use(cors());

var bp = require('body-parser')
app.use(bp.json())

var passwordHash = require('password-hash');

const path = require('path');
const fs = require('fs');
const amqp = require('amqplib');

const queue = 'OneTakeQueue';

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const path = "/mnt/volumen/brutos";
        if (!fs.existsSync(path)) { //Creo las carpetas si no existen
            fs.mkdirSync(path, { recursive: true });
        }

        if (!fs.existsSync("/mnt/volumen/procesados")) { 
            fs.mkdirSync("/mnt/volumen/procesados", { recursive: true });
        }

        cb(null, path);
    },
    filename: function (req, file, cb) {
        cb(null, req.params.id + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const { Sequelize, DataTypes, where } = require('sequelize');

const sequelize = new Sequelize('OneTake', 'user', '1234', {
  host: 'mysql',
  dialect: 'mysql'
});

const Usuario = sequelize.define('USUARIO', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nick: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'USUARIO',
    timestamps: false
});

const PeticionAmistad = sequelize.define('PETICION_AMISTAD', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_enviador: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id'
      }
    },
    id_receptor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id'
      }
    }
}, {
    tableName: 'PETICION_AMISTAD',
    timestamps: false
});

const RelacionAmistad = sequelize.define('RELACION_AMISTAD', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id'
      }
    },
    id_usuario2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Usuario',
        key: 'id'
      }
    }
}, {
    tableName: 'RELACION_AMISTAD',
    timestamps: false
});

app.post('/usuarios/:id/video', upload.single('video'), async function(req, res){
    await channel.sendToQueue(queue, Buffer.from(req.params.id + path.extname(req.file.originalname))); //pongo el nombre del archivo en la cola
    res.json({ message: 'Video recibido correctamente, en cola para transcodificar.'});
})

app.get('/usuarios/:id/video', async function(req, res){
    const videoPath = path.join('/mnt/volumen/procesados', req.params.id + '.mp4');
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).json({ error: 'Video no encontrado.' });
        } else {
            res.sendFile(videoPath);
        }
    });
})

app.post('/usuarios', async function(req,resp){
    usu = req.body
    if(usu.nombre && usu.email && usu.password && usu.nick){
        usuEmail = await Usuario.findOne({where: {
            email: usu.email
        }})
        usuNick = await Usuario.findOne({where: {
            nick: usu.nick
        }})
        if(usuEmail.length > 0){
            resp.status(400)
            resp.send({
                code:2,
                message: "Ya existe un usuario con ese email."
            })
        }
        else if(usuNick.length > 0){
            resp.status(400)
            resp.send({
                code:2,
                message: "Ya existe un usuario con ese nick."
            })
        }
        else{
            try{
                var creado = await Usuario.create({
                    nombre: usu.nombre,
                    email: usu.email,
                    nick: usu.nick,
                    password: usu.password
                });
                  
                resp.setHeader('Location', 'http://localhost:3000/usuarios/' + creado.id)
                resp.status(201)
                resp.send(creado)
            }
            catch(error){
                console.log(error)
            }
        }
    }
    else{
        resp.status(400)
        resp.send({
            code:1,
            message: "Faltan datos"
        })
    }
})

app.get('/usuarios/:id',async function(pet,resp) {
    id = parseInt(pet.params.id)
    if(isNaN(id)){
        resp.status(400)
        resp.send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }
    else{
        item = await Usuario.findByPk(id)
        if(!item){
            resp.status(404)
            resp.send({
                code:3,
                message: "El dato no existe"
            })
        }
        else{
            resp.status(200)
            resp.send(item)
        }
    }
})

async function setupRabbitMQ() {
    var connection = await amqp.connect('amqp://rabbitmq');
    channel = await connection.createChannel(); //variable global para poder usar la cola en los diferentes endpoints
    await channel.assertQueue(queue, { durable: true });
}

app.listen(3000, function(){
    setupRabbitMQ();
    console.log('Cola creada. Servidor arrancado')
})