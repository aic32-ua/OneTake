<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon src="/resources/home.svg" color="white"></ion-icon>
        </ion-tab-button>

        <ion-tab-button id="publicarVideo" tab="publicar">
          <ion-icon src="/resources/more.svg"></ion-icon>
        </ion-tab-button>
        <ion-popover :is-open="popOverStore.abierto" trigger="publicarVideo" trigger-action="click" @didDismiss="popOverStore.cerrarPopOver" side="top" alignment="center" size="auto">
            <ion-content class="ion-padding">
                <VideoUpload/>
            </ion-content>
        </ion-popover>

        <ion-tab-button tab="social" href="/tabs/social">
          <ion-icon src="/resources/invite.svg"></ion-icon>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonContent, IonPopover, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { usePopOverStore } from '../stores/PopOverStore';
import { onMounted, computed, watch } from 'vue';
import VideoUpload from '@/components/VideoUpload.vue';

const router = useRouter();
const popOverStore = usePopOverStore();

onMounted(() => {
  if (!localStorage.getItem('token') && router.currentRoute.value.path !== '/login') {
    router.push('/login');
  }
});

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
