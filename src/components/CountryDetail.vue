<template>
  <div class="country-detail-overlay">
    <!-- Header with Glass Effect -->
    <header class="detail-header">
      <div class="header-left-section">
        <button class="back-btn" @click="$emit('back')">
          <i class="icon-back">←</i> 返回世界视图
        </button>
        <h1 class="title">{{ country.name }} 项目详情</h1>
      </div>
      
      <div class="header-right-info">
        <div class="info-group time-group">
          <span class="date">{{ currentDate }}</span>
          <span class="time">{{ currentTime }}</span>
        </div>
        <div class="info-group weather-group">
          <span class="weather-icon">{{ weatherInfo.icon }}</span>
          <span class="weather-temp">{{ weatherInfo.temp }}</span>
          <span class="weather-cond">{{ weatherInfo.condition }}</span>
        </div>
      </div>
    </header>
    
    <div class="detail-container">
      <div class="left-col panel">
        <div class="panel-header">
          <h3><i class="icon-chart"></i>关键指标</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <label>项目总数</label>
            <div class="val gradient-text-blue">{{ country.projectCount }}</div>
          </div>
           <div class="stat-card">
            <label>总收入(亿)</label>
            <div class="val gradient-text-purple">{{ country.income }}</div>
          </div>
           <div class="stat-card">
            <label>总成本(亿)</label>
            <div class="val gradient-text-warning">{{ country.cost }}</div>
          </div>
           <div class="stat-card">
            <label>整体进度</label>
            <div class="val gradient-text-success">{{ country.progress }}%</div>
          </div>
        </div>

        <div class="project-list-container">
          <div class="panel-header">
            <h3><i class="icon-list"></i>作业队伍与项目</h3>
          </div>
          <div class="project-list scrollable-content">
            <div v-for="i in country.projectCount" :key="i" class="project-item">
              <div class="item-header">
                <span class="team-name">CC7000{{ i }}钻井队</span>
                <span class="status-badge">进行中</span>
              </div>
              <div class="project-name">{{ country.name }}区块{{ i }}号井项目</div>
              <div class="progress-bar">
                <div class="fill" :style="{ width: (Math.random() * 30 + 60) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-col panel map-panel">
        <div class="panel-header">
           <h3><i class="icon-map"></i>作业分布图</h3>
        </div>
        <!-- ECharts container for the country map -->
        <div ref="mapChart" class="echarts-map"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, watch, onUnmounted, computed } from 'vue';
import * as echarts from 'echarts';
import type { CountryData } from '../composables/useMockData';

const props = defineProps<{
  country: CountryData
}>();

defineEmits(['back']);

const mapChart = ref<HTMLElement | null>(null);
let myChart: echarts.ECharts | null = null;

// Weather and Time Logic
const currentDate = ref('');
const currentTime = ref('');
const weatherInfo = ref({ temp: '25°C', condition: '晴', icon: '☀️' });
let timer: any = null;

const timeZoneMap: Record<string, string> = {
  'TM': 'Asia/Ashgabat',
  'PK': 'Asia/Karachi',
  'EC': 'America/Guayaquil',
  'BD': 'Asia/Dhaka',
  'IQ': 'Asia/Baghdad',
  'PE': 'America/Lima',
  'CN': 'Asia/Shanghai'
};

const weatherMockMap: Record<string, { temp: string; condition: string; icon: string }> = {
  'TM': { temp: '32°C', condition: '晴', icon: '☀️' },
  'PK': { temp: '35°C', condition: '多云', icon: '⛅' },
  'EC': { temp: '22°C', condition: '小雨', icon: '🌧️' },
  'BD': { temp: '29°C', condition: '雷阵雨', icon: '⛈️' },
  'IQ': { temp: '38°C', condition: '晴', icon: '☀️' },
  'PE': { temp: '18°C', condition: '阴', icon: '☁️' },
  'CN': { temp: '24°C', condition: '晴', icon: '☀️' }
};

const updateTime = () => {
  const iso2 = props.country.id;
  const timeZone = timeZoneMap[iso2] || 'UTC';
  
  const now = new Date();
  
  try {
    const dateOptions: Intl.DateTimeFormatOptions = { 
      timeZone, 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      timeZone, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
    };
    
    currentDate.value = new Intl.DateTimeFormat('zh-CN', dateOptions).format(now);
    currentTime.value = new Intl.DateTimeFormat('zh-CN', timeOptions).format(now);
  } catch (e) {
    console.error('Timezone error:', e);
    currentDate.value = now.toLocaleDateString();
    currentTime.value = now.toLocaleTimeString();
  }
};

const updateWeather = () => {
  const iso2 = props.country.id;
  weatherInfo.value = weatherMockMap[iso2] || { temp: '25°C', condition: '晴', icon: '☀️' };
};

onMounted(() => {
  initMap();
  window.addEventListener('resize', () => myChart?.resize());
  
  updateTime();
  updateWeather();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// Watch for country changes
watch(() => props.country, () => {
  initMap();
  updateTime();
  updateWeather();
});

const initMap = () => {
  if (!mapChart.value) return;
  
  if (myChart) {
      myChart.dispose();
  }
  myChart = echarts.init(mapChart.value);
  myChart.showLoading();

  // Mapping from ISO2 (Mock Data) to ISO3 (GeoBoundaries)
  const iso2ToIso3: Record<string, string> = {
      'TM': 'TKM', 'PK': 'PAK', 'EC': 'ECU', 
      'BD': 'BGD', 'IQ': 'IRQ', 'PE': 'PER',
      'CN': 'CHN'
  };

  const iso3 = iso2ToIso3[props.country.id] || props.country.id;
  
  // Try to fetch detailed province-level data (Admin 1)
  let detailedUrl = '';
  let nameProp = 'name'; // Default for Natural Earth and Aliyun

  if (iso3 === 'CHN') {
      // Use Aliyun DataV for China (Chinese names)
      detailedUrl = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
      nameProp = 'name';
  } else {
      // Use geoBoundaries for others (Local/English names)
      // Using media.githubusercontent.com to resolve Git LFS files correctly
      detailedUrl = `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/${iso3}/ADM1/geoBoundaries-${iso3}-ADM1.geojson`;
      nameProp = 'shapeName';
  }
  
  // Fallback URL (Admin 0 - Outline only)
  const fallbackUrl = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

  console.log(`Loading map for ${props.country.name} (${iso3})...`);

  fetch(detailedUrl)
    .then(res => {
        if (!res.ok) throw new Error(`Detailed map not found: ${res.statusText}`);
        return res.json();
    })
    .then(geojson => {
      console.log('Detailed map loaded successfully');
      renderMap(geojson, true, nameProp);
    })
    .catch((err) => {
        // Fallback to Natural Earth Admin 0
        console.warn(`Detailed map for ${iso3} failed: ${err.message}. Falling back to world outline.`);
        fetch(fallbackUrl)
            .then(res => res.json())
            .then(geojson => {
                 // Filter for the selected country feature
                 const feature = geojson.features.find((f: any) => 
                    f.properties.name === props.country.nameEn || 
                    f.properties.sov_a3 === iso3 ||
                    f.properties.adm0_a3 === iso3
                 );
                 if (feature) {
                     renderMap({ type: 'FeatureCollection', features: [feature] }, false, 'name');
                 } else {
                     showError('暂无地图数据');
                 }
            })
            .catch(err => {
                console.error('Failed to load fallback map:', err);
                showError('地图加载失败');
            });
    });
};

const showError = (msg: string) => {
    myChart?.hideLoading();
    myChart?.setOption({
        title: { 
            text: msg, 
            left: 'center', 
            top: 'center',
            textStyle: { color: '#64748b' }
        }
    });
};

const renderMap = (geojson: any, isDetailed: boolean, nameProp: string = 'name') => {
    myChart?.hideLoading();
    echarts.registerMap('countryMap', geojson);
    
    // Generate simulated project locations
    const data = Array.from({ length: props.country.projectCount }).map((_, i) => ({
        name: `项目${i+1}`,
        value: [
            props.country.lon + (Math.random() - 0.5) * (isDetailed ? 2 : 5), 
            props.country.lat + (Math.random() - 0.5) * (isDetailed ? 2 : 5)
        ]
    }));

    const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderColor: '#fff',
            textStyle: { color: '#333' },
            formatter: (params: any) => {
                if (params.componentType === 'series') {
                    return `${params.marker} ${params.name}`;
                } else if (params.componentType === 'geo') {
                    // Try to get name from properties using the specified property name
                    const props = params.data?.properties || {};
                    return props[nameProp] || props.name || params.name; 
                }
                return '';
            }
        },
        geo: {
            map: 'countryMap',
            roam: true,
            zoom: 1.2,
            label: {
                show: isDetailed, // Show labels only if we have detailed provinces
                color: '#64748b',
                fontSize: 10,
                formatter: (params: any) => {
                     return params.name; 
                }
            },
            itemStyle: {
                areaColor: '#e0f2fe',
                borderColor: '#0ea5e9',
                borderWidth: 1,
                shadowColor: 'rgba(0, 0, 0, 0.1)',
                shadowBlur: 10
            },
            emphasis: {
                itemStyle: { areaColor: '#bae6fd' },
                label: { show: true, color: '#0f172a' }
            },
            // Use the dynamically determined name property
            nameProperty: nameProp 
        },
        series: [
            {
                name: '项目分布',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: data,
                symbolSize: 15,
                showEffectOn: 'render',
                rippleEffect: { brushType: 'stroke', scale: 3 },
                itemStyle: { color: '#f59e0b', shadowBlur: 10, shadowColor: '#333' },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'right',
                    color: '#334155',
                    fontWeight: 'bold',
                    fontSize: 12
                },
                zlevel: 1
            }
        ]
    };
    
    myChart?.setOption(option);
};

onMounted(() => {
  initMap();
  window.addEventListener('resize', () => myChart?.resize());
});

// Watch for country changes if the component is kept alive (though v-if in parent usually remounts)
watch(() => props.country, () => {
    initMap();
});

</script>

<style scoped lang="scss">
// Variables matching DashboardOverlay.vue
$text-primary: #0f172a;
$text-secondary: #64748b;
$panel-bg: linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 249, 255, 0.75) 100%);
$panel-border: rgba(255, 255, 255, 0.9);
$panel-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);

$grad-primary: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
$grad-success: linear-gradient(135deg, #059669 0%, #34d399 100%);
$grad-warning: linear-gradient(135deg, #d97706 0%, #fbbf24 100%);
$grad-purple: linear-gradient(135deg, #7c3aed 0%, #c084fc 100%);

.country-detail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // Light gray-blue background matching Home/Dashboard
  background: #f1f5f9; 
  z-index: 500;
  padding: 24px;
  box-sizing: border-box;
  color: $text-primary;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  position: relative;
  
  .header-left-section {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  
  .back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    background: white;
    border: none;
    border-radius: 12px;
    color: #3b82f6;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    transition: all 0.2s ease;
    
    &:hover {
      background: #eff6ff;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.25);
    }
  }

  .title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    background: $grad-primary;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header-right-info {
    display: flex;
    align-items: center;
    gap: 24px;
    
    .info-group {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
    }
    
    .time-group {
      .date {
        color: $text-secondary;
        font-size: 14px;
        font-weight: 500;
      }
      .time {
        color: #1e3a8a;
        font-size: 18px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
    }
    
    .weather-group {
      .weather-icon {
        font-size: 20px;
      }
      .weather-temp {
        font-size: 18px;
        font-weight: 700;
        color: #1e3a8a;
      }
      .weather-cond {
        color: $text-secondary;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
}

.detail-container {
  display: flex;
  flex: 1;
  gap: 24px;
  overflow: hidden; // Prevent full page scroll
  
  .panel {
    background: $panel-bg;
    backdrop-filter: blur(24px);
    border: 1px solid $panel-border;
    box-shadow: $panel-shadow;
    border-radius: 24px;
    padding: 24px;
    display: flex;
    flex-direction: column;
  }
  
  .left-col {
    flex: 1;
    max-width: 450px;
    gap: 24px;
    
    .panel-header {
       margin-bottom: 16px;
       h3 {
         margin: 0;
         font-size: 18px;
         color: #334155;
         display: flex;
         align-items: center;
         gap: 8px;
       }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      
      .stat-card {
        background: rgba(255,255,255,0.6);
        padding: 16px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.8);
        
        label { display: block; font-size: 12px; color: $text-secondary; margin-bottom: 4px; font-weight: 600; }
        .val { font-size: 24px; font-weight: 800; }
        
        .gradient-text-blue { background: $grad-primary; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-text-purple { background: $grad-purple; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-text-warning { background: $grad-warning; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .gradient-text-success { background: $grad-success; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      }
    }

    .project-list-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0; // For flex scroll
      
      .project-list {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;
        
        // Scrollbar styling
        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-track { background: transparent; }
        &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .project-item {
          background: white;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          transition: transform 0.2s;
          
          &:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          
          .item-header {
             display: flex;
             justify-content: space-between;
             margin-bottom: 8px;
             .team-name { font-weight: 700; color: #3b82f6; font-size: 13px; }
             .status-badge { 
                background: #ecfdf5; 
                color: #059669; 
                padding: 2px 8px; 
                border-radius: 100px; 
                font-size: 11px; 
                font-weight: 600;
             }
          }
          
          .project-name { font-weight: 600; font-size: 14px; margin-bottom: 10px; color: $text-primary; }
          
          .progress-bar {
             height: 6px;
             background: #f1f5f9;
             border-radius: 3px;
             overflow: hidden;
             .fill { height: 100%; background: $grad-success; border-radius: 3px; }
          }
        }
      }
    }
  }

  .right-col {
    flex: 2;
    padding: 0; // Map fills panel
    overflow: hidden;
    position: relative;
    
    .panel-header {
        position: absolute;
        top: 24px;
        left: 24px;
        z-index: 10;
        background: rgba(255,255,255,0.8);
        backdrop-filter: blur(8px);
        padding: 8px 16px;
        border-radius: 100px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        
        h3 { margin: 0; font-size: 16px; color: #334155; display: flex; align-items: center; gap: 8px; }
    }
    
    .echarts-map {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
