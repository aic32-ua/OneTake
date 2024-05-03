const fs = require('fs');
const path = require('path');

const ruta = '/mnt/volumen/procesados/';

fs.readdir(ruta, (err, archivos) => {
    if (err) {
        console.error('Error al leer el directorio:', err);
        return;
    }
    
    archivos.forEach(archivo => {
        const rutaArchivo = path.join(ruta, archivo);
        
        fs.unlink(rutaArchivo, err => {
        if (err) {
            console.error('Error al eliminar el archivo:', err);
            return;
        }
        console.log('Archivo eliminado:', rutaArchivo);
        });
    });
    });

console.log('Tarea cron ejecutada');