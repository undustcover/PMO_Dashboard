<template>
  <div class="home-view">
    <!-- The 3D Scene Background -->
    <div class="scene-layer">
      <ThreeEarth 
        ref="earthRef"
        @select-country="onCountrySelect" 
        @select-logistics="onLogisticsSelect" 
      />
    </div>

    <!-- Main Dashboard UI -->
    <Transition name="slide-fade">
      <DashboardOverlay 
        v-if="currentView === 'world'"
        :selected-logistics="selectedLogistics"
        @close-modal="selectedLogistics = null"
      />
    </Transition>

    <!-- Country Detail View -->
    <Transition name="zoom-fade">
      <CountryDetail 
        v-if="currentView === 'country' && selectedCountry" 
        :country="selectedCountry" 
        @back="onBackToWorld" 
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ThreeEarth from '../components/ThreeEarth.vue';
import DashboardOverlay from '../components/DashboardOverlay.vue';
import CountryDetail from '../components/CountryDetail.vue';
import type { CountryData, LogisticsItem } from '../composables/useMockData';

const currentView = ref<'world' | 'country'>('world');
const selectedCountry = ref<CountryData | null>(null);
const selectedLogistics = ref<LogisticsItem | null>(null);
const earthRef = ref<any>(null); // To access ThreeEarth methods if needed

function onCountrySelect(country: CountryData) {
  selectedCountry.value = country;
  // Delay switching view to allow camera zoom animation to complete/start
  setTimeout(() => {
    currentView.value = 'country';
  }, 1000);
}

function onLogisticsSelect(item: LogisticsItem) {
  selectedLogistics.value = item;
}

function onBackToWorld() {
  currentView.value = 'world';
  selectedCountry.value = null;
  if (earthRef.value) {
    earthRef.value.resetCamera();
  }
}
</script>

<style scoped>
.home-view {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #000;
}

.scene-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: all 0.5s ease;
}
.zoom-fade-enter-from {
  opacity: 0;
  transform: scale(0.9);
}
.zoom-fade-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
</style>
