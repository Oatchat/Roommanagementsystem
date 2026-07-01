<script setup>
import { PlusCircle, Zap, Droplets, Banknote, ShieldCheck, CreditCard, Eye, Save } from 'lucide-vue-next';
import { ref, computed, watch } from 'vue';
import InvoicePreview from '../components/InvoicePreview.vue';

const props = defineProps(['tenants', 'ownerSettings']);
const emit = defineEmits(['save']);

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const formData = ref({
  selectedTenantId: null,
  month: thaiMonths[new Date().getMonth()],
  year: new Date().getFullYear().toString(),
  securityDeposit: 0,
  advancedRent: 0,
  otherFees: 0,
  otherFeesNote: '',
  keyCardFee: 0,
});

const selectedTenant = computed(() => {
  if (!formData.value.selectedTenantId) return null;
  return props.tenants.find(t => t.id === formData.value.selectedTenantId);
});

const grandTotal = computed(() => {
  if (!selectedTenant.value) return 0;
  return Number(formData.value.securityDeposit) + 
         Number(formData.value.advancedRent) + 
         Number(formData.value.otherFees) + 
         Number(formData.value.keyCardFee);
});

const previewData = computed(() => {
  if (!selectedTenant.value) return null;
  return {
    ...props.ownerSettings,
    ...selectedTenant.value,
    type: 'move-in',
    tenantId: selectedTenant.value.id,
    month: formData.value.month,
    year: formData.value.year,
    securityDeposit: formData.value.securityDeposit,
    advancedRent: formData.value.advancedRent,
    otherFees: formData.value.otherFees,
    otherFeesNote: formData.value.otherFeesNote,
    keyCardFee: formData.value.keyCardFee,
    grandTotal: grandTotal.value,
    createdAt: Date.now(),
    tenantName: selectedTenant.value.name
  };
});

const activeTenants = computed(() => props.tenants.filter(t => t.active));

watch(() => formData.value.selectedTenantId, (newVal) => {
  if (newVal && selectedTenant.value) {
    formData.value.advancedRent = selectedTenant.value.roomRent;
    formData.value.securityDeposit = selectedTenant.value.roomRent * 2; // Default 2 months
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

  emit('save', invoice);
  
  // Reset
  formData.value.selectedTenantId = null;
  showMobilePreview.value = false;
};
</script>

<template>
  <div class="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      
      <!-- Form Container -->
      <div class="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-3xl font-black flex items-center gap-3 text-indigo-700">
                <ShieldCheck class="w-8 h-8" />
                บิลแรกเข้าพัก
            </h2>
            <button 
                v-if="selectedTenant"
                @click="showMobilePreview = !showMobilePreview"
                class="lg:hidden flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-bold text-xs"
            >
                {{ showMobilePreview ? 'ซ่อนพรีวิว' : 'ดูพรีวิวบิล' }}
            </button>
        </div>

        <div class="space-y-8">
          <!-- Month & Year Selection -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">รอบบิลเดือน</label>
              <select v-model="formData.month" class="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none">
                <option v-for="month in thaiMonths" :key="month">{{ month }}</option>
              </select>
            </div>
            <div class="space-y-3">
              <label class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">ปี</label>
              <input type="number" v-model="formData.year" class="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
          </div>

          <!-- Tenant Selection -->
          <div class="space-y-3">
            <label class="text-xs font-black text-slate-400 uppercase tracking-widest px-2">เลือกห้องที่เข้าพัก</label>
            <select v-model="formData.selectedTenantId" class="w-full bg-slate-50 border-0 rounded-2xl p-4 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all">
              <option :value="null">-- กรุณาเลือกห้อง --</option>
              <option v-for="tenant in activeTenants" :key="tenant.id" :value="tenant.id">
                ห้อง {{ tenant.roomNumber }} - {{ tenant.name }}
              </option>
            </select>
          </div>

          <Transition name="fade">
            <div v-if="selectedTenant" class="space-y-8 pt-4">
              <!-- Costs Section -->
              <div class="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
                <CreditCard class="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-200/30" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-indigo-700 uppercase tracking-widest px-1">เงินมัดจำ/ประกัน</label>
                    <input 
                      type="number" 
                      v-model.number="formData.securityDeposit"
                      class="w-full bg-white border-2 border-indigo-100 rounded-2xl p-4 text-indigo-900 font-black text-xl text-center focus:border-indigo-400 focus:ring-0 transition-all shadow-inner" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-indigo-700 uppercase tracking-widest px-1">ค่าเช่าห้อง</label>
                    <input 
                      type="number" 
                      v-model.number="formData.advancedRent"
                      class="w-full bg-white border-2 border-indigo-100 rounded-2xl p-4 text-indigo-900 font-black text-xl text-center focus:border-indigo-400 focus:ring-0 transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-indigo-700 uppercase tracking-widest px-1">ค่าคีย์การ์ด/อื่นๆ</label>
                    <input 
                      type="number" 
                      v-model.number="formData.keyCardFee"
                      class="w-full bg-white border-2 border-indigo-100 rounded-2xl p-4 text-indigo-900 font-black text-xl text-center focus:border-indigo-400 focus:ring-0 transition-all shadow-inner" 
                    />
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-black text-indigo-700 uppercase tracking-widest px-1">ค่าใช้จ่ายเพิ่มเติม</label>
                    <input 
                      type="number" 
                      v-model.number="formData.otherFees"
                      class="w-full bg-white border-2 border-indigo-100 rounded-2xl p-4 text-indigo-900 font-black text-xl text-center focus:border-indigo-400 focus:ring-0 transition-all shadow-inner" 
                    />
                  </div>
                </div>
                
                <div class="mt-4 relative z-10">
                    <input 
                      type="text" 
                      v-model="formData.otherFeesNote"
                      placeholder="หมายเหตุค่าใช้จ่ายเพิ่มเติม (ถ้ามี)"
                      class="w-full bg-white/50 border-0 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-indigo-200 transition-all" 
                    />
                </div>
              </div>

              <!-- Grand Total Box -->
              <div class="bg-slate-900 p-8 rounded-[32px] text-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                <div class="relative z-10">
                  <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">ยอดรวมแรกเข้าทั้งหมด</p>
                  <div class="text-5xl font-black tracking-tighter">฿{{ grandTotal.toLocaleString() }}</div>
                </div>
                <button 
                  @click="handleSave"
                  class="bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 hover:scale-105 transition-all shadow-xl flex items-center gap-3 relative z-10"
                >
                  <Save class="w-6 h-6" />
                  บันทึกบิล
                </button>
              </div>
            </div>
          </Transition>

          <div v-if="!selectedTenant" class="text-center py-20 px-10 border-4 border-dashed border-slate-100 rounded-[40px]">
            <PlusCircle class="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p class="text-slate-300 font-black uppercase tracking-widest text-sm">กรุณาเลือกผู้เช่าเพื่อทำรายการบิลแรกเข้า</p>
          </div>
        </div>
      </div>

      <!-- Preview Sticky -->
      <div v-if="previewData" :class="[showMobilePreview ? 'block' : 'hidden lg:block', 'sticky top-6 z-10']">
        <div class="mb-4 flex items-center justify-between px-6">
          <div class="flex items-center gap-2">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest italic">Live Preview (Move-in)</h2>
            <button @click="showMobilePreview = false" class="lg:hidden text-xs font-bold text-red-500">ปิด</button>
          </div>
          <span class="flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">
            <span class="w-1.5 h-1.5 bg-indigo-700 rounded-full animate-pulse"></span>
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
