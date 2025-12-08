"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

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
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Đơn dịch vụ"
        description="Quản lý các đơn dịch vụ"
      />
      {orders.map((o) => (
        <div key={o.id} className="border rounded-lg p-3 mb-2 bg-white hover:shadow-md transition-shadow">
          <h2 className="font-semibold">{o.customerName}</h2>
          <p>{o.serviceName}</p>
          <p className="text-sm text-gray-600">{o.status}</p>
        </div>
      ))}
    </div>
  );
}
