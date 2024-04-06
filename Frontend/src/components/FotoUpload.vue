<script>
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'
import ClienteAPI from '../ClienteAPI.js'
export default{
    emits: ['fotoActualizada'],
    data: function() {
        return {
            api: new ClienteAPI(),
            foto: null,
            usuarioLogeadoStore: useUsuarioLogeadoStore()
        };
    },
    methods: {
        handleFileUpload(event) {
            this.foto = event.target.files[0];
        },
        async uploadFoto() {
            if(this.foto != null){
                await this.api.subirFoto(this.usuarioLogeadoStore.idUsu, this.foto);
                document.getElementById('img').value = '';
                this.foto = null;
                this.$emit('fotoActualizada');
            }
            else{
                alert("Por favor, seleccione una foto para subir.");
                return;
            }
        }
    }
}
</script>

<template>
    <div>
        <div class="addFile">
            <input type="file" id="img" name="img" accept="image/*" @change="handleFileUpload">
            <input type="submit" @click="uploadFoto">
        </div>
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
