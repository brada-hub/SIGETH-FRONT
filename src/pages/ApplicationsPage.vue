<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-lg">
      <h5 class="q-ma-none text-weight-bold">Gestionar Sistemas</h5>
      <q-space />
      <q-btn color="primary" icon="add" label="Nuevo Sistema" @click="openDialog()" />
    </div>

    <div class="row q-col-gutter-lg">
      <div v-for="app in applications" :key="app.id" class="col-12 col-md-6 col-lg-4">
        <q-card flat bordered class="q-hoverable">
          <q-card-section :class="`bg-${app.color || 'primary'} text-white`">
            <div class="row items-center">
              <q-icon :name="app.icono || 'apps'" size="40px" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold">{{ app.nombre }}</div>
                <div class="text-caption">{{ app.descripcion }}</div>
              </div>
            </div>
          </q-card-section>
          <q-card-section>
            <div class="text-caption text-grey-7">URL:</div>
            <div class="text-body2 q-mb-sm">{{ app.url }}</div>
            <q-badge :color="app.activo ? 'positive' : 'negative'">
              {{ app.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-card-section>
          <q-card-actions>
            <q-btn flat color="primary" icon="edit" label="Editar" @click="openDialog(app)" />
            <q-btn flat color="negative" icon="delete" label="Eliminar" @click="deleteApp(app)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ editing ? 'Editar' : 'Nuevo' }} Sistema</div>
        </q-card-section>
        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input v-model="form.nombre" label="Nombre" outlined dense />
          <q-input v-model="form.url" label="URL" outlined dense />
          <q-input v-model="form.icono" label="Ícono (Material Icon)" outlined dense />
          <q-select v-model="form.color" :options="colors" label="Color" outlined dense />
          <q-input v-model="form.descripcion" label="Descripción" outlined dense type="textarea" autogrow />
          <q-toggle v-model="form.activo" label="Activo" color="positive" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" :label="editing ? 'Actualizar' : 'Crear'" @click="saveApp" :loading="saving" />
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
const applications = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editing = ref(false)
const editingId = ref(null)
const colors = ['purple', 'teal', 'primary', 'deep-purple', 'indigo', 'blue', 'cyan', 'green', 'orange', 'red']

const form = ref({ nombre: '', url: '', icono: 'apps', color: 'primary', descripcion: '', activo: true })

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('/applications')
    applications.value = res.data.filter(app => app.nombre !== 'SSO')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al cargar: ' + e.message })
  } finally { loading.value = false }
}

const openDialog = (app = null) => {
  if (app) {
    editing.value = true
    editingId.value = app.id
    form.value = { ...app }
  } else {
    editing.value = false
    editingId.value = null
    form.value = { nombre: '', url: '', icono: 'apps', color: 'primary', descripcion: '', activo: true }
  }
  dialog.value = true
}

const saveApp = async () => {
  saving.value = true
  try {
    if (editing.value) {
      await api.put(`/applications/${editingId.value}`, form.value)
      $q.notify({ type: 'positive', message: 'Sistema actualizado' })
    } else {
      await api.post('/applications', form.value)
      $q.notify({ type: 'positive', message: 'Sistema creado' })
    }
    dialog.value = false
    loadData()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error' })
  } finally { saving.value = false }
}

const deleteApp = (app) => {
  $q.dialog({
    title: 'Confirmar', message: `¿Eliminar ${app.nombre}?`, cancel: true, persistent: true
  }).onOk(async () => {
    await api.delete(`/applications/${app.id}`)
    $q.notify({ type: 'positive', message: 'Eliminado' })
    loadData()
  })
}

onMounted(loadData)
</script>
