import { Navigate, useLocation } from 'react-router-dom'
import AdminCouponsView from './coupons/AdminCouponsView'
import AdminContentView from './content/AdminContentView'
import AdminFinanceView from './finance/AdminFinanceView'
import AdminOrdersView from './orders/AdminOrdersView'
import AdminOverviewView from './overview/AdminOverviewView'
import AdminPricingView from './pricing/AdminPricingView'
import AdminServicesView from './services/AdminServicesView'
import AdminSettingsView from './settings/AdminSettingsView'
import AdminTicketsView from './tickets/AdminTicketsView'
import AdminUsersView from './users/AdminUsersView'
import AdminWarrantyView from './warranty/AdminWarrantyView'
import AdminAssignedAccountsView from './assigned-accounts/AdminAssignedAccountsView'
import AdminAccountInventoryView from './account-inventory/AdminAccountInventoryView'
import AdminEntitlementsView from './entitlements/AdminEntitlementsView'
import SettingsView from '../user/settings/SettingsView'
import './admin.css'
import './finance/finance.css'
import './overview/overview.css'
import './pricing/pricing.css'
import './services/services.css'
import './settings/settings.css'
import './tickets/tickets.css'
import './users/users.css'
import './warranty/warranty.css'
import './assigned-accounts/assigned-accounts.css'
import './account-inventory/account-inventory.css'
import './entitlements/entitlements.css'
import './orders/orders.css'

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function AdminRoutes({
  categories,
  currentUser,
  dashboard,
  dashboardSummary,
  auditLogs,
  bankTransactions,
  health,
  onSetError,
  onSetNotice,
  onCurrentUserChange,
  mountedPaths,
  pricingItems,
  revenue,
  revenueChart,
  servicePerformance,
  services,
  token,
  userActivity,
}) {
  const location = useLocation()
  const activePath = normalizePathname(location.pathname)
  const sharedProps = { onSetError, onSetNotice, token }
  const routes = [
    {
      path: '/admin',
      element: (
        <AdminOverviewView
          categories={categories}
          dashboard={dashboard}
          dashboardSummary={dashboardSummary}
          auditLogs={auditLogs}
          bankTransactions={bankTransactions}
          health={health}
          pricingItems={pricingItems}
          revenue={revenue}
          revenueChart={revenueChart}
          servicePerformance={servicePerformance}
          services={services}
          userActivity={userActivity}
        />
      ),
    },
    { path: '/admin/users', element: <AdminUsersView {...sharedProps} /> },
    { path: '/admin/orders', element: <AdminOrdersView {...sharedProps} currentUser={currentUser} /> },
    { path: '/admin/finance', element: <AdminFinanceView {...sharedProps} /> },
    { path: '/admin/tickets', element: <AdminTicketsView {...sharedProps} /> },
    { path: '/admin/services', element: <AdminServicesView {...sharedProps} /> },
    { path: '/admin/account-inventory', element: <AdminAccountInventoryView {...sharedProps} /> },
    { path: '/admin/assigned-accounts', element: <AdminAssignedAccountsView {...sharedProps} /> },
    { path: '/admin/entitlements', element: <AdminEntitlementsView {...sharedProps} /> },
    { path: '/admin/pricing', element: <AdminPricingView {...sharedProps} /> },
    { path: '/admin/coupons', element: <AdminCouponsView {...sharedProps} /> },
    { path: '/admin/warranty', element: <AdminWarrantyView {...sharedProps} /> },
    { path: '/admin/content', element: <AdminContentView {...sharedProps} /> },
    {
      path: '/admin/settings',
      element: (
        <AdminSettingsView
          {...sharedProps}
          currentUser={currentUser}
          onCurrentUserChange={onCurrentUserChange}
        />
      ),
    },
    {
      path: '/admin/profile',
      element: (
        <SettingsView
          {...sharedProps}
          currentUser={currentUser}
          onCurrentUserChange={onCurrentUserChange}
        />
      ),
    },
  ]
  const activeRoute = routes.find((route) => route.path === activePath)

  if (activePath === '/admin/overview') {
    return <Navigate to="/admin" replace />
  }

  if (!activeRoute) {
    return <Navigate to="/admin" replace />
  }

  return (
    <>
      {routes.map((route) => (
        mountedPaths.includes(route.path) && (
          <div
            key={route.path}
            style={route.path === activePath ? undefined : { display: 'none' }}
            aria-hidden={route.path !== activePath}
          >
            {route.element}
          </div>
        )
      ))}
    </>
  )
}

export default AdminRoutes
