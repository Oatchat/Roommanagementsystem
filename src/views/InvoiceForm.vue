<script setup>
import { ref, computed, watch } from 'vue';
import { PlusCircle, Zap, Droplets, Globe, ReceiptText } from 'lucide-vue-next';
import InvoicePreview from '../components/InvoicePreview.vue';

const props = defineProps(['tenants', 'ownerSettings', 'isProcessing']);
const emit = defineEmits(['save', 'update-meter']);

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const formData = ref({
  selectedTenantId: null,
  month: thaiMonths[new Date().getMonth()],
  year: new Date().getFullYear().toString(),
  electricityPrev: 0,
  electricityCurrent: 0,
  internet: 0,
  additionalFees: []
});

const selectedTenant = computed(() => {
  if (!formData.value.selectedTenantId) return null;
  return props.tenants.find(t => t.id === formData.value.selectedTenantId);
});

const electricityUnits = computed(() => {
  if (!selectedTenant.value) return 0;
  const current = Number(formData.value.electricityCurrent) || 0;
  const prev = Number(formData.value.electricityPrev) || 0;
  
  if (current >= prev) {
    return current - prev;
  } else {
    // Meter rollover logic at 10000 (since max is 9999.9 -> 0000.0)
    return parseFloat(((10000 - prev) + current).toFixed(2));
  }
});

const electricityTotal = computed(() => {
  return electricityUnits.value * props.ownerSettings.defaultElectricityRate;
});

const waterTotal = computed(() => {
  if (!selectedTenant.value) return 0;
  return selectedTenant.value.waterTenants * props.ownerSettings.defaultWaterRate;
});

const additionalFeesTotal = computed(() => {
    return formData.value.additionalFees?.reduce((sum, fee) => sum + Number(fee.amount), 0) || 0;
});

const grandTotal = computed(() => {
  if (!selectedTenant.value) return 0;
  return Number(selectedTenant.value.roomRent) + electricityTotal.value + waterTotal.value + Number(formData.value.internet) + additionalFeesTotal.value;
});

const previewData = computed(() => {
  if (!selectedTenant.value) return null;
  return {
    ...props.ownerSettings,
    ...selectedTenant.value,
    tenantId: selectedTenant.value.id,
    month: formData.value.month,
    year: formData.value.year,
    electricityPrev: formData.value.electricityPrev,
    electricityCurrent: formData.value.electricityCurrent,
    electricityUnits: electricityUnits.value,
    electricityTotal: electricityTotal.value,
    waterTotal: waterTotal.value,
    grandTotal: grandTotal.value,
    internet: formData.value.internet,
    additionalFees: formData.value.additionalFees,
    electricityRate: props.ownerSettings.defaultElectricityRate,
    waterRate: props.ownerSettings.defaultWaterRate,
    createdAt: Date.now(),
    tenantName: selectedTenant.value.name
  };
});

const activeTenants = computed(() => props.tenants.filter(t => t.active));

watch(() => formData.value.selectedTenantId, (newVal) => {
  if (newVal && selectedTenant.value) {
    formData.value.electricityPrev = selectedTenant.value.electricityPrev;
    formData.value.electricityCurrent = selectedTenant.value.electricityPrev;
    formData.value.internet = props.ownerSettings.defaultInternet;
    formData.value.additionalFees = (props.ownerSettings.additionalFees || []).map(fee => ({ ...fee }));
  }
});

const showMobilePreview = ref(false);

const handleSave = () => {
  if (!selectedTenant.value) {
    alert('กรุณาเลือกห้อง/ผู้เช่า');
    return;
  }

  const invoice = {
    ...previewData.value,
    id: Date.now().toString(),
  };

  emit('save', invoice, selectedTenant.value.id, formData.value.electricityCurrent);
};
</script>

<template>
  <div class="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- Form Container -->
      <div class="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-black flex items-center gap-3 text-green-700">
                <PlusCircle class="w-8 h-8" />
                สร้างบิลใหม่
            </h2>
            <button 
                v-if="selectedTenant"
                @click="showMobilePreview = !showMobilePreview"
                class="lg:hidden flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl font-bold text-xs"
            >
                {{ showMobilePreview ? 'ซ่อนพรีวิว' : 'ดูพรีวิวบิล' }}
            </button>
        </div>

        <div class="space-y-8">
          <!-- Month & Year Selection -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">รอบบิลเดือน</label>
              <select v-model="formData.month" class="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-green-500/10 transition-all appearance-none">
                <option v-for="month in thaiMonths" :key="month">{{ month }}</option>
              </select>
            </div>
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ปี</label>
              <input type="number" v-model="formData.year" class="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-green-500/10 transition-all" />
            </div>
          </div>

          <!-- Tenant Selection -->
          <div class="space-y-3">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">เลือกห้อง / ผู้เช่า</label>
            <select v-model="formData.selectedTenantId" class="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-green-500/10 transition-all">
              <option :value="null">-- กรุณาเลือกห้อง --</option>
              <option v-for="tenant in activeTenants" :key="tenant.id" :value="tenant.id">
                ห้อง {{ tenant.roomNumber }} - {{ tenant.name }}
              </option>
            </select>
          </div>

          <Transition name="fade">
            <div v-if="selectedTenant" class="space-y-8 pt-4">
              <!-- Electricity Section -->
              <div class="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 relative overflow-hidden">
                <Zap class="absolute -right-4 -bottom-4 w-24 h-24 text-amber-200/30" />
                <div class="grid grid-cols-2 gap-6 relative z-10">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-amber-700 uppercase tracking-widest px-1">มิเตอร์ครั้งก่อน</label>
                    <input 
                      type="number" 
                      v-model.number="formData.electricityPrev"
                      class="w-full bg-white border-2 border-amber-100 rounded-2xl p-4 text-amber-900 font-black text-xl text-center focus:border-amber-400 focus:ring-0 transition-all shadow-inner" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-amber-700 uppercase tracking-widest px-1">มิเตอร์ครั้งนี้</label>
                    <input 
                      type="number" 
                      v-model.number="formData.electricityCurrent"
                      class="w-full bg-white border-2 border-amber-200 rounded-2xl p-4 text-amber-900 font-black text-xl text-center focus:border-amber-400 focus:ring-0 transition-all" 
                    />
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-center gap-2">
                    <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">ใช้ไฟไป</span>
                    <span class="text-3xl font-black text-amber-900">{{ electricityUnits }}</span>
                    <span class="text-xs font-bold text-amber-700 uppercase tracking-widest">หน่วย</span>
                </div>
              </div>

              <!-- Extra Costs -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div class="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative overflow-hidden">
                   <Droplets class="absolute -right-4 -bottom-4 w-20 h-20 text-blue-200/30" />
                   <label class="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2 block">ค่าน้ำ (เหมาจ่ายตามคน)</label>
                   <div class="text-2xl font-black text-blue-900">{{ waterTotal }} <small class="text-xs font-bold uppercase">บาท</small></div>
                   <div class="text-[10px] text-blue-600 font-bold uppercase mt-1">{{ selectedTenant.waterTenants }} คน x {{ ownerSettings.defaultWaterRate }} บาท</div>
                 </div>
                 
                 <div class="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
                   <Globe class="absolute -right-4 -bottom-4 w-20 h-20 text-indigo-200/30" />
                   <label class="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-2 block">ค่าอินเทอร์เน็ต</label>
                   <input 
                    type="number" 
                    v-model.number="formData.internet"
                    class="w-full bg-white/50 border-2 border-indigo-100 rounded-xl p-2 font-black text-indigo-900 focus:bg-white transition-all" 
                   />
                 </div>
              </div>

              <!-- Additional Fees from Settings -->
              <div v-if="formData.additionalFees && formData.additionalFees.length > 0" class="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 space-y-4">
                 <label class="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle class="w-4 h-4 text-green-600" />
                    ค่าใช้จ่ายอื่นๆ
                 </label>
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(fee, index) in formData.additionalFees" :key="fee.id" class="flex gap-3 items-center">
                        <div class="flex-1 bg-white border border-slate-100 rounded-xl p-3 text-sm font-bold text-slate-600 shadow-sm truncate">
                            {{ fee.name }}
                        </div>
                        <div class="w-32 relative">
                            <input 
                                type="number" 
                                v-model.number="fee.amount"
                                class="w-full bg-white border-2 border-slate-100 rounded-xl p-3 font-black text-slate-900 focus:border-green-400 focus:ring-0 transition-all pr-8" 
                            />
                            <span class="absolute right-3 top-1/2 -translate-y-1/2 font-black text-[10px] text-slate-400">฿</span>
                        </div>
                    </div>
                 </div>
              </div>

              <!-- Final Summary Card -->
              <div class="bg-green-700 text-white p-8 rounded-[32px] shadow-2xl shadow-green-200 relative overflow-hidden">
                <div class="absolute right-0 top-0 p-4 opacity-20">
                    <ReceiptText class="w-20 h-20" />
                </div>
                <div class="flex justify-between items-end relative z-10">
                    <div>
                        <div class="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">ยอดรวมสุทธิ</div>
                        <div class="text-5xl font-black tracking-tighter">{{ grandTotal.toLocaleString() }} <small class="text-lg">฿</small></div>
                    </div>
                    <button 
                        @click="handleSave"
                        :disabled="props.isProcessing"
                        class="bg-white text-green-700 px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        <span v-if="props.isProcessing" class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700 mr-2"></span>
                        {{ props.isProcessing ? 'กำลังบันทึก...' : 'บันทึกและออกบิล' }}
                    </button>
                </div>
              </div>
            </div>
          </Transition>

          <div v-if="!selectedTenant" class="text-center py-20 px-10 border-4 border-dashed border-slate-100 rounded-[40px]">
            <PlusCircle class="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p class="text-slate-300 font-black uppercase tracking-widest text-sm">กรุณาเลือกผู้เช่าเพื่อทำรายการ</p>
          </div>
        </div>
      </div>

      <!-- Preview Sticky -->
      <div v-if="previewData" :class="[showMobilePreview ? 'block' : 'hidden lg:block', 'sticky top-6 z-10']">
        <div class="mb-4 flex items-center justify-between px-6">
          <div class="flex items-center gap-2">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest italic">Live Preview</h2>
            <button @click="showMobilePreview = false" class="lg:hidden text-xs font-bold text-red-500">ปิด</button>
          </div>
          <span class="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
            <span class="w-1.5 h-1.5 bg-green-700 rounded-full animate-pulse"></span>
            Real-time
          </span>
        </div>
        <div class="transform scale-[0.85] lg:scale-[0.85] origin-top shadow-2xl rounded-2xl overflow-hidden border border-slate-200 bg-white">
          <InvoicePreview :data="previewData" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(20px); }
</style>
