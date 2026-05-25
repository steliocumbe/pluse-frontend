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
    path: '/vigilante',
    redirect: '/vigilante/escala',
    children: [
      {
        path: 'escala',
        name: 'vigilante-schedule',
        component: () => import('pages/field/FieldMobileAppPage.vue'),
        props: { screen: 'schedule' },
      },
      {
        path: 'posto',
        name: 'vigilante-post',
        component: () => import('pages/field/FieldMobileAppPage.vue'),
        props: { screen: 'post' },
      },
      {
        path: 'check-in',
        name: 'vigilante-check-in',
        component: () => import('pages/field/FieldMobileAppPage.vue'),
        props: { screen: 'check-in' },
      },
      {
        path: 'resultado',
        name: 'vigilante-result',
        component: () => import('pages/field/FieldMobileAppPage.vue'),
        props: { screen: 'result' },
      },
      {
        path: 'offline',
        name: 'vigilante-offline',
        component: () => import('pages/field/FieldMobileAppPage.vue'),
        props: { screen: 'offline' },
      },
      {
        path: 'ocorrencia',
        name: 'vigilante-incident',
        component: () => import('pages/field/FieldMobileAppPage.vue'),
        props: { screen: 'incident' },
      },
    ],
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/IndexPage.vue') },

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
        component: () => import('pages/hr/HrApprovalsPage.vue'),
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

      {
        path: 'employment-contracts',
        name: 'employment-contracts-list',
        component: () => import('pages/employment/ContractsListPage.vue'),
      },
      {
        path: 'employment-contracts/new',
        name: 'employment-contracts-new',
        component: () => import('pages/employment/ContractFormPage.vue'),
      },
      {
        path: 'employment-contracts/:id/edit',
        name: 'employment-contracts-edit',
        component: () => import('pages/employment/ContractFormPage.vue'),
      },
      {
        path: 'employment-contracts/:id',
        name: 'employment-contracts-detail',
        component: () => import('pages/employment/ContractDetailPage.vue'),
      },

      {
        path: 'clients',
        name: 'clients-list',
        component: () => import('pages/clients/ClientsListPage.vue'),
      },
      {
        path: 'clients/new',
        name: 'clients-new',
        component: () => import('pages/clients/ClientFormPage.vue'),
      },
      {
        path: 'clients/:id/edit',
        name: 'clients-edit',
        component: () => import('pages/clients/ClientFormPage.vue'),
      },
      {
        path: 'clients/:id',
        name: 'clients-detail',
        component: () => import('pages/clients/ClientDetailPage.vue'),
      },
      {
        path: 'contracts/new',
        name: 'contracts-new',
        component: () => import('pages/contracts/ContractNewPage.vue'),
      },
      {
        path: 'contracts/:view(active|pending|expiring)?',
        name: 'contracts-list',
        component: () => import('pages/contracts/ContractsPage.vue'),
      },
      {
        path: 'posts/new',
        name: 'posts-new',
        component: () => import('pages/posts/PostFormPage.vue'),
      },
      {
        path: 'posts/map',
        name: 'posts-map',
        component: () => import('pages/posts/PostsMapPage.vue'),
      },
      {
        path: 'posts/:id/edit',
        name: 'posts-edit',
        component: () => import('pages/posts/PostFormPage.vue'),
      },
      {
        path: 'posts/:id',
        name: 'posts-detail',
        component: () => import('pages/posts/PostDetailPage.vue'),
      },
      {
        path: 'posts',
        name: 'posts-list',
        component: () => import('pages/posts/PostsListPage.vue'),
      },

      {
        path: 'schedules',
        name: 'schedules-calendar',
        component: () => import('pages/scheduling/SchedulesPage.vue'),
      },
      {
        path: 'attendance',
        name: 'attendance-marking',
        component: () => import('pages/scheduling/AttendanceMarkingPage.vue'),
      },
      {
        path: 'attendance-map',
        name: 'attendance-map',
        component: () => import('pages/scheduling/AttendanceMapPage.vue'),
      },

      {
        path: 'leaves',
        name: 'leave-requests',
        component: () => import('pages/leaves/LeaveRequestsPage.vue'),
        props: { defaultType: 'vacation' },
      },
      {
        path: 'sick-leaves',
        name: 'sick-leaves',
        component: () => import('pages/leaves/LeaveRequestsPage.vue'),
        props: { defaultType: 'sick_leave' },
      },
      {
        path: 'absences',
        name: 'absences',
        component: () => import('pages/leaves/AbsencesPage.vue'),
      },
      {
        path: 'schedules/by-post',
        name: 'schedules-by-post',
        component: () => import('pages/operations/SchedulesByPostPage.vue'),
      },
      {
        path: 'schedules/by-employee',
        name: 'schedules-by-employee',
        component: () => import('pages/operations/SchedulesByEmployeePage.vue'),
      },

      {
        path: 'attendances/ongoing',
        name: 'attendances-ongoing',
        component: () => import('pages/operations/AttendancesOngoingPage.vue'),
      },
      {
        path: 'attendances/today',
        name: 'attendances-today',
        component: () => import('pages/operations/AttendancesTodayPage.vue'),
      },
      {
        path: 'attendances/late',
        name: 'attendances-late',
        component: () => import('pages/operations/AttendancesLatePage.vue'),
      },
      {
        path: 'attendances/missing-checkout',
        name: 'attendances-missing-checkout',
        component: () => import('pages/operations/AttendancesMissingCheckoutPage.vue'),
      },

      {
        path: 'cco',
        name: 'cco',
        component: () => import('pages/operations/CcoPage.vue'),
      },
      {
        path: 'cco/presences',
        name: 'cco-presences',
        component: () => import('pages/operations/CcoPresencesPage.vue'),
      },
      {
        path: 'cco/coverage',
        name: 'cco-coverage',
        component: () => import('pages/operations/CcoCoveragePage.vue'),
      },
      {
        path: 'cco/delays',
        name: 'cco-delays',
        component: () => import('pages/operations/CcoDelaysPage.vue'),
      },
      {
        path: 'cco/out-of-radius',
        name: 'cco-out-of-radius',
        component: () => import('pages/operations/CcoOutOfRadiusPage.vue'),
      },
      {
        path: 'cco/incidents',
        name: 'cco-incidents',
        component: () => import('pages/operations/CcoIncidentsPage.vue'),
      },

      {
        path: 'field/schedule',
        name: 'field-schedule',
        component: () => import('pages/field/FieldSchedulePage.vue'),
      },
      {
        path: 'field/post',
        name: 'field-post',
        component: () => import('pages/field/FieldPostDetailPage.vue'),
      },
      {
        path: 'field/check-in',
        name: 'field-check-in',
        component: () => import('pages/field/FieldCheckInPage.vue'),
      },
      {
        path: 'field/check-in/result',
        name: 'field-check-in-result',
        component: () => import('pages/field/FieldCheckInResultPage.vue'),
      },
      {
        path: 'field/offline',
        name: 'field-offline',
        component: () => import('pages/field/FieldOfflinePage.vue'),
      },
      {
        path: 'field/incidents/new',
        name: 'field-incident-new',
        component: () => import('pages/field/FieldIncidentNewPage.vue'),
      },

      {
        path: 'supervisor/team',
        name: 'supervisor-team',
        component: () => import('pages/supervisor/SupervisorTeamPage.vue'),
      },
      {
        path: 'supervisor/patrols',
        name: 'supervisor-patrols',
        component: () => import('pages/supervisor/SupervisorPatrolsPage.vue'),
      },
      {
        path: 'supervisor/incidents/validation',
        name: 'supervisor-incident-validation',
        component: () => import('pages/supervisor/SupervisorIncidentValidationPage.vue'),
      },
      {
        path: 'supervisor/attendance-confirmation',
        name: 'supervisor-attendance-confirmation',
        component: () => import('pages/supervisor/SupervisorAttendanceConfirmationPage.vue'),
      },
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
