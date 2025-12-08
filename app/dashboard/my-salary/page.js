"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Briefcase,
  Building2,
  Download,
  Filter,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MySalaryPage() {
  const currentDate = new Date();
  const [loading, setLoading] = useState(true);
  const [staffInfo, setStaffInfo] = useState(null);
  const [currentPayroll, setCurrentPayroll] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchMySalary();
  }, []);

  async function fetchMySalary() {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!user.id) {
        toast.error("Không tìm thấy thông tin người dùng");
        return;
      }

      const res = await fetch(`/api/my-salary?user_id=${user.id}`);
      const data = await res.json();

      if (data.success) {
        setStaffInfo(data.data.staff);
        setCurrentPayroll(data.data.current_payroll);
        setHistory(data.data.history);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching salary:", err);
      toast.error("Không thể tải dữ liệu lương");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  }

  function handleExportExcel() {
    if (history.length === 0) {
      toast.error("Không có dữ liệu để xuất");
      return;
    }

    // Create CSV content
    const headers = ["Tháng/Năm", "Task", "Lương CB", "Phụ cấp", "KPI %", "KPI (VNĐ)", "Tổng lương"];
    const rows = history.map((p) => [
      `${p.month}/${p.year}`,
      p.total_tasks,
      p.base_salary,
      p.allowance,
      `${p.kpi_percentage}%`,
      p.kpi_bonus,
      p.total_salary,
    ]);

    let csvContent = "\uFEFF"; // BOM for UTF-8
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `luong_${staffInfo?.full_name}_${selectedMonth}_${selectedYear}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Đã xuất file thành công");
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

  // Filter history by selected month/year
  const filteredHistory = selectedMonth && selectedYear
    ? history.filter((p) => p.month === selectedMonth && p.year === selectedYear)
    : history;

  // Prepare chart data
  const chartData = history
    .slice()
    .reverse()
    .map((p) => ({
      month: `${p.month}/${p.year}`,
      salary: p.total_salary,
      kpi: p.kpi_bonus,
      tasks: p.total_tasks,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-muted-foreground">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!staffInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy thông tin nhân sự của bạn
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lương Của Tôi"
        description="Theo dõi lương và hiệu suất công việc cá nhân"
      />

      {/* Staff Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Họ tên"
          value={staffInfo.full_name}
          icon={Briefcase}
        />
        <StatCard
          title="Bộ phận"
          value={staffInfo.department}
          icon={Building2}
        />
        <StatCard
          title="Vai trò"
          value={staffInfo.role || "N/A"}
          icon={Award}
        />
        <StatCard
          title="Tháng hiện tại"
          value={`${new Date().getMonth() + 1}/${new Date().getFullYear()}`}
          icon={Calendar}
          gradient
        />
      </div>

      {/* Current Month Salary */}
      {currentPayroll ? (

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Lương cơ bản"
            value={formatCurrency(currentPayroll.base_salary)}
            icon={DollarSign}
          />
          <StatCard
            title="Phụ cấp"
            value={formatCurrency(currentPayroll.allowance)}
            icon={DollarSign}
          />
          <StatCard
            title="Thưởng KPI"
            value={formatCurrency(currentPayroll.kpi_bonus)}
            icon={Award}
            trend="up"
            trendValue={`${currentPayroll.kpi_percentage}% KPI`}
          />
          <StatCard
            title="Task hoàn thành"
            value={currentPayroll.total_tasks}
            icon={CheckCircle}
            trend={currentPayroll.total_tasks >= currentPayroll.previous_month_tasks ? "up" : "down"}
            trendValue={currentPayroll.previous_month_tasks > 0 ? `${(
              ((currentPayroll.total_tasks - currentPayroll.previous_month_tasks) /
                currentPayroll.previous_month_tasks) *
              100
            ).toFixed(1)}%` : "N/A"}
          />
          <StatCard
            title="Tổng lương"
            value={formatCurrency(currentPayroll.total_salary)}
            icon={DollarSign}
            gradient
            className="md:col-span-3 lg:col-span-1"
          />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Chưa có dữ liệu lương cho tháng hiện tại
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Salary Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ lương theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="salary"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Tổng lương"
                  />
                  <Line
                    type="monotone"
                    dataKey="kpi"
                    stroke="#22c55e"
                    strokeWidth={2}
                    name="KPI"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Số task hoàn thành theo tháng</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#8b5cf6" name="Số task" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salary History Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lịch sử lương</CardTitle>
            <div className="flex gap-4 items-center">
              {/* Month Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedMonth?.toString() || "all"}
                  onValueChange={(v) => setSelectedMonth(v === "all" ? null : parseInt(v))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả tháng</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        Tháng {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <Select
                value={selectedYear?.toString() || "all"}
                onValueChange={(v) => setSelectedYear(v === "all" ? null : parseInt(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả năm</SelectItem>
                  {Array.from({ length: 7 }, (_, i) => currentDate.getFullYear() - 3 + i).map(
                    (y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              {/* Export Button */}
              <Button onClick={handleExportExcel} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Xuất Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {history.length === 0 ? "Chưa có lịch sử lương" : "Không có dữ liệu cho tháng/năm đã chọn"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tháng/Năm</TableHead>
                    <TableHead className="text-center">Task</TableHead>
                    <TableHead className="text-right">Lương CB</TableHead>
                    <TableHead className="text-right">Phụ cấp</TableHead>
                    <TableHead className="text-center">KPI</TableHead>
                    <TableHead className="text-right">KPI (VNĐ)</TableHead>
                    <TableHead className="text-right">Tổng lương</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((payroll) => (
                    <TableRow key={payroll._id}>
                      <TableCell className="font-medium">
                        {payroll.month}/{payroll.year}
                      </TableCell>
                      <TableCell className="text-center">{payroll.total_tasks}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payroll.base_salary)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payroll.allowance)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getKPIBadge(payroll.kpi_percentage)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        {formatCurrency(payroll.kpi_bonus)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(payroll.total_salary)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
