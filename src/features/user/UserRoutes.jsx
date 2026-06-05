import { Navigate, useLocation } from 'react-router-dom'
import OrderTable from '../../components/orders/OrderTable'
import { navItems } from './navigation'
import DepositView from './deposit/DepositView'
import OverviewView from './overview/OverviewView'
import ServicesView from './services/ServicesView'
import SettingsView from './settings/SettingsView'
import SupportView from './support/SupportView'

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
  onLoadTicket,
  onOpenServices,
  onPurchase,
  onRefreshDeposit,
  onRefreshTickets,
  onReopenTicket,
  onReorder,
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
  supportQuery,
  supportSelectedTicket,
  supportStatus,
  supportSubmitting,
  ticketForm,
  token,
}) {
  const location = useLocation()
  const activePath = normalizePathname(location.pathname)
  const mountedPaths = navItems.map((item) => item.path)
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
          onRefreshDeposit={onRefreshDeposit}
        />
      ),
    },
    {
      path: '/services',
      element: (
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
      path: '/orders',
      element: <OrderTable orders={orderList} onCancelOrder={onCancelOrder} onReorder={onReorder} />,
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
        />
      ),
    },
    {
      path: '/settings',
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

  if (!routes.some((route) => route.path === activePath)) {
    return <Navigate to="/" replace />
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

export default UserRoutes
