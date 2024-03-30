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
                console.log(resp)
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
      <div class="registration-form">
        <input type="text" placeholder="Nombre de usuario" v-model="nickName" required>
        <br/>
        <input type="text" placeholder="Correo electrónico" v-model="email" required>
        <br/>
        <input type="password" placeholder="Contraseña" v-model="password" required>
        <br/>
        <button class="register-button" @click="registrarUsuario">Registrarme</button>
      </div>

      <div class="error" v-if="error">
            <p>{{error}}</p>
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
  height: calc(100vh - 65.6px);;
}

.container {
  text-align: center;
}

.onetake
{
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

.color{
  color: white;
}

.registration-form {
  max-width: 400px;
  width: 80%;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

label {
  display: block;
  margin-bottom: 12px;
}

input {
  width: 100%;
  height:37px;
  width:337px;
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

.register-button {
    padding: 8px 12px;
  height:37px;
  width:337px;
  border-radius:13px;
  color: white;
  text-decoration: underline;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  background-color:rgba(0, 255, 25, 0.8199999928474426);
}

.admin {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.additional-info {
  text-align: center;
  margin-top: 20px;
}

.login-link {
    color: #4C83EE;
  text-decoration: none;
  margin-left: 5px;
}

.login-link:hover {
  text-decoration: underline;
}
</style>