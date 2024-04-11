<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :src="isActiveTab('home') ? '/resources/homeSelected.svg' : '/resources/home.svg'" color="white"></ion-icon>
        </ion-tab-button>

        <ion-tab-button id="publicarVideo" tab="publicar" @click="subirVideo=true">
          <ion-icon src="/resources/more.svg"></ion-icon>
        </ion-tab-button>
        <ion-popover :is-open="subirVideo" trigger="publicarVideo" trigger-action="click" @didDismiss="subirVideo=false" side="top" alignment="center" size="auto">
            <ion-content class="ion-padding">
                <VideoUpload @videoSubido="subirVideo=false"/>
            </ion-content>
        </ion-popover>

        <ion-tab-button tab="social" href="/tabs/social">
          <ion-icon :src="isActiveTab('social') ? '/resources/inviteSelected.svg' : '/resources/invite.svg'"></ion-icon>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonContent, IonPopover, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { watch, onMounted, ref } from 'vue';
import VideoUpload from '@/components/VideoUpload.vue';
import {useUsuarioLogeadoStore} from '../stores/UsuarioLogeadoStore.js'

const router = useRouter();

const usuarioLogeadoStore = useUsuarioLogeadoStore(); 

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.replace({ path: '/login' });
  }
});

watch(() => usuarioLogeadoStore.token , (newValue) => {
  if (newValue === null) {
    router.replace({ path: '/login' });
  }
});

const isActiveTab = (tabName: string) => {
  return router.currentRoute.value.path.startsWith("/tabs/" + tabName);
};

const subirVideo = ref(false)

</script>
<style scoped>
ion-popover {
    --backdrop-opacity: 0.6;
    --box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.6);
    --width: 250px;
}

ion-popover ion-content {
    --background: rgba(188, 188, 188, 0.25);
}
</style>
