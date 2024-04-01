let express = require('express')
let app = express()

const cors = require('cors');
app.use(cors());

let bp = require('body-parser')
app.use(bp.json())

let passwordHash = require('password-hash');

let jwt = require('jsonwebtoken');

const secret = "123456";
const expiresIn = 3600; //1 hora

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

const { Sequelize, DataTypes, Op} = require('sequelize');

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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    nick: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    video: {
        type: DataTypes.BOOLEAN
    }
}, {
    tableName: 'USUARIO',
});

const PeticionAmistad = sequelize.define('PETICION_AMISTAD', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_emisor: {
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
});

function obtenerIdToken(token){ //algunos metodos estan disponibles para todos los usuarios pero se necesita identificar quien esta accediendo
    try{
        const decoded = jwt.verify(token,secret)
        if(!decoded){
            return {code: 1, msg: "Token invalido"};
        }
        else{
            return {code: 0, id:decoded.idToken};
        }
    }
    catch(Exception){
        if (Exception instanceof jwt.TokenExpiredError) {
            return {code: 5, msg:"Token expirado"};
        }
        return {code: 1, msg: "Token invalido"};
    }
}

function verificarToken(token, id){ //anadir que aqui se compruebe que el usuario con ese id existe para simplificar los endpoints
    try{
        const decoded = jwt.verify(token,secret)
        if(!decoded || !decoded.idToken){
            return {code: 1, msg: "Token invalido"};
        }
        else if(decoded.idToken != id){
            return {code: 4, msg:"No autorizado"};
        }
        else{
            return {code: 0}
        }
    }
    catch(Exception){
        if (Exception instanceof jwt.TokenExpiredError) {
            return {code: 5, msg:"Token expirado"};
        }
        return {code: 1, msg: "Token invalido"};
    }
}

async function verificarTokenAmigo(token, id){ //un usuario amigo tambien esta autorizado para algunas acciones
    try{
        const decoded = jwt.verify(token,secret)
        if(!decoded || !decoded.idToken){
            return {code: 1, msg: "Token invalido"};
        }
        else if(decoded.idToken != id){
            let item = await Usuario.findByPk(decoded.idToken)
            if(!item){
                return {code: 4, msg: "No autorizado"}; //si llega un token valido pero de un usuario que ya no existe (seria raro pero por si acaso)
            }
            if(await RelacionAmistad.findOne({where : {
                [Op.or]: [
                    { id_usuario1: id, id_usuario2: decoded.idToken },
                    { id_usuario1: decoded.idToken, id_usuario2: id }
                ]
            }})){
                return {code: 0}
            }

            return {code: 4, msg:"No autorizado"};
        }
        else{
            return {code: 0}
        }
    }
    catch(Exception){
        if (Exception instanceof jwt.TokenExpiredError) {
            return {code: 5, msg:"Token expirado"};
        }
        return {code: 1, msg: "Token invalido"};
    }
}

//1. registro
app.post('/usuarios', async function(req,resp){
    let usu = req.body
    if(!(usu.email && usu.password && usu.nick)){
        return resp.status(400).send({
            code:1,
            message: "Faltan datos"
        })
    }
    try{
        let creado = await Usuario.create({
            email: usu.email,
            nick: usu.nick,
            password: passwordHash.generate(usu.password)
        });    
        resp.setHeader('Location', 'http://localhost:3000/usuarios/' + creado.id)
        resp.status(201).send(creado)
    }
    catch(error){
        console.log(error)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return resp.status(400).send({
                code: 2,
                message: `Ya existe un usuario con ese ${error.errors[0].path}.`
            });
        }
        else{
            console.log(error)
            return resp.status(400).send({
                code: 1,
                message: `Error desconocido.`
            });
        }
    }
})

//2. login
app.post('/login', async function(req,resp) {
    let usu = req.body
    if(!(usu.email && usu.password)){
        return resp.status(400).send({
            code:1,
            message: "Faltan datos"
        })
    }

    let usuEmail = await Usuario.findOne({where: { email: usu.email }})
    if(usuEmail==null){
        return resp.status(400).send({
            code:2,
            message: "No existe un usuario con ese email."
        })
    }
    
    if(!(passwordHash.verify(usu.password, usuEmail.password))){ //comprobar que usuEmail sea lista
        return resp.status(400).send({
            code:1,
            message: "Contraseña incorrecta."
        })
    }

    let payload = {
        idToken: usuEmail.id,
    }
    resp.status(200).send({
        jwt: jwt.sign(payload, secret, {expiresIn}),
        id: usuEmail.id,
    })
})

//3. actualizar datos usuario
app.put('/usuarios/:id',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let usu = req.body
    if(!(usu.email && usu.password && usu.nick)){
        return resp.status(400).send({
            code:1,
            message: "Faltan datos"
        })
    }

    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = verificarToken(authHeader.split(' ')[1], idParam)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    let item = await Usuario.findByPk(idParam)
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    try{
        await Usuario.update({email: usu.email, password: passwordHash.generate(usu.password), nombre: usu.nombre, nick: usu.nick}, {where: { id: idParam }})
        resp.setHeader('Location', 'http://localhost:3000/usuarios/' + idParam)
        resp.status(200).send(await Usuario.findOne({where: { email: usu.email }}))
    }
    catch(error){
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.log(error)
            return resp.status(400).send({
                code: 2,
                message: `Ya existe un usuario con ese ${error.errors[0].path}.`
            });
        }
        else{
            console.log(error)
            return resp.status(400).send({
                code: 1,
                message: `Error desconocido.`
            });
        }
    }
})

//4. borrar cuenta
app.delete('/usuarios/:id',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let item = await Usuario.findByPk(idParam)
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    const authHeader = req.headers["authorization"]
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        token = authHeader.split(' ')[1] //quito el bearer
        retCode = verificarToken(token, idParam)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    await Usuario.destroy({where: { id: idParam }})
    resp.status(204).send()
    
})

//5. obtener informacion usuario
app.get('/usuarios/:id',async function(req,resp) {
    let id = parseInt(req.params.id)
    if(isNaN(id)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let item = await Usuario.findByPk(id, {attributes: ['nombre', 'email', 'nick', 'video']})
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    resp.status(200).send({nombre: item.nombre, email: item.email, nick: item.nick})
})

//6. buscar usuario por nick paginacion?
app.get('/usuarios/buscar/:nick',async function(req,resp) {

    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = obtenerIdToken(authHeader.split(' ')[1])
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    let nickParam = req.params.nick
    let usuarios = await Usuario.findAll({where: { 
        id: { [Sequelize.Op.not]: retCode.id },
        nick: { [Sequelize.Op.like]: '%' + nickParam + '%' }
    }});
    const userId = retCode.id;

    for (const usuario of usuarios) {
        const peticion = await PeticionAmistad.findOne({
            where: {
                id_emisor: userId,
                id_receptor: usuario.id
            }
        });
        usuario.dataValues.peticion = peticion !== null;
    }

    resp.status(200)
    resp.send(usuarios)
})

//8. Enviar peticion amistad
app.post('/usuarios/:idEmisor/peticiones/:idReceptor',async function(req,resp) {
    let idEmisor = parseInt(req.params.idEmisor)
    let idReceptor = parseInt(req.params.idReceptor)
    if(isNaN(idEmisor) || isNaN(idReceptor)){
        return resp.status(400).send({
            code:1,
            message: "Los parametro id deben ser un numero"
        })
    }

    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = verificarToken(authHeader.split(' ')[1], idEmisor)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    let emisor = await Usuario.findByPk(idEmisor)
    let receptor = await Usuario.findByPk(idReceptor)
    if(!emisor || !receptor){
        return resp.status(404).send({
            code:3,
            message: "Emisor o receptor incorrecto"
        })
    }

    try{
        let peticion = await PeticionAmistad.create({
            id_emisor : idEmisor,
            id_receptor : idReceptor
        })
        resp.status(201).send(peticion)
    }
    catch(error){
        console.log(error)
        return resp.status(400).send({
            code: 1,
            message: `Error desconocido.`
        });
    }

})

//9. Ver listado peticiones amistad usuario
app.get('/usuarios/:id/peticiones',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = verificarToken(authHeader.split(' ')[1], idParam)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    let user = await Usuario.findByPk(idParam)
    if(!user){
        return resp.status(404).send({
            code:3,
            message: "El usuario no existe"
        })
    }

    resp.status(200).send(await PeticionAmistad.findAll({where: { id_receptor: idParam }}))
})

//10. Aceptar peticion amistad
app.delete('/peticiones/:id/aceptar',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let item = await PeticionAmistad.findByPk(idParam)
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    const authHeader = req.headers["authorization"]
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        token = authHeader.split(' ')[1] //quito el bearer
        retCode = verificarToken(token, item.id_receptor)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    await RelacionAmistad.create({
        id_usuario1: item.id_emisor,
        id_usuario2: item.id_receptor
    })
    await PeticionAmistad.destroy({where: { id: idParam }})
    resp.status(204).send()
    
})

//11. Rechazar peticion amistad
app.delete('/peticiones/:id/rechazar',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let item = await PeticionAmistad.findByPk(idParam)
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    const authHeader = req.headers["authorization"]
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        token = authHeader.split(' ')[1] //quito el bearer
        retCode = verificarToken(token, item.id_receptor)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    await PeticionAmistad.destroy({where: { id: idParam }})
    resp.status(204).send()
    
})

//12. Ver listado amigos
app.get('/usuarios/:id/amigos',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = verificarToken(authHeader.split(' ')[1], idParam)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    try {
        const relaciones = await RelacionAmistad.findAll({
            where: {
                [Op.or]: [
                    { id_usuario1: idParam },
                    { id_usuario2: idParam }
                ]
            }
        });

        const idsAmigos = relaciones.map(relacion => {
            if (relacion.id_usuario1 === idParam) {
                return relacion.id_usuario2;
            } else {
                return relacion.id_usuario1;
            }
        });

        const amigos = await Usuario.findAll({ where: { id: idsAmigos }, attributes: ['nombre', 'email', 'nick', 'video']});

        resp.status(200).send(amigos);
    } catch (error) {
        console.error("Error al obtener amigos:", error);
        resp.status(500).send({
            code: 500,
            message: "Error interno del servidor"
        });
    }
})

//13. Eliminar relacion amistad
app.delete('/amistad/:id',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let item = await RelacionAmistad.findByPk(idParam)
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    const authHeader = req.headers["authorization"]
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        token = authHeader.split(' ')[1] //quito el bearer
        retCode = verificarToken(token, item.id_usuario1) //cualquiera de los dos usuarios en una relacion de amistad puede romperla
        if(retCode.code!=0){
            retCode = verificarToken(token, item.id_usuario2)
        }
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    await RelacionAmistad.destroy({where: { id: idParam }})
    resp.status(204).send()
    
})

//14. Ver video usuario
app.get('/usuarios/:id/video',async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }
    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = await verificarTokenAmigo(authHeader.split(' ')[1], idParam)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    let user = await Usuario.findByPk(idParam)
    if(!user){
        return resp.status(404).send({
            code:3,
            message: "El usuario no existe"
        })
    }

    if(user.video == false){
        return resp.status(404).send({
            code:3,
            message: "El video no existe"
        })
    }

    const videoPath = path.join('/mnt/volumen/procesados', idParam + '.mp4');
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            return resp.status(404).send({
                code:3,
                message: "El video no existe"
            })
        } else {
            resp.sendFile(videoPath);
        }
    });
})

//15. Publicar video
app.patch('/usuarios/:id/video', upload.single('video'), async function(req,resp) {
    let idParam = parseInt(req.params.id)
    if(isNaN(idParam)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    let user = await Usuario.findByPk(idParam)
    if(!user){
        return resp.status(404).send({
            code:3,
            message: "El usuario no existe"
        })
    }

    if(!req.file || !req.file.originalname){
        return resp.status(400).send({
            code:1,
            message: "Archivo incorrecto"
        })
    }

    const authHeader = req.headers["authorization"]
    let retCode;
    if(!authHeader){
        retCode = {code: 4, msg:"No autorizado"};
    }
    else{
        retCode = verificarToken(authHeader.split(' ')[1], idParam)
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    await channel.sendToQueue(queue, Buffer.from(idParam + path.extname(req.file.originalname))); //pongo el nombre del archivo en la cola
    await Usuario.update({video: true}, {where: { id: idParam }})
    resp.json({ message: 'Video recibido correctamente, en cola para transcodificar.'});
})

//dev endpoint
app.get('/usuarioCompleto/:id',async function(req,resp) {
    id = parseInt(req.params.id)
    if(isNaN(id)){
        return resp.status(400).send({
            code:1,
            message: "El parametro id debe ser un numero"
        })
    }

    item = await Usuario.findByPk(id)
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    resp.status(200)
    resp.send(item)
})

//dev endpoint
app.get('/usuariosCompleto/',async function(req,resp) {
    resp.status(200)
    resp.send(await Usuario.findAll())
})

app.get('/peticiones',async function(req,resp) {
    resp.status(200)
    resp.send(await PeticionAmistad.findAll())
})

app.get('/amistad',async function(req,resp) {
    resp.status(200)
    resp.send(await RelacionAmistad.findAll())
})

app.post('/usuarios/:id/video', upload.single('video'), async function(req, res){
    await channel.sendToQueue(queue, Buffer.from(req.params.id + path.extname(req.file.originalname))); //pongo el nombre del archivo en la cola
    res.json({ message: 'Video recibido correctamente, en cola para transcodificar.'});
})

app.get('/usuarios/:id/videoX', async function(req, res){
    const videoPath = path.join('/mnt/volumen/procesados', req.params.id + '.mp4');
    fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
            res.status(404).json({ error: 'Video no encontrado.' });
        } else {
            res.sendFile(videoPath);
        }
    });
})

async function setupRabbitMQ() {
    let connection = await amqp.connect('amqp://rabbitmq');
    channel = await connection.createChannel(); //variable global para poder usar la cola en los diferentes endpoints
    await channel.assertQueue(queue, { durable: true });
}

app.listen(3000, function(){
    setupRabbitMQ();
    console.log('Cola creada. Servidor arrancado')
})