<script setup>
import { computed } from 'vue';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-vue-next';
import { toCE } from '../utils/date';

const props = defineProps(['invoices', 'expenses']);

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const reportData = computed(() => {
    const monthlyData = {};

    // Process Invoices (Revenue)
    props.invoices.forEach(inv => {
        const key = `${inv.month} ${toCE(inv.year)}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { monthYear: key, revenue: 0, expense: 0, profit: 0, invoiceCount: 0, rawDate: inv.createdAt || 0 };
        }
        monthlyData[key].revenue += (inv.grandTotal || 0);
        monthlyData[key].invoiceCount += 1;
        if (inv.createdAt > monthlyData[key].rawDate) monthlyData[key].rawDate = inv.createdAt;
    });

    // Process Expenses
    props.expenses.forEach(ex => {
        const exDate = new Date(ex.date);
        const month = thaiMonths[exDate.getMonth()];
        const year = exDate.getFullYear();
        const key = `${month} ${year}`;

        if (!monthlyData[key]) {
            monthlyData[key] = { monthYear: key, revenue: 0, expense: 0, profit: 0, invoiceCount: 0, rawDate: ex.createdAt || 0 };
        }
        monthlyData[key].expense += (ex.amount || 0);
        if (ex.createdAt > monthlyData[key].rawDate) monthlyData[key].rawDate = ex.createdAt;
    });

    // Calculate Profit and convert to array
    return Object.values(monthlyData).map(item => {
        item.profit = item.revenue - item.expense;
        return item;
    }).sort((a, b) => b.rawDate - a.rawDate);
});

const totalOverallRevenue = computed(() => reportData.value.reduce((sum, item) => sum + item.revenue, 0));
const totalOverallExpense = computed(() => reportData.value.reduce((sum, item) => sum + item.expense, 0));
const totalOverallProfit = computed(() => totalOverallRevenue.value - totalOverallExpense.value);

</script>

<template>
  <div class="max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
            <h2 class="text-4xl font-black mb-1 tracking-tight italic">สรุปรายงาน (Report)</h2>
            <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">วิเคราะห์รายรับ-รายจ่าย รายเดือน</p>
        </div>
        <div class="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <Filter class="w-4 h-4 text-slate-400" />
            <span class="text-xs font-black uppercase tracking-widest text-slate-500">ข้อมูลทั้งหมด</span>
        </div>
    </div>

    <!-- Summary Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-green-300 transition-all duration-500">
            <div class="bg-green-50 p-5 rounded-3xl text-green-700 group-hover:bg-green-700 group-hover:text-white transition-all duration-500">
                <Banknote class="w-8 h-8" />
            </div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">รายรับรวม</p>
                <h3 class="text-3xl font-black text-slate-900 tracking-tight">฿{{ totalOverallRevenue.toLocaleString() }}</h3>
            </div>
        </div>

        <div class="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center gap-6 group hover:border-red-300 transition-all duration-500">
            <div class="bg-red-50 p-5 rounded-3xl text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
                <Wallet class="w-8 h-8" />
            </div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">รายจ่ายรวม</p>
                <h3 class="text-3xl font-black text-slate-900 tracking-tight">฿{{ totalOverallExpense.toLocaleString() }}</h3>
            </div>
        </div>

        <div class="bg-slate-900 p-8 rounded-[40px] shadow-2xl flex items-center gap-6 relative overflow-hidden group">
            <!-- Decoration -->
            <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            
            <div class="bg-green-500/20 p-5 rounded-3xl text-green-400 relative z-10">
                <BarChart3 class="w-8 h-8" />
            </div>
            <div class="relative z-10">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">กำไรสุทธิ</p>
                <h3 class="text-3xl font-black text-white tracking-tight">฿{{ totalOverallProfit.toLocaleString() }}</h3>
            </div>
        </div>
    </div>

    <!-- Monthly Table -->
    <div class="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-700">
        <div class="p-8 border-b border-slate-50 flex items-center justify-between">
            <h4 class="font-black text-xl tracking-tight">สถิติแยกตามเดือน</h4>
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest">หน่วย: บาท (THB)</div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead class="bg-slate-50/50">
                    <tr>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">เดือน / ปี</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">จำนวนบิล</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">รายรับ</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">รายจ่าย</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">กำไร</th>
                        <th class="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">สถานะ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    <tr 
                        v-for="row in reportData" 
                        :key="row.monthYear"
                        class="hover:bg-slate-50/30 transition-colors"
                    >
                        <td class="px-8 py-8">
                            <span class="font-black text-lg text-slate-900">{{ row.monthYear }}</span>
                        </td>
                        <td class="px-8 py-8 text-center">
                            <span class="font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">{{ row.invoiceCount }}</span>
                        </td>
                        <td class="px-8 py-8 text-center">
                            <span class="font-black text-green-700">฿{{ row.revenue.toLocaleString() }}</span>
                        </td>
                        <td class="px-8 py-8 text-center">
                            <span class="font-black text-red-500">฿{{ row.expense.toLocaleString() }}</span>
                        </td>
                        <td class="px-8 py-8 text-center">
                            <span :class="['font-black text-xl italic', row.profit >= 0 ? 'text-blue-600' : 'text-red-600']">
                                ฿{{ row.profit.toLocaleString() }}
                            </span>
                        </td>
                        <td class="px-8 py-8">
                           <div class="flex justify-center">
                                <div v-if="row.profit >= 0" class="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-green-100">
                                    <ArrowUpRight class="w-3 h-3" /> กำไร
                                </div>
                                <div v-else class="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100">
                                    <ArrowDownRight class="w-3 h-3" /> ขาดทุน
                                </div>
                           </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="reportData.length === 0" class="p-20 text-center">
            <p class="text-slate-300 font-black uppercase tracking-widest">ยังไม่มีข้อมูลสำหรับสรุปรายงาน</p>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Table styles for a premium look */
th {
    white-space: nowrap;
}
</style>
