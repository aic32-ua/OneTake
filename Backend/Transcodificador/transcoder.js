const amqp = require('amqplib');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const queue = 'OneTakeQueue';

async function setupRabbitMQ() {
    var connection = await amqp.connect('amqp://rabbitmq');
    channel = await connection.createChannel(); //variable global para poder usar la cola en los diferentes endpoints
    await channel.assertQueue(queue, { durable: true });
}

function transcodificar(nombre) {
    const origen = `/mnt/volumen/brutos/${nombre}`;
    const destino = `/mnt/volumen/procesados/${path.parse(nombre).name}.mp4`;
    const comando = `ffmpeg -i ${origen} -c:v libx264 ${destino}`;

    return new Promise((resolve, reject) => {
        exec(comando, (error, stdout, stderr) => {
            if (error) {
                console.error('Error al transcodificar el video:', error);
                reject(error);
                return;
            }
            console.log(stderr);
            console.log('Video transcodificado y movido exitosamente.');

            fs.unlink(origen, (error) => {
                if (error) {
                    console.error('Error al eliminar el archivo original:', error);
                    reject(error);
                } else {
                    console.log('Archivo original eliminado exitosamente.');
                    resolve();
                }
            });
        });
    });
}

async function consumeMessages() {
    channel.consume(queue, async (msg) => {
        console.log(`Mensaje recibido: ${msg.content.toString()}`);
        await transcodificar(msg.content.toString());
    }, { noAck: true });
}

setupRabbitMQ();

console.log('Consumidor a espera.')

setInterval(async () => {
    await consumeMessages().catch(console.error);
}, 5000);