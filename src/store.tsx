import { configureStore } from "@reduxjs/toolkit";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";
import servicesReducer from "./slices/servicesSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import allOrderReducer from "./slices/allOrderSlice";
import shopperRequestReducer from "./slices/shopperRequestSlice";
import shipperOffersReducer from "./slices/shipperOffersSlice";
import shipperNewOffersReducer from "./slices/shipperNewOffersSlice";
import shopperPaymentReducer from "./slices/shopperPaymentSlice";
import shipperPaymentReducer from "./slices/shipperPaymentSlice";
import orderStatusReducer from "./slices/orderStatusSlice";
import getMessagesReduce from "./slices/getMessagesSlice";
import getAdminMessagesReduce from "./slices/getAdminMessagesSlice";
import allPaymentReducer from "./slices/allPaymentSlice";
import notificationReducer from "./slices/notificationSlice";
import messageNotificationReducer from "./slices/messgeNotificationSlice";
import shippingTypeReducer from "./slices/shippingTypeSlice";
import paymentSettingReducer from "./slices/paymentSettingSlice";
import paymentPlanReducer from "./slices/getPaymentSettingForRolesSlice";
import countriesReducer from "./slices/countriesSlice"
import statesReducer from "./slices/statesSlice"
import citiesReducer from "./slices/citiesSlice"
import chatContactsReducer from "./slices/chatContactsSlice"
import messagesReducer from "./slices/messagesSlice"
import latestChatsReducer from "./slices/latestChatsSlice"
import shopperChatContactsReducer from "./slices/shopper/shopperChatContactsSlice"
import getBlogsReducer from "./slices/admin/getBlogsSlice"

export const store = configureStore({
  reducer: {
    //admin
    roles: roleReducer,
    blogs: getBlogsReducer,
    permissions: permissionReducer,
    services: servicesReducer,
    products: productReducer,
    order: orderReducer,
    allOrder: allOrderReducer,
    shopperRequest: shopperRequestReducer,
    shipperOffers: shipperOffersReducer,
    shipperNewOffers: shipperNewOffersReducer,
    shopperPayments: shopperPaymentReducer,
    shipperPayments: shipperPaymentReducer,
    orderStatus: orderStatusReducer,
    getMessages: getMessagesReduce,
    getAdminMessages: getAdminMessagesReduce,
    allPayments:allPaymentReducer,
    notification:notificationReducer,
    messageNotification:messageNotificationReducer,
    shippingType:shippingTypeReducer,
    paymentSetting:paymentSettingReducer,
    paymentPlan:paymentPlanReducer,
    countries:countriesReducer,
    states:statesReducer,
    cities:citiesReducer,
    chatContacts:chatContactsReducer,
    messages:messagesReducer,
    latestChats:latestChatsReducer,
    //shopper
    shopperChatContacts:shopperChatContactsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
