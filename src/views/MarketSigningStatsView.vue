<template>
  <DetailTable
    title="市场签约额详情列表"
    :columns="columns"
    :data="marketSigningData"
    @back="goBack"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DetailTable, { type ColumnDef } from '../components/DetailTable.vue';
import { useDetailData } from '../composables/useDetailData';

const router = useRouter();
const { marketSigningData } = useDetailData();

const columns: ColumnDef[] = [
  { label: '项目名称', key: 'projectName' },
  { label: '客户名称', key: 'client' },
  { label: '合同金额(亿)', key: 'amount' },
  { label: '合同周期', key: 'period' },
  { label: '合同工作量', key: 'workload' },
];

const goBack = () => {
  router.push('/');
};
</script>
