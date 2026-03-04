<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <div>
        <h5 class="q-ma-none text-weight-bold">Gestión de Sedes</h5>
        <div class="text-grey-7 text-caption">Administra las ubicaciones y campus universitarios</div>
      </div>
      <q-space />
      <q-btn color="primary" icon="add" label="Nueva Sede" @click="openDialog()" />
    </div>

    <q-table
      :rows="sedes"
      :columns="columns"
      row-key="id"
      :loading="loading"
      flat bordered
      :filter="search"
    >
      <template v-slot:top-right>
        <q-input v-model="search" outlined dense placeholder="Buscar..." class="q-ml-md">
          <template v-slot:append><q-icon name="search" /></template>
        </q-input>
      </template>
      <template v-slot:body-cell-departamento="props">
        <q-td :props="props">
          <q-badge v-if="props.row.departamento" :color="getDeptColor(props.row.departamento)" outline>
            {{ props.row.departamento }}
          </q-badge>
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
          <q-btn flat round dense icon="edit" color="primary" @click="openDialog(props.row)" />
          <q-btn flat round dense icon="delete" color="negative" @click="deleteSede(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="apartment" class="q-mr-sm" />
            {{ editing ? 'Editar' : 'Nueva' }} Sede
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input v-model="form.nombre" label="Nombre de la Sede" outlined dense />
          <q-input v-model="form.sigla" label="Sigla (ej: LPZ, COC, SCZ)" outlined dense maxlength="10" />
          <q-select
            v-model="form.departamento"
            :options="departamentos"
            label="Departamento / Ubicación"
            outlined dense
          />
          <q-input v-model="form.direccion" label="Dirección (opcional)" outlined dense />
          <q-input v-model="form.ciudad" label="Ciudad (opcional)" outlined dense />
          <q-toggle v-model="form.activo" label="Sede Activa" color="positive" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" :label="editing ? 'Actualizar' : 'Crear'" @click="saveSede" :loading="saving" />
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
const sedes = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editingId = ref(null)
const search = ref('')

const departamentos = [
  'LA PAZ', 'COCHABAMBA', 'SANTA CRUZ', 'ORURO',
  'POTOSI', 'SUCRE', 'TARIJA', 'BENI', 'PANDO', 'NACIONAL'
]

const deptColors = {
  'LA PAZ': 'blue', 'COCHABAMBA': 'purple', 'SANTA CRUZ': 'green',
  'BENI': 'orange', 'PANDO': 'red', 'NACIONAL': 'teal',
  'ORURO': 'amber', 'POTOSI': 'brown', 'SUCRE': 'indigo', 'TARIJA': 'cyan'
}

const getDeptColor = (dept) => deptColors[dept] || 'grey'

const form = ref({ nombre: '', sigla: '', departamento: '', direccion: '', ciudad: '', activo: true })

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', sortable: true, align: 'left' },
  { name: 'sigla', label: 'Sigla', field: 'sigla', align: 'left' },
  { name: 'departamento', label: 'Departamento / Ubicación', field: 'departamento', align: 'left' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/sedes')
    sedes.value = res.data
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error: ' + e.message })
  } finally { loading.value = false }
}

const openDialog = (sede = null) => {
  if (sede) {
    editing.value = true
    editingId.value = sede.id
    form.value = {
      nombre: sede.nombre, sigla: sede.sigla || '',
      departamento: sede.departamento || '', direccion: sede.direccion || '',
      ciudad: sede.ciudad || '', activo: sede.activo ?? true
    }
  } else {
    editing.value = false
    editingId.value = null
    form.value = { nombre: '', sigla: '', departamento: '', direccion: '', ciudad: '', activo: true }
  }
  dialog.value = true
}

const saveSede = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/sedes/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Sede actualizada' })
    } else {
      await api.post('/sedes', form.value)
      $q.notify({ type: 'positive', message: 'Sede creada' })
    }
    dialog.value = false
    loadData()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error' })
  } finally { saving.value = false }
}

const deleteSede = (sede) => {
  $q.dialog({
    title: 'Confirmar', message: `¿Eliminar ${sede.nombre}?`, cancel: true, persistent: true
  }).onOk(async () => {
    await api.delete(`/sedes/${sede.id}`)
    $q.notify({ type: 'positive', message: 'Eliminada' })
    loadData()
  })
}

const toggleActivo = async (sede, val) => {
  try {
    await api.put(`/sedes/${sede.id}`, { ...sede, activo: val })
    sede.activo = val
    $q.notify({ type: 'positive', message: `${sede.nombre} ${val ? 'activada' : 'desactivada'}`, position: 'top' })
  } catch {
    $q.notify({ type: 'negative', message: 'Error al cambiar estado' })
  }
}

onMounted(loadData)
</script>
