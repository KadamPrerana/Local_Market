// Initial Mock Data for Local Market Platform

export const INITIAL_USERS = [
  {
    id: "usr_admin_1",
    name: "System Administrator Central",
    email: "admin@localmarket.com",
    address: "Plot No. 45, Sector 15, Vashi, Navi Mumbai, MH 400703",
    password: "Password123!",
    role: "System Administrator"
  },
  {
    id: "usr_owner_1",
    name: "Rajesh Patel Store Owner",
    email: "freshmart.owner@localmarket.com",
    address: "100 Mahatma Gandhi Road, Camp, Pune, MH 411001",
    password: "Password123!",
    role: "Store Owner",
    storeId: "str_1"
  },
  {
    id: "usr_owner_2",
    name: "Amit Sharma Store Owner",
    email: "techhub.owner@localmarket.com",
    address: "500 IT Expressway, OMR, Karapakkam, Chennai, TN 600097",
    password: "Password123!",
    role: "Store Owner",
    storeId: "str_2"
  },
  {
    id: "usr_owner_3",
    name: "Priya Mehta Store Owner",
    email: "bakery.owner@localmarket.com",
    address: "22B Park Street, Park Circus, Kolkata, WB 700016",
    password: "Password123!",
    role: "Store Owner",
    storeId: "str_3"
  },
  {
    id: "usr_normal_1",
    name: "Aarav Sharma Verified Customer",
    email: "aarav.sharma.verified@localmarket.com",
    address: "Flat 402, Shanti Kunj, Sector 9, Rohini, New Delhi, DL 110085",
    password: "Password123!",
    role: "Normal User"
  },
  {
    id: "usr_normal_2",
    name: "Diya Patel Verified Customer",
    email: "diya.patel.verified@localmarket.com",
    address: "35, Jubilee Hills, Hyderabad, TS 500033",
    password: "Password123!",
    role: "Normal User"
  },
  {
    id: "usr_normal_3",
    name: "Rohan Mehta Verified Consumer",
    email: "rohan.mehta.verified@localmarket.com",
    address: "88, MG Road, Ashok Nagar, Bengaluru, KA 560001",
    password: "Password123!",
    role: "Normal User"
  }
];

export const INITIAL_STORES = [
  {
    id: "str_1",
    name: "FreshMart Organic Supermarket",
    email: "contact@freshmartorganic.com",
    address: "100 Mahatma Gandhi Road, Camp, Pune, MH 411001",
    ownerId: "usr_owner_1"
  },
  {
    id: "str_2",
    name: "TechHub Gadgets & Electronics",
    email: "support@techhubelectronics.com",
    address: "500 IT Expressway, OMR, Chennai, TN 600097",
    ownerId: "usr_owner_2"
  },
  {
    id: "str_3",
    name: "Artisan Bakes & Confectionery",
    email: "hello@artisanbakeshop.com",
    address: "22B Park Street, Kolkata, WB 700016",
    ownerId: "usr_owner_3"
  },
  {
    id: "str_4",
    name: "Urban Outfitters & Apparel Hub",
    email: "info@urbanoutfittersapparel.com",
    address: "740 Linking Road, Bandra West, Mumbai, MH 400050",
    ownerId: null
  }
];

export const INITIAL_RATINGS = [
  {
    id: "rat_1",
    storeId: "str_1",
    userId: "usr_normal_1",
    userName: "Aarav Sharma Verified Customer",
    userEmail: "aarav.sharma.verified@localmarket.com",
    rating: 5,
    createdAt: "2026-08-10T10:30:00Z"
  },
  {
    id: "rat_2",
    storeId: "str_1",
    userId: "usr_normal_2",
    userName: "Diya Patel Verified Customer",
    userEmail: "diya.patel.verified@localmarket.com",
    rating: 4,
    createdAt: "2026-08-11T14:15:00Z"
  },
  {
    id: "rat_3",
    storeId: "str_2",
    userId: "usr_normal_1",
    userName: "Aarav Sharma Verified Customer",
    userEmail: "aarav.sharma.verified@localmarket.com",
    rating: 3,
    createdAt: "2026-08-12T09:45:00Z"
  },
  {
    id: "rat_4",
    storeId: "str_2",
    userId: "usr_normal_3",
    userName: "Rohan Mehta Verified Consumer",
    userEmail: "rohan.mehta.verified@localmarket.com",
    rating: 5,
    createdAt: "2026-08-13T16:20:00Z"
  },
  {
    id: "rat_5",
    storeId: "str_3",
    userId: "usr_normal_2",
    userName: "Diya Patel Verified Customer",
    userEmail: "diya.patel.verified@localmarket.com",
    rating: 5,
    createdAt: "2026-08-14T11:00:00Z"
  }
];

// Helper to load or initialize state from localStorage
export function loadInitialData() {
  const savedUsers = localStorage.getItem("lm_users");
  const savedStores = localStorage.getItem("lm_stores");
  const savedRatings = localStorage.getItem("lm_ratings");

  return {
    users: savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS,
    stores: savedStores ? JSON.parse(savedStores) : INITIAL_STORES,
    ratings: savedRatings ? JSON.parse(savedRatings) : INITIAL_RATINGS
  };
}

export function saveStateToStorage(users, stores, ratings) {
  localStorage.setItem("lm_users", JSON.stringify(users));
  localStorage.setItem("lm_stores", JSON.stringify(stores));
  localStorage.setItem("lm_ratings", JSON.stringify(ratings));
}
