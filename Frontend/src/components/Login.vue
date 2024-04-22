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
                  this.usuarioLogeadoStore.iniciarSesion({ newToken: resp.jwt, newId: resp.id});
                  this.email = '';
                  this.password = '';
                  this.error = '';
                  this.$router.replace({path: 'tabs'});
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
    <h1 class="onetake">OneTake</h1>
    
    <form @submit.prevent="iniciarSesion">
      <div :class="{ 'login-form': true, 'error-shake': error }">
        <input type="text" placeholder="Email" v-model="email" required autocomplete="username">
        <input type="password" placeholder="Contraseña" v-model="password" required autocomplete="current-password">
        <button class="login-button center-button">Entrar</button>
  
        <div class="error" v-if="error">
          <p>{{error}}</p>
        </div>
      </div>
    </form>

    <div class="registration-section">
      <p class="color">¿Todavía no eres miembro?</p>
      <RouterLink to="/register" class="register-link">Registrarse</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.onetake {
  color: #ffffff;
  text-align: center;
  font-size: 40px;
  font-family: 'Rounded Mplus 1c Bold', sans-serif;
  margin-bottom: 30px;
}

.page-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
}

.color {
  color: white;
}

.error {
  margin-top: 20px;
  background-color: #f8d7da;
  border: 1px solid #dc3545;
  color: #721c24;
  border-radius: 5px;
  font-size: 14px;
}

.login-form {
  margin: 0 auto;
  width: 85%;
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

.login-button {
  width: 100%;
  height: 40px;
  border-radius: 13px;
  padding: 8px 12px;
  color: white;
  text-decoration: underline;
  cursor: pointer;
  font-size: 15px;
  background-color: rgba(0, 255, 25, 0.82);
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
