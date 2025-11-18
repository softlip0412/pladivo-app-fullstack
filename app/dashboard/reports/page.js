"use client";
import { useEffect, useState } from "react";

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
    <div>
      <h1 className="text-xl font-bold mb-4">Báo cáo</h1>
      {reports.length === 0 ? (
        <p>Không có báo cáo nào</p>
      ) : (
        <ul>
          {reports.map((r) => (
            <li key={r.id} className="border-b py-2">
              <strong>{r.title}</strong> - {r.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
