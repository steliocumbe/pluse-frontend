const routes = [
  // Página de bloqueio por licença — standalone, sem layout, sem auth.
  {
    path: '/locked',
    name: 'locked',
    component: () => import('pages/locked/LockedPage.vue'),
  },

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
    component: () => import('layouts/VigilanteLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/vigilante/escala',
    children: [
      {
        path: 'escala',
        name: 'vigilante-schedule',
        component: () => import('pages/field/VigilanteSchedulePage.vue'),
      },
      {
        path: 'posto',
        name: 'vigilante-post',
        component: () => import('pages/field/VigilantePostPage.vue'),
      },
      {
        path: 'check-in',
        name: 'vigilante-check-in',
        component: () => import('pages/field/VigilanteCheckInPage.vue'),
      },
      {
        path: 'resultado',
        name: 'vigilante-result',
        component: () => import('pages/field/VigilanteResultPage.vue'),
      },
      {
        path: 'offline',
        name: 'vigilante-offline',
        component: () => import('pages/field/VigilanteOfflinePage.vue'),
      },
      {
        path: 'ocorrencia',
        name: 'vigilante-incident',
        component: () => import('pages/field/VigilanteIncidentPage.vue'),
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
        path: 'profile',
        name: 'profile',
        component: () => import('pages/profile/ProfilePage.vue'),
      },
      {
        path: 'admin/license',
        name: 'license-admin',
        component: () => import('pages/admin/LicensePage.vue'),
      },

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
        path: 'clients/wizard',
        name: 'clients-wizard',
        component: () => import('pages/clients/ClientWizardPage.vue'),
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
        path: 'client-contracts',
        name: 'client-contracts-list',
        component: () => import('pages/clients/ClientContractsListPage.vue'),
      },
      {
        path: 'client-contracts/new',
        name: 'client-contracts-new',
        component: () => import('pages/clients/ClientContractFormPage.vue'),
      },
      {
        path: 'client-contracts/:id/edit',
        name: 'client-contracts-edit',
        component: () => import('pages/clients/ClientContractFormPage.vue'),
      },
      {
        path: 'client-contracts/:id',
        name: 'client-contracts-detail',
        component: () => import('pages/clients/ClientContractDetailPage.vue'),
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
        path: 'payroll/categories',
        name: 'salary-categories',
        component: () => import('pages/payroll/SalaryCategoriesPage.vue'),
      },
      {
        path: 'payroll',
        name: 'payroll-runs-list',
        component: () => import('pages/payroll/PayrollRunsListPage.vue'),
      },
      {
        path: 'payroll/:id',
        name: 'payroll-run-detail',
        component: () => import('pages/payroll/PayrollRunDetailPage.vue'),
      },

      {
        path: 'training',
        name: 'training-records',
        component: () => import('pages/training/TrainingRecordsPage.vue'),
      },
      {
        path: 'certifications',
        name: 'certifications',
        component: () => import('pages/training/CertificationsPage.vue'),
      },
      {
        path: 'performance',
        name: 'performance-reviews',
        component: () => import('pages/performance/PerformanceReviewsPage.vue'),
      },
      {
        path: 'hr-alerts',
        name: 'hr-alerts',
        component: () => import('pages/hr/HrAlertsPage.vue'),
      },

      {
        path: 'incidents',
        name: 'incidents',
        component: () => import('pages/operations/IncidentsPage.vue'),
      },
      {
        path: 'participations',
        name: 'participations',
        component: () => import('pages/operations/ParticipationsPage.vue'),
      },

      {
        path: 'assets/vehicles',
        name: 'assets-vehicles',
        component: () => import('pages/assets/VehiclesPage.vue'),
      },
      {
        path: 'assets/equipment',
        name: 'assets-equipment',
        component: () => import('pages/assets/EquipmentPage.vue'),
      },
      {
        path: 'assets/assignments',
        name: 'assets-assignments',
        component: () => import('pages/assets/AssignmentsPage.vue'),
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
        component: () => import('pages/operations/CcoLivePage.vue'),
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
        path: ':catchAll(.*)*',
        name: 'not-found',
        component: () => import('pages/ErrorNotFound.vue'),
      },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
