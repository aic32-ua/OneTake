<script>
import ClienteAPI from '../ClienteAPI'
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'

export default{
    emits: ['datosActualizados'],
    data: function(){
        return{
            email: "",
            nick: "",
            usuarioLogeadoStore: useUsuarioLogeadoStore(),
            error: ""
        }
    },
    methods: {
        async actualizarDatos(){
          this.error = "";
            if(this.email.length > 0 && this.nick.length > 0){
                const cli = new ClienteAPI();
                const resp = await cli.actualizarDatosUsuario(this.usuarioLogeadoStore.idUsu, {"email": this.email, "nick":this.nick});
                if(resp.id){
                  this.email = '';
                  this.nick = '';
                  this.error = '';
                  this.$emit('datosActualizados');
                }
                else{
                  this.error = resp.message;
                }
            }
        }
    },
}
</script>

<template>
  <div class="page-container">
    <div class="form">
      <input type="text" placeholder="Nick" v-model="nick" required>
      <input type="text" placeholder="Email" v-model="email" required>
      <button class="button center-button" @click="actualizarDatos">Actualizar datos</button>

      <div class="error" v-if="error">
        <p>{{error}}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>

.page-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.error {
  margin-top: 20px;
  background-color: #f8d7da;
  border: 1px solid #dc3545;
  color: #721c24;
  border-radius: 5px;
  font-size: 14px;
}

.form {
  margin: 0 auto;
}

input {
  width: 100%;
  height: 40px;
  border-radius: 13px;
  padding: 8px;
  margin-bottom: 20px;
  box-sizing: border-box;
  border: none;
  outline: none;
  font-size: 16px;
  background-color: rgba(188, 188, 188, 0.25);
}

input::placeholder {
  color: #BCBCBC;
}

.button {
  width: 100%;
  height: 40px;
  border-radius: 13px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  font-size: 15px;
  background-color: rgba(0, 255, 25, 0.82);
}

.button {
  display: block;
  margin: 0 auto;
}
</style>
