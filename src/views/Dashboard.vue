<script setup>
import { computed } from 'vue';
import { Receipt, Building2, Clock, Banknote, ArrowRight, Wallet, TrendingUp } from 'lucide-vue-next';
import { toCE } from '../utils/date';

const props = defineProps(['invoices', 'tenants', 'ownerSettings', 'expenses']);
const emit = defineEmits(['navigate']);

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const currentMonth = thaiMonths[new Date().getMonth()];
const currentYear = new Date().getFullYear();

const activeTenantsCount = computed(() => props.tenants.length);
const occupiedRooms = computed(() => props.tenants.filter(t => t.active).length);

const monthlyStats = computed(() => {
  const currentYearCE = String(currentYear);
  const thisMonthInvoices = props.invoices.filter(inv =>
    inv.month === currentMonth && toCE(inv.year) === currentYearCE
  );
  
  // Expenses this month
  const thisMonthExpenses = (props.expenses || []).filter(ex => {
      const exDate = new Date(ex.date);
      return thaiMonths[exDate.getMonth()] === currentMonth && exDate.getFullYear() === currentYear;
  });

  const totalRevenue = thisMonthInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalExpenses = thisMonthExpenses.reduce((sum, ex) => sum + (ex.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  return {
    count: thisMonthInvoices.length,
    total: totalRevenue,
    expenses: totalExpenses,
    profit: netProfit
  };
});

const stats = computed(() => [
  { 
    label: 'ห้องพัก', 
    value: activeTenantsCount.value, 
    sub: 'ห้องที่ใช้งาน', 
    icon: Building2, 
    color: 'bg-blue-100 text-blue-700' 
  },
  { 
    label: 'รายรับ', 
    value: `฿${monthlyStats.value.total.toLocaleString()}`, 
    sub: 'บาท (เดือนนี้)', 
    icon: Banknote, 
    color: 'bg-green-100 text-green-700' 
  },
  { 
    label: 'รายจ่าย', 
    value: `฿${monthlyStats.value.expenses.toLocaleString()}`, 
    sub: 'บาท (เดือนนี้)', 
    icon: Wallet, 
    color: 'bg-red-100 text-red-600' 
  },
  { 
    label: 'กำไรสุทธิ', 
    value: `฿${monthlyStats.value.profit.toLocaleString()}`, 
    sub: 'บาท (เดือนนี้)', 
    icon: TrendingUp, 
    color: 'bg-purple-100 text-purple-600' 
  },
]);
</script>

<template>
  <div class="max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
    <header class="mb-8">
      <h1 class="text-4xl font-black mb-2 tracking-tight">ยินดีต้อนรับ 👋</h1>
      <p class="text-slate-500 font-medium">{{ ownerSettings.apartmentName }}</p>
    </header>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      >
        <div class="flex items-center justify-between mb-4">
          <div :class="[stat.color, 'p-3 rounded-2xl']">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ stat.label }}</span>
        </div>
        <div class="text-4xl font-black tracking-tight">{{ stat.value }}</div>
        <div class="text-xs text-slate-400 font-bold uppercase mt-1">{{ stat.sub }}</div>
      </div>
    </div>

    <div class="bg-gradient-to-br from-green-700 to-green-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
      <div class="absolute -left-20 -bottom-20 w-60 h-60 bg-green-500/20 rounded-full blur-2xl"></div>
      
      <div class="relative z-10">
        <h2 class="text-2xl sm:text-3xl font-black mb-3">พร้อมออกบิลใหม่หรือยัง?</h2>
        <p class="text-green-100/80 mb-8 max-w-md font-medium text-sm sm:text-base">จัดการค่าเช่าและค่าสาธารณูปโภคประจำเดือนได้ง่ายๆ เพียงไม่กี่คลิก</p>
        <button 
          @click="emit('navigate', 'create')"
          class="bg-white text-green-700 px-8 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl flex items-center gap-3"
        >
          เริ่มออกบิลเลย
          <ArrowRight class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>
