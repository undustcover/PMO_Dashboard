import { ref } from 'vue';

// Types
export interface CountryData {
  id: string;
  name: string;
  nameEn: string; // For mapping to geojson or textures if needed
  lat: number;
  lon: number;
  projectCount: number;
  income: number; // In millions
  cost: number; // In millions
  progress: number; // Percentage
  description?: string;
}

export interface LogisticsItem {
  id: string;
  type: 'rig' | 'equipment' | 'material';
  transportType: 'truck' | 'ship' | 'plane' | 'train';
  name: string;
  project: string;
  startLocation: string;
  startLat: number;
  startLon: number;
  destination: string;
  destLat: number;
  destLon: number;
  startDate: string;
  arrivalDate: string;
  currentLat: number;
  currentLon: number;
  // Specific details
  rigModel?: string;
  rigNo?: string;
  factoryDate?: string;
  unit?: string;
  startDrillDate?: string;
  
  equipmentModel?: string;
  requiredDate?: string;

  materialModel?: string;
  useDate?: string;
  
  waypoints?: Array<{lat: number, lon: number}>;
}

export interface CompanyStats {
  totalProjects: number;
  annualIncome: number;
  contractAmount: number;
}

export interface BranchStat {
  name: string;
  projectCount: number;
  rigCount: number;
}

export interface KeyProject {
  name: string;
  progress: number;
  workloadValue: number;
  income: number;
  profit: number;
}

export interface ContractStats {
  total: number;
  completed: number;
  uncompleted: number;
}

export interface HseStats {
  safeManHours: number; // Million hours
  safeDays: number;
  incidents: number;
}

export interface PersonnelStats {
  total: number;
  chinese: number;
  local: number;
}

export interface OperationStats {
  annualFootage: number; // Meters
  dayRateDays: number; // Days
}

export interface RegionStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RigDistributionItem {
  name: string;
  value: number;
}

export interface ProjectDistributionItem {
  name: string;
  count: number;
  income: number; // In billions
}

// Mock Data Generator
export function useMockData() {
  
  const countries = ref<CountryData[]>([
    { id: 'TM', name: '土库曼斯坦', nameEn: 'Turkmenistan', lat: 38.9697, lon: 59.5563, projectCount: 12, income: 450, cost: 320, progress: 78 },
    { id: 'PK', name: '巴基斯坦', nameEn: 'Pakistan', lat: 30.3753, lon: 69.3451, projectCount: 8, income: 280, cost: 210, progress: 65 },
    { id: 'EC', name: '厄瓜多尔', nameEn: 'Ecuador', lat: -1.8312, lon: -78.1834, projectCount: 5, income: 150, cost: 110, progress: 45 },
    { id: 'BD', name: '孟加拉国', nameEn: 'Bangladesh', lat: 23.6850, lon: 90.3563, projectCount: 3, income: 90, cost: 70, progress: 88 },
    { id: 'IQ', name: '伊拉克', nameEn: 'Iraq', lat: 33.2232, lon: 43.6793, projectCount: 15, income: 890, cost: 600, progress: 92 },
    { id: 'PE', name: '秘鲁', nameEn: 'Peru', lat: -9.1900, lon: -75.0152, projectCount: 4, income: 120, cost: 95, progress: 30 },
  ]);

  const logistics = ref<LogisticsItem[]>([
    {
      id: 'L001',
      type: 'rig',
      transportType: 'ship',
      name: 'CC70012钻机',
      project: '鲁迈拉油田项目',
      startLocation: '上海港',
      startLat: 31.2304,
      startLon: 121.4737,
      destination: '巴士拉港',
      destLat: 30.5081,
      destLon: 47.7835,
      startDate: '2025-11-01',
      arrivalDate: '2025-12-20',
      currentLat: 10.0, // Indian Ocean
      currentLon: 65.0,
      rigNo: 'CC70012',
      rigModel: 'ZJ70D',
      factoryDate: '2020-05-15',
      unit: '国际工程公司',
      startDrillDate: '2026-01-15',
      waypoints: [
        { lat: 25.0, lon: 123.0 }, // East China Sea
        { lat: 5.0, lon: 108.0 }, // South China Sea
        { lat: 1.5, lon: 104.0 }, // Singapore
        { lat: 5.8, lon: 95.0 }, // Malacca Exit
        { lat: 6.0, lon: 80.0 }, // South of Sri Lanka
        { lat: 15.0, lon: 60.0 }, // Arabian Sea
        { lat: 26.0, lon: 56.5 }  // Hormuz
      ]
    },
    {
      id: 'L002',
      type: 'equipment',
      transportType: 'train', // Changed to train for variety
      name: '顶驱装置DQ-90',
      project: '土库曼复兴气田',
      startLocation: '西安',
      startLat: 34.3416,
      startLon: 108.9398,
      destination: '阿什哈巴德',
      destLat: 37.9601,
      destLon: 58.3261,
      startDate: '2025-12-01',
      arrivalDate: '2025-12-15',
      currentLat: 40.0,
      currentLon: 70.0, // Central Asia
      equipmentModel: 'TDS-11SA',
      requiredDate: '2025-12-20'
    },
    {
      id: 'L003',
      type: 'material',
      transportType: 'ship',
      name: '高强度钻杆',
      project: '厄瓜多尔19区块',
      startLocation: '天津港',
      startLat: 39.0842,
      startLon: 117.2009,
      destination: '瓜亚基尔港',
      destLat: -2.1894,
      destLon: -79.8891,
      startDate: '2025-10-20',
      arrivalDate: '2025-12-30',
      currentLat: 20.0, // Pacific
      currentLon: -140.0,
      materialModel: 'G105',
      useDate: '2026-01-10',
      waypoints: [
        { lat: 30.0, lon: 130.0 }, // South of Japan
        { lat: 20.0, lon: 180.0 }, // Central Pacific
        { lat: 10.0, lon: -140.0 }, // East Pacific
        { lat: 0.0, lon: -100.0 }   // Galapagos Vicinity
      ]
    },
    {
      id: 'L004',
      type: 'equipment',
      transportType: 'plane',
      name: '精密测井仪',
      project: '伊拉克AK项目',
      startLocation: '北京',
      startLat: 39.9042,
      startLon: 116.4074,
      destination: '巴格达',
      destLat: 33.3152,
      destLon: 44.3661,
      startDate: '2025-12-10',
      arrivalDate: '2025-12-11',
      currentLat: 35.0, 
      currentLon: 60.0,
      equipmentModel: 'ECLIPS-5700',
      requiredDate: '2025-12-12'
    },
    {
      id: 'L005',
      type: 'material',
      transportType: 'truck',
      name: '化工助剂',
      project: '孟加拉项三口井目',
      startLocation: '阿拉山口',
      startLat: 24.8801,
      startLon: 102.8329,
      destination: '达卡',
      destLat: 23.8103,
      destLon: 90.4125,
      startDate: '2025-12-05',
      arrivalDate: '2025-12-12',
      currentLat: 24.0, 
      currentLon: 95.0,
      materialModel: 'Polymer-X',
      useDate: '2025-12-15'
    }
  ]);

  const companyStats = ref<CompanyStats>({
    totalProjects: 47,
    annualIncome: 35.8, // Billion
    contractAmount: 42.5 // Billion
  });

  const branchStats = ref<BranchStat[]>([
    { name: '国际工程公司', projectCount: 15, rigCount: 20 },
    { name: '川西钻探公司', projectCount: 10, rigCount: 15 },
    { name: '川东钻探公司', projectCount: 8, rigCount: 12 },
    { name: '长庆钻井总公司', projectCount: 6, rigCount: 8 },
    { name: '蜀渝公司', projectCount: 3, rigCount: 5 },
    { name: '试修公司', projectCount: 3, rigCount: 6 },
    { name: '井下作业公司', projectCount: 2, rigCount: 4 },
  ]);

  const keyProjects = ref<KeyProject[]>([
    { name: '伊拉克AK项目', progress: 92, workloadValue: 12.5, income: 4.2, profit: 0.8 },
    { name: '土库曼复兴气田', progress: 78, workloadValue: 8.3, income: 2.1, profit: 0.4 },
    { name: '巴基斯坦OPI项目', progress: 65, workloadValue: 5.1, income: 1.5, profit: 0.2 },
    { name: '厄瓜多尔19区块', progress: 45, workloadValue: 3.2, income: 0.9, profit: 0.1 },
  ]);

  const contractStats = ref<ContractStats>({
    total: 42.5,
    completed: 28.3,
    uncompleted: 14.2
  });

  const hseStats = ref<HseStats>({
    safeManHours: 12.5,
    safeDays: 2850,
    incidents: 0
  });

  const personnelStats = ref<PersonnelStats>({
    total: 3580,
    chinese: 1250,
    local: 2330
  });

  const operationStats = ref<OperationStats>({
    annualFootage: 125800,
    dayRateDays: 4560
  });

  const regionStats = ref<RegionStat[]>([
    { name: '中东地区', count: 15, percentage: 35 },
    { name: '中亚地区', count: 12, percentage: 28 },
    { name: '美洲地区', count: 9, percentage: 21 },
    { name: '亚太地区', count: 7, percentage: 16 }
  ]);

  const rigDistribution = ref<RigDistributionItem[]>([
    { name: '土库曼斯坦', value: 10 },
    { name: '巴基斯坦', value: 9 },
    { name: '厄瓜多尔', value: 8 },
    { name: '秘鲁', value: 6 },
    { name: '孟加拉国', value: 3 },
    { name: '伊拉克', value: 2 }
  ]);

  const projectDistribution = ref<ProjectDistributionItem[]>([
    { name: '土库曼斯坦', count: 15, income: 15 },
    { name: '厄瓜多尔', count: 12, income: 8 },
    { name: '巴基斯坦', count: 10, income: 2 },
    { name: '孟加拉', count: 3, income: 5 },
    { name: '伊拉克', count: 3, income: 3 },
    { name: '秘鲁', count: 2, income: 3 },
    { name: '中东', count: 2, income: 1 }
  ]);

  return {
    countries,
    logistics,
    companyStats,
    branchStats,
    keyProjects,
    contractStats,
    hseStats,
    personnelStats,
    operationStats,
    regionStats,
    rigDistribution,
    projectDistribution
  };
}
