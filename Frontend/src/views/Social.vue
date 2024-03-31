<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>OneTake</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
    
      <ion-tabs>
        <ion-router-outlet></ion-router-outlet>
        <ion-tab-bar slot="top">
          <ion-tab-button tab="buscar" href="/tabs/social/buscar">
            <ion-label>Buscar</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="peticiones" href="/tabs/social/peticiones">
            <ion-label>Peticiones</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="amigos" href="/tabs/social/amigos">
            <ion-label>Amigos</ion-label>
          </ion-tab-button>

          <ion-tab-button tab="perfil" href="/tabs/social/perfil">
            <ion-label>Perfil</ion-label>
          </ion-tab-button>
        </ion-tab-bar>
      </ion-tabs>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonTabBar, IonTabButton, IonLabel, IonRouterOutlet, IonTabs, IonToolbar, IonTitle, IonContent } from '@ionic/vue';
</script>
