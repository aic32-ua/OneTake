import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import { createPinia } from 'pinia';
import { useUsuarioLogeadoStore } from './stores/UsuarioLogeadoStore.js';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { addIcons } from 'ionicons';
import {searchSharp, closeOutline, checkmarkSharp } from 'ionicons/icons';

addIcons({
  'search-sharp': searchSharp,
  'close-outline': closeOutline,
  "checkmark-sharp": checkmarkSharp
});

const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia())

const userStore = useUsuarioLogeadoStore()

if (localStorage.getItem('token')) {
    userStore.token = localStorage.getItem('token');
}
if (localStorage.getItem('usuario')) {
    userStore.usuario = localStorage.getItem('usuario');
}
  
router.isReady().then(() => {
  app.mount('#app');
});