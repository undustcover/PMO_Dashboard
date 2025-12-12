<template>
  <div class="dashboard-overlay light-theme">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="title">川庆国际项目管理驾驶舱</h1>
      </div>
      <div class="header-center">
        <div class="kpi-card">
          <span class="label">项目总数</span>
          <span class="value">{{ companyStats.totalProjects }}</span>
        </div>
        <div class="kpi-card">
          <span class="label">年度总收入(亿)</span>
          <span class="value">{{ companyStats.annualIncome }}</span>
        </div>
        <div class="kpi-card">
          <span class="label">签约金额(亿)</span>
          <span class="value">{{ companyStats.contractAmount }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="weather">2025-12-12 晴 24°C</div>
      </div>
    </header>

    <!-- Left Panel -->
    <aside class="panel left-panel">
      <!-- Personnel Stats -->
      <div class="panel-block">
        <h3>人员动态</h3>
        <div class="stat-grid">
           <div class="stat-item">
             <label>总人数</label>
             <span class="val highlight">{{ personnelStats.total }}</span>
           </div>
           <div class="stat-item">
             <label>中方人员</label>
             <span class="val">{{ personnelStats.chinese }}</span>
           </div>
           <div class="stat-item">
             <label>外籍人员</label>
             <span class="val">{{ personnelStats.local }}</span>
           </div>
        </div>
      </div>

      <!-- HSE Stats -->
      <div class="panel-block">
        <h3>HSE 安全管理</h3>
        <div class="stat-grid">
           <div class="stat-item">
             <label>安全工时(百万)</label>
             <span class="val success">{{ hseStats.safeManHours }}</span>
           </div>
           <div class="stat-item">
             <label>安全生产天数</label>
             <span class="val success">{{ hseStats.safeDays }}</span>
           </div>
        </div>
      </div>

      <div class="panel-block">
        <h3>分公司项目概况</h3>
        <div class="chart-container scrollable" id="branch-chart">
          <div v-for="branch in branchStats" :key="branch.name" class="branch-item">
            <div class="branch-name">{{ branch.name }}</div>
            <div class="branch-bars">
              <div class="bar-group">
                <div class="bar-label">项目</div>
                <div class="bar project-bar" :style="{ width: (branch.projectCount / 20 * 100) + '%' }"></div>
                <span class="bar-value">{{ branch.projectCount }}</span>
              </div>
              <div class="bar-group">
                <div class="bar-label">钻机</div>
                <div class="bar rig-bar" :style="{ width: (branch.rigCount / 25 * 100) + '%' }"></div>
                <span class="bar-value">{{ branch.rigCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Right Panel -->
    <aside class="panel right-panel">
      <!-- Operation Stats -->
      <div class="panel-block">
        <h3>生产运行指标</h3>
        <div class="stat-grid">
           <div class="stat-item">
             <label>年度进尺(米)</label>
             <span class="val highlight">{{ operationStats.annualFootage }}</span>
           </div>
           <div class="stat-item">
             <label>日费运营天数</label>
             <span class="val">{{ operationStats.dayRateDays }}</span>
           </div>
        </div>
      </div>

       <!-- Regional Stats -->
      <div class="panel-block">
        <h3>区域项目分布</h3>
        <div class="region-list">
          <div v-for="region in regionStats" :key="region.name" class="region-item">
            <span class="name">{{ region.name }}</span>
            <div class="progress-bg">
              <div class="fill" :style="{ width: region.percentage + '%' }"></div>
            </div>
            <span class="val">{{ region.percentage }}%</span>
          </div>
        </div>
      </div>

      <div class="panel-block">
        <h3>重点项目监控</h3>
        <div class="project-list scrollable">
          <div v-for="project in keyProjects" :key="project.name" class="project-item">
            <div class="project-header">
              <span class="name">{{ project.name }}</span>
              <span class="progress">{{ project.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="fill" :style="{ width: project.progress + '%' }"></div>
            </div>
            <div class="project-details">
              <div>收入: {{ project.income }}亿</div>
              <div>利润: {{ project.profit }}亿</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-block">
        <h3>合同执行情况</h3>
        <div class="contract-stats">
          <div class="stat-row">
            <span>总金额</span>
            <span class="val">{{ contractStats.total }}亿</span>
          </div>
          <div class="stat-row">
            <span>已完成</span>
            <span class="val success">{{ contractStats.completed }}亿</span>
          </div>
          <div class="stat-row">
            <span>未完成</span>
            <span class="val warning">{{ contractStats.uncompleted }}亿</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Detail Modal for Logistics -->
    <Transition name="fade">
      <div v-if="selectedLogistics" class="modal-backdrop" @click.self="$emit('close-modal')">
        <div class="modal-content glass-panel">
          <div class="modal-header">
            <h2>{{ selectedLogistics.name }}</h2>
            <button class="close-btn" @click="$emit('close-modal')">×</button>
          </div>
          <div class="modal-body">
            <div class="info-grid">
              <div class="info-item">
                <label>类型</label>
                <span>{{ formatType(selectedLogistics.type) }}</span>
              </div>
               <div class="info-item">
                <label>所属项目</label>
                <span>{{ selectedLogistics.project }}</span>
              </div>
              <div class="info-item">
                <label>启运地</label>
                <span>{{ selectedLogistics.startLocation }}</span>
              </div>
              <div class="info-item">
                <label>目的地</label>
                <span>{{ selectedLogistics.destination }}</span>
              </div>
               <div class="info-item">
                <label>预计到达</label>
                <span>{{ selectedLogistics.arrivalDate }}</span>
              </div>
              
              <!-- Specific Fields -->
              <template v-if="selectedLogistics.type === 'rig'">
                 <div class="info-item"><label>钻机型号</label><span>{{ selectedLogistics.rigModel }}</span></div>
                 <div class="info-item"><label>钻机编号</label><span>{{ selectedLogistics.rigNo }}</span></div>
                 <div class="info-item"><label>所属单位</label><span>{{ selectedLogistics.unit }}</span></div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useMockData, type LogisticsItem } from '../composables/useMockData';

const { 
  companyStats, branchStats, keyProjects, contractStats,
  hseStats, personnelStats, operationStats, regionStats 
} = useMockData();

defineProps<{
  selectedLogistics?: LogisticsItem | null
}>();

defineEmits(['close-modal']);

const formatType = (type: string) => {
  const map: Record<string, string> = {
    rig: '钻机',
    equipment: '重点设备',
    material: '重点物资'
  };
  return map[type] || type;
};
</script>

<style scoped lang="scss">
// Light / Glass Theme Variables
$glass-bg: rgba(255, 255, 255, 0.75);
$glass-border: rgba(255, 255, 255, 0.4);
$text-main: #1a2b3c;
$text-secondary: #5a6b7c;
$accent-color: #007aff;
$success-color: #34c759;
$warning-color: #ff9500;
$shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

.dashboard-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  box-sizing: border-box;
  color: $text-main;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  z-index: 10;
}

// Common Panel Style (Glassmorphism - Light)
.panel, .header-center, .modal-content {
  background: $glass-bg;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid $glass-border;
  border-radius: 16px;
  pointer-events: auto;
  box-shadow: $shadow;
}

// Header
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  
  .header-left {
    .title {
      font-size: 28px;
      font-weight: 800;
      color: #fff; // Keep title white for contrast against dark space, or change if background is light
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      letter-spacing: 1px;
    }
  }

  .header-center {
    display: flex;
    gap: 40px;
    padding: 10px 40px;
    background: rgba(255, 255, 255, 0.85); // Make center header slightly more opaque
    
    .kpi-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      .label { font-size: 13px; color: $text-secondary; font-weight: 500; }
      .value { font-size: 26px; font-weight: 800; color: $accent-color; }
    }
  }
  
  .header-right {
    font-size: 14px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
}

// Side Panels
.panel {
  width: 380px; // Widened slightly
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: calc(100vh - 120px);
  overflow: hidden;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 700;
    border-left: 4px solid $accent-color;
    padding-left: 12px;
    color: $text-main;
  }
  
  .panel-block {
    margin-bottom: 10px;
  }
}

.scrollable {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 5px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 2px;
  }
}

.left-panel {
  position: absolute;
  top: 100px;
  left: 20px;
  bottom: 20px;
}

.right-panel {
  position: absolute;
  top: 100px;
  right: 20px;
  bottom: 20px;
}

// Stats Grids (New)
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  
  .stat-item {
    background: rgba(255,255,255,0.4);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    
    label { font-size: 12px; color: $text-secondary; margin-bottom: 2px; }
    .val { font-size: 18px; font-weight: bold; color: $text-main; }
    .val.highlight { color: $accent-color; }
    .val.success { color: $success-color; }
  }
}

// Region List (New)
.region-list {
  .region-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    
    .name { width: 70px; color: $text-secondary; }
    .progress-bg {
      flex: 1;
      height: 6px;
      background: rgba(0,0,0,0.05);
      border-radius: 3px;
      margin: 0 10px;
      .fill { height: 100%; background: $accent-color; border-radius: 3px; }
    }
    .val { width: 30px; text-align: right; font-weight: bold; }
  }
}

// Chart/List Styles
.branch-item {
  margin-bottom: 15px;
  .branch-name { font-size: 13px; margin-bottom: 5px; color: $text-main; font-weight: 500; }
  .branch-bars {
    display: flex;
    flex-direction: column;
    gap: 4px;
    .bar-group {
      display: flex;
      align-items: center;
      font-size: 12px;
      .bar-label { width: 30px; color: $text-secondary; }
      .bar { height: 6px; border-radius: 3px; margin: 0 8px; }
      .project-bar { background: $accent-color; }
      .rig-bar { background: $warning-color; }
      .bar-value { color: $text-main; font-weight: bold; }
    }
  }
}

.project-item {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  
  .project-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    font-size: 14px;
    font-weight: 500;
  }
  .progress-bar {
    height: 4px;
    background: rgba(0,0,0,0.05);
    border-radius: 2px;
    margin-bottom: 5px;
    .fill { height: 100%; background: $success-color; border-radius: 2px; }
  }
  .project-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: $text-secondary;
  }
}

.contract-stats {
  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    font-size: 14px;
    .val { font-weight: bold; color: $text-main; }
    .val.success { color: $success-color; }
    .val.warning { color: $warning-color; }
  }
}

// Modal
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.2); // Lighter backdrop
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 1000;
}

.modal-content {
  width: 500px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.95); // Nearly opaque white
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding-bottom: 10px;
    
    h2 { margin: 0; color: $text-main; }
    
    .close-btn {
      background: none;
      border: none;
      color: $text-secondary;
      font-size: 24px;
      cursor: pointer;
      &:hover { color: $text-main; }
    }
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    
    .info-item {
      display: flex;
      flex-direction: column;
      label { font-size: 12px; color: $text-secondary; margin-bottom: 2px; }
      span { font-size: 14px; color: $text-main; font-weight: 500; }
    }
  }
}
</style>
