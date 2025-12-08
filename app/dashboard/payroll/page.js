"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Calculator, Search, Download, TrendingUp, TrendingDown, Users, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default function PayrollPage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchPayrolls();
  }, [month, year, statusFilter]);

  async function fetchPayrolls() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
        status: statusFilter,
      });

      if (search) {
        params.append("search", search);
      }

      const res = await fetch(`/api/payroll?${params}`);
      const data = await res.json();

      if (data.success) {
        setPayrolls(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching payrolls:", err);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  async function handleCalculatePayroll() {
    try {
      setCalculating(true);
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchPayrolls();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error calculating payroll:", err);
      toast.error("Không thể tính lương");
    } finally {
      setCalculating(false);
    }
  }

  async function handleUpdateStatus(payrollId, newStatus) {
    try {
      const res = await fetch("/api/payroll", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payroll_id: payrollId, status: newStatus }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchPayrolls();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Không thể cập nhật");
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  function getKPIBadge(percentage) {
    if (percentage === 100) {
      return <Badge className="bg-green-500">100% KPI</Badge>;
    } else if (percentage === 50) {
      return <Badge className="bg-yellow-500">50% KPI</Badge>;
    } else {
      return <Badge variant="secondary">0% KPI</Badge>;
    }
  }

  function getStatusBadge(status) {
    const statusMap = {
      draft: { label: "Nháp", variant: "secondary" },
      approved: { label: "Đã duyệt", variant: "default" },
      paid: { label: "Đã trả", variant: "outline" },
    };
    const config = statusMap[status] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  const filteredPayrolls = search
    ? payrolls.filter((p) =>
        p.staff_id?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : payrolls;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảng Lương Nhân Sự"
        description="Quản lý và tính toán lương theo tháng"
      >
        <Button
          onClick={handleCalculatePayroll}
          disabled={calculating}
          size="lg"
          className="gap-2 bg-white text-primary hover:bg-white/90"
        >
          <Calculator className="h-5 w-5" />
          {calculating ? "Đang tính..." : "Tính Lương Tháng Này"}
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Month */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tháng</label>
              <Select
                value={month.toString()}
                onValueChange={(v) => setMonth(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      Tháng {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-medium mb-2 block">Năm</label>
              <Select
                value={year.toString()}
                onValueChange={(v) => setYear(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => currentDate.getFullYear() - 3 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="paid">Đã trả</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tên nhân sự..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Tổng nhân sự"
          value={filteredPayrolls.length}
          icon={Users}
        />
        <StatCard
          title="Tổng lương"
          value={formatCurrency(
            filteredPayrolls.reduce((sum, p) => sum + p.total_salary, 0)
          )}
          icon={DollarSign}
          gradient
        />
        <StatCard
          title="Tổng KPI"
          value={formatCurrency(
            filteredPayrolls.reduce((sum, p) => sum + p.kpi_bonus, 0)
          )}
          icon={TrendingUp}
        />
        <StatCard
          title="Tổng task"
          value={filteredPayrolls.reduce((sum, p) => sum + p.total_tasks, 0)}
          icon={CheckCircle}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lương tháng {month}/{year}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có dữ liệu. Nhấn "Tính Lương Tháng Này" để bắt đầu.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">STT</TableHead>
                    <TableHead>Nhân sự</TableHead>
                    <TableHead>Bộ phận</TableHead>
                    <TableHead className="text-center">Task hiện tại</TableHead>
                    <TableHead className="text-center">Task trước</TableHead>
                    <TableHead className="text-center">Tăng trưởng</TableHead>
                    <TableHead className="text-right">Lương CB</TableHead>
                    <TableHead className="text-right">Phụ cấp</TableHead>
                    <TableHead className="text-center">KPI</TableHead>
                    <TableHead className="text-right">KPI (VNĐ)</TableHead>
                    <TableHead className="text-right">Tổng lương</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrolls.map((payroll, index) => {
                    const growthRate =
                      payroll.previous_month_tasks > 0
                        ? (
                            ((payroll.total_tasks - payroll.previous_month_tasks) /
                              payroll.previous_month_tasks) *
                            100
                          ).toFixed(1)
                        : 0;

                    return (
                      <TableRow key={payroll._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {payroll.staff_id?.full_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {payroll.staff_id?.department_id?.name || "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {payroll.total_tasks}
                        </TableCell>
                        <TableCell className="text-center">
                          {payroll.previous_month_tasks}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {growthRate >= 10 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span
                              className={
                                growthRate >= 10
                                  ? "text-green-600 font-semibold"
                                  : "text-red-600"
                              }
                            >
                              {growthRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payroll.base_salary)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(payroll.allowance)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getKPIBadge(payroll.kpi_percentage)}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(payroll.kpi_bonus)}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(payroll.total_salary)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(payroll.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            {payroll.status === "draft" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(payroll._id, "approved")
                                }
                              >
                                Duyệt
                              </Button>
                            )}
                            {payroll.status === "approved" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUpdateStatus(payroll._id, "paid")
                                }
                              >
                                Đã trả
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
