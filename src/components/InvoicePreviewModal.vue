<script setup>
import { ref } from 'vue';
import { Download, Copy, X } from 'lucide-vue-next';
import { toPng } from 'html-to-image';
import InvoicePreview from './InvoicePreview.vue';

const props = defineProps(['invoice']);
const emit = defineEmits(['close', 'toast']);

const invoiceRef = ref(null);
const isSaving = ref(false);

const saveAsImage = async () => {
  if (!invoiceRef.value || isSaving.value) return;
  isSaving.value = true;
  try {
    const dataUrl = await toPng(invoiceRef.value, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
    const { roomNumber, month, year } = props.invoice;
    const safe = (v) => String(v ?? '').replace(/[\\/:*?"<>|]/g, '').trim();
    const filename = `invoice-${safe(roomNumber)}-${safe(month)}-${safe(year)}.png`;
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Save image failed', err);
  } finally {
    isSaving.value = false;
  }
};

const copyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    emit('toast');
  } catch (err) {
    console.error('Copy failed', err);
  }
  document.body.removeChild(textArea);
};

const shareInvoice = () => {
  const invoice = props.invoice;
  let additionalText = '';
  if (invoice.additionalFees && invoice.additionalFees.length > 0) {
      const validFees = invoice.additionalFees.filter(f => Number(f.amount) > 0);
      if (validFees.length > 0) {
          additionalText = '\n' + validFees.map(f => `➕ ${f.name}: ${Number(f.amount)?.toLocaleString()} บาท`).join('\n');
      }
  }

  const text = `🏠 แจ้งค่าเช่าห้อง ${invoice.roomNumber}
📅 ประจำเดือน ${invoice.month} ${invoice.year}

👤 ผู้เช่า: ${invoice.tenantName}
💰 ยอดรวมทั้งสิ้น: ${invoice.grandTotal?.toLocaleString()} บาท

รายละเอียด:
🏠 ค่าเช่า: ${invoice.roomRent?.toLocaleString()} บาท
⚡ ค่าไฟ: ${invoice.electricityTotal?.toLocaleString()} บาท (${invoice.electricityUnits} หน่วย)
💧 ค่าน้ำ: ${invoice.waterTotal?.toLocaleString()} บาท${invoice.internet > 0 ? '\n📶 ค่าเน็ต: ' + invoice.internet?.toLocaleString() + ' บาท' : ''}${additionalText}

💳 ชำระเงินที่: ${invoice.bankInfo}
⏰ กรุณาชำระภายในวันที่ 5`;
  
  copyToClipboard(text);
};
</script>

<template>
  <Transition name="modal">
    <div class="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div class="bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
        
        <!-- Controls -->
        <div class="sticky top-0 right-0 z-50 flex justify-between items-center mb-8 no-print bg-white/80 backdrop-blur pb-4">
            <h3 class="text-xl font-black uppercase tracking-widest text-slate-400 italic">Invoice Viewer</h3>
            <div class="flex gap-3">
                <button
                    @click="saveAsImage"
                    :disabled="isSaving"
                    class="bg-green-700 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-green-800 shadow-xl shadow-green-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Download class="w-5 h-5" />
                    {{ isSaving ? 'กำลังบันทึก...' : 'บันทึกรูป' }}
                </button>
                <button 
                    @click="shareInvoice"
                    class="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-slate-200 transition-all"
                >
                    <Copy class="w-5 h-5" />
                    คัดลอกข้อความ
                </button>
                <button 
                    @click="emit('close')"
                    class="bg-red-50 text-red-500 w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all"
                >
                    <X class="w-6 h-6" />
                </button>
            </div>
        </div>

        <div ref="invoiceRef" class="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
            <InvoicePreview :data="invoice" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

@media print {
  .fixed { position: static !important; background: white !important; padding: 0 !important; }
  .max-w-4xl { max-width: none !important; box-shadow: none !important; border-radius: 0 !important; padding: 0 !important; }
  .bg-slate-50 { background: white !important; border: none !important; padding: 0 !important; }
}
</style>
