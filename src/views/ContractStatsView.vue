<template>
  <DetailTable
    title="合同执行情况详情列表"
    :columns="columns"
    :data="contractData"
    @back="goBack"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import DetailTable, { type ColumnDef } from '../components/DetailTable.vue';
import { useDetailData } from '../composables/useDetailData';

const router = useRouter();
const { contractData } = useDetailData();

const columns: ColumnDef[] = [
  { label: '合同名称', key: 'contractName' },
  { label: '合同执行起止时间', key: 'period' },
  { label: '客户名称', key: 'client' },
  { label: '合同金额(亿)', key: 'amount' },
  { label: '合同工作量', key: 'workload' },
  { label: '已完成价值工作量金额(亿)', key: 'completedValue' },
  { label: '已收现金额(亿)', key: 'cashReceived' },
];

const goBack = () => {
  router.push('/');
};
</script>
