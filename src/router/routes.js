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

      // ─────────────── Employees ───────────────
      // Order matters: more-specific routes must come before /:id.
      {
        path: 'employees',
        name: 'employees-list',
        component: () => import('pages/employees/EmployeesListPage.vue'),
      },
      {
        path: 'employees/new',
        name: 'employees-new',
        component: () => import('pages/employees/EmployeeNewPage.vue'),
      },
      {
        path: 'employees/approvals',
        name: 'employees-approvals',
        component: () => import('pages/employees/EmployeeApprovalsPage.vue'),
      },
      {
        path: 'employees/:id/edit',
        name: 'employees-edit',
        component: () => import('pages/employees/EmployeeEditPage.vue'),
      },
      {
        path: 'employees/:id',
        name: 'employees-detail',
        component: () => import('pages/employees/EmployeeDetailPage.vue'),
      },

      // Catch-all under MainLayout → placeholder for not-yet-implemented sections.
      {
        path: ':section(.*)*',
        name: 'placeholder',
        component: () => import('pages/PlaceholderPage.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
