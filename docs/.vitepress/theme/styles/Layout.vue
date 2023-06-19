<template>
    <div class="layout">
      <Sidebar />
      <main>
        <div class="image-centered">
          <Content :customWrapper="customWrapper" />
        </div>
      </main>
    </div>
  </template>
  
  <script>
  import Sidebar from './Sidebar.vue'
  import Content from './Content.vue'
  
  export default {
    components: {
      Sidebar,
      Content
    },
    methods: {
      customWrapper() {
        return 'div'
      }
    }
  }
  </script>
  
  <style>
  .layout {
    display: flex;
  }
  
  main {
    flex-grow: 1;
    padding: 2rem;
  }
  
  .image-centered {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  </style>
  