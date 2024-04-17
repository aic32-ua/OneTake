let express = require('express')
let app = express()

const cors = require('cors');
app.use(cors());

let bp = require('body-parser')
app.use(bp.json())

const argon2 = require('argon2');

let jwt = require('jsonwebtoken');

const secret = "123456";
const expiresIn = 3600 * 24 * 3; //3 dias, añadir que en cada peticion en la que se envia un token valido, se genere uno nuevo, de forma que no tengas que iniciar sesion a menos que estes 3 dias seguidos sin usar la aplicacion

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

const uploadFoto = multer({ storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const path = "/mnt/volumen/imagenes";
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path, { recursive: true });
            }
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, req.params.id + path.extname(file.originalname));
        }
    }),
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Solo se permiten imágenes'));
        }
        cb(null, true);
    }
});

const eliminarFoto = async(ruta) => {
    if(fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
    }
}

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
    foto: {
        type: DataTypes.STRING,
        unique: true
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

Usuario.hasMany(PeticionAmistad, { foreignKey: 'id_emisor', onDelete: 'CASCADE' });
Usuario.hasMany(PeticionAmistad, { foreignKey: 'id_receptor', onDelete: 'CASCADE' });

Usuario.hasMany(RelacionAmistad, { foreignKey: 'id_usuario1', onDelete: 'CASCADE' });
Usuario.hasMany(RelacionAmistad, { foreignKey: 'id_usuario2', onDelete: 'CASCADE' });

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

function verificarToken(token, id){
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
        const hash = await argon2.hash("usu.password");
        let creado = await Usuario.create({
            email: usu.email,
            nick: usu.nick,
            password: hash
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
    
    if(!(passwordHash.verify(usu.password, usuEmail.password))){
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
    if(!(usu.email && usu.nick)){
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
        await Usuario.update({email: usu.email, nick: usu.nick}, {where: { id: idParam }})
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

    let item = await Usuario.findByPk(id, {attributes: ['email', 'nick', 'video', 'foto']})
    if(!item){
        return resp.status(404).send({
            code:3,
            message: "El dato no existe"
        })
    }

    resp.status(200).send(item)
})

//6. buscar usuario por nick paginacion?
app.get('/usuarios/buscar/:nick',async function(req,resp) {

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

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
        },
        offset: offset,
        limit: perPage
    });
    const userId = retCode.id;

    for (const usuario of usuarios) {
        const amistadExistente = await RelacionAmistad.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { id_usuario1: userId, id_usuario2: usuario.id },
                    { id_usuario1: usuario.id, id_usuario2: userId }
                ]
            }
        });
        if (amistadExistente) {
            usuario.dataValues.peticion = true;
            continue;
        }

        const peticionExistente = await PeticionAmistad.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { id_emisor: userId, id_receptor: usuario.id },
                    { id_emisor: usuario.id, id_receptor: userId }
                ]
            }
        });
        if (peticionExistente) {
            usuario.dataValues.peticion = true;
        } else {
            usuario.dataValues.peticion = false;
        }
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

    let amistadExistente = await RelacionAmistad.findOne({
        where: {
            [Op.or]: [
                { id_usuario1: idEmisor, id_usuario2: idReceptor },
                { id_usuario1: idReceptor, id_usuario2: idEmisor }
            ]
        }
    });
    if (amistadExistente) {
        return resp.status(409).send({
            code: 2,
            message: "Los usuarios ya son amigos, no se puede enviar una solicitud de amistad"
        });
    }

    let peticionExistente = await PeticionAmistad.findOne({ where: { id_emisor: idEmisor, id_receptor: idReceptor } });
    if (peticionExistente) {
        return resp.status(409).send({
            code: 2,
            message: "Ya existe una petición de amistad de este emisor a este receptor"
        });
    }

    peticionExistente = await PeticionAmistad.findOne({ where: { id_emisor: idReceptor, id_receptor: idEmisor } });
    if (peticionExistente) {
        return resp.status(409).send({
            code: 2,
            message: "Ya existe una petición de amistad de este receptor a este emisor"
        });
    }

    let peticion = await PeticionAmistad.create({
        id_emisor : idEmisor,
        id_receptor : idReceptor
    })
    resp.status(201).send(peticion)

})

//9. Ver listado peticiones amistad usuario
app.get('/usuarios/:id/peticiones',async function(req,resp) {

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

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

    resp.status(200).send(await PeticionAmistad.findAll({where: { id_receptor: idParam }, offset: offset, limit: perPage}))
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

    let id1 = item.id_emisor
    let id2 = item.id_receptor

    if(id1>id2){ //las relaciones de amistad siempre tendran como id1 el menor de los ids
        const id3 = id1
        id1 = id2
        id2 = id3
    }

    await RelacionAmistad.create({
        id_usuario1: id1,
        id_usuario2: id2
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

        const amigos = await Usuario.findAll({ where: { id: idsAmigos }, attributes: ['id', 'email', 'nick', 'video', 'foto']});

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
app.delete('/amistad/:id1/:id2',async function(req,resp) {
    let idParam1 = parseInt(req.params.id1)
    let idParam2 = parseInt(req.params.id2)
    if(isNaN(idParam1) || isNaN(idParam2)){
        return resp.status(400).send({
            code:1,
            message: "Los parametros id deben ser numeros"
        })
    }

    let item = await RelacionAmistad.findOne({where : {
        [Op.or]: [
            { id_usuario1: idParam1, id_usuario2: idParam2 },
            { id_usuario1: idParam2, id_usuario2: idParam1 }
        ]
    }})
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
        retCode = verificarToken(token, idParam1) //cualquiera de los dos usuarios en una relacion de amistad puede romperla
        if(retCode.code!=0){
            retCode = verificarToken(token, idParam2)
        }
    }
    if(retCode.code != 0){
        return resp.status(401).send({
            code:retCode.code,
            message: retCode.msg
        })
    }

    await RelacionAmistad.destroy({where: { id: item.id }})
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

    idSesion = obtenerIdToken(authHeader.split(' ')[1]).id
    usuarioSesion = await Usuario.findByPk(idSesion)

    if(!usuarioSesion.video){
        return resp.status(401).send({
            code: 4,
            message: "Tienes que subir un video para poder ver los de tus amigos"
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
            resp.set('Content-Type', 'video/mp4');
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

//16. Subir foto perfil
app.patch('/usuarios/:id/foto', uploadFoto.single('foto'), async function(req, resp) {
    try{
        let idParam = parseInt(req.params.id);
        if (isNaN(idParam)) {
            return resp.status(400).send({
                code: 1,
                message: "El parametro id debe ser un numero"
            });
        }

        let user = await Usuario.findByPk(idParam);
        if (!user) {
            return resp.status(404).send({
                code: 3,
                message: "El usuario no existe"
            });
        }

        if (!req.file || !req.file.originalname) {
            return resp.status(400).send({
                code: 1,
                message: "Archivo incorrecto"
            });
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

        await eliminarFoto(await Usuario.findByPk(idParam, {attributes: ['foto']}).foto) //es necesario eliminar la foto ya que si tienen diferente formato no la va a sobreescribir
        await Usuario.update({ foto: req.file.path }, { where: { id: idParam } });

        resp.status(200).send()
    } catch (error) {
        console.error("Error al subir la foto:", error);
        resp.status(500).json({ error: 'Error al subir la foto.' });
    }
});

//17. Ver foto perfil
app.get('/usuarios/:id/foto', async function(req, resp) {
    let idParam = parseInt(req.params.id);
    if (isNaN(idParam)) {
        return resp.status(400).send({
            code: 1,
            message: "El parametro id debe ser un numero"
        });
    }

    let user = await Usuario.findByPk(idParam);
    if (!user) {
        return resp.status(404).send({
            code: 3,
            message: "El usuario no existe"
        });
    }

    if (!user.foto) {
        return resp.status(404).json({ message: 'Foto de perfil no encontrada.' });
    }

    fs.readFile(user.foto, (err, data) => {
        if (err) {
            console.error("Error al leer la foto de perfil:", err);
            return resp.status(500).json({ message: 'Error al cargar la foto de perfil.' });
        }

        resp.setHeader('Content-Type', 'image/' + path.extname(user.foto).toLowerCase());
        resp.send(data);
    });
});

//dev endpoints:
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
    await channel.sendToQueue(queue, Buffer.from(req.params.id + path.extname(req.file.originalname)));
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