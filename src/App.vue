<template>
<!--  <img alt="Vue logo" src="./assets/logo.png">-->
  <Index/>
</template>

<script>
import Index from 'views/Index'

export default {
  name: 'App',
  components: {
    Index
  }
}
</script>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    width: 100vw;
    height: 100vh;
  }

  body{
    padding: 0;
    margin: 0;
  }
</style>
