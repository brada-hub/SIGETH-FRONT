<template>
  <q-layout>
    <q-page-container>
      <q-page class="login-extreme flex items-center justify-center overflow-hidden h-screen">
        <!-- IMERSIVE BRAND EXPERIENCE -->
        <div class="absolute inset-0 z-0 bg-unitepc-gradient">
           <!-- Falling Brand Elements (U) -->
           <div class="falling-entities">
              <div class="entity ent-1">U</div>
              <div class="entity ent-2">UNITEPC</div>
              <div class="entity ent-3">U</div>
              <div class="entity ent-4">UNITEPC</div>
              <div class="entity ent-5">U</div>
              <div class="entity ent-6">U</div>
              <div class="entity ent-7">UNITEPC</div>
              <div class="entity ent-8">U</div>
           </div>

           <!-- Dynamic Light Leaks -->
           <div class="light-leak leak-1"></div>
           <div class="light-leak leak-2"></div>
        </div>

        <!-- THE GLASS CONSOLE -->
        <div class="w-full max-w-[420px] q-pa-md relative z-10 animate-zoom-in">
          <q-card class="glass-god-card border-glass overflow-hidden shadow-2xl">

            <!-- Header: Identity -->
            <q-card-section class="flex flex-col items-center q-pt-xl q-pb-lg">
              <div class="logo-aura">
                <img src="~assets/logo_unitepc.png" alt="UNITEPC" class="h-12" />
              </div>
              <div class="text-center q-mt-lg">
                <h1 class="font-black text-[22px] text-[#663399] tracking-tighter m-0 leading-none" style="line-height: 1.1;">SISTEMA DE GESTIÓN DE<br/>TALENTO HUMANO</h1>
                <div class="row items-center justify-center gap-2 q-mt-sm">
                   <div class="h-1 w-4 bg-[#009999] rounded-full"></div>
                   <span class="text-[10px] font-black text-[#009999] tracking-[0.4em] uppercase">SIGETH</span>
                   <div class="h-1 w-4 bg-[#009999] rounded-full"></div>
                </div>
              </div>
            </q-card-section>

            <!-- Body: Interface -->
            <q-card-section class="q-px-xl q-pb-xl">
              <q-form @submit="onLogin" class="q-gutter-y-lg">

                <div class="input-field-god">
                  <label class="label-pro">Cédula de Identidad</label>
                  <q-input
                    v-model="login.ci"
                    autocomplete="username"
                    name="ci"
                    outlined
                    dense
                    placeholder="Escribe tu número de C.I."
                    bg-color="white"
                    class="input-premium"
                    :rules="[(val) => !!val || 'Requerido']"
                    hide-bottom-space
                  >
                    <template v-slot:prepend>
                      <q-icon name="person" color="primary" class="opacity-50" />
                    </template>
                  </q-input>
                </div>

                <div class="input-field-god">
                  <label class="label-pro">Contraseña de Acceso</label>
                  <q-input
                    v-model="login.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    name="password"
                    outlined
                    dense
                    placeholder="••••••••"
                    bg-color="white"
                    class="input-premium"
                    :rules="[(val) => !!val || 'Requerido']"
                    hide-bottom-space
                  >
                    <template v-slot:prepend>
                      <q-icon name="lock" color="primary" class="opacity-50" />
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility' : 'visibility_off'"
                        class="cursor-pointer text-grey-5 hover:text-primary transition-colors"
                        size="18px"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>
                </div>

                <div class="q-pt-md">
                  <q-btn
                    type="submit"
                    :loading="loading"
                    class="full-width btn-impact py-4 rounded-2xl"
                    unelevated
                    no-caps
                  >
                    <div class="row no-wrap items-center justify-center gap-3">
                       <span class="text-md font-black tracking-widest">INGRESAR AHORA</span>
                       <q-icon name="arrow_forward" size="20px" class="q-ml-sm" />
                    </div>
                  </q-btn>
                </div>

              </q-form>
            </q-card-section>

            <!-- Branding Footer -->
            <div class="q-pb-xl text-center opacity-30">
               <div class="text-[9px] font-black text-slate-900 uppercase tracking-[0.6em]">UNITEPC • UNIFIED SIGETH • 2026</div>
            </div>
          </q-card>
        </div>

        <!-- DIALOG PARA FORZAR CAMBIO DE CONTRASEÑA -->
        <q-dialog v-model="showForceChangeDialog" persistent backdrop-filter="blur(4px)">
          <q-card style="min-width: 400px; max-width: 90vw;" class="rounded-borders relative-position">
            <q-card-section class="bg-primary text-white row items-center no-wrap">
              <q-icon name="warning" size="24px" class="q-mr-sm" />
              <div class="text-h6 text-weight-bold">Cambio Obligatorio de Contraseña</div>
            </q-card-section>

            <q-card-section class="q-pt-md">
              <p class="text-caption text-grey-8 q-mb-md">
                Por razones de seguridad, es necesario actualizar tu contraseña ya que fue restablecida al inicio. Por favor, elige una nueva y segura contraseña.
              </p>

              <q-form @submit="onSubmitForceChange">
                <div class="q-mb-md">
                  <q-input
                    v-model="forceForm.new_password"
                    :type="showForcePwd.new ? 'text' : 'password'"
                    label="Nueva Contraseña"
                    outlined
                    dense
                    :rules="[val => val.length >= 6 || 'Mínimo 6 caracteres']"
                    hide-bottom-space
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showForcePwd.new ? 'visibility' : 'visibility_off'"
                        class="cursor-pointer"
                        @click="showForcePwd.new = !showForcePwd.new"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="q-mb-md">
                  <q-input
                    v-model="forceForm.new_password_confirmation"
                    :type="showForcePwd.confirm ? 'text' : 'password'"
                    label="Confirmar Contraseña"
                    outlined
                    dense
                    :rules="[val => val === forceForm.new_password || 'Las contraseñas no coinciden']"
                    hide-bottom-space
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showForcePwd.confirm ? 'visibility' : 'visibility_off'"
                        class="cursor-pointer"
                        @click="showForcePwd.confirm = !showForcePwd.confirm"
                      />
                    </template>
                  </q-input>
                </div>

                <div class="row items-center justify-end q-mt-lg">
                  <q-btn flat label="Cerrar Sesión" color="negative" class="q-mr-sm" @click="onCancelForceChange" />
                  <q-btn type="submit" label="Actualizar y Continuar" color="primary" unelevated :loading="forceSaving" />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-dialog>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { authService } from 'src/services/api'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const showPassword = ref(false)

const showForceChangeDialog = ref(false)
const forceSaving = ref(false)
const showForcePwd = ref({ new: false, confirm: false })
const forceForm = reactive({
  new_password: '',
  new_password_confirmation: ''
})

const redirectUser = (data, returnToUrl) => {
  if (returnToUrl) {
    const userEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(data.user))))
    let redirectUrl
    if (returnToUrl.includes('9001') || returnToUrl.includes('sispo') || returnToUrl.includes('postulaciones') || returnToUrl.includes('sipost')) {
      const baseUrl = returnToUrl.replace(/#.*$/, '').replace(/\/$/, '')
      redirectUrl = `${baseUrl}/#/login?token=${data.access_token}&user=${userEncoded}`
    } else if (returnToUrl.includes('9002') || returnToUrl.includes('sigva')) {
      const baseUrl = returnToUrl.replace(/#.*$/, '').replace(/\/$/, '')
      redirectUrl = `${baseUrl}/admin/login?token=${data.access_token}&user=${userEncoded}`
    } else {
      redirectUrl = returnToUrl
    }
    console.log('SSO: Redirecting to:', redirectUrl.substring(0, 100) + '...')
    window.location.href = redirectUrl
  } else {
    router.push('/')
  }
}

onMounted(() => {
  if (route.query.logout === 'true') {
     console.log('Login: Cierre de sesión forzado detectado.')
     authService.logout()
     localStorage.clear() // Limpieza total de seguridad
     $q.notify({ message: 'Sesión cerrada correctamente', color: 'info', icon: 'logout', position: 'top' })
  } else if (localStorage.getItem('sso_token') && localStorage.getItem('sso_user')) {
    const user = JSON.parse(localStorage.getItem('sso_user'))
    console.log('Login: Sesión previa encontrada:', user.nombres)

    if (user.must_change_password) {
      showForceChangeDialog.value = true
    } else {
      const returnTo = route.query.returnTo
      if (returnTo) {
        // EVITAR BUCLE: Si ya estamos logueados y venimos de un returnTo, redirigir de inmediato
        console.log('Login: Redirigiendo a destino:', returnTo)
        redirectUser({
          access_token: localStorage.getItem('sso_token'),
          user: user
        }, returnTo)
      } else {
        // Si no hay returnTo y estamos logueados, vamos al Dashboard del SSO
        router.push('/')
      }
    }
  }
})

const login = reactive({
  ci: '',
  password: ''
})

const onLogin = async () => {
  if (!login.ci || !login.password) return

  loading.value = true
  try {
    const data = await authService.login(login.ci, login.password)

    if (data.user.must_change_password) {
      forceForm.new_password = ''
      forceForm.new_password_confirmation = ''
      showForcePwd.value = { new: false, confirm: false }
      showForceChangeDialog.value = true
      loading.value = false
      return // Wait for the user to change password
    }

    $q.notify({
      color: 'positive',
      message: '¡Bienvenido a SIGETH!',
      icon: 'check_circle',
      position: 'top'
    })

    // REDIRECCIÓN INTELIGENTE
    const returnTo = route.query.returnTo
    redirectUser(data, returnTo)

  } catch (error) {
    console.error(error)
    $q.notify({
      color: 'negative',
      message: error.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.',
      icon: 'report_problem',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const onSubmitForceChange = async () => {
  if (!forceForm.new_password || !forceForm.new_password_confirmation) {
    return
  }
  forceSaving.value = true
  try {
    const { default: api } = await import('src/services/api')
    const res = await api.post('/force-change-password', forceForm)

    // Update local storage user variable
    localStorage.setItem('sso_user', JSON.stringify(res.data.user))

    $q.notify({ color: 'positive', message: 'Contraseña actualizada y verificada', icon: 'check_circle' })
    showForceChangeDialog.value = false

    // Continue the flow
    const returnTo = route.query.returnTo
    const loginData = {
      access_token: localStorage.getItem('sso_token'),
      user: res.data.user
    }

    $q.notify({
      color: 'positive',
      message: '¡Bienvenido a SIGETH!',
      icon: 'check_circle',
      position: 'top'
    })
    redirectUser(loginData, returnTo)
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error.response?.data?.message || 'Error al actualizar contraseña'
    })
  } finally {
    forceSaving.value = false
  }
}

const onCancelForceChange = () => {
  authService.logout()
  showForceChangeDialog.value = false
  $q.notify({ message: 'Sesión cancelada porque el cambio de contraseña es obligatorio', color: 'warning', position: 'top' })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');

.login-extreme {
  font-family: 'Outfit', sans-serif;
  height: 100vh;
  position: relative;
  background-color: #0f172a;
}

.bg-unitepc-gradient {
  background: radial-gradient(circle at 0% 0%, #663399 0%, #2c164a 50%, #009999 100%);
  width: 100%;
  height: 100%;
}

/* Falling Brand Entities (U and UNITEPC) */
.falling-entities {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}

.entity {
  position: absolute;
  color: white;
  font-weight: 900;
  opacity: 0.08;
  user-select: none;
  pointer-events: none;
  animation: drift-down 20s infinite linear;
}

.ent-1 { font-size: 80px; left: 5%; top: -100px; animation-duration: 25s; }
.ent-2 { font-size: 20px; left: 25%; top: -50px; animation-duration: 18s; animation-delay: -5s; letter-spacing: 12px; }
.ent-3 { font-size: 120px; left: 60%; top: -150px; animation-duration: 35s; animation-delay: -2s; }
.ent-4 { font-size: 15px; left: 85%; top: -30px; animation-duration: 22s; animation-delay: -12s; letter-spacing: 8px; }
.ent-5 { font-size: 60px; left: 45%; top: -80px; animation-duration: 30s; animation-delay: -8s; }
.ent-6 { font-size: 160px; left: 15%; bottom: -200px; animation-duration: 40s; animation-delay: -20s; transform: rotate(15deg); }
.ent-7 { font-size: 30px; left: 75%; top: -60px; animation-duration: 20s; animation-delay: -4s; letter-spacing: 15px; }
.ent-8 { font-size: 90px; right: 10%; bottom: -100px; animation-duration: 28s; animation-delay: -10s; }

@keyframes drift-down {
  0% { transform: translateY(-20vh) rotate(0deg); }
  100% { transform: translateY(120vh) rotate(360deg); }
}

/* Light Leaks for Impact */
.light-leak {
  position: absolute;
  width: 60vw;
  height: 60vw;
  border-radius: 50%;
  filter: blur(140px);
  opacity: 0.15;
  z-index: 2;
}
.leak-1 { background: #663399; top: -10%; right: -10%; }
.leak-2 { background: #009999; bottom: -10%; left: -10%; }

/* Glass God Card - Now Semi-Transparent */
.glass-god-card {
  background: rgba(255, 255, 255, 0.75); /* More transparent */
  backdrop-filter: blur(30px); /* Intense blur */
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.logo-aura {
  background: white;
  padding: 16px 36px;
  border-radius: 24px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.label-pro {
  display: block;
  font-size: 10px;
  font-weight: 900;
  color: #663399;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-left: 18px;
  margin-bottom: 8px;
  opacity: 0.8;
}

.input-premium :deep(.q-field__control) {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid #e2e8f0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.input-premium :deep(.q-field--focused .q-field__control) {
  border-color: #663399;
  box-shadow: 0 15px 35px rgba(102, 51, 153, 0.15);
  transform: translateY(-4px);
  background: white !important;
}

.btn-impact {
  background: linear-gradient(135deg, #663399 0%, #312e81 100%);
  color: white;
  box-shadow: 0 20px 50px rgba(102, 51, 153, 0.4);
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}
.btn-impact:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 30px 70px rgba(102, 51, 153, 0.6);
}

.animate-zoom-in {
  animation: zoom-in 1.2s cubic-bezier(0.19, 1, 0.22, 1);
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.9) translateY(40px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

:deep(body) {
  overflow: hidden !important;
}
</style>
