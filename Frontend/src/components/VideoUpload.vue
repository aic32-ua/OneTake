<script>
    import ClienteAPI from '../ClienteAPI.js'
    export default{
        data: function() {
            return {
                api: new ClienteAPI(),
                videoFile: null
            };
        },
        methods: {
            handleFileUpload(event) {
                this.videoFile = event.target.files[0];
            },
            uploadVideo() {
                if(this.videoFile != null){
                    this.api.subirVideo(1, this.videoFile);
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
    <div>
        <label for="video">Selecciona un video:</label>
        <input type="file" id="video" name="video" accept="video/*" @change="handleFileUpload">
        <br>
        <input type="submit" @click="uploadVideo">
    </div>
</template>

<style scoped>

</style>
