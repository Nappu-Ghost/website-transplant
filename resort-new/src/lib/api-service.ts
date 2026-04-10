import api from './api';

export const hotelService = {
  list: (token?: string | null) => api.getHotels(token),
  getById: (id: string, token?: string | null) => api.getHotelById(id, token),
  create: (data: any, token?: string | null) => api.createHotel(data, token),
  update: (id: string, data: any, token?: string | null) => api.updateHotel(id, data, token),
  remove: (id: string, token?: string | null) => api.deleteHotel(id, token),
  uploadImage: (id: string, file: File, token?: string | null) => api.uploadHotelImage(id, file, token),
};

export const roomService = {
  list: (filters?: Record<string, any>, token?: string | null) => api.getRooms(filters, token),
  getById: (id: string, token?: string | null) => api.getRoomById(id, token),
  create: (data: any, token?: string | null) => api.createRoom(data, token),
  update: (id: string, data: any, token?: string | null) => api.updateRoom(id, data, token),
  remove: (id: string, token?: string | null) => api.deleteRoom(id, token),
  uploadImage: (id: string, file: File, token?: string | null) => api.uploadRoomImage(id, file, token),
};

export const activityService = {
  list: (token?: string | null) => api.getActivities(token),
  getById: (id: string, token?: string | null) => api.getActivityById(id, token),
  create: (data: any, token?: string | null) => api.createActivity(data, token),
  update: (id: string, data: any, token?: string | null) => api.updateActivity(id, data, token),
  remove: (id: string, token?: string | null) => api.deleteActivity(id, token),
  uploadImage: (id: string, file: File, token?: string | null) => api.uploadActivityImage(id, file, token),
};

export const bookingService = {
  list: (filters?: Record<string, any>, token?: string | null) => api.getBookings(filters, token),
  getById: (id: string, token?: string | null) => api.getBookingById(id, token),
  listForUser: (userId?: string, token?: string | null) => api.getUserBookings(userId, token),
  create: (data: any, token?: string | null) => api.createBooking(data, token),
  update: (id: string, data: any, token?: string | null) => api.updateBooking(id, data, token),
  requestCancellation: (id: string, data?: any, token?: string | null) => api.requestBookingCancellation(id, data, token),
  reviewCancellation: (id: string, data: any, token?: string | null) => api.reviewBookingCancellation(id, data, token),
  remove: (id: string, token?: string | null) => api.deleteBooking(id, token),
  listPaymentsForUser: (token?: string | null) => api.getUserPayments(token),
};

export const paymentService = {
  list: (filters?: Record<string, any>, token?: string | null) => api.getPayments(filters, token),
  getById: (id: string, token?: string | null) => api.getPaymentById(id, token),
  create: (data: any, token?: string | null) => api.createPayment(data, token),
  update: (id: string, data: any, token?: string | null) => api.updatePayment(id, data, token),
};

export const userService = {
  getCurrent: (token?: string | null) => api.getCurrentUser(token),
  list: (filters?: Record<string, any>, token?: string | null) => api.getUsers(filters, token),
  getById: (id: string, token?: string | null) => api.getUserById(id, token),
  create: (data: any, token?: string | null) => api.createUser(data, token),
  update: (id: string, data: any, token?: string | null) => api.updateUser(id, data, token),
  remove: (id: string, token?: string | null) => api.deleteUser(id, token),
};

export const adminService = {
  getOverview: (token?: string | null) => api.getAdminOverview(token),
  getHomepageSettings: (token?: string | null) => api.getHomepageSettings(token),
  updateHomepageSettings: (data: any, token?: string | null) => api.updateHomepageSettings(data, token),
  getAccommodationsSettings: (token?: string | null) => api.getAccommodationsSettings(token),
  updateAccommodationsSettings: (data: any, token?: string | null) => api.updateAccommodationsSettings(data, token),
  getActivitiesSettings: (token?: string | null) => api.getActivitiesSettings(token),
  updateActivitiesSettings: (data: any, token?: string | null) => api.updateActivitiesSettings(data, token),
  getAboutSettings: (token?: string | null) => api.getAboutSettings(token),
  updateAboutSettings: (data: any, token?: string | null) => api.updateAboutSettings(data, token),
  getMapSettings: (token?: string | null) => api.getMapSettings(token),
  updateMapSettings: (data: any, token?: string | null) => api.updateMapSettings(data, token),
};

export const metaService = {
  get: () => api.getMeta(),
  getHomepage: () => api.getHomepageConfig(),
  getAccommodations: () => api.getAccommodationsConfig(),
  getActivities: () => api.getActivitiesConfig(),
  getAbout: () => api.getAboutConfig(),
  getMap: () => api.getMapConfig(),
  toPublicUrl: (url: string) => api.toPublicUrl(url),
};
