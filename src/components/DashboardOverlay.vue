<template>
  <div class="dashboard-overlay light-theme">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="title">川庆国际项目管理驾驶舱</h1>
      </div>
      <div class="header-center">
        <div class="kpi-card clickable" @click="router.push('/project-stats')">
          <span class="label">项目总数</span>
          <span class="value gradient-text-blue">{{ companyStats.totalProjects }}</span>
        </div>
        <div class="kpi-card clickable" @click="router.push('/project-stats')">
          <span class="label">年度总收入(亿)</span>
          <span class="value gradient-text-purple">{{ companyStats.annualIncome }}</span>
        </div>
        <div class="kpi-card clickable" @click="router.push('/market-signing')">
          <span class="label">签约金额(亿)</span>
          <span class="value gradient-text-cyan">{{ companyStats.contractAmount }}</span>
        </div>
      </div>
      <div class="header-right">
        <div class="weather">2025-12-12 晴 24°C</div>
      </div>
    </header>

    <!-- Left Panel -->
    <aside class="panel left-panel">
      <!-- Rig Distribution Chart -->
      <div class="panel-block">
        <h3><i class="icon-pie-chart"></i>钻机分布</h3>
        <div class="chart-container" id="rig-chart"></div>
      </div>

      <!-- Project Distribution Chart -->
      <div class="panel-block">
        <h3><i class="icon-pie-chart"></i>项目与收入分布</h3>
        <div class="chart-container" id="project-dist-chart"></div>
      </div>

      <div class="panel-block flex-grow-col">
        <h3><i class="icon-chart"></i>专业公司项目概况</h3>
        <div class="chart-container scrollable-content" id="branch-chart">
          <div v-for="branch in branchStats" :key="branch.name" class="branch-item">
            <div class="branch-name">{{ branch.name }}</div>
            <div class="branch-bars">
              <div class="bar-group">
                <div class="bar-label">项目</div>
                <div class="bar-bg">
                   <div class="bar project-bar" :style="{ width: (branch.projectCount / 20 * 100) + '%' }"></div>
                </div>
                <span class="bar-value">{{ branch.projectCount }}</span>
              </div>
              <div class="bar-group">
                <div class="bar-label">钻机</div>
                <div class="bar-bg">
                  <div class="bar rig-bar" :style="{ width: (branch.rigCount / 25 * 100) + '%' }"></div>
                </div>
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
        <h3><i class="icon-activity"></i>生产运行指标</h3>
        <div class="stat-grid">
           <div class="stat-item clickable" @click="router.push('/footage')">
             <label>年度进尺(米)</label>
             <span class="val highlight">{{ operationStats.annualFootage }}</span>
           </div>
           <div class="stat-item clickable" @click="router.push('/day-rate')">
             <label>日费运营天数</label>
             <span class="val">{{ operationStats.dayRateDays }}</span>
           </div>
        </div>
      </div>

       <!-- Regional Stats -->
      <div class="panel-block">
        <h3><i class="icon-globe"></i>区域项目分布</h3>
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

      <div class="panel-block flex-grow-col">
        <h3 class="clickable-header" @click="router.push('/key-projects')">
          <i class="icon-target"></i>重点项目监控 <span class="arrow">→</span>
        </h3>
        <div class="project-list scrollable-content">
          <div v-for="project in keyProjects" :key="project.name" class="project-item">
            <div class="project-header">
              <span class="name">{{ project.name }}</span>
              <span class="progress">{{ project.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="fill" :style="{ width: project.progress + '%' }"></div>
            </div>
            <div class="project-details">
              <div>收入: <span class="num">{{ project.income }}</span>亿</div>
              <div>利润: <span class="num">{{ project.profit }}</span>亿</div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-block">
        <h3 class="clickable-header" @click="router.push('/contracts')">
          <i class="icon-file"></i>合同执行情况 <span class="arrow">→</span>
        </h3>
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
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { useMockData, type LogisticsItem } from '../composables/useMockData';
import { onMounted, onUnmounted } from 'vue';

const router = useRouter();

const { 
  companyStats, branchStats, keyProjects, contractStats,
  operationStats, regionStats, rigDistribution, projectDistribution
} = useMockData();

defineProps<{
  selectedLogistics?: LogisticsItem | null
}>();

defineEmits(['close-modal']);

let rigChart: echarts.ECharts | null = null;
let projectDistChart: echarts.ECharts | null = null;

const initCharts = () => {
  // Rig Distribution Chart
  const rigDom = document.getElementById('rig-chart');
  if (rigDom) {
    rigChart = echarts.init(rigDom);
    const totalRigs = rigDistribution.value.reduce((acc, curr) => acc + curr.value, 0);
    
    rigChart.setOption({
      title: {
        text: totalRigs + '',
        subtext: '总数',
        left: '59%', // Adjusted to match pie center visual
        top: '48%',
        textAlign: 'center',
        textVerticalAlign: 'middle',
        textStyle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#1e3a8a'
        },
        subtextStyle: {
          fontSize: 14,
          color: '#64748b'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}台 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#64748b' },
        formatter: (name: string) => {
          const item = rigDistribution.value.find(i => i.name === name);
          return item ? `${name} ${item.value}` : name;
        }
      },
      series: [
        {
          name: '钻机分布',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false
            }
          },
          labelLine: {
            show: false
          },
          data: rigDistribution.value,
          center: ['60%', '50%']
        }
      ]
    });
  }

  // Project Distribution Chart
  const projectDom = document.getElementById('project-dist-chart');
  if (projectDom) {
    projectDistChart = echarts.init(projectDom);
    const totalIncome = projectDistribution.value.reduce((acc, curr) => acc + curr.income, 0);
    
    projectDistChart.setOption({
      title: {
        text: totalIncome + '亿',
        subtext: '预测总收',
        left: '64%', // Adjusted to match pie center visual
        top: '48%',
        textAlign: 'center',
        textVerticalAlign: 'middle',
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: '#1e3a8a'
        },
        subtextStyle: {
          fontSize: 12,
          color: '#64748b'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.seriesIndex === 0) {
            return `${params.name}<br/>项目数量: ${params.value}个 (${params.percent}%)`;
          } else {
            return `${params.name}<br/>预测收入: ${params.value}亿 (${params.percent}%)`;
          }
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center',
        textStyle: { color: '#64748b', fontSize: 10 },
        itemWidth: 10,
        itemHeight: 10
      },
      series: [
        // Outer Ring: Project Count
        {
          name: '项目数量',
          type: 'pie',
          radius: ['60%', '75%'],
          center: ['65%', '50%'],
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: { show: false },
          data: projectDistribution.value.map(item => ({ name: item.name, value: item.count }))
        },
        // Inner Ring: Projected Income
        {
          name: '预测收入',
          type: 'pie',
          radius: ['40%', '55%'],
          center: ['65%', '50%'],
          itemStyle: {
            borderRadius: 5,
            borderColor: '#fff',
            borderWidth: 1
          },
          label: { show: false },
          data: projectDistribution.value.map(item => ({ name: item.name, value: item.income }))
        }
      ]
    });
  }
};

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  rigChart?.dispose();
  projectDistChart?.dispose();
});

const handleResize = () => {
  rigChart?.resize();
  projectDistChart?.resize();
};

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
// Premium Light Theme Variables
$text-primary: #0f172a; // Darker slate
$text-secondary: #64748b;
// Refined Glass Effect for Light Tech Background
// Increased opacity and added subtle blue tint to stand out against the light background
$panel-bg: linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.75) 100%); 
$panel-border: rgba(255, 255, 255, 0.9);
$panel-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15); // Slightly stronger shadow

// Gradients
$grad-primary: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%); // Blue -> Cyan
$grad-success: linear-gradient(135deg, #059669 0%, #34d399 100%); // Emerald -> Teal
$grad-warning: linear-gradient(135deg, #d97706 0%, #fbbf24 100%); // Amber -> Yellow
$grad-purple: linear-gradient(135deg, #7c3aed 0%, #c084fc 100%); // Violet -> Purple
$grad-text-title: linear-gradient(90deg, #1e293b 0%, #334155 100%);

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
  padding: 24px;
  box-sizing: border-box;
  color: $text-primary;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  z-index: 10;
}

// Glass Panel Effect
.panel, .header-center, .modal-content, .header-right {
  background: $panel-bg;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid $panel-border;
  box-shadow: $panel-shadow, inset 0 0 0 1px rgba(255, 255, 255, 0.5); // Added inner rim light
  border-radius: 24px; // Softer corners
  pointer-events: auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 15px 50px rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.6);
  }
}

// Header
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 90px;
  
  .header-left {
    .title {
      font-size: 32px;
      font-weight: 800;
      color: #1e3a8a; // Solid dark blue for professional look
      background: none;
      -webkit-background-clip: border-box;
      -webkit-text-fill-color: currentColor;
      letter-spacing: 0.5px;
      text-shadow: none;
    }
  }

  .header-center {
    display: flex;
    gap: 60px;
    padding: 16px 60px;
    border-radius: 100px; // Pill shape
    
    .kpi-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      
      .label { 
        font-size: 13px; 
        color: $text-secondary; 
        font-weight: 600; 
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .value { 
        font-size: 32px; 
        font-weight: 800; 
        line-height: 1.1;
      }
      .gradient-text-blue {
        background: $grad-primary;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .gradient-text-purple {
        background: $grad-purple;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .gradient-text-cyan {
        background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
  }
  
  .header-right {
    font-size: 14px;
    color: $text-primary;
    font-weight: 600;
    padding: 10px 24px;
    border-radius: 100px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '';
      display: block;
      width: 8px;
      height: 8px;
      background: #facc15;
      border-radius: 50%;
      box-shadow: 0 0 10px #facc15;
    }
  }
}

// Side Panels
.panel {
  width: 380px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-height: calc(100vh - 140px);
  overflow: hidden;
  
  h3 {
    margin: 0 0 12px 0;
    font-size: 17px;
    font-weight: 700;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 10px;
    
    // Icon placeholder style
    i {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: rgba(37, 99, 235, 0.1);
      border-radius: 6px;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: $grad-primary;
        -webkit-mask-size: contain;
        mask-size: contain;
        mask-repeat: no-repeat;
      }
      
      &.icon-user::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>'); }
      &.icon-shield::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-4z"/></svg>'); }
      &.icon-pie-chart::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>'); stroke: currentColor; stroke-width: 2; fill: none; mask-image: none; }
      &.icon-chart::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="12" width="4" height="8"/><rect x="10" y="8" width="4" height="12"/><rect x="17" y="4" width="4" height="16"/></svg>'); }
      &.icon-activity::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>'); background: none; border-radius: 0; mask-image: none; }
      &.icon-globe::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'); background: none; border-radius: 0; mask-image: none; }
      &.icon-target::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>'); background: none; border-radius: 0; mask-image: none; }
      &.icon-file::after { mask-image: url('data:image/svg+xml;utf8,<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'); }
    }

    &.clickable-header {
      cursor: pointer;
      justify-content: space-between;
      transition: color 0.2s;

      .arrow {
        opacity: 0;
        transform: translateX(-5px);
        transition: all 0.2s;
        font-size: 14px;
        color: #3b82f6;
      }

      &:hover {
        color: #2563eb;
        
        .arrow {
          opacity: 1;
          transform: translateX(0);
        }
      }
    }
  }
  
  .panel-block {
    flex-shrink: 0; // Don't shrink fixed blocks
    &:not(:last-child) {
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(0,0,0,0.04);
    }
  }

  // Allow specific blocks to grow and shrink
  .panel-block.flex-grow-col {
    flex: 1;
    min-height: 0; // Important for flex scrolling
    display: flex;
    flex-direction: column;
    padding-bottom: 0 !important; // Remove padding for grow block if not last
    border-bottom: none !important; // Remove border
    margin-bottom: 24px; // Use margin instead
    
    // If it IS the last child (left panel case), handle margin
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  min-height: 100px; // Minimum height to show some content
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
    &:hover { background: #94a3b8; }
  }
}

.chart-container {
  width: 100%;
  height: 250px;
  position: relative;
}

// Responsive adjustments for smaller screens (e.g. 1k resolution / laptops)
@media (max-height: 900px) {
  .dashboard-header {
    height: 70px;
    .header-left .title { font-size: 24px; }
    .header-center {
      padding: 8px 40px;
      gap: 30px;
      .kpi-card .value { font-size: 24px; }
    }
  }

  .panel {
    top: 80px;
    bottom: 20px;
    padding: 20px;
    gap: 16px;
    width: 340px;

    h3 { font-size: 15px; margin-bottom: 8px; }
    
    .panel-block:not(:last-child) {
      padding-bottom: 16px;
    }
    
    .panel-block.flex-grow-col {
      margin-bottom: 16px;
    }
  }

  .stat-grid .stat-item {
    padding: 12px;
    .val { font-size: 18px; }
  }

  .project-item {
    padding: 12px;
    margin-bottom: 12px;
  }
}

.left-panel {
  position: absolute;
  top: 110px;
  left: 32px;
  bottom: 32px;
}

.right-panel {
  position: absolute;
  top: 110px;
  right: 32px;
  bottom: 32px;
}

// Stats Grids
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.5);
    padding: 15px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    
    &.clickable {
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.8);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }
    
    label { font-size: 12px; color: $text-secondary; margin-bottom: 6px; font-weight: 600; }
    .val { font-size: 22px; font-weight: 700; color: $text-primary; letter-spacing: -0.5px; }
    .val.highlight { 
      background: $grad-primary;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .val.success { 
      background: $grad-success;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
}

// Region List
.region-list {
  .region-item {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    font-size: 13px;
    
    .name { width: 70px; color: $text-secondary; font-weight: 600; }
    .progress-bg {
      flex: 1;
      height: 10px; // Thicker
      background: #f1f5f9;
      border-radius: 10px;
      margin: 0 16px;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
      
      .fill { 
        height: 100%; 
        background: $grad-primary; 
        border-radius: 10px; 
      }
    }
    .val { width: 40px; text-align: right; font-weight: 700; color: $text-primary; }
  }
}

// Chart/List Styles
.branch-item {
  margin-bottom: 20px;
  .branch-name { font-size: 14px; margin-bottom: 8px; color: $text-primary; font-weight: 700; }
  .branch-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    .bar-group {
      display: flex;
      align-items: center;
      font-size: 12px;
      .bar-label { width: 36px; color: $text-secondary; font-weight: 500; }
      .bar-bg {
        flex: 1;
        height: 8px;
        background: #f1f5f9;
        border-radius: 4px;
        margin: 0 12px;
        overflow: hidden;
      }
      .bar { height: 100%; border-radius: 4px; }
      .project-bar { background: $grad-primary; }
      .rig-bar { background: $grad-warning; }
      .bar-value { color: $text-primary; font-weight: 700; font-size: 12px; width: 24px; text-align: right;}
    }
  }
}

.project-item {
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
  
  .project-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 700;
    color: $text-primary;
    
    .progress {
       color: #059669;
    }
  }
  .progress-bar {
    height: 8px;
    background: #f1f5f9;
    border-radius: 4px;
    margin-bottom: 12px;
    .fill { height: 100%; background: $grad-success; border-radius: 4px; }
  }
  .project-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: $text-secondary;
    .num { font-weight: 700; color: $text-primary; margin-left: 4px; }
  }
}

.contract-stats {
  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px dashed #e2e8f0;
    font-size: 14px;
    
    &:last-child { border-bottom: none; }
    
    span:first-child { color: $text-secondary; font-weight: 500; }
    
    .val { font-weight: 700; color: $text-primary; font-size: 15px; }
    .val.success { background: $grad-success; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .val.warning { background: $grad-warning; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  }
}

// Modal
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.2); // Lighter backdrop
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  z-index: 1000;
}

.modal-content {
  width: 500px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 20px;
    
    h2 { 
      margin: 0; 
      color: $text-primary; 
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    
    .close-btn {
      background: #f1f5f9;
      border: none;
      color: $text-secondary;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      
      &:hover { 
        background: #e2e8f0; 
        color: $text-primary; 
        transform: rotate(90deg);
      }
    }
  }
}
</style>
