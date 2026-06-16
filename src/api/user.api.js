import { userAccountApi } from './user/account.api';
import { userCheckoutApi } from './user/checkout.api';
import { userCouponsApi } from './user/coupons.api';
import { userDepositsApi } from './user/deposits.api';
import { userNotificationsApi } from './user/notifications.api';
import { userOrdersApi } from './user/orders.api';
import { userSecurityApi } from './user/security.api';
import { userServicesApi } from './user/services.api';
import { userTicketsApi } from './user/tickets.api';
import { userWalletApi } from './user/wallet.api';
import { userWarrantyApi } from './user/warranty.api';

export const userApi = {
  ...userAccountApi,
  ...userCheckoutApi,
  ...userCouponsApi,
  ...userSecurityApi,
  ...userWalletApi,
  ...userOrdersApi,
  ...userDepositsApi,
  ...userTicketsApi,
  ...userNotificationsApi,
  ...userServicesApi,
  ...userWarrantyApi,
};
