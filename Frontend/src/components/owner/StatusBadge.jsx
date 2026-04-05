export default function StatusBadge({ status }) {
  const map = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${map[status] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}