const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'users', component: () => import('pages/UsersPage.vue'), meta: { permissions: ['usuarios', 'all'] } },
      { path: 'applications', component: () => import('pages/ApplicationsPage.vue'), meta: { permissions: ['sistemas', 'all'] } },
      { path: 'sedes', component: () => import('pages/SedesPage.vue'), meta: { permissions: ['sedes', 'all'] } },
      { path: 'roles', component: () => import('pages/RolesPage.vue'), meta: { permissions: ['roles', 'all'] } },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue')
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
