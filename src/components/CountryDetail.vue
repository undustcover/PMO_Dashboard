<template>
  <div class="country-detail-overlay">
    <button class="back-btn" @click="$emit('back')">← 返回世界视图</button>
    
    <div class="detail-container">
      <div class="left-col">
        <h2>{{ country.name }} 项目详情</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <label>项目总数</label>
            <div class="val">{{ country.projectCount }}</div>
          </div>
           <div class="stat-card">
            <label>总收入</label>
            <div class="val">{{ country.income }}亿</div>
          </div>
           <div class="stat-card">
            <label>总成本</label>
            <div class="val">{{ country.cost }}亿</div>
          </div>
           <div class="stat-card">
            <label>整体进度</label>
            <div class="val">{{ country.progress }}%</div>
          </div>
        </div>

        <div class="project-list">
          <h3>作业队伍与项目</h3>
          <ul>
            <li v-for="i in country.projectCount" :key="i">
              <span class="team-name">第{{ 100 + i }}钻井队</span>
              <span class="project-name">{{ country.name }}区块{{ i }}号井项目</span>
              <span class="status">进行中</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="right-col map-placeholder">
        <!-- ECharts container for the country map -->
        <div ref="mapChart" class="echarts-map"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import * as echarts from 'echarts';
import type { CountryData } from '../composables/useMockData';

const props = defineProps<{
  country: CountryData
}>();

defineEmits(['back']);

const mapChart = ref<HTMLElement | null>(null);

onMounted(() => {
  if (mapChart.value) {
    const chart = echarts.init(mapChart.value);
    
    // Simulate a map with scatter points since we lack GeoJSON
    // In a real app, we would load the specific GeoJSON for props.country.nameEn
    const data = Array.from({ length: props.country.projectCount }).map((_, i) => ({
      name: `项目点${i+1}`,
      value: [
        Math.random() * 100, // Simulated X
        Math.random() * 100  // Simulated Y
      ]
    }));

    chart.setOption({
      title: {
        text: `${props.country.name} 作业分布图 (模拟)`,
        left: 'center',
        textStyle: { color: '#fff' }
      },
      grid: { top: 60, bottom: 40, left: 40, right: 40 },
      xAxis: { show: false, min: 0, max: 100 },
      yAxis: { show: false, min: 0, max: 100 },
      series: [
        {
          type: 'scatter',
          symbolSize: 20,
          data: data,
          itemStyle: { color: '#ffbd00' },
          label: {
            show: true,
            formatter: '{b}',
            position: 'right',
            color: '#fff'
          }
        },
        {
          type: 'effectScatter', // Ripple effect
          coordinateSystem: 'cartesian2d',
          data: data,
          symbolSize: 20,
          showEffectOn: 'render',
          rippleEffect: { brushType: 'stroke' },
          itemStyle: { color: '#ffbd00' }
        }
      ]
    });
    
    window.addEventListener('resize', () => chart.resize());
  }
});
</script>

<style scoped lang="scss">
.country-detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 30, 0.95); // High opacity to cover the globe
  z-index: 500;
  padding: 40px;
  box-sizing: border-box;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.back-btn {
  align-self: flex-start;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  cursor: pointer;
  margin-bottom: 30px;
  border-radius: 4px;
  &:hover { background: rgba(255, 255, 255, 0.2); }
}

.detail-container {
  display: flex;
  flex: 1;
  gap: 40px;
  
  .left-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 30px;
    
    h2 { font-size: 32px; margin: 0; color: #00d2ff; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      .stat-card {
        background: rgba(255,255,255,0.05);
        padding: 20px;
        border-radius: 8px;
        label { display: block; font-size: 14px; opacity: 0.6; margin-bottom: 5px; }
        .val { font-size: 24px; font-weight: bold; }
      }
    }

    .project-list {
      flex: 1;
      overflow-y: auto;
      background: rgba(255,255,255,0.05);
      padding: 20px;
      border-radius: 8px;
      
      h3 { margin-top: 0; }
      
      ul {
        list-style: none;
        padding: 0;
        li {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          .team-name { color: #00d2ff; }
          .status { color: #00ff9d; }
        }
      }
    }
  }

  .right-col {
    flex: 2;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    position: relative;
    
    .echarts-map {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
