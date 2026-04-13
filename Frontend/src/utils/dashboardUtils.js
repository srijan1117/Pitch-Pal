/**
 * Group bookings by date and sum revenue for the last 30 days.
 */
export const getRevenueData = (bookings) => {
  const last30Days = [...Array(30)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const revenueMap = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((acc, b) => {
      acc[b.booking_date] = (acc[b.booking_date] || 0) + parseFloat(b.total_amount || 0);
      return acc;
    }, {});

  return last30Days.map((date) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: revenueMap[date] || 0,
  }));
};

/**
 * Filter and count bookings by status.
 */
export const getBookingStatusData = (bookings) => {
  const counts = bookings.reduce((acc, b) => {
    const status = b.status.charAt(0).toUpperCase() + b.status.slice(1);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const COLORS = {
    Confirmed: "#10b981", // green-500
    Pending: "#f59e0b",   // amber-500
    Cancelled: "#ef4444", // red-500
    Completed: "#3b82f6", // blue-500
  };

  return Object.keys(counts).map((status) => ({
    name: status,
    value: counts[status],
    fill: COLORS[status] || "#94a3b8",
  }));
};

/**
 * Count bookings per court.
 */
export const getCourtPopularityData = (bookings) => {
  const counts = bookings.reduce((acc, b) => {
    acc[b.court_name] = (acc[b.court_name] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(counts)
    .map((name) => ({
      name,
      bookings: counts[name],
    }))
    .sort((a, b) => b.bookings - a.bookings);
};
