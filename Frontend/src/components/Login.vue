<script>
import ClienteAPI from '../ClienteAPI'
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'

export default{
    data: function(){
        return{
            email: "",
            password: "",
            usuarioLogeadoStore: useUsuarioLogeadoStore(),
            error: ""
        }
    },
    methods: {
        async iniciarSesion(){
          this.error = "";
            if(this.email.length > 0 && this.password.length > 0){
                const cli = new ClienteAPI();
                const resp = await cli.login(this.email, this.password);
                if(resp.jwt){
                  this.usuarioLogeadoStore.iniciarSesion({ newToken: resp.jwt, newUsuario: this.email, newId: resp.id});
                  this.$router.push({path: 'tabs'});
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

    <h1 class="oneTake">OneTake</h1>
    
    <div :class="{ 'login-form': true, 'error-shake': error }">
      <input type="text" placeholder="Nombre de usuario" v-model="email" required>
      <br/>
      <input type="password" placeholder="Contraseña" v-model="password" required>
      <br/>
      <button class="login-button center-button" @click="iniciarSesion">Entrar</button>
    </div>
  
    <div class="error" v-if="error">
      <p>{{error}}</p>
    </div>

    <div class="registration-section">
      <p class="color">
        ¿Todavía no eres miembro?
      </p>
      <RouterLink to="/register" class="register-link">Registrarse</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.onetake {
  color:#ffffff;
  text-align:left;
  vertical-align:text-top;
  font-size:40px;
  font-family:Rounded Mplus 1c Bold;
  line-height:auto;
  border-style:hidden;
  outline:none;
  width:164px;
}

.page-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.color{
  color: white;
}

.error {
  margin-top: 10px;
  padding: 10px;
  background-color: #f8d7da; /* Color de fondo para indicar un error (puedes personalizarlo) */
  border: 1px solid #dc3545; /* Borde rojo para resaltar el error */
  color: #721c24; /* Color de texto oscuro para una mejor legibilidad */
  border-radius: 5px; /* Bordes redondeados */
  font-size: 14px; /* Tamaño de fuente */
}

.login-form {
  margin: 0 auto;
}

label {
  display: block;
  margin-bottom: 12px;
}

input {
  width: 370px;
  height: 40px;
  width:95%;
  border-radius:13px;
  padding: 8px;
  margin-bottom: 20px;
  box-sizing: border-box;
  font-size: 16px;
  background-color:rgba(188, 188, 188, 0.25);
  border-radius: 10px;
}

input::placeholder {
  color: #BCBCBC;
}

.login-button {
  padding: 8px 12px;
  height: 37px;
  width: 95%;
  border-radius:13px;
  color: white;
  text-decoration: underline;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  background-color:rgba(0, 255, 25, 0.8199999928474426);
}

.center-button {
  display: block;
  margin: 0 auto;
}

.registration-section {
  margin-top: 20px;
}

.register-link {
  color: #4C83EE;
  text-decoration: none;
  margin-left: 5px;
}

.register-link:hover {
  text-decoration: underline;
}

.shake-enter-active, .shake-leave-active {
  transition: transform 0.5s ease-in-out;
}

.shake-enter, .shake-leave-to /* .shake-leave-active in <2.1.8 */ {
  transform: translateX(0);
}

.shake-leave, .shake-enter-to /* .shake-enter-active in <2.1.8 */ {
  transform: translateX(-10px);
}

.error-shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-10px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(10px);
  }
}
</style>
