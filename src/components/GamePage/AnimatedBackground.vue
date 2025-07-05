<template>
  <div class="animated-background">
    <!-- Comment out the orbs to disable animations -->
    <!-- <div class="floating-orbs">
      <div v-for="n in 4" :key="n" class="orb" :style="getOrbStyle(n)"></div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
// Orb style function - uncomment if re-enabling animations
// const getOrbStyle = (index: number) => {
//   const positions = [
//     { top: '20%', left: '10%', size: '50px', delay: '0s' },
//     { top: '70%', right: '15%', size: '60px', delay: '7.5s' },
//     { top: '30%', right: '20%', size: '40px', delay: '15s' },
//     { top: '80%', left: '25%', size: '55px', delay: '22.5s' },
//   ];

//   const pos = positions[index - 1];
//   if (!pos) return '';

//   return `
//     top: ${pos.top};
//     ${pos.left ? `left: ${pos.left}` : `right: ${pos.right}`};
//     width: ${pos.size};
//     height: ${pos.size};
//     animation-delay: ${pos.delay};
//     opacity: 0.5;
//   `;
// };
</script>

<style scoped>
/* Animated Background */
.animated-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  /* Static gradient fallback */
  background: linear-gradient(
    135deg,
    var(--primary-bg) 0%,
    rgba(94, 114, 228, 0.05) 50%,
    var(--primary-bg) 100%
  );
}

.floating-orbs {
  position: absolute;
  inset: 0;
}

.orb {
  position: absolute;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  animation: float 30s infinite linear;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  -webkit-transform: translateZ(0);
}

@keyframes float {
  0% {
    transform: translateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-15px) translateZ(0);
  }
  100% {
    transform: translateY(0) translateZ(0);
  }
}
</style>
