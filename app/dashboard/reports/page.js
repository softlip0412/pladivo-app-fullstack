"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data);
    }
    fetchReports();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <PageHeader
        title="Báo cáo"
        description="Xem và quản lý các báo cáo hệ thống"
      />
      {reports.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Không có báo cáo nào</p>
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="border-b py-3 hover:bg-gray-50 px-4 rounded">
              <strong className="text-indigo-600">{r.title}</strong> - <span className="text-gray-600">{r.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
