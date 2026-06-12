import { userAccountApi } from './user/account.api';
import { userCheckoutApi } from './user/checkout.api';
import { userDepositsApi } from './user/deposits.api';
import { userNotificationsApi } from './user/notifications.api';
import { userOrdersApi } from './user/orders.api';
import { userSecurityApi } from './user/security.api';
import { userServicesApi } from './user/services.api';
import { userTicketsApi } from './user/tickets.api';
import { userWalletApi } from './user/wallet.api';

export const userApi = {
  ...userAccountApi,
  ...userCheckoutApi,
  ...userSecurityApi,
  ...userWalletApi,
  ...userOrdersApi,
  ...userDepositsApi,
  ...userTicketsApi,
  ...userNotificationsApi,
  ...userServicesApi,
};
