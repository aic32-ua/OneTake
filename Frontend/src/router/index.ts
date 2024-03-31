import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'publicar',
        component: () => import('@/views/Publicar.vue')
      },
      {
        path: 'social',
        component: () => import('@/views/Social.vue'),
        children: [
          {
            path: 'social',
            redirect: '/tabs/social/buscar'
          },
          {
            path: '/tabs/social/buscar',
            component: () => import('@/views/Buscar.vue')
          },
          {
            path: '/tabs/social/peticiones',
            component: () => import('@/views/Peticiones.vue')
          },
          {
            path: '/tabs/social/amigos',
            component: () => import('@/views/Amigos.vue')
          },
          {
            path: '/tabs/social/perfil',
            component: () => import('@/views/Perfil.vue')
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/register',
    component: RegisterPage
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;