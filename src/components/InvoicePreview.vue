<script setup>
import { Building2, User, Calendar, Zap, Droplets, Globe, CreditCard, CheckCircle2 } from 'lucide-vue-next';
const props = defineProps(['data']);
</script>

<template>
  <div class="bg-white p-6 md:p-8 max-w-[850px] mx-auto text-slate-900 font-sans shadow-2xl rounded-[32px] border border-slate-100" id="invoice-content">
    <!-- Header with Apartment Info -->
    <div class="flex justify-between items-start mb-6 border-b border-slate-100 pb-6">
      <div class="space-y-1">
          <h1 class="text-2xl font-black tracking-tight text-slate-900 leading-none mb-2">{{ data.apartmentName }}</h1>
          <div class="text-[10px] font-bold text-slate-500 max-w-sm leading-relaxed">{{ data.address }}</div>
          <div class="flex items-center gap-2 text-[10px] font-black text-slate-900 pt-1">
              <span class="text-slate-400">โทร:</span> {{ data.phoneNumber }}
          </div>
      </div>
      
      <div class="text-right">
        <h2 class="text-3xl font-black text-slate-900 tracking-tighter mb-1 leading-none uppercase">
            {{ data.type === 'move-in' ? 'Receipt' : 'Invoice' }}
        </h2>
        <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
            {{ data.type === 'move-in' ? 'ใบเสร็จรับเงิน' : 'ใบแจ้งหนี้' }}
        </div>
        <div class="text-sm font-black text-green-700 uppercase tracking-widest border-t border-slate-100 pt-1">
            {{ data.month }} {{ data.year }}
        </div>
      </div>
    </div>

    <!-- Info Section -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative overflow-hidden">
        <div class="absolute right-0 top-0 p-4 opacity-5">
            <User class="w-12 h-12" />
        </div>
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            Billed To / ชื่อผู้เช่า
        </div>
        <div class="text-2xl font-black text-slate-900 leading-tight mb-2">{{ data.tenantName }}</div>
        <div class="flex items-center gap-3">
            <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Room Number:</span>
            <span class="bg-slate-900 text-white px-3 py-1 rounded-lg text-lg font-black italic transform -skew-x-6">{{ data.roomNumber }}</span>
        </div>
      </div>
      
      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            <CreditCard class="w-3 h-3" />
            Payment Account / ช่องทางชำระเงิน
        </div>
        <div class="text-base font-black text-slate-900 mb-1 leading-tight">
            <div>{{ data.bankInfo.replace(/\s*\d[\d\-\s]*$/, '') }}</div>
            <div>{{ (data.bankInfo.match(/\d[\d\-\s]*$/) || [''])[0].trim() }}</div>
        </div>
        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{{ data.apartmentName }}</div>
      </div>
    </div>

    <!-- Line Items -->
    <div class="space-y-4">
        <div class="flex items-center justify-between px-2">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Description / รายการ</h3>
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mr-4">Amount / จำนวนเงิน</h3>
        </div>
        
        <div class="space-y-1.5">
            <!-- MOVE-IN SPECIFIC ITEMS -->
            <template v-if="data.type === 'move-in'">
                <div v-if="data.securityDeposit > 0" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                    <div class="col-span-7">
                        <div class="font-black text-slate-900 text-lg">เงินประกัน/มัดจำ (Security Deposit)</div>
                    </div>
                    <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase italic">1-2 Months</div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ data.securityDeposit?.toLocaleString() }}</div>
                </div>

                <div v-if="data.advancedRent > 0" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                    <div class="col-span-7">
                        <div class="font-black text-slate-900 text-lg">ค่าเช่าห้อง (Room Rent)</div>
                    </div>
                    <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase italic">Paid</div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ data.advancedRent?.toLocaleString() }}</div>
                </div>

                <div v-if="data.keyCardFee > 0" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                    <div class="col-span-7">
                        <div class="font-black text-slate-900 text-lg">ค่าคีย์การ์ด/อื่นๆ (Entry Fees)</div>
                    </div>
                    <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase italic">Included</div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ data.keyCardFee?.toLocaleString() }}</div>
                </div>

                <div v-if="data.otherFees > 0 || data.otherFeesNote" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                    <div class="col-span-7">
                        <div class="font-black text-slate-900 text-lg">อื่นๆ (Other Charges)</div>
                        <div v-if="data.otherFeesNote" class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{{ data.otherFeesNote }}</div>
                    </div>
                    <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase italic">{{ data.otherFees > 0 ? 'Adjusted' : 'Note' }}</div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ data.otherFees > 0 ? data.otherFees?.toLocaleString() : '-' }}</div>
                </div>
            </template>

            <!-- REGULAR UTILITY ITEMS -->
            <template v-else>
                <!-- Room Rent -->
                <div class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                    <div class="col-span-7">
                        <div class="font-black text-slate-900 text-lg">ค่าเช่าห้อง (Room Rent)</div>
                        <div class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Base monthly rental fee</div>
                    </div>
                    <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase">Monthly</div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ data.roomRent?.toLocaleString() }}</div>
                </div>

                <!-- Electricity -->
                <div v-if="data.electricityUnits !== undefined" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 opacity-20"></div>
                    <div class="col-span-7">
                        <div class="flex items-center gap-2">
                            <Zap class="w-4 h-4 text-amber-500" />
                            <div class="font-black text-slate-900 text-lg">ค่าไฟฟ้า (Electricity)</div>
                        </div>
                        <div class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            ครั้งก่อน (PREV): <span class="text-slate-900 text-sm">{{ data.electricityPrev }}</span> | ครั้งนี้ (CURR): <span class="text-slate-900 text-sm">{{ data.electricityCurrent }}</span>
                        </div>
                    </div>
                    <div class="col-span-2 text-center">
                        <div class="text-xl font-black text-amber-600 leading-none">{{ data.electricityUnits }}</div>
                        <div class="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Units Used</div>
                    </div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">
                        <span class="text-xs font-bold text-slate-400 mr-2">@{{ data.electricityRate }} ฿</span>
                        {{ data.electricityTotal?.toLocaleString() }}
                    </div>
                </div>

                <!-- Water -->
                <div v-if="data.waterTotal !== undefined" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center relative overflow-hidden">
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 opacity-20"></div>
                    <div class="col-span-7">
                        <div class="flex items-center gap-2">
                            <Droplets class="w-4 h-4 text-blue-500" />
                            <div class="font-black text-slate-900 text-lg">ค่าน้ำ (Water Charge)</div>
                        </div>
                        <div class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Fixed fee per occupant</div>
                    </div>
                    <div class="col-span-2 text-center">
                        <div class="text-xl font-black text-blue-600 leading-none">{{ data.waterTenants }}</div>
                        <div class="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">Occupants</div>
                    </div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">
                        <span class="text-xs font-bold text-slate-400 mr-2">@{{ data.waterRate }} ฿</span>
                        {{ data.waterTotal?.toLocaleString() }}
                    </div>
                </div>

                <!-- Internet -->
                <div v-if="data.internet > 0" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                    <div class="col-span-7">
                        <div class="flex items-center gap-2">
                            <Globe class="w-4 h-4 text-indigo-500" />
                            <div class="font-black text-slate-900 text-lg">ค่าเน็ต (Internet)</div>
                        </div>
                    </div>
                    <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase italic">Ultra</div>
                    <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ data.internet?.toLocaleString() }}</div>
                </div>

                <!-- Additional Fees -->
                <template v-if="data.additionalFees && data.additionalFees.length > 0">
                    <template v-for="fee in data.additionalFees" :key="fee.id">
                        <div v-if="Number(fee.amount) > 0" class="grid grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 items-center">
                            <div class="col-span-7">
                                <div class="font-black text-slate-900 text-lg">{{ fee.name }}</div>
                                <div class="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Other expense</div>
                            </div>
                            <div class="col-span-2 text-center text-xs font-black text-slate-400 uppercase italic">Custom</div>
                            <div class="col-span-3 text-right font-black text-2xl italic text-slate-900">{{ Number(fee.amount)?.toLocaleString() }}</div>
                        </div>
                    </template>
                </template>
            </template>
        </div>
    </div>

    <!-- Grand Total -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900 p-6 rounded-[28px] shadow-xl relative overflow-hidden">
        <div class="absolute -right-4 -bottom-4 opacity-10">
            <CheckCircle2 class="w-24 h-24 text-white" />
        </div>
        <div class="relative z-10 text-center sm:text-left">
            <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">Total Amount Due</p>
            <div class="text-5xl font-black text-white tracking-tighter leading-none">
                {{ data.grandTotal?.toLocaleString() }}
                <span class="text-sm font-black text-green-400 uppercase tracking-widest italic ml-2">THB (฿)</span>
            </div>
        </div>
        <div class="relative z-10 text-[9px] font-bold text-white/60 text-center sm:text-right max-w-[200px] leading-tight">
            Please pay by the 5th of each month. Thank you for staying with us!
        </div>
    </div>
    
    <!-- Footer micro-text -->
    <div class="mt-4 flex justify-between items-center px-2">
        <div class="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            SmartRent Digital Invoice
        </div>
        <div class="text-[8px] text-slate-300 italic">Gen Date: {{ new Date(data.createdAt || Date.now()).toLocaleDateString('th-TH') }}</div>
    </div>
  </div>
</template>

<style scoped>
#invoice-content {
    font-family: 'Prompt', 'Inter', sans-serif;
}

@media print {
  #invoice-content {
    width: 100% !important;
    max-width: none !important;
    padding: 2cm !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
}
</style>
