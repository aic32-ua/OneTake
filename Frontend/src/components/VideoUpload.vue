<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import { usePopOverStore } from '../stores/PopOverStore';
import ClienteAPI from '../ClienteAPI.js'
export default{
    emits: ['videoSubido'],
    data: function() {
        return {
            api: new ClienteAPI(),
            videoFile: null,
            usuarioLogeadoStore: useUsuarioLogeadoStore(),
            popOverStore: usePopOverStore()
        };
    },
    methods: {
        handleFileUpload(event) {
            this.videoFile = event.target.files[0];
        },
        async uploadVideo() {
            if(this.videoFile != null){
                this.popOverStore.abrirPopOver()
                await this.api.subirVideo(this.usuarioLogeadoStore.idUsu, this.videoFile);
                document.getElementById('video').value = '';
                this.videoFile = null;
                this.popOverStore.cerrarPopOver()
            }
            else{
                alert("Por favor, seleccione un video para subir.");
                return;
            }
        }
    }
}
</script>

<template>
    <div class="addFile">
        <input type="file" id="video" name="video" accept="video/*" capture="user" @change="handleFileUpload">
        <input type="submit" @click="uploadVideo">
    </div>
</template>

<style scoped>
.addFile{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 60px;
}
</style>
