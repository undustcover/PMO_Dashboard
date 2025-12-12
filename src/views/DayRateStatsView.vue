<template>
  <DetailTable
    title="日费项目日费天数统计列表"
    :columns="columns"
    :data="dayRateData"
    @back="goBack"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DetailTable, { type ColumnDef } from '../components/DetailTable.vue';
import { useDetailData } from '../composables/useDetailData';

const router = useRouter();
const { dayRateData } = useDetailData();

const columns: ColumnDef[] = [
  { label: '钻井队编号', key: 'teamId' },
  { label: '项目名称', key: 'projectName' },
  { label: '客户名称', key: 'client' },
  { label: '开钻数', key: 'spudCount' },
  { label: '完井数', key: 'completionCount' },
  { label: '日费率', key: 'dayRate' },
  { label: '总日费天数', key: 'totalDays' },
  { label: '全日费天数', key: 'fullRateDays' },
];

const goBack = () => {
  router.push('/');
};
</script>
