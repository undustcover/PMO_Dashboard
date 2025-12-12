<template>
  <DetailTable
    title="各项目进尺统计列表"
    :columns="columns"
    :data="projectStatsData"
    @back="goBack"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DetailTable, { type ColumnDef } from '../components/DetailTable.vue';
import { useDetailData } from '../composables/useDetailData';

const router = useRouter();
const { projectStatsData } = useDetailData();

const columns: ColumnDef[] = [
  { label: '项目名称', key: 'projectName' },
  { label: '客户名称', key: 'client' },
  { label: '项目周期', key: 'cycle' },
  { label: '项目工作量', key: 'workload' },
  { label: '项目收入(亿)', key: 'income' },
  { label: '项目成本(亿)', key: 'cost' },
  { label: '项目进度(%)', key: 'progress' },
];

const goBack = () => {
  router.push('/');
};
</script>
