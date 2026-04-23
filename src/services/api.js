import { supabase } from '../supabaseClient'

export const api = {

  // 🛍️ PRODUCTS
  products: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(category_name), inventory(stock_quantity), vendors(name, user_id)')
      if (error) throw error
      return data.map(p => ({ ...p, stock_quantity: p.inventory?.[0]?.stock_quantity || 0 }))
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(category_name), inventory(stock_quantity), vendors(name, qr_code_url, user_id)')
        .eq('product_id', Number(id))
        .single()
      if (error) throw error
      return { ...data, stock_quantity: data.inventory?.[0]?.stock_quantity || 0 }
    },

    getByCategory: async (categoryId) => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(category_name), inventory(stock_quantity), vendors(name)')
        .eq('category_id', categoryId)
      if (error) throw error
      return data.map(p => ({ ...p, stock_quantity: p.inventory?.[0]?.stock_quantity || 0 }))
    },

    getByVendor: async (vendorId) => {
      // vendorId here is the integer vendor_id (PK)
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(category_name), inventory(stock_quantity), vendors(name)')
        .eq('vendor_id', vendorId)
      if (error) throw error
      return data.map(p => ({ ...p, stock_quantity: p.inventory?.[0]?.stock_quantity || 0 }))
    }
  },

  // 🏪 VENDORS
  vendors: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },

    getApproved: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('status', 'approved')
      if (error) throw error
      return data || []
    },

    // ✅ FIXED: use user_id (uuid) not vendor_id (integer)
    getByUser: async (userId) => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error) return null
      return data
    },

    create: async ({ name, description, phone, address, email, qr_code_url, userId }) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert({
          user_id: userId,   // uuid — the auth user
          name,
          description,
          phone,
          address,
          email,
          qr_code_url,
          status: 'pending'
        })
        .select()
        .single()
      if (error) throw error
      return data
    },

    // ✅ Update Application when reapplying
    updateApplication: async (vendorId, { name, description, phone, address, email, qr_code_url }) => {
      const { data, error } = await supabase
        .from('vendors')
        .update({
          name,
          description,
          phone,
          address,
          email,
          qr_code_url,
          status: 'pending' // sets status back to pending
        })
        .eq('vendor_id', vendorId)
        .select()
        .single()
      if (error) throw error
      return data
    },

    // ✅ Update by integer vendor_id (PK)
    updateStatus: async (vendorId, status) => {
      const { error } = await supabase
        .from('vendors')
        .update({ status })
        .eq('vendor_id', vendorId)
      if (error) throw error
    },

    updateQR: async (vendorId, qr_code_url) => {
      const { error } = await supabase
        .from('vendors')
        .update({ qr_code_url })
        .eq('vendor_id', vendorId)
      if (error) throw error
    },

    // ✅ Dismiss vendor: set status + delete all their products + inventory
    dismiss: async (vendorId) => {
      // 1. Get all product_ids for this vendor
      const { data: products, error: pError } = await supabase
        .from('products')
        .select('product_id')
        .eq('vendor_id', vendorId)
      if (pError) throw pError

      const productIds = (products || []).map(p => p.product_id)

      // 2. Delete inventory rows first (FK constraint)
      if (productIds.length > 0) {
        const { error: iError } = await supabase
          .from('inventory')
          .delete()
          .in('product_id', productIds)
        if (iError) throw iError

        // 3. Delete the products
        const { error: prodError } = await supabase
          .from('products')
          .delete()
          .in('product_id', productIds)
        if (prodError) throw prodError
      }

      // 4. Set vendor status to dismissed
      const { error: vError } = await supabase
        .from('vendors')
        .update({ status: 'dismissed' })
        .eq('vendor_id', vendorId)
      if (vError) throw vError
    }
  },

  // 📦 ORDERS
  orders: {
    getAll: async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return []

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(*, vendors(name, qr_code_url))
          )
        `)
        .eq('user_id', userData.user.id)
        .order('order_date', { ascending: false })

      if (error) throw error
      return data || []
    },

    // ✅ Get orders for a vendor using their integer vendor_id
    getByVendor: async (vendorId) => {
      const { data: vendorProducts, error: vpError } = await supabase
        .from('products')
        .select('product_id')
        .eq('vendor_id', vendorId)
      if (vpError) throw vpError
      if (!vendorProducts || vendorProducts.length === 0) return []

      const productIds = vendorProducts.map(p => p.product_id)

      const { data: orderItems, error: oiError } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', productIds)
      if (oiError) throw oiError
      if (!orderItems || orderItems.length === 0) return []

      const orderIds = [...new Set(orderItems.map(oi => oi.order_id))]

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, image_url, price, vendor_id)
          )
        `)
        .in('order_id', orderIds)
        .order('order_date', { ascending: false })
      if (ordersError) throw ordersError

      return (orders || []).map(order => ({
        ...order,
        order_items: (order.order_items || []).filter(
          item => productIds.includes(item.product_id)
        )
      }))
    },

    updateStatus: async (orderId, status) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId)
        .select('*, order_items(product_id, quantity)')
        .single()
      if (error) throw error
      
      // Restore inventory if the order is Cancelled
      if (status === 'Cancelled' && data && data.order_items) {
          for (const item of data.order_items) {
             const { data: invData } = await supabase.from('inventory').select('stock_quantity').eq('product_id', item.product_id).single();
             if (invData) {
                 await supabase.from('inventory').update({ stock_quantity: invData.stock_quantity + item.quantity }).eq('product_id', item.product_id);
             }
          }
      }
      
      // CREATE NOTIFICATION FOR CUSTOMER
      if (data && data.user_id) {
          let msg = `Your order #${orderId} status has been updated to ${status}.`;
          if (status === 'Shipped') msg = `Your order #${orderId} has been shipped! It is on its way. Estimated delivery in 2-4 days.`;
          if (status === 'Delivered') msg = `Your order #${orderId} has been delivered successfully! Enjoy your purchase.`;
          if (status === 'Processing') msg = `Good news! Your order #${orderId} is now being processed.`;
          if (status === 'Cancelled') msg = `Your order #${orderId} has been cancelled.`;
          
          await api.notifications.create(data.user_id, `Order ${status}`, msg, 'order_status');
      }

      return data
    },

    create: async (cartItems, totalAmount, orderData = null) => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not logged in')

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.user.id,
          total_amount: totalAmount,
          status: 'Pending',
          order_date: new Date().toISOString(),
        })
        .select()
        .single()
      if (orderError) throw orderError

      const items = cartItems.map(item => ({
        order_id: order.order_id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }))
      const { error: itemsError } = await supabase.from('order_items').insert(items)
      if (itemsError) throw itemsError

      if (orderData) {
        const { error: shippingError } = await supabase.from('shipping').insert({
          order_id: order.order_id,
          address: orderData.address || '',
          city: orderData.city || '',
          tracking_number: null
        })
        if (shippingError) console.error("Failed to insert shipping info:", shippingError)
      }

      // Decrement inventory stock
      for (const item of cartItems) {
        const { data: invData } = await supabase.from('inventory').select('stock_quantity').eq('product_id', item.product_id).single();
        if (invData) {
          const newQty = Math.max(0, invData.stock_quantity - item.quantity);
          await supabase.from('inventory').update({ stock_quantity: newQty }).eq('product_id', item.product_id);
        }
      }

      return { success: true, order_id: order.order_id }
    }
  },

  // 💳 PAYMENTS
  payments: {
    create: async (orderId) => {
      const { error } = await supabase
        .from('payments')
        .insert({ order_id: orderId, payment_method: 'UPI', payment_status: 'Paid' })
      if (error) throw error
    }
  },

  // 📂 CATEGORIES
  categories: {
    getAll: async () => {
      const { data, error } = await supabase.from('categories').select('*')
      if (error) throw error
      return data || []
    },
    create: async (name, description = '') => {
      const { data, error } = await supabase
        .from('categories')
        .insert({ category_name: name, description })
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  supportTickets: {
    getByOrders: async (orderIds) => {
      if (!orderIds || orderIds.length === 0) return []
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    },
    updateStatus: async (ticketId, status) => {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('ticket_id', ticketId)
        .select()
      if (error) throw new Error(error.message || JSON.stringify(error))
      if (!data || data.length === 0) {
         throw new Error("Update blocked by Database RLS policies. Vendor does not own this ticket.");
      }
      
      const ticket = data[0];

      // Notify the customer
      if (ticket.user_id) {
          const msg = status === 'Resolved' 
             ? `Your support ticket for Order #${ticket.order_id} has been marked as Resolved by the vendor.`
             : `Your support ticket for Order #${ticket.order_id} status has been updated to ${status}.`;
          
          await api.notifications.create(ticket.user_id, `Ticket ${status}`, msg, 'support_ticket');
      }

      return ticket;
    }
  },

  shipping: {
    getByOrders: async (orderIds) => {
      if (!orderIds || orderIds.length === 0) return []
      const { data, error } = await supabase
        .from('shipping')
        .select('*')
        .in('order_id', orderIds)
      if (error) throw error
      return data || []
    },
    updateTracking: async (orderId, trackingNumber) => {
      const { data, error } = await supabase
        .from('shipping')
        .update({ tracking_number: trackingNumber })
        .eq('order_id', orderId)
        .select()
        .single()
      if (error) throw error
      return data
    }
  },

  // 🔔 NOTIFICATIONS
  notifications: {
    getByUser: async (userId) => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) console.error("Failed to fetch notifications:", error);
      return data || [];
    },
    markAsRead: async (notificationId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) console.error("Failed to mark as read:", error);
    },
    markAllAsRead: async (userId) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      if (error) console.error("Failed to mark all as read:", error);
    },
    create: async (userId, title, message, type) => {
      if (!userId) return;
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title, 
          message, 
          type
        });
      if (error) console.error("Failed to create notification:", error);
    }
  }
}