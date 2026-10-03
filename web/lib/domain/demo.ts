import type { FoodItem, Outlet } from "./types";

// Believable SRM-campus demo catalogue. Used when Supabase env is absent.
// Real data path (Supabase live) replaces these 1:1 via lib/data/*.

export const DEMO_OUTLETS: Outlet[] = [
  { id: "o1", slug: "annapurna-mess", name: "Annapurna Mess", description: "South Indian staples, thalis and filter coffee.", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop", isOpen: true, isActive: true, rating: 4.4, totalReviews: 2314, location: "Main Block · Ground Floor", pickupEtaMin: 12, cuisines: ["South Indian", "Meals"], queue: "short" },
  { id: "o2", slug: "charcoal-bun", name: "Charcoal Bun Co.", description: "Smashed burgers, fries and thick shakes.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop", isOpen: true, isActive: true, rating: 4.6, totalReviews: 1871, location: "Food Street · Stall 4", pickupEtaMin: 15, cuisines: ["Burgers", "Fast Food"], queue: "medium" },
  { id: "o3", slug: "biryani-blues", name: "Biryani Blues Cart", description: "Hyderabadi biryani by the kilo and by the box.", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&auto=format&fit=crop", isOpen: true, isActive: true, rating: 4.5, totalReviews: 3204, location: "Hostel Gate 2", pickupEtaMin: 20, cuisines: ["Biryani", "North Indian"], queue: "long" },
  { id: "o4", slug: "chai-sutta", name: "Chai Point Express", description: "Kulhad chai, bun maska and maggi lab.", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80&auto=format&fit=crop", isOpen: false, isActive: true, rating: 4.2, totalReviews: 954, location: "Library Block", pickupEtaMin: 8, cuisines: ["Beverages", "Snacks"], queue: "short" },
  { id: "o5", slug: "green-bowl", name: "Green Bowl", description: "Salads, Buddha bowls and protein plates.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop", isOpen: true, isActive: true, rating: 4.3, totalReviews: 642, location: "Sports Complex", pickupEtaMin: 10, cuisines: ["Healthy", "Salads"], queue: "short" },
  { id: "o6", slug: "midnight-momos", name: "Midnight Momos", description: "Steamed, fried and tandoori momos till 1 AM.", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80&auto=format&fit=crop", isOpen: true, isActive: true, rating: 4.1, totalReviews: 1108, location: "Night Canteen", pickupEtaMin: 14, cuisines: ["Chinese", "Late Night"], queue: "medium" },
];

export const DEMO_FOODS: FoodItem[] = [
  { id: "f1", slug: "ghee-roast-dosa", outletId: "o1", outletName: "Annapurna Mess", name: "Ghee Roast Dosa", description: "Crisp ghee roast with sambar trio and coconut chutney.", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&q=80&auto=format&fit=crop", price: 90, isVeg: true, isAvailable: true, prepMin: 10, rating: 4.6, totalReviews: 842, category: "South Indian", tags: ["crispy", "breakfast", "bestseller"], isPopular: true, calories: 420, ingredients: ["Rice", "Urad dal", "Ghee", "Potato masala"], variants: [{ id: "v1", name: "Size", required: true, maxSelections: 1, options: [{ id: "s1", name: "Regular", extraPrice: 0 }, { id: "s2", name: "Family roast", extraPrice: 60 }] }] },
  { id: "f2", slug: "smash-burger", outletId: "o2", outletName: "Charcoal Bun Co.", name: "Double Smash Burger", description: "Two smashed patties, cheddar, pickles, house sauce.", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&q=80&auto=format&fit=crop", price: 199, isVeg: false, isAvailable: true, prepMin: 15, rating: 4.7, totalReviews: 1204, category: "Burgers", tags: ["cheesy", "non-veg", "trending"], isPopular: true, calories: 780, ingredients: ["Chicken", "Cheddar", "Brioche", "Pickles"] },
  { id: "f3", slug: "chicken-biryani", outletId: "o3", outletName: "Biryani Blues Cart", name: "Hyderabadi Chicken Biryani", description: "Dum biryani with mirchi ka salan and raita.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop", price: 149, isVeg: false, isAvailable: true, prepMin: 20, rating: 4.5, totalReviews: 2310, category: "Biryani", tags: ["dum", "spicy", "lunch"], isPopular: true, calories: 890, ingredients: ["Basmati", "Chicken", "Saffron", "Fried onions"] },
  { id: "f4", slug: "paneer-tikka-bowl", outletId: "o5", outletName: "Green Bowl", name: "Paneer Tikka Buddha Bowl", description: "Smoked paneer, quinoa, greens and tahini drizzle.", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop", price: 179, isVeg: true, isAvailable: true, prepMin: 12, rating: 4.4, totalReviews: 312, category: "Healthy", tags: ["protein", "low-oil"], calories: 520, ingredients: ["Paneer", "Quinoa", "Greens", "Tahini"] },
  { id: "f5", slug: "tandoori-momos", outletId: "o6", outletName: "Midnight Momos", name: "Tandoori Chicken Momos (8 pc)", description: "Charred momos with spicy mayo and onion rings.", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80&auto=format&fit=crop", price: 129, isVeg: false, isAvailable: true, prepMin: 14, rating: 4.2, totalReviews: 689, category: "Chinese", tags: ["late-night", "spicy"], calories: 610, ingredients: ["Chicken", "Flour", "Spices", "Mayo"] },
  { id: "f6", slug: "cold-coffee", outletId: "o4", outletName: "Chai Point Express", name: "Vietnamese Cold Coffee", description: "Slow-steeped coffee with condensed milk over ice.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", price: 99, isVeg: true, isAvailable: false, prepMin: 6, rating: 4.3, totalReviews: 421, category: "Beverages", tags: ["coffee", "cold"], calories: 280, ingredients: ["Coffee", "Milk", "Condensed milk"] },
];

export const CATEGORIES = [
  { slug: "south-indian", name: "South Indian", color: "#FF9E0B" },
  { slug: "burgers", name: "Burgers", color: "#FF4D2E" },
  { slug: "biryani", name: "Biryani", color: "#7C5CFF" },
  { slug: "healthy", name: "Healthy", color: "#1F9D55" },
  { slug: "chinese", name: "Chinese", color: "#2456E6" },
  { slug: "beverages", name: "Beverages", color: "#FF4D8D" },
  { slug: "late-night", name: "Late Night", color: "#171111" },
  { slug: "under-100", name: "Under ₹100", color: "#A8E10C" },
];
