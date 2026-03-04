<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div>
        <h5 class="q-ma-none text-weight-bold">Gestión de Roles</h5>
        <div class="text-grey-7 text-caption">Administra los roles y permisos del sistema</div>
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Rol" @click="openDialog()" />
    </div>

    <div class="row q-col-gutter-lg">
      <div v-for="rol in roles" :key="rol.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat bordered>
          <q-card-section class="bg-deep-purple text-white">
            <div class="row items-center no-wrap">
              <q-icon name="security" size="32px" class="q-mr-md" />
              <div class="col">
                <div class="text-h6 text-weight-bold">{{ rol.nombre }}</div>
                <div class="text-caption opacity-80">{{ rol.descripcion || 'Sin descripción' }}</div>
              </div>
              <q-badge color="white" text-color="deep-purple" class="text-weight-bold">
                {{ rol.users_count || 0 }} usuarios
              </q-badge>
            </div>
          </q-card-section>
          <q-card-section>
            <template v-for="sys in systemsList" :key="sys.id">
              <div v-if="getRolPermissionsBySystem(rol.id, sys.id).length" class="q-mb-sm">
                <div class="text-caption text-weight-bold q-mb-xs" :style="{ color: sys.color }">
                  {{ sys.icon }} {{ sys.name }}
                </div>
                <div class="q-gutter-xs">
                  <q-badge v-for="perm in getRolPermissionsBySystem(rol.id, sys.id)" :key="perm.id"
                    :color="sys.badgeColor" outline class="q-mb-xs">
                    {{ perm.name }}
                  </q-badge>
                </div>
              </div>
            </template>
            <span v-if="!getRolPermissions(rol.id).length" class="text-grey text-caption">
              Sin permisos configurados
            </span>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="primary" icon="edit" label="Editar" @click="openDialog(rol)" />
            <q-btn flat color="negative" icon="delete" label="Eliminar" @click="deleteRol(rol)"
              :disable="rol.users_count > 0" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 600px; max-width: 700px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="security" class="q-mr-sm" />
            {{ editing ? 'Editar' : 'Nuevo' }} Rol
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input v-model="form.nombre" label="Nombre del Rol" outlined dense />
          <q-input v-model="form.descripcion" label="Descripción" outlined dense type="textarea" autogrow />

          <div class="text-subtitle2 text-weight-bold q-mt-md">Permisos</div>
          <div class="text-caption text-grey-7 q-mb-sm">Selecciona los permisos que tendrá este rol</div>

          <template v-for="sys in systemsList" :key="sys.id">
            <div class="q-pa-sm q-mb-md rounded-borders" :style="{ border: '1px solid ' + sys.color + '40', background: sys.color + '08' }">
              <div class="row items-center q-mb-sm">
                <span class="text-weight-bold" :style="{ color: sys.color }">{{ sys.icon }} {{ sys.name }}</span>
                <q-space />
                <q-btn flat dense size="sm" :color="sys.badgeColor" @click="toggleAllSystem(sys.id)">
                  {{ isAllSystemSelected(sys.id) ? 'Quitar todos' : 'Seleccionar todos' }}
                </q-btn>
              </div>
              <div class="row q-col-gutter-sm">
                <div v-for="perm in getPermissionsBySystem(sys.id)" :key="perm.id" class="col-6 col-md-4">
                  <q-checkbox
                    v-model="form.permission_ids"
                    :val="perm.id"
                    :label="perm.name"
                    dense
                    :color="sys.badgeColor"
                  />
                </div>
              </div>
            </div>
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" :label="editing ? 'Actualizar' : 'Crear'" @click="saveRol" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from 'src/services/api'

const $q = useQuasar()
const roles = ref([])
const allPermissions = ref([])
const rolPermissionsMap = ref({}) // { rolId: [permissions] }
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editingId = ref(null)

const form = ref({ nombre: '', descripcion: '', permission_ids: [] })

const systemsList = [
  { id: 1, name: 'SISPO — Postulaciones', icon: '📋', color: '#673ab7', badgeColor: 'deep-purple' },
  { id: 2, name: 'SIGVA — Vacaciones', icon: '🏖️', color: '#00897b', badgeColor: 'teal' },
  { id: 3, name: 'SIGETH — Panel Central', icon: '🔐', color: '#1976D2', badgeColor: 'blue' },
]

const getRolPermissions = (rolId) => {
  return rolPermissionsMap.value[rolId] || []
}

const getRolPermissionsBySystem = (rolId, systemId) => {
  const perms = rolPermissionsMap.value[rolId] || []
  return perms.filter(p => p.system_id === systemId)
}

const getPermissionsBySystem = (systemId) => {
  return allPermissions.value.filter(p => p.system_id === systemId)
}

const isAllSystemSelected = (systemId) => {
  const sysPerms = getPermissionsBySystem(systemId)
  return sysPerms.length > 0 && sysPerms.every(p => form.value.permission_ids.includes(p.id))
}

const toggleAllSystem = (systemId) => {
  const sysPerms = getPermissionsBySystem(systemId)
  const sysPermIds = sysPerms.map(p => p.id)
  if (isAllSystemSelected(systemId)) {
    form.value.permission_ids = form.value.permission_ids.filter(id => !sysPermIds.includes(id))
  } else {
    const newIds = sysPermIds.filter(id => !form.value.permission_ids.includes(id))
    form.value.permission_ids = [...form.value.permission_ids, ...newIds]
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [rolesRes, permsRes] = await Promise.all([
      api.get('/roles'),
      api.get('/permissions')
    ])
    roles.value = rolesRes.data
    allPermissions.value = permsRes.data

    // Cargar permisos de cada rol
    const permMap = {}
    for (const rol of roles.value) {
      try {
        const rolDetail = await api.get(`/roles/${rol.id}`)
        const permIds = rolDetail.data.permission_ids || []
        permMap[rol.id] = allPermissions.value.filter(p => permIds.includes(p.id))
      } catch {
        permMap[rol.id] = []
      }
    }
    rolPermissionsMap.value = permMap
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error: ' + e.message })
  } finally { loading.value = false }
}

const openDialog = async (rol = null) => {
  if (rol) {
    editing.value = true
    editingId.value = rol.id
    try {
      const detail = await api.get(`/roles/${rol.id}`)
      form.value = {
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
        permission_ids: detail.data.permission_ids || []
      }
    } catch {
      form.value = { nombre: rol.nombre, descripcion: rol.descripcion || '', permission_ids: [] }
    }
  } else {
    editing.value = false
    editingId.value = null
    form.value = { nombre: '', descripcion: '', permission_ids: [] }
  }
  dialog.value = true
}

const saveRol = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/roles/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Rol actualizado' })
    } else {
      await api.post('/roles', form.value)
      $q.notify({ type: 'positive', message: 'Rol creado' })
    }
    dialog.value = false
    loadData()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error' })
  } finally { saving.value = false }
}

const deleteRol = (rol) => {
  $q.dialog({
    title: 'Confirmar', message: `¿Eliminar el rol "${rol.nombre}"?`, cancel: true, persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/roles/${rol.id}`)
      $q.notify({ type: 'positive', message: 'Rol eliminado' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'No se puede eliminar un rol con usuarios asignados' })
    }
  })
}

onMounted(loadData)
</script>
