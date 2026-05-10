const routes = [
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      { path: '', redirect: { name: 'login' } },
      { path: 'login', name: 'login', component: () => import('pages/auth/LoginPage.vue') },
    ],
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/IndexPage.vue') },
      // Catch-all under MainLayout → renders the placeholder page so menu items
      // pointing to not-yet-implemented sections still navigate cleanly.
      // Concrete routes added later (e.g. /colaboradores/vigilantes) take
      // precedence because they're defined before this entry.
      {
        path: ':section(.*)*',
        name: 'placeholder',
        component: () => import('pages/PlaceholderPage.vue'),
      },
    ],
  },

  // Last-resort catch-all (only matches when not authenticated, since
  // anything authenticated falls into MainLayout's catch-all above).
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
