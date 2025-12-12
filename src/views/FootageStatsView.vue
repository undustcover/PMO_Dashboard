<template>
  <DetailTable
    title="各项目进尺统计列表"
    :columns="columns"
    :data="footageData"
    @back="goBack"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DetailTable, { type ColumnDef } from '../components/DetailTable.vue';
import { useDetailData } from '../composables/useDetailData';

const router = useRouter();
const { footageData } = useDetailData();

const columns: ColumnDef[] = [
  { label: '钻井队编号', key: 'teamId' },
  { label: '项目名称', key: 'projectName' },
  { label: '客户名称', key: 'client' },
  { label: '开钻数', key: 'spudCount' },
  { label: '完井数', key: 'completionCount' },
  { label: '总进尺(米)', key: 'totalFootage' },
  { label: '最高日进尺', key: 'maxDailyFootage' },
  { label: '最高月进尺', key: 'maxMonthlyFootage' },
];

const goBack = () => {
  router.push('/');
};
</script>
