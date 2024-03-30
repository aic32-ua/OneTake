<template>
    <div>
      <video controls ref="videoPlayer">
        <source :src="videoUrl" type="video/mp4">
        Tu navegador no soporta el elemento de video.
      </video>
    </div>
</template>
  
<script>
  
  export default {
    data() {
      return {
        videoUrl: ''
      };
    },
    mounted() {
      this.loadVideo();
    },
    methods: {
      async loadVideo() {
        try {
          this.videoUrl = 'http://localhost:3000/usuarios/1/video';
          this.$refs.videoPlayer.load();
        } catch (error) {
          console.error('Error al cargar el video:', error);
        }
      }
    }
  };
</script>
  
<style scoped>

</style>
  