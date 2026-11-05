<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive>
      <component :is="Component" v-if="Component" :key="route.path" />
    </KeepAlive>
  </RouterView>
</template>
