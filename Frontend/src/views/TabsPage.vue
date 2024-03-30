<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon name="home-sharp" color="white"></ion-icon>
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon name="film"></ion-icon>
          <ion-label>Publicar</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon name="person-add"></ion-icon>
          <ion-label>Social</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useUsuarioLogeadoStore } from '../stores/UsuarioLogeadoStore';
import { onMounted } from 'vue';

const router = useRouter();
const usuarioLogeadoStore = useUsuarioLogeadoStore();

onMounted(() => {
  if (!localStorage.getItem('token') && router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }
});
</script>
