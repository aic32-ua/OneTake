<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon src="/resources/home.svg" color="white"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="publicar" href="/tabs/publicar">
          <ion-icon src="/resources/more.svg"></ion-icon>
        </ion-tab-button>

        <ion-tab-button tab="social" href="/tabs/social">
          <ion-icon src="/resources/invite.svg"></ion-icon>
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
