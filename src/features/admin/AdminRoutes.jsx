import { Navigate, useLocation } from 'react-router-dom'
import AdminFinanceView from './AdminFinanceView'
import AdminOrdersView from './AdminOrdersView'
import AdminOverviewView from './AdminOverviewView'
import AdminPricingView from './AdminPricingView'
import AdminServicesView from './AdminServicesView'
import AdminSettingsView from './AdminSettingsView'
import AdminTicketsView from './AdminTicketsView'
import AdminUsersView from './AdminUsersView'

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function AdminRoutes({
  categories,
  currentUser,
  dashboard,
  onSetError,
  onSetNotice,
  onCurrentUserChange,
  mountedPaths,
  pricingItems,
  revenue,
  services,
  token,
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
          pricingItems={pricingItems}
          revenue={revenue}
          services={services}
        />
      ),
    },
    { path: '/admin/users', element: <AdminUsersView {...sharedProps} /> },
    { path: '/admin/orders', element: <AdminOrdersView {...sharedProps} /> },
    { path: '/admin/finance', element: <AdminFinanceView {...sharedProps} /> },
    { path: '/admin/tickets', element: <AdminTicketsView {...sharedProps} /> },
    { path: '/admin/services', element: <AdminServicesView {...sharedProps} /> },
    { path: '/admin/pricing', element: <AdminPricingView {...sharedProps} /> },
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
          <div hidden={route.path !== activePath} key={route.path}>
            {route.element}
          </div>
        )
      ))}
    </>
  )
}

export default AdminRoutes
