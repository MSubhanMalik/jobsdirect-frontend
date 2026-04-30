export const api = {
  endpoints: {
    // Auth
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    USER_INFO: "/api/auth/user-info",
    GOOGLE_AUTH: "/api/auth/google",
    VERIFY_EMAIL: "/api/auth/verify-email",
    RESEND_VERIFICATION: "/api/auth/resend-verification",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",

    // Jobs
    JOBS: "/api/jobs",
    JOB_DETAIL: "/api/jobs/:id",
    JOB_DUPLICATE: "/api/jobs/:id/duplicate",
    JOB_COST_ESTIMATE: "/api/jobs/cost-estimate",
    JOB_SCRAPE_JOBSIRELAND: "/api/jobs/scrape/jobsireland",

    // Employers
    EMPLOYERS: "/api/employers",
    EMPLOYER_DETAIL: "/api/employers/:id",

    // Employees
    EMPLOYEES: "/api/employees",
    EMPLOYEE_DETAIL: "/api/employees/:id",

    // Applications
    APPLICATIONS: "/api/applications",
    APPLICATION_DETAIL: "/api/applications/:id",

    // Payments
    PAYMENTS: "/api/payments",
    PAYMENT_PLANS: "/api/payments/plans",
    PAYMENT_CHECKOUT: "/api/payments/checkout",
    PAYMENT_SYNC_SESSION: "/api/payments/sync-session",
    PAYMENT_PORTAL: "/api/payments/portal",
    PAYMENT_PRICING: "/api/payments/pricing",
    PAYMENT_BALANCE: "/api/payments/balance",

    // Settings
    SITE_SETTINGS: "/api/settings/site",
    PAGES: "/api/settings/pages",
    PAGE_DETAIL: "/api/settings/pages/:slug",

    // Admin
    ADMIN_USERS: "/api/admin/users",
    ADMIN_USER_DETAIL: "/api/admin/users/:id",

    // Products
    PRODUCTS: "/api/products",
    PRODUCTS_ADDONS: "/api/products/addons",
    PRODUCTS_COST_ESTIMATE: "/api/products/cost-estimate",

    // Contact
    CONTACT: "/api/contact",
  },
};
