import { Navigate, useLocation } from 'react-router-dom'
import OrderTable from '../../components/orders/OrderTable'
import { navItems } from './navigation'
import DepositView from './deposit/DepositView'
import OverviewView from './overview/OverviewView'
import ServicesView from './services/ServicesView'
import UserServiceDetail from './services/components/UserServiceDetail'
import SettingsView from './settings/SettingsView'
import SupportView from './support/SupportView'
import WarrantyView from './warranty/WarrantyView'
import LockerView from './locker/LockerView'
import './user.css'
import './deposit/deposit.css'
import './overview/overview.css'
import './services/services.css'
import './support/support.css'
import './locker/locker.css'

function normalizePathname(pathname) {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

function UserRoutes({
  activeDeposit,
  amountNumber,
  apiDeposits,
  apiTickets,
  apiWalletTransactions,
  copied,
  currentUser,
  depositAmount,
  detailOrderLoading,
  favoriteServices,
  metrics,
  onAmountChange,
  onCancelDeposit,
  onCancelOrder,
  onCloseTicket,
  onCopy,
  onCreateDeposit,
  onCreateTicket,
  onCurrentUserChange,
  onDeleteAttachment,
  onFileChange,
  onFiltersChange,
  onLoadTicket,
  onLoadOrder,
  onOpenServices,
  onPurchase,
  onReorder,
  onRefreshDeposit,
  onRefreshTickets,
  onReopenTicket,
  onSearchChange,
  onSendMessage,
  onSetMessage,
  onSetNotice,
  onSetSettingsError,
  onStatusChange,
  onTicketFormChange,
  onToggleFavorite,
  onUploadAttachment,
  onViewChange,
  orderList,
  recentServices,
  serviceList,
  supportAttachments,
  supportFile,
  supportLoading,
  supportMessage,
  supportPage,
  supportQuery,
  supportSelectedTicket,
  supportStatus,
  supportSubmitting,
  supportTotalPages,
  ticketForm,
  token,
}) {
  const location = useLocation()
  const activePath = normalizePathname(location.pathname)
  const mountedPaths = [...navItems.map((item) => item.path), '/profile']

  const isServiceDetail = activePath.startsWith('/services/') && activePath.length > '/services/'.length
  const serviceSlug = isServiceDetail ? decodeURIComponent(activePath.slice('/services/'.length)) : null
  const matchedService = serviceSlug
    ? (serviceList || []).find((s) => s.slug === serviceSlug || String(s.id) === serviceSlug || s.name === serviceSlug)
    : null

  const routes = [
    {
      path: '/',
      element: (
        <OverviewView
          favoriteServices={favoriteServices}
          metrics={metrics}
          onOpenServices={onOpenServices}
          onPurchase={onPurchase}
          onViewChange={onViewChange}
          orders={orderList}
          recentServices={recentServices}
          services={serviceList}
          transactions={apiWalletTransactions}
        />
      ),
    },
    {
      path: '/deposit',
      element: (
        <DepositView
          activeDeposit={activeDeposit}
          amountNumber={amountNumber}
          copied={copied}
          depositAmount={depositAmount}
          deposits={apiDeposits}
          onAmountChange={onAmountChange}
          onCancelDeposit={onCancelDeposit}
          onCopy={onCopy}
          onCreateDeposit={onCreateDeposit}
          onFiltersChange={onFiltersChange}
          onRefreshDeposit={onRefreshDeposit}
        />
      ),
    },
    {
      path: '/services',
      element: isServiceDetail ? (
        <UserServiceDetail
          isFavorite={matchedService ? (favoriteServices || []).some((f) => f.id === matchedService.id) : false}
          onPurchase={onPurchase}
          onToggleFavorite={onToggleFavorite}
          service={matchedService}
        />
      ) : (
        <ServicesView
          favoriteServices={favoriteServices}
          onPurchase={onPurchase}
          onToggleFavorite={onToggleFavorite}
          recentServices={recentServices}
          services={serviceList}
        />
      ),
    },
    {
      path: '/locker',
      element: (
        <LockerView
          onSetNotice={onSetNotice}
          token={token}
        />
      ),
    },
    {
      path: '/orders',
      element: (
        <OrderTable
          currentUser={currentUser}
          detailLoading={detailOrderLoading}
          onCancelOrder={onCancelOrder}
          onLoadOrder={onLoadOrder}
          onReorder={onReorder}
          onSetNotice={onSetNotice}
          orders={orderList}
          token={token}
        />
      ),
    },
    {
      path: '/support',
      element: (
        <SupportView
          attachments={supportAttachments}
          file={supportFile}
          loading={supportLoading}
          message={supportMessage}
          onCloseTicket={onCloseTicket}
          onCreateTicket={onCreateTicket}
          onDeleteAttachment={onDeleteAttachment}
          onFileChange={onFileChange}
          onLoadTicket={onLoadTicket}
          onPageChange={(page) => onRefreshTickets(page - 1)}
          onRefresh={onRefreshTickets}
          onReopenTicket={onReopenTicket}
          onSearchChange={onSearchChange}
          onSendMessage={onSendMessage}
          onSetMessage={onSetMessage}
          onStatusChange={onStatusChange}
          onTicketFormChange={onTicketFormChange}
          onUploadAttachment={onUploadAttachment}
          query={supportQuery}
          selectedTicket={supportSelectedTicket}
          statusFilter={supportStatus}
          submitting={supportSubmitting}
          ticketForm={ticketForm}
          tickets={apiTickets}
          totalPages={supportTotalPages}
          currentPage={supportPage + 1}
          token={token}
        />
      ),
    },
    {
      path: '/warranty',
      element: (
        <WarrantyView
          onSetNotice={onSetNotice}
          token={token}
        />
      ),
    },
    {
      path: '/profile',
      element: (
        <SettingsView
          currentUser={currentUser}
          onCurrentUserChange={onCurrentUserChange}
          onSetError={onSetSettingsError}
          onSetNotice={onSetNotice}
          token={token}
        />
      ),
    },
  ]

  if (activePath === '/overview') {
    return <Navigate to="/" replace />
  }

  if (activePath === '/settings') {
    return <Navigate to="/profile" replace />
  }

  if (!routes.some((route) => route.path === activePath || (route.path === '/services' && isServiceDetail))) {
    return <Navigate to="/" replace />
  }

  const isActive = (routePath) => routePath === activePath || (routePath === '/services' && isServiceDetail)

  return (
    <div className="user-route-stack">
      {routes.map((route) => (
        mountedPaths.includes(route.path) && (
          <div
            className={`user-route-panel ${isActive(route.path) ? 'active' : 'inactive'}`}
            key={route.path}
            aria-hidden={!isActive(route.path)}
          >
            {route.element}
          </div>
        )
      ))}
    </div>
  )
}

export default UserRoutes
