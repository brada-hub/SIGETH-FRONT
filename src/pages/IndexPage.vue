<template>
  <q-page class="q-pa-lg bg-grey-2">
    <div class="row q-col-gutter-lg justify-center">
      <!-- Welcome Header -->
      <div class="col-12 text-center q-mb-xl">
        <h1 class="text-h3 text-weight-bold text-primary q-mb-sm">Bienvenido, {{ userName || 'Usuario' }}</h1>
        <p class="text-subtitle1 text-grey-8">SISTEMA DE GESTIÓN DE TALENTO HUMANO</p>
      </div>

      <!-- Application Cards -->
      <div v-for="app in applications" :key="app.name" class="col-12 col-sm-6 col-md-4">
        <q-card v-ripple class="my-card q-hoverable cursor-pointer shadow-10" @click="goToApp(app.url)">
          <q-card-section class="text-center q-py-xl" :class="`bg-gradient-${app.color}`">
             <q-icon :name="app.icon" size="100px" color="white" />
          </q-card-section>

          <q-card-section>
            <div class="text-h5 text-weight-bold q-mb-xs">{{ app.name }}</div>
            <div class="text-caption text-grey-7">{{ app.description }}</div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat color="primary" label="Acceder" icon-right="arrow_forward" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Settings / Profile Quick Access -->
      <div class="col-12 row justify-center q-mt-xl">
        <q-btn
          outline
          rounded
          color="secondary"
          icon="manage_accounts"
          label="Gestionar Mi Perfil y Contraseña"
          class="q-px-xl q-py-sm"
          @click="goToProfile"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const applications = ref([])
const userName = ref('')

onMounted(() => {
  const userStr = localStorage.getItem('sso_user')
  if (userStr) {
    const user = JSON.parse(userStr)
    userName.value = `${user.nombres} ${user.apellido_paterno || user.apellidos || ''}`.trim()
    applications.value = user.applications
      .filter(app => app.nombre !== 'SSO')
      .map(app => ({
        name: app.nombre,
        icon: app.icono || 'apps',
        description: app.descripcion,
        url: app.url,
        color: app.color || 'primary'
      }))
  } else {
    router.push('/login')
  }
})

const goToApp = (url) => {
  const token = localStorage.getItem('sso_token')
  const userStr = localStorage.getItem('sso_user')

  try {
    // Safely encode user string to Base64 avoiding Latin1 errors
    const userEncoded = btoa(unescape(encodeURIComponent(userStr)))

    // Construir la URL de redirección correctamente
    // SISPO usa hash mode (/#/), SIGVA usa history mode
    let redirectUrl
    if (url.includes('9001') || url.includes('sispo') || url.includes('postulaciones') || url.includes('sipost')) {
      // SISPO: hash mode => base/#/login?token=xxx&user=xxx
      const baseUrl = url.replace(/#.*$/, '').replace(/\/$/, '')
      redirectUrl = `${baseUrl}/#/login?token=${token}&user=${userEncoded}`
    } else if (url.includes('9002') || url.includes('sigva')) {
      // SIGVA: history mode => base/admin/login?token=xxx&user=xxx
      const cleanUrl = url.replace(/\?.*$/, '').replace(/\/$/, '')
      redirectUrl = `${cleanUrl}/admin/login?token=${token}&user=${userEncoded}`
    } else {
      // Default: try with query params on the base URL
      const cleanUrl = url.replace(/\?.*$/, '').replace(/\/$/, '')
      redirectUrl = `${cleanUrl}?token=${token}&user=${userEncoded}`
    }

    console.log('SSO Redirecting to:', redirectUrl.substring(0, 80) + '...')
    window.location.href = redirectUrl
  } catch (e) {
    console.error('Error al redirigir:', e)
    alert('Error al redirigir a la aplicación.')
  }
}

const goToProfile = () => {
  // router.push('/perfil')
  alert('Sección de Perfil en construcción')
}
</script>

<style lang="scss" scoped>
.my-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 16px;
  overflow: hidden;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.15);
  }
}

.bg-gradient-purple {
  background: linear-gradient(135deg, #673ab7 0%, #9c27b0 100%);
}

.bg-gradient-teal {
  background: linear-gradient(135deg, #00897b 0%, #00acc1 100%);
}
</style>
