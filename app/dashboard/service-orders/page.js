"use client";
import { useEffect, useState } from "react";

export default function ServiceOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function fetchOrders() {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/service-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    }
    fetchOrders();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Đơn dịch vụ</h1>
      {orders.map((o) => (
        <div key={o.id} className="border rounded-lg p-3 mb-2 bg-white">
          <h2 className="font-semibold">{o.customerName}</h2>
          <p>{o.serviceName}</p>
          <p className="text-sm text-gray-600">{o.status}</p>
        </div>
      ))}
    </div>
  );
}
