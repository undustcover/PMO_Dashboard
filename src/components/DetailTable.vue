<template>
  <div class="detail-table-overlay">
    <header class="detail-header">
      <button class="back-btn" @click="$emit('back')">
        <i class="icon-back">←</i> 返回
      </button>
      <h1 class="title">{{ title }}</h1>
    </header>

    <div class="table-container glass-panel">
      <table class="detail-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="{ width: col.width }">
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="index">
            <td v-for="col in columns" :key="col.key">
              {{ row[col.key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

export interface ColumnDef {
  label: string;
  key: string;
  width?: string;
}

defineProps<{
  title: string;
  columns: ColumnDef[];
  data: any[];
}>();

defineEmits(['back']);
</script>

<style scoped lang="scss">
// Reuse SCSS variables from DashboardOverlay logic (simplified)
$text-primary: #0f172a;
$text-secondary: #64748b;
$panel-bg: linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.85) 100%);
$panel-border: rgba(255, 255, 255, 0.9);
$panel-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);

.detail-table-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  z-index: 100; // Above dashboard
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;

  .back-btn {
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid #fff;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: #334155;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 5px;

    &:hover {
      background: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
}

.table-container {
  flex: 1;
  overflow: hidden; // For internal scroll
  background: $panel-bg;
  backdrop-filter: blur(24px);
  border: 1px solid $panel-border;
  border-radius: 20px;
  box-shadow: $panel-shadow;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  display: block; // For scrolling
  height: 100%;
  overflow-y: auto;

  thead {
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.95); // Opaque header
    z-index: 10;
    
    tr {
      border-bottom: 2px solid #e2e8f0;
    }

    th {
      padding: 16px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.2s;

      &:hover {
        background: rgba(224, 242, 254, 0.5);
      }

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 16px;
        color: #334155;
        font-size: 14px;
      }
    }
  }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}
</style>
