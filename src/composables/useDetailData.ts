import { ref } from 'vue';

export interface ProjectFootageItem {
  teamId: string;
  projectName: string;
  client: string;
  spudCount: number;
  completionCount: number;
  totalFootage: number;
  maxDailyFootage: string; // "12月1日 120米"
  maxMonthlyFootage: string; // "11月 3500米"
}

export interface DayRateItem {
  teamId: string;
  projectName: string;
  client: string;
  spudCount: number;
  completionCount: number;
  dayRate: string; // % (String with %)
  totalDays: number; // 日费天数
  fullRateDays: number; // 全日费天数
}

export interface KeyProjectDetailItem {
  projectName: string;
  client: string;
  cycle: string; // "2024.01-2025.12"
  workload: string; // "12口井"
  income: number; // 亿
  cost: number; // 亿
  progress: number; // %
  valueWorkload: number; // 亿 (Value Workload)
}

export interface ContractDetailItem {
  contractName: string;
  period: string; // "2023.06-2026.06"
  client: string;
  amount: number; // 亿
  workload: string; // "30口井/3年"
  completedValue: number; // 亿
  cashReceived: number; // 亿
}

export interface ProjectStatsItem {
  projectName: string;
  client: string;
  cycle: string;
  workload: string;
  income: number;
  cost: number;
  progress: number;
}

export interface MarketSigningItem {
  projectName: string;
  client: string;
  amount: number;
  period: string;
  workload: string;
}

const generateFootageData = (count: number): ProjectFootageItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    teamId: `CC7000${i + 1}`,
    projectName: `阿姆河右岸区块${i + 1}号项目`,
    client: 'CNPC International',
    spudCount: Math.floor(Math.random() * 5) + 1,
    completionCount: Math.floor(Math.random() * 5),
    totalFootage: Math.floor(Math.random() * 10000) + 5000,
    maxDailyFootage: `${Math.floor(Math.random() * 12) + 1}月${Math.floor(Math.random() * 28) + 1}日 ${Math.floor(Math.random() * 100) + 100}米`,
    maxMonthlyFootage: `${Math.floor(Math.random() * 12) + 1}月 ${Math.floor(Math.random() * 2000) + 2000}米`
  }));
};

const generateDayRateData = (count: number): DayRateItem[] => {
  return Array.from({ length: count }).map((_, i) => {
    const totalDays = Math.floor(Math.random() * 300) + 50; // 日费天数
    const naturalDays = totalDays + Math.floor(Math.random() * 50); // 自然天数 >= 日费天数
    const fullRateDays = Math.floor(totalDays * (0.8 + Math.random() * 0.2)); // 全日费天数 (Usually a portion of total days)
    
    // Formula: 日费天数 / 自然天数 * 100%
    const rate = Math.min((totalDays / naturalDays) * 100, 100).toFixed(2);

    return {
      teamId: `CC7000${i + 10}`,
      projectName: `伊拉克Rumaila钻井项目${i + 1}`,
      client: 'BP',
      spudCount: Math.floor(Math.random() * 3) + 1,
      completionCount: Math.floor(Math.random() * 3),
      dayRate: `${rate}%`,
      totalDays: totalDays,
      fullRateDays: fullRateDays
    };
  });
};

const generateKeyProjectData = (count: number): KeyProjectDetailItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    projectName: `土库曼斯坦复兴气田${i + 1}期项目`,
    client: 'TurkmenGas',
    cycle: '2024.01-2025.12',
    workload: `${Math.floor(Math.random() * 10) + 5}口深井`,
    income: parseFloat((Math.random() * 5 + 1).toFixed(2)),
    cost: parseFloat((Math.random() * 4 + 0.5).toFixed(2)),
    progress: Math.floor(Math.random() * 80) + 10,
    valueWorkload: parseFloat((Math.random() * 2 + 0.5).toFixed(2))
  }));
};

const generateContractData = (count: number): ContractDetailItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    contractName: `厄瓜多尔Sacha油田钻完井总包合同${i + 1}`,
    period: '2023.06-2026.06',
    client: 'PetroAmazonas',
    amount: parseFloat((Math.random() * 20 + 10).toFixed(2)),
    workload: `${Math.floor(Math.random() * 50) + 20}口井/3年`,
    completedValue: parseFloat((Math.random() * 10 + 2).toFixed(2)),
    cashReceived: parseFloat((Math.random() * 8 + 1).toFixed(2))
  }));
};

const generateProjectStatsData = (count: number): ProjectStatsItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    projectName: `钻井项目${i + 1}`,
    client: 'ADNOC Offshore',
    cycle: '2024.01-2026.12',
    workload: `${Math.floor(Math.random() * 8) + 2}部平台`,
    income: parseFloat((Math.random() * 8 + 2).toFixed(2)),
    cost: parseFloat((Math.random() * 6 + 1).toFixed(2)),
    progress: Math.floor(Math.random() * 90) + 5
  }));
};

const generateMarketSigningData = (count: number): MarketSigningItem[] => {
  return Array.from({ length: count }).map((_, i) => ({
    projectName: `2026新签钻井项目${i + 1}`,
    client: 'Saudi Aramco',
    amount: parseFloat((Math.random() * 30 + 10).toFixed(2)),
    period: '2025.01-2029.12',
    workload: `${Math.floor(Math.random() * 100) + 50}口井`
  }));
};

export const useDetailData = () => {
  const footageData = ref<ProjectFootageItem[]>(generateFootageData(15));
  const dayRateData = ref<DayRateItem[]>(generateDayRateData(12));
  const keyProjectData = ref<KeyProjectDetailItem[]>(generateKeyProjectData(8));
  const contractData = ref<ContractDetailItem[]>(generateContractData(10));
  const projectStatsData = ref<ProjectStatsItem[]>(generateProjectStatsData(20));
  const marketSigningData = ref<MarketSigningItem[]>(generateMarketSigningData(15));

  return {
    footageData,
    dayRateData,
    keyProjectData,
    contractData,
    projectStatsData,
    marketSigningData
  };
};
