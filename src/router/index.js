import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('sso_token')
    const userStr = localStorage.getItem('sso_user')

    if (to.path !== '/login' && (!token || !userStr)) {
      return next('/login')
    }

    if (to.meta.permissions && userStr) {
      try {
        const user = JSON.parse(userStr)
        const userPerms = user.permisos || []

        // Check if user has context 'all'
        if (userPerms.includes('all')) {
          return next()
        }

        const hasPermission = to.meta.permissions.some(p => userPerms.includes(p))
        if (!hasPermission) {
          return next('/') // Redirect to dashboard if no permission
        }
      } catch {
        return next('/login')
      }
    }

    next()
  })

  return Router
})
