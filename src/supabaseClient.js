// Neutralized Supabase client replacement (all database operations now use Express backend)
export const supabase = {
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
        range: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  }),
  auth: {
    user: () => null,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
  }),
  removeSubscription: () => {},
};