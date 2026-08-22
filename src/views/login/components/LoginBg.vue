<template>
  <div class="login-bg">
    <div
      class="login-bg__image"
      :style="{ backgroundImage: `url('${bgImage}')` }"
    />
    <div class="login-bg__title">
      <img class="login-bg__logo" src="/logo-dark.svg" />
      <strong>{{ title }}</strong>
    </div>
    <div class="login-bg__slogan">
      <h3>{{ slogan }}</h3>
      <p>{{ subSlogan }}</p>
    </div>
    <div class="login-bg__card">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import bgStarry from '@/assets/bg-starry.jpg'

withDefaults(
  defineProps<{
    title?: string
    slogan?: string
    subSlogan?: string
    bgImage?: string
  }>(),
  {
    title: undefined,
    slogan: '用真诚',
    subSlogan: '让复杂的世界更美好',
    bgImage: bgStarry,
  },
)
</script>

<style lang="scss" scoped>
.login-bg {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-bg__image {
  position: fixed;
  inset: 0;
  background-repeat: no-repeat;
  background-size: cover;
}

.login-bg__title {
  position: fixed;
  top: 60px;
  left: 70px;
  font-size: 24px;
  display: flex;
  align-items: center;
  color: #fff;
}

.login-bg__logo {
  width: 38px;
  margin-right: 4px;
}

.login-bg__slogan {
  position: fixed;
  left: 195px;
  top: 314px;
  color: #fff;

  h3 {
    font-size: 54px;
    letter-spacing: 0;
    font-weight: 700;
    margin-bottom: 0;
  }

  p {
    font-size: 32px;
    letter-spacing: 3.8px;
    font-weight: 300;
  }

  @media (max-width: 1150px) {
    display: none;
  }
}

.login-bg__card {
  position: absolute;
  right: 120px;
  top: 50%;
  transform: translateY(-50%);
  width: 476px;
  max-height: 90vh;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
}
</style>
