var express = require('express')
var app = express()

const cors = require('cors');
app.use(cors());

var bp = require('body-parser')
app.use(bp.json())

const path = require('path');
const fs = require('fs');
const amqp = require('amqplib');

const queue = 'QueueNode';

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

async function setupRabbitMQ() {
    var connection = await amqp.connect('amqp://transcoder');
    channel = await connection.createChannel(); //variable global para poder usar la cola en los diferentes endpoints
    await channel.assertQueue(queue, { durable: true });
}

app.listen(3000, function(){
    setupRabbitMQ();
    console.log('Cola creada. Servidor arrancado')
})