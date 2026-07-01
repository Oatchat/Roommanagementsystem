<script setup>
import { ref, onMounted } from 'vue';
import { db, auth } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import Sidebar from './components/Sidebar.vue';
import Dashboard from './views/Dashboard.vue';
import InvoiceForm from './views/InvoiceForm.vue';
import MoveInBilling from './views/MoveInBilling.vue';
import InvoiceHistory from './views/InvoiceHistory.vue';
import TenantManager from './views/TenantManager.vue';
import Settings from './views/Settings.vue';
import Expenses from './views/Expenses.vue';
import Reports from './views/Reports.vue';
import Login from './views/Login.vue';
import InvoicePreviewModal from './components/InvoicePreviewModal.vue';

// State
const activeTab = ref('dashboard');
const loading = ref(true);
const authLoading = ref(true);
const user = ref(null);
const isProcessing = ref(false); 
const toastMessage = ref('สำเร็จ!');
const copySuccess = ref(false);

const ownerSettings = ref({
  apartmentName: 'พี่ปุ้ยห้องพัก',
  address: '30/21-22 ซ.สุขุมวิท 23 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพฯ 10110',
  phoneNumber: '084-1956628',
  bankInfo: 'กสิกรไทย 063-2-46836-9',
  defaultElectricityRate: 7,
  defaultWaterRate: 100,
  defaultInternet: 0,
  cashPayment: true
});

const tenants = ref([]);
const invoices = ref([]);
const expenses = ref([]);
const selectedInvoice = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
    authLoading.value = false;
    
    if (currentUser) {
      initData();
    } else {
      loading.value = false;
    }
  });
});

const initData = async () => {
  loading.value = true;
  console.log("🔥 App Mounted - Firebase Project ID:", db.app.options.projectId);
  console.log("🔥 App Mounted - Checking Firebase Data...");

  // 1. Sync Settings
  const settingsDoc = doc(db, 'config', 'ownerSettings');
  onSnapshot(settingsDoc, (snapshot) => {
    if (snapshot.exists()) {
      console.log("✅ Settings Loaded:", snapshot.data().apartmentName);
      ownerSettings.value = { ...ownerSettings.value, ...snapshot.data() };
    } else {
      console.warn("⚠️ No settings found, initializing default...");
      setDoc(settingsDoc, ownerSettings.value);
    }
  }, (error) => {
    console.error("❌ Firestore [Settings] Error:", error);
  });

  // 2. Sync Tenants
  const tenantsCol = collection(db, 'tenants');
  onSnapshot(tenantsCol, (snapshot) => {
    console.log(`📊 Tenants Sync: Received ${snapshot.docs.length} records`);
    tenants.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    loading.value = false;
  }, (error) => {
    console.error("❌ Firestore [Tenants] Error:", error);
    loading.value = false;
  });

  // 3. Sync Invoices
  const invoicesCol = query(collection(db, 'invoices'), orderBy('createdAt', 'desc'));
  onSnapshot(invoicesCol, (snapshot) => {
    console.log(`🧾 Invoices Sync: Received ${snapshot.docs.length} records`);
    invoices.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, (error) => {
    console.error("❌ Firestore [Invoices] Error:", error);
  });

  // 4. Sync Expenses
  const expensesCol = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
  onSnapshot(expensesCol, (snapshot) => {
    console.log(`💸 Expenses Sync: Received ${snapshot.docs.length} records`);
    expenses.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, (error) => {
    console.error("❌ Firestore [Expenses] Error:", error);
  });
};

const handleLogout = async () => {
    try {
        await signOut(auth);
        activeTab.value = 'dashboard';
    } catch (err) {
        console.error('Logout error:', err);
    }
};

const showToast = (msg = 'สำเร็จ!', duration = 3000) => {
  toastMessage.value = msg;
  copySuccess.value = true;
  setTimeout(() => copySuccess.value = false, duration);
};

const handleSaveInvoice = async (invoice, tenantId = null, newMeter = null) => {
  isProcessing.value = true;
  try {
    const { id, ...invoiceData } = invoice;

    await addDoc(collection(db, 'invoices'), {
        ...invoiceData,
        createdAt: Date.now()
    });

    if (tenantId && newMeter !== null && newMeter !== undefined) {
      const tenantRef = doc(db, 'tenants', tenantId);
      await updateDoc(tenantRef, { electricityPrev: newMeter });
    }

    activeTab.value = 'history';
    showToast('บันทึกบิลสำเร็จ!');
  } catch (e) {
    console.error("Error saving invoice:", e);
    alert(`เกิดข้อผิดพลาด: ${e.message}`);
  } finally {
    isProcessing.value = false;
  }
};

const handleSaveTenant = async (tenant) => {
    isProcessing.value = true;
    try {
        if (!tenant.id) {
            // New tenant
            const { id, ...data } = tenant;
            await addDoc(collection(db, 'tenants'), data);
            showToast('เพิ่มผู้เช่าใหม่สำเร็จ!');
        } else {
            // Update existing
            const tenantRef = doc(db, 'tenants', tenant.id);
            const { id, ...data } = tenant;
            await updateDoc(tenantRef, data);
            showToast('อัปเดตข้อมูลผู้เช่าสำเร็จ!');
        }
    } catch (e) {
        console.error("Error saving tenant: ", e);
        alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้เช่า");
    } finally {
        isProcessing.value = false;
    }
};

const handleDeleteTenant = async (tenantId) => {
    if (confirm('ต้องการลบข้อมูลผู้เช่านี้? (ข้อมูลจะถูกซ่อนจากรายการเบื้องต้น)')) {
        isProcessing.value = true;
        try {
            const tenantRef = doc(db, 'tenants', tenantId);
            await updateDoc(tenantRef, { active: false });
            showToast('ลบข้อมูลผู้เช่าแล้ว');
        } catch (e) {
            console.error("Error deactivating tenant: ", e);
        } finally {
            isProcessing.value = false;
        }
    }
};

const handleUpdateInvoiceStatus = async (id, newStatus) => {
  isProcessing.value = true;
  try {
    const invoiceRef = doc(db, 'invoices', id);
    await updateDoc(invoiceRef, { 
      paid: newStatus,
      updatedAt: Date.now()
    });
    showToast(newStatus ? 'แจ้งชำระเงินแล้ว' : 'ยกเลิกการชำระเงินแล้ว');
  } catch (err) {
    console.error('Error updating invoice status:', err);
    alert('ไม่สามารถอัปเดตสถานะการชำระเงินได้');
  } finally {
    isProcessing.value = false;
  }
};

const handleDeleteInvoice = async (invoiceId) => {
    if (confirm('ต้องการลบใบเสร็จนี้?')) {
        isProcessing.value = true;
        try {
            await deleteDoc(doc(db, 'invoices', invoiceId));
            showToast('ลบบิลสำเร็จ!');
        } catch (e) {
            console.error("Error deleting invoice: ", e);
        } finally {
            isProcessing.value = false;
        }
    }
};

const handleUpdateSettings = async (newSettings) => {
    isProcessing.value = true;
    try {
        const settingsDoc = doc(db, 'config', 'ownerSettings');
        await updateDoc(settingsDoc, newSettings);
        showToast('บันทึกการตั้งค่าสำเร็จ!');
    } catch (e) {
        console.error("Error updating settings: ", e);
    } finally {
        isProcessing.value = false;
    }
};

const handleSaveExpense = async (expense) => {
    isProcessing.value = true;
    try {
        await addDoc(collection(db, 'expenses'), {
            ...expense,
            createdAt: Date.now()
        });
        showToast('บันทึกรายจ่ายสำเร็จ!');
    } catch (e) {
        console.error("Error adding expense: ", e);
    } finally {
        isProcessing.value = false;
    }
};

const handleDeleteExpense = async (id) => {
    if (confirm('ต้องการลบรายการจ่ายนี้?')) {
        isProcessing.value = true;
        try {
            await deleteDoc(doc(db, 'expenses', id));
            showToast('ลบรายการสำเร็จ!');
        } catch (e) {
            console.error("Error deleting expense: ", e);
        } finally {
            isProcessing.value = false;
        }
    }
};

</script>

<template>
  <!-- Loading Full Screen -->
  <div v-if="authLoading" class="min-h-screen bg-slate-50 flex items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
  </div>

  <!-- Login Mode -->
  <Login v-else-if="!user" />

  <!-- App Mode -->
  <div v-else class="min-h-screen bg-slate-50 flex flex-col md:flex-row">
    <!-- Success Toast -->
    <Transition name="fade">
      <div v-if="copySuccess" class="fixed top-6 left-1/2 transform -translate-x-1/2 z-[200] bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="font-bold">{{ toastMessage }}</span>
      </div>
    </Transition>

    <Sidebar 
        v-model="activeTab" 
        :apartmentName="ownerSettings.apartmentName" 
        @logout="handleLogout"
    />

    <!-- Mobile Header -->
    <div class="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-40 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="bg-green-700 p-1.5 rounded-lg text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <span class="font-black text-lg tracking-tight">{{ ownerSettings.apartmentName }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 p-6 pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-8">
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
      
      <div v-else>
        <Dashboard 
          v-if="activeTab === 'dashboard'" 
          :invoices="invoices" 
          :tenants="tenants" 
          :expenses="expenses"
          :ownerSettings="ownerSettings"
          @navigate="activeTab = $event"
        />

        <Expenses 
          v-if="activeTab === 'expenses'" 
          :expenses="expenses"
          :isProcessing="isProcessing"
          @save="handleSaveExpense"
          @delete="handleDeleteExpense"
        />

        <Reports
          v-if="activeTab === 'reports'"
          :invoices="invoices"
          :expenses="expenses"
        />
        
        <InvoiceForm
          v-if="activeTab === 'create'"
          :tenants="tenants"
          :ownerSettings="ownerSettings"
          :isProcessing="isProcessing"
          @save="handleSaveInvoice"
        />

        <MoveInBilling
          v-if="activeTab === 'move-in'"
          :tenants="tenants"
          :ownerSettings="ownerSettings"
          :isProcessing="isProcessing"
          @save="handleSaveInvoice"
        />
        
        <InvoiceHistory 
          v-if="activeTab === 'history'" 
          :invoices="invoices"
          :isProcessing="isProcessing"
          @view="selectedInvoice = $event"
          @delete="handleDeleteInvoice"
          @toggle-status="handleUpdateInvoiceStatus"
        />
        
        <TenantManager 
          v-if="activeTab === 'tenants'" 
          :tenants="tenants"
          :isProcessing="isProcessing"
          @save="handleSaveTenant"
          @delete="handleDeleteTenant"
        />
        
        <Settings 
          v-if="activeTab === 'settings'" 
          :modelValue="ownerSettings"
          @update:modelValue="handleUpdateSettings"
        />
      </div>
    </main>

    <!-- Invoice Detail Modal -->
    <InvoicePreviewModal 
      v-if="selectedInvoice" 
      :invoice="selectedInvoice" 
      @close="selectedInvoice = null" 
      @toast="showToast"
    />
  </div>
</template>

<style>
@import "tailwindcss";

@layer base {
  body {
    @apply text-slate-900 bg-slate-50;
  }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media print {
  .no-print { display: none !important; }
}
</style>
