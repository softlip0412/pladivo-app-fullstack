"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Users,
  Briefcase,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default function RevenuePage() {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [month, year]);

  async function fetchRevenueData() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });

      const res = await fetch(`/api/revenue?${params}`);
      const data = await res.json();

      if (data.success) {
        setRevenueData(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      toast.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("vi-VN");
  }

  const isProfit = revenueData?.net_revenue >= 0;
  const isGrowthPositive = revenueData?.growth_percentage >= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo Doanh thu"
        description="Theo dõi doanh thu và chi phí theo tháng"
      >
        <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90">
          <Download className="h-5 w-5" />
          Xuất báo cáo
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      ) : !revenueData ? (
        <div className="text-center py-12 text-muted-foreground">
          Không có dữ liệu
        </div>
      ) : (
        <>
          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Tổng thu nhập"
              value={formatCurrency(revenueData.income.total)}
              icon={DollarSign}
              gradient
            />
            <StatCard
              title="Tổng chi phí"
              value={formatCurrency(revenueData.expenses.total)}
              icon={TrendingDown}
            />
            <StatCard
              title={isProfit ? "Lợi nhuận ròng" : "Thua lỗ"}
              value={formatCurrency(Math.abs(revenueData.net_revenue))}
              icon={isProfit ? TrendingUp : TrendingDown}
              trend={isProfit ? "up" : "down"}
            />
            <StatCard
              title="Tăng trưởng"
              value={`${isGrowthPositive ? "+" : ""}${revenueData.growth_percentage.toFixed(1)}%`}
              icon={isGrowthPositive ? ArrowUpRight : ArrowDownRight}
              trend={isGrowthPositive ? "up" : "down"}
            />
          </div>

          {/* Net Revenue Summary Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tổng quan doanh thu tháng {month}/{year}</span>
                <Badge
                  variant={isProfit ? "default" : "destructive"}
                  className="text-lg px-4 py-2"
                >
                  {isProfit ? "Lãi" : "Lỗ"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Thu nhập từ khách hàng</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(revenueData.income.total)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {revenueData.income.payments.length} khoản thanh toán
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tổng chi phí</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(revenueData.expenses.total)}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Đối tác: {formatCurrency(revenueData.expenses.partner_contracts.total)}</p>
                    <p>• Nhân viên: {formatCurrency(revenueData.expenses.employee_salaries.total)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isProfit ? "Lợi nhuận ròng" : "Thua lỗ"}
                  </p>
                  <p className={`text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(Math.abs(revenueData.net_revenue))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    So với tháng trước:{" "}
                    <span className={isGrowthPositive ? "text-green-600" : "text-red-600"}>
                      {isGrowthPositive ? "+" : ""}{revenueData.growth_percentage.toFixed(1)}%
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Income Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Thu nhập từ hợp đồng khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.income.payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có khoản thanh toán nào trong tháng này
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">STT</TableHead>
                        <TableHead>Số HĐ</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                        <TableHead className="text-center">Ngày thanh toán</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueData.income.payments.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {payment.contract_number}
                          </TableCell>
                          <TableCell>{payment.customer_name}</TableCell>
                          <TableCell>{payment.description}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="text-center">
                            {formatDate(payment.paid_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-bold">
                          Tổng cộng
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-600 text-lg">
                          {formatCurrency(revenueData.income.total)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partner Contracts Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Chi phí hợp đồng đối tác
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.expenses.partner_contracts.contracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có hợp đồng đối tác nào trong tháng này
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">STT</TableHead>
                        <TableHead>Số HĐ</TableHead>
                        <TableHead>Đối tác</TableHead>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead className="text-right">Giá trị</TableHead>
                        <TableHead className="text-center">Ngày ký</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueData.expenses.partner_contracts.contracts.map((contract, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            {contract.contract_number}
                          </TableCell>
                          <TableCell>{contract.partner_name}</TableCell>
                          <TableCell>{contract.title}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(contract.total_value)}
                          </TableCell>
                          <TableCell className="text-center">
                            {contract.signed_date ? formatDate(contract.signed_date) : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="font-bold">
                          Tổng cộng
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600 text-lg">
                          {formatCurrency(revenueData.expenses.partner_contracts.total)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Salaries Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Chi phí lương nhân viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.expenses.employee_salaries.payrolls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có bảng lương nào được trả trong tháng này
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">STT</TableHead>
                        <TableHead>Nhân viên</TableHead>
                        <TableHead>Bộ phận</TableHead>
                        <TableHead className="text-right">Lương</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueData.expenses.employee_salaries.payrolls.map((payroll, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{payroll.staff_name}</TableCell>
                          <TableCell>{payroll.department}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(payroll.total_salary)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={3} className="font-bold">
                          Tổng cộng
                        </TableCell>
                        <TableCell className="text-right font-bold text-red-600 text-lg">
                          {formatCurrency(revenueData.expenses.employee_salaries.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
