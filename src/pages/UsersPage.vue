<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div>
        <h5 class="q-ma-none text-weight-bold">Gestión de Usuarios</h5>
        <div class="text-grey-7 text-caption">Administra los accesos y perfiles del personal</div>
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Usuario" @click="openDialog()" />
    </div>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      :filter="search"
      :pagination="{ rowsPerPage: 15 }"
    >
      <template v-slot:top-right>
        <q-input v-model="search" outlined dense placeholder="Buscar..." class="q-ml-md">
          <template v-slot:append><q-icon name="search" /></template>
        </q-input>
      </template>
      <template v-slot:body-cell-nombre="props">
        <q-td :props="props">
          <div class="text-weight-bold">{{ props.row.nombres }}</div>
          <div class="text-caption text-grey-7">CI: {{ props.row.ci }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-rol="props">
        <q-td :props="props">
          <q-badge :color="getRolColor(props.row.rol?.nombre)" outline class="text-weight-bold">
            {{ props.row.rol?.nombre || 'Sin rol' }}
          </q-badge>
        </q-td>
      </template>
      <template v-slot:body-cell-sede="props">
        <q-td :props="props">
          <span v-if="props.row.sede">{{ props.row.sede.nombre }}</span>
          <span v-else class="text-grey">Nacional</span>
        </q-td>
      </template>
      <template v-slot:body-cell-jurisdiccion="props">
        <q-td :props="props">
          <template v-if="props.row.jurisdiccion?.length">
            <q-badge v-for="sid in props.row.jurisdiccion" :key="sid"
              color="teal" outline class="q-mr-xs">
              {{ getSedeNombre(sid) }}
            </q-badge>
          </template>
          <span v-else class="text-grey text-caption">Todas</span>
        </q-td>
      </template>
      <template v-slot:body-cell-applications="props">
        <q-td :props="props">
          <q-badge v-for="app in props.row.applications.filter(a => a.nombre !== 'SSO')" :key="app.id"
            :color="app.color || 'primary'" class="q-mr-xs">
            {{ app.nombre }}
          </q-badge>
          <span v-if="!props.row.applications?.filter(a => a.nombre !== 'SSO').length" class="text-grey text-caption">Sin apps</span>
        </q-td>
      </template>
      <template v-slot:body-cell-activo="props">
        <q-td :props="props">
          <q-toggle
            :model-value="!!props.row.activo"
            @update:model-value="val => toggleActivo(props.row, val)"
            color="positive"
            checked-icon="check"
            unchecked-icon="close"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn flat round dense icon="edit" color="primary" @click="openDialog(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="lock_reset" color="orange" @click="resetPassword(props.row)">
            <q-tooltip>Restablecer Contraseña (CI)</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="delete" color="negative" @click="deleteUser(props.row)">
            <q-tooltip>Eliminar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Dialog Crear/Editar -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 700px; max-width: 800px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="manage_accounts" class="q-mr-sm" />
            {{ editing ? 'Actualizar' : 'Nuevo' }} Usuario
          </div>
        </q-card-section>
        <q-card-section class="q-pt-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input v-model="form.nombres" label="Nombres" outlined dense />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.apellido_paterno" label="Primer Apellido" outlined dense />
            </div>
            <div class="col-12 col-md-4">
              <q-input v-model="form.apellido_materno" label="Segundo Apellido" outlined dense />
            </div>
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-4">
              <q-input v-model="form.ci" label="CI (Usuario)" outlined dense />
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.rol_id" :options="roles" option-value="id" option-label="nombre"
                label="Plantilla de Rol" outlined dense emit-value map-options
                @update:model-value="onRolChange">
                <template v-slot:hint>
                  <span class="text-caption">Al cambiar, se copian los permisos del rol</span>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-md-4">
              <q-select v-model="form.sede_id" :options="sedes" option-value="id" option-label="nombre"
                label="Sede Asignada" outlined dense emit-value map-options clearable>
                <template v-slot:hint>
                  <span class="text-caption">Vacío = Nacional</span>
                </template>
              </q-select>
            </div>
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-6">
              <q-input v-model="form.email" label="Email" type="email" outlined dense />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="form.password" label="Contraseña" type="password" outlined dense
                :hint="editing ? 'Dejar vacío para no cambiar' : ''" />
            </div>
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12">
              <q-select v-model="form.jurisdiccion" :options="sedes" option-value="id" option-label="nombre"
                label="Jurisdicción (Sedes que puede ver)" outlined dense emit-value map-options
                multiple use-chips clearable>
                <template v-slot:hint>
                  <span class="text-caption">Vacío = Puede ver TODAS las sedes</span>
                </template>
              </q-select>
            </div>
          </div>
          <!-- Acceso a Sistemas y Permisos (Fusionado) -->
          <div class="text-subtitle2 text-weight-bold q-mt-lg">Acceso a Sistemas y Permisos</div>
          <div class="text-caption text-grey-7 q-mb-sm">
            Activa los sistemas a los que tendrá acceso y personaliza sus permisos
          </div>

          <template v-for="sys in systemsList" :key="sys.id">
            <div class="q-pa-md q-mb-md rounded-borders" :style="{
              border: '2px solid ' + (isSystemEnabled(sys) ? sys.color : '#e0e0e0'),
              background: isSystemEnabled(sys) ? sys.color + '08' : '#fafafa',
              opacity: isSystemEnabled(sys) ? 1 : 0.7,
              transition: 'all 0.3s ease'
            }">
              <!-- Header con switch de sistema -->
              <div class="row items-center q-mb-sm">
                <q-toggle
                  :model-value="isSystemEnabled(sys)"
                  @update:model-value="val => toggleSystem(sys, val)"
                  :color="sys.badgeColor"
                />
                <span class="text-weight-bold text-body1" :style="{ color: isSystemEnabled(sys) ? sys.color : '#999' }">
                  {{ sys.icon }} {{ sys.name }}
                </span>
                <q-space />
                <q-btn v-if="isSystemEnabled(sys)" flat dense size="sm" :color="sys.badgeColor"
                  @click="toggleAllSystem(sys.systemId)">
                  {{ isAllSystemSelected(sys.systemId) ? 'Quitar todos' : 'Marcar todos' }}
                </q-btn>
              </div>

              <!-- Permisos (solo si el sistema está activo) -->
              <div v-if="isSystemEnabled(sys)" class="row q-col-gutter-sm q-mt-xs">
                <div v-for="perm in getPermsBySystem(sys.systemId)" :key="perm.id" class="col-6 col-md-4">
                  <q-checkbox
                    v-model="form.direct_permission_ids"
                    :val="perm.id"
                    :label="perm.name"
                    dense
                    :color="sys.badgeColor"
                  />
                </div>
              </div>
              <div v-else class="text-caption text-grey q-ml-lg" style="padding-left: 40px">
                Sistema desactivado — el usuario no tendrá acceso
              </div>
            </div>
          </template>

          <div class="q-mt-md">
            <q-toggle v-model="form.activo" label="Usuario Habilitado" color="positive" />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" :label="editing ? 'Guardar Usuario' : 'Crear Usuario'" @click="saveUser" :loading="saving" />
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
const users = ref([])
const sedes = ref([])
const roles = ref([])
const applications = ref([])
const allPermissions = ref([])
const rolePermMap = ref({}) // { rolId: [permissionIds] }
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editingId = ref(null)
const search = ref('')

const systemsList = ref([])

// Se inicializará al cargar las apps
const buildSystemsList = () => {
  const mapping = [
    { appName: 'SISPO', name: 'SISPO — Postulaciones', icon: '📋', color: '#673ab7', badgeColor: 'deep-purple' },
    { appName: 'SIGVA', name: 'SIGVA — Vacaciones', icon: '🏖️', color: '#00897b', badgeColor: 'teal' },
    { appName: 'SIGETH', name: 'SIGETH — Panel Central', icon: '🔐', color: '#1976D2', badgeColor: 'blue' },
  ]
  systemsList.value = mapping.map(m => {
    const app = applications.value.find(a => a.nombre === m.appName || a.key === m.appName.toLowerCase())
    return { ...m, appId: app?.id || null, systemId: app?.id || null }
  })
}

const form = ref({
  ci: '', nombres: '', apellido_paterno: '', apellido_materno: '',
  email: '', password: '', sede_id: null, jurisdiccion: [],
  rol_id: null, application_ids: [], activo: true,
  direct_permission_ids: []
})

const isSystemEnabled = (sys) => {
  return sys.appId && form.value.application_ids.includes(sys.appId)
}

const toggleSystem = (sys, val) => {
  if (!sys.appId) return
  if (val) {
    if (!form.value.application_ids.includes(sys.appId)) {
      form.value.application_ids = [...form.value.application_ids, sys.appId]
    }
  } else {
    form.value.application_ids = form.value.application_ids.filter(id => id !== sys.appId)
    // Al desactivar el sistema, quitar sus permisos directos
    const sysPermIds = getPermsBySystem(sys.systemId).map(p => p.id)
    form.value.direct_permission_ids = form.value.direct_permission_ids.filter(id => !sysPermIds.includes(id))
  }
}

const getPermsBySystem = (sysId) => allPermissions.value.filter(p => p.application_id === sysId)

const isAllSystemSelected = (sysId) => {
  const sysPerms = getPermsBySystem(sysId)
  return sysPerms.length > 0 && sysPerms.every(p => form.value.direct_permission_ids.includes(p.id))
}

const toggleAllSystem = (sysId) => {
  const ids = getPermsBySystem(sysId).map(p => p.id)
  if (isAllSystemSelected(sysId)) {
    form.value.direct_permission_ids = form.value.direct_permission_ids.filter(id => !ids.includes(id))
  } else {
    form.value.direct_permission_ids = [...new Set([...form.value.direct_permission_ids, ...ids])]
  }
}

const onRolChange = (rolId) => {
  if (!rolId) return
  const rolPerms = rolePermMap.value[rolId] || []
  if (!rolPerms.length) return

  const rolName = roles.value.find(r => r.id === rolId)?.nombre || 'Rol'

  $q.dialog({
    title: '🔑 Aplicar plantilla de permisos',
    message: `¿Deseas aplicar los permisos del rol "${rolName}" a este usuario? Esto reemplazará los permisos actuales.`,
    cancel: { label: 'No, mantener actuales', flat: true },
    ok: { label: 'Sí, aplicar plantilla', color: 'primary' },
    persistent: true
  }).onOk(() => {
    form.value.direct_permission_ids = [...rolPerms]
    // Auto-activar los sistemas que tienen permisos
    const permSystems = new Set()
    rolPerms.forEach(permId => {
      const perm = allPermissions.value.find(p => p.id === permId)
      if (perm) permSystems.add(perm.application_id)
    })
    // Mapear system_id a app_id y activar
    systemsList.value.forEach(sys => {
      if (permSystems.has(sys.systemId) && sys.appId) {
        if (!form.value.application_ids.includes(sys.appId)) {
          form.value.application_ids = [...form.value.application_ids, sys.appId]
        }
      }
    })
    $q.notify({ type: 'info', message: `Permisos del rol "${rolName}" aplicados. Puedes personalizarlos.`, icon: 'tune' })
  })
}

const rolColors = {
  'Administrador': 'deep-purple', 'RRHH': 'teal', 'Evaluador': 'blue', 'Operador': 'orange'
}
const getRolColor = (nombre) => rolColors[nombre] || 'grey'
const getSedeNombre = (id) => sedes.value.find(s => s.id === id)?.nombre || `Sede #${id}`

const columns = [
  { name: 'nombre', label: 'Funcionario / Usuario', field: 'nombres', sortable: true, align: 'left' },
  { name: 'rol', label: 'Rol Asignado', field: 'rol', align: 'left' },
  { name: 'sede', label: 'Sede', field: 'sede', align: 'left' },
  { name: 'jurisdiccion', label: 'Jurisdicción', field: 'jurisdiccion', align: 'left' },
  { name: 'applications', label: 'Sistemas', field: 'applications', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const [usersRes, sedesRes, rolesRes, appsRes, permsRes] = await Promise.all([
      api.get('/users'), api.get('/sedes'), api.get('/roles'), api.get('/applications'), api.get('/permissions')
    ])
    users.value = usersRes.data
    sedes.value = sedesRes.data
    roles.value = rolesRes.data
    applications.value = appsRes.data
    allPermissions.value = permsRes.data
    buildSystemsList()

    // Cargar permisos de cada rol (plantillas)
    const permMap = {}
    for (const rol of roles.value) {
      try {
        const detail = await api.get(`/roles/${rol.id}`)
        permMap[rol.id] = detail.data.permission_ids || []
      } catch { permMap[rol.id] = [] }
    }
    rolePermMap.value = permMap
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al cargar datos: ' + e.message })
  } finally { loading.value = false }
}

const openDialog = (user = null) => {
  if (user) {
    editing.value = true
    editingId.value = user.id
    form.value = {
      ci: user.ci,
      nombres: user.nombres,
      apellido_paterno: user.apellido_paterno || '',
      apellido_materno: user.apellido_materno || '',
      email: user.email,
      password: '',
      sede_id: user.sede_id,
      jurisdiccion: user.jurisdiccion || [],
      rol_id: user.rol_id,
      application_ids: user.applications?.map(a => a.id) || [],
      activo: user.activo ?? true,
      direct_permission_ids: user.direct_permission_ids || []
    }
  } else {
    editing.value = false
    editingId.value = null
    form.value = {
      ci: '', nombres: '', apellido_paterno: '', apellido_materno: '',
      email: '', password: '', sede_id: null, jurisdiccion: [],
      rol_id: null, application_ids: [], activo: true,
      direct_permission_ids: []
    }
  }
  dialog.value = true
}

const saveUser = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/users/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Usuario actualizado' })
    } else {
      await api.post('/users', form.value)
      $q.notify({ type: 'positive', message: 'Usuario creado' })
    }
    dialog.value = false
    loadData()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al guardar' })
  } finally { saving.value = false }
}

const deleteUser = (user) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Eliminar a ${user.nombres} ${user.apellido_paterno || ''}?`,
    cancel: true, persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/users/${user.id}`)
      $q.notify({ type: 'positive', message: 'Usuario eliminado' })
      loadData()
    } catch {
      $q.notify({ type: 'negative', message: 'Error al eliminar' })
    }
  })
}

const resetPassword = (user) => {
  $q.dialog({
    title: '🔑 Restablecer Contraseña',
    message: `La contraseña de "${user.nombres}" se restablecerá a su número de CI: ${user.ci}`,
    cancel: { label: 'Cancelar', flat: true },
    ok: { label: 'Restablecer', color: 'orange' },
    persistent: true
  }).onOk(async () => {
    try {
      const res = await api.post(`/users/${user.id}/reset-password`)
      $q.notify({ type: 'positive', message: res.data.message, icon: 'lock_reset' })
    } catch {
      $q.notify({ type: 'negative', message: 'Error al restablecer contraseña' })
    }
  })
}

const toggleActivo = async (user, val) => {
  try {
    await api.put(`/users/${user.id}`, { activo: val })
    user.activo = val
    $q.notify({ type: 'positive', message: `${user.nombres} ${val ? 'habilitado' : 'deshabilitado'}`, position: 'top' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(loadData)
</script>
