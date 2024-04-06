<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI.js'
export default{
    data: function() {
        return {
            api: new ClienteAPI(),
            videoFile: null,
            usuarioLogeadoStore: useUsuarioLogeadoStore()
        };
    },
    methods: {
        handleFileUpload(event) {
            this.videoFile = event.target.files[0];
        },
        async uploadVideo() {
            if(this.videoFile != null){
                await this.api.subirVideo(this.usuarioLogeadoStore.idUsu, this.videoFile);
                document.getElementById('video').value = '';
                this.videoFile = null;
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
