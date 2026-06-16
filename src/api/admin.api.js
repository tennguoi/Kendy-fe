import { adminAccessApi } from './admin/access.api';
import { adminAuditApi } from './admin/audit.api';
import { adminCouponsApi } from './admin/coupons.api';
import { adminDashboardApi } from './admin/dashboard.api';
import { adminFilesApi } from './admin/files.api';
import { adminFinanceApi } from './admin/finance.api';
import { adminNotificationsApi } from './admin/notifications.api';
import { adminOrdersApi } from './admin/orders.api';
import { adminServicesApi } from './admin/services.api';
import { adminSettingsApi } from './admin/settings.api';
import { adminSystemApi } from './admin/system.api';
import { adminTicketsApi } from './admin/tickets.api';
import { adminUsersApi } from './admin/users.api';
import { adminWarrantyApi } from './admin/warranty.api';

export const adminApi = {
  ...adminServicesApi,
  ...adminCouponsApi,
  ...adminSettingsApi,
  ...adminNotificationsApi,
  ...adminAccessApi,
  ...adminSystemApi,
  ...adminDashboardApi,
  ...adminUsersApi,
  ...adminAuditApi,
  ...adminOrdersApi,
  ...adminFinanceApi,
  ...adminTicketsApi,
  ...adminFilesApi,
  ...adminWarrantyApi,
};
