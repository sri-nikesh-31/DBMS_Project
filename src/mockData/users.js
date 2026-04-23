export const currentUser = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  addresses: [
    {
      id: 'a1',
      type: 'Home',
      street: '123 Innovation Drive',
      city: 'Techville',
      state: 'CA',
      zip: '90210',
      isDefault: true
    },
    {
      id: 'a2',
      type: 'Work',
      street: '456 Startup Blvd',
      city: 'Techville',
      state: 'CA',
      zip: '90211',
      isDefault: false
    }
  ],
  wishlist: ['p1', 'p3']
};

export const orders = [
  {
    id: 'ORD-73921',
    date: '2023-10-15',
    status: 'Delivered', // Processing, Shipped, Delivered
    total: 394.99,
    items: [
      { productId: 'p3', name: 'Wireless Noise-Canceling Headphones', price: 349.99, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
      { productId: 'p5', name: 'Ceramic Coffee Mug Set', price: 45.00, quantity: 1, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ],
    trackingNumber: 'TRK9876543210'
  },
  {
    id: 'ORD-84022',
    date: '2023-11-20',
    status: 'Shipped',
    total: 129.50,
    items: [
      { productId: 'p4', name: 'Smart Home Hub', price: 129.50, quantity: 1, image: 'https://images.unsplash.com/photo-1558002038-1055907df827?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
    ],
    trackingNumber: 'TRK1234567890'
  }
];
