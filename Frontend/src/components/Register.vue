<script>
import ClienteAPI from '../ClienteAPI'
export default{
    data: function(){
        return{
            nickName: "",
            email: "",
            password: "",
            error: ""
        }
    },
    methods: {
        async registrarUsuario(){
            this.error = "";
            if(this.nickName.length > 0 && this.email.length > 0 && this.password.length > 0){
                var usuario = {nick: this.nickName, email: this.email, password: this.password}
                const cli = new ClienteAPI();
                const resp = await cli.registro(usuario);
                if(resp.id){
                    this.$router.push({path: '/login'});
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
    <div class="container">
      <h1 class="onetake">OneTake</h1>
      <div class="registration-form">
        <input type="text" placeholder="Nombre de usuario" v-model="nickName" required>
        <input type="text" placeholder="Correo electrónico" v-model="email" required>
        <input type="password" placeholder="Contraseña" v-model="password" required>
        <button class="register-button" @click="registrarUsuario">Registrarme</button>

        <div class="error" v-if="error">
          <p>{{error}}</p>
        </div>

      </div>

      <div class="additional-info">
        <p class="color">¿Ya tienes cuenta?</p>
        <RouterLink to="/login" class="login-link">Login</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.container {
  text-align: center;
}

.onetake {
  color: #ffffff;
  font-size: 40px;
  font-family: 'Rounded Mplus 1c Bold', sans-serif;
  margin-bottom: 30px;
}

.color {
  color: white;
}

.registration-form {
  width: 85%;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

input {
  width: 100%;
  height: 40px;
  border-radius: 10px;
  padding: 8px;
  margin-bottom: 20px;
  outline: none;
  box-sizing: border-box;
  font-size: 16px;
  border: none;
  background-color: rgba(188, 188, 188, 0.25);
}

input::placeholder {
  color: #BCBCBC;
}

.register-button {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 10px;
  color: white;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;
  background-color: rgba(0, 255, 25, 0.82);
}

.error {
  margin-top: 20px;
  background-color: #f8d7da;
  border: 1px solid #dc3545;
  color: #721c24;
  border-radius: 5px;
  font-size: 14px;
}

.additional-info {
  margin-top: 20px;
}

.login-link {
  color: #4C83EE;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}
</style>
