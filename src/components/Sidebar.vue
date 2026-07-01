<script setup>
import {
  LayoutDashboard,
  ReceiptText,
  History,
  Users,
  Settings,
  ShieldCheck,
  Building2,
  LogOut,
  Wallet,
  BarChart3
} from 'lucide-vue-next';

const props = defineProps(['modelValue', 'apartmentName']);
const emit = defineEmits(['update:modelValue', 'logout']);

const menuItems = [
  { id: 'dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { id: 'create', label: 'ออกบิล', icon: ReceiptText },
  { id: 'move-in', label: 'บิลแรกเข้า', icon: ShieldCheck },
  { id: 'history', label: 'ประวัติ', icon: History },
  { id: 'expenses', label: 'รายจ่าย', icon: Wallet },
  { id: 'reports', label: 'รายงาน', icon: BarChart3 },
  { id: 'tenants', label: 'จัดการห้อง', icon: Users },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];
</script>

<template>
  <nav class="fixed bottom-0 w-full md:left-0 md:top-0 md:w-64 md:h-full bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50 pb-[env(safe-area-inset-bottom)] md:pb-0">
    <div class="p-6 hidden md:block border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="bg-green-700 p-2 rounded-xl text-white shadow-lg shadow-green-200">
          <Building2 class="w-6 h-6" />
        </div>
        <div>
          <span class="font-bold text-lg block leading-tight">{{ apartmentName || 'SmartRent' }}</span>
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Dormitory System</span>
        </div>
      </div>
    </div>
    
    <div class="flex md:flex-col items-center justify-around md:justify-start px-2 py-3 md:p-6 gap-1 md:gap-4 h-full md:h-auto overflow-x-auto no-scrollbar">
      <button 
        v-for="item in menuItems"
        :key="item.id"
        @click="emit('update:modelValue', item.id)"
        :class="[
          'flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:p-3 rounded-2xl transition-all duration-300 group min-w-[64px] md:min-w-0 md:w-full',
          modelValue === item.id 
            ? 'bg-green-700 text-white shadow-lg shadow-green-100' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
        ]"
      >
        <component 
          :is="item.icon" 
          :class="['w-5 h-5 md:w-5 md:h-5', modelValue === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform']" 
        />
        <span class="text-[9px] md:text-sm font-black md:font-bold uppercase md:capitalize tracking-tighter md:tracking-normal">{{ item.label }}</span>
      </button>

      <div class="mt-auto pt-4 border-t border-slate-100 w-full hidden md:block">
        <button 
          @click="emit('logout')"
          class="flex items-center gap-3 p-3 rounded-2xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-all w-full"
        >
          <LogOut class="w-5 h-5" />
          <span class="text-sm font-bold capitalize">ออกจากระบบ</span>
        </button>
      </div>

      <button 
        @click="emit('logout')"
        class="md:hidden flex flex-col items-center justify-center p-2 rounded-2xl text-red-300 hover:text-red-500 transition-all"
      >
        <LogOut class="w-5 h-5" />
        <span class="text-[9px] font-black uppercase tracking-tighter">ขยาย</span>
      </button>
    </div>
  </nav>
</template>
