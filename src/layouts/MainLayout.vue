<template>
  <q-layout view="lHh LpR lFf">
    <!-- HEADER -->
    <q-header class="bg-gradient-to-r from-primary to-secondary text-white" height-hint="60">
      <q-toolbar class="h-16 px-6">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="mr-4"
        />

        <q-toolbar-title
          class="flex items-center gap-4 cursor-pointer"
          @click="$router.push('/')"
        >
          <div class="flex flex-col leading-tight ml-2 mt-1">
            <span class="font-bold text-sm tracking-wide uppercase leading-none" style="line-height:1.1;">SISTEMA DE GESTIÓN DE<br/>TALENTO HUMANO</span>
            <span class="text-[10px] opacity-90 font-light tracking-widest mt-1"
              >SIGETH</span
            >
          </div>
        </q-toolbar-title>

        <div class="flex items-center gap-4">
          <div class="hidden sm:flex flex-col items-end mr-2">
            <span class="text-sm font-bold">{{ today }}</span>
            <span class="text-xs opacity-80">Cochabamba, Bolivia</span>
          </div>

          <q-btn
            flat
            round
            dense
            icon="notifications"
            class="bg-white/10 hover:bg-white/20 transition-all"
          >
            <q-badge floating color="red" rounded />
            <q-tooltip class="bg-black/80 text-white">Notificaciones</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR (Drawer) -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="260"
      bordered
      class="bg-white"
    >
      <div class="column no-wrap h-full" style="height: 100vh;">
        <!-- Brand Area -->
        <div class="p-6 flex flex-col gap-1">
          <div class="flex items-center gap-2 font-bold text-xl tracking-tight">
             <img src="~assets/logo_unitepc.png" class="h-10" alt="UNITEPC" />
          </div>
          <div class="text-xs text-gray-500 font-medium leading-tight">SISTEMA DE GESTIÓN DE<br/>TALENTO HUMANO</div>
        </div>

        <!-- Menu items -->
        <div class="col px-4 space-y-2 overflow-y-auto mt-2">
          <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4 mb-2">Menú Principal (SIGETH)</div>

          <!-- Dashboard -->
          <div
            @click="setSection('/')"
            :class="[
              'flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-1 group',
              route.path === '/'
                ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md scale-[1.02]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary font-medium hover:translate-x-1',
            ]"
          >
            <q-icon name="dashboard" size="22px" :class="route.path === '/' ? 'text-white' : 'text-gray-400 group-hover:text-primary'" />
            <span>Dashboard</span>
          </div>

          <!-- Separador Configuración -->
          <div v-if="configMenuItems.length > 0" class="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-4 mb-2 mt-4">Configuración</div>

          <div
            v-for="item in configMenuItems"
            :key="item.to"
            @click="setSection(item.to)"
            :class="[
              'flex items-center gap-4 px-4 py-3 rounded-lg transition-all cursor-pointer mb-1 group',
              route.path === item.to
                ? 'bg-gradient-to-r from-primary to-secondary text-white font-bold shadow-md scale-[1.02]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary font-medium hover:translate-x-1',
            ]"
          >
            <q-icon :name="item.icon" size="22px" :class="route.path === item.to ? 'text-white' : 'text-gray-400 group-hover:text-primary'" />
            <span>{{ item.label }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <div class="row items-center no-wrap gap-3 mb-4">
            <div
              class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shadow-sm border border-primary/20 shrink-0"
            >
              {{ userInitial }}
            </div>
            <div class="column leading-tight overflow-hidden">
              <div class="font-bold text-gray-900 text-[11px] uppercase truncate">
                {{ userName }}
              </div>
              <div class="text-[10px] text-gray-500 truncate">
                Administrador
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              @click="changePassword"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <q-icon name="lock" size="18px" class="text-gray-400 group-hover:text-primary group-hover:rotate-12 transition-all" />
              <span class="font-bold text-sm">Cambiar Contraseña</span>
            </button>

            <button
              @click="logout"
              class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all group"
            >
              <q-icon name="logout" size="18px" class="rotate-180 group-hover:-translate-x-1 transition-all" />
              <span class="font-bold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Dialog Cambiar Contraseña -->
    <q-dialog v-model="pwdDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="lock" class="q-mr-sm" />
            Cambiar Contraseña
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input v-model="pwdForm.current_password" label="Contraseña Actual"
            :type="showPwd.current ? 'text' : 'password'" outlined dense>
            <template v-slot:append>
              <q-icon :name="showPwd.current ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                @click="showPwd.current = !showPwd.current" />
            </template>
          </q-input>
          <q-input v-model="pwdForm.new_password" label="Nueva Contraseña"
            :type="showPwd.new ? 'text' : 'password'" outlined dense
            :rules="[val => !val || val.length >= 6 || 'Mínimo 6 caracteres']">
            <template v-slot:append>
              <q-icon :name="showPwd.new ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                @click="showPwd.new = !showPwd.new" />
            </template>
          </q-input>
          <q-input v-model="pwdForm.new_password_confirmation" label="Confirmar Nueva Contraseña"
            :type="showPwd.confirm ? 'text' : 'password'" outlined dense
            :rules="[val => val === pwdForm.new_password || 'Las contraseñas no coinciden']">
            <template v-slot:append>
              <q-icon :name="showPwd.confirm ? 'visibility' : 'visibility_off'" class="cursor-pointer"
                @click="showPwd.confirm = !showPwd.confirm" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" @click="submitChangePassword" :loading="pwdSaving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/api'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const leftDrawerOpen = ref(false)
const userName = ref('Usuario')
const userInitial = ref('U')

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const today = new Date().toLocaleDateString('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const configMenuItems = ref([])

const setSection = (path) => {
  router.push(path)
  leftDrawerOpen.value = false
}

const pwdDialog = ref(false)
const pwdSaving = ref(false)
const pwdForm = ref({ current_password: '', new_password: '', new_password_confirmation: '' })
const showPwd = ref({ current: false, new: false, confirm: false })

const changePassword = () => {
  pwdForm.value = { current_password: '', new_password: '', new_password_confirmation: '' }
  pwdDialog.value = true
}

const submitChangePassword = async () => {
  if (!pwdForm.value.current_password || !pwdForm.value.new_password) {
    $q.notify({ type: 'warning', message: 'Completa todos los campos' })
    return
  }
  if (pwdForm.value.new_password !== pwdForm.value.new_password_confirmation) {
    $q.notify({ type: 'warning', message: 'Las contraseñas no coinciden' })
    return
  }
  if (pwdForm.value.new_password.length < 6) {
    $q.notify({ type: 'warning', message: 'La contraseña debe tener al menos 6 caracteres' })
    return
  }
  pwdSaving.value = true
  try {
    const { default: api } = await import('src/services/api')
    const res = await api.post('/change-password', pwdForm.value)
    $q.notify({ type: 'positive', message: res.data.message, icon: 'check_circle' })
    pwdDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al cambiar contraseña' })
  } finally { pwdSaving.value = false }
}

const logout = async () => {
  try {
    await authService.logout()
  } catch {
    // ignore
  }
  localStorage.clear() // LIMPIEZA TOTAL
  $q.notify({ type: 'positive', message: 'Sesión cerrada correctamente', position: 'top' })
  window.location.href = '/#/login' // Redirección dura para limpiar estado de Vue
}

onMounted(() => {
  const userStr = localStorage.getItem('sso_user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      const apellidos = user.apellido_paterno || user.apellido_materno ? `${user.apellido_paterno || ''} ${user.apellido_materno || ''}`.trim() : user.apellidos || ''
      userName.value = `${user.nombres || ''} ${apellidos}`.trim() || 'Usuario'
      userInitial.value = user.nombres?.[0] || 'U'

      const perms = user.permisos || []

      configMenuItems.value = [
        { label: 'Gestionar Usuarios', icon: 'manage_accounts', to: '/users', show: perms.includes('gestionar_usuarios') || perms.includes('usuarios') || perms.includes('all') },
        { label: 'Gestionar Roles', icon: 'security', to: '/roles', show: perms.includes('gestionar_roles') || perms.includes('roles') || perms.includes('all') },
        { label: 'Gestionar Sistemas', icon: 'apps', to: '/applications', show: perms.includes('gestionar_aplicaciones') || perms.includes('sistemas') || perms.includes('all') },
        { label: 'Gestionar Sedes', icon: 'apartment', to: '/sedes', show: perms.includes('gestionar_sedes') || perms.includes('sedes') || perms.includes('all') },
      ].filter(item => item.show)
    } catch {
      // ignore
    }
  }
})
</script>
