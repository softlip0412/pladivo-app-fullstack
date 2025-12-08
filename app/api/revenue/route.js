import { NextResponse } from "next/server";
import { connectDB } from "@/app/api/common/db";
import EventContract from "@/models/EventContract";
import PartnerContract from "@/models/PartnerContract";
import Payroll from "@/models/Payroll";
import Partner from "@/models/Partner";
import Staff from "@/models/Staff";
import Department from "@/models/Department";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

    // Calculate date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Also get previous month for comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
    const prevEndDate = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    // ========================================
    // 1. INCOME - Customer Contract Payments
    // ========================================
    const eventContracts = await EventContract.find({
      "payment_schedule.paid_at": { $gte: startDate, $lte: endDate },
    }).lean();

    const incomePayments = [];
    let totalIncome = 0;

    eventContracts.forEach((contract) => {
      contract.payment_schedule.forEach((payment) => {
        if (payment.paid_at) {
          const paidDate = new Date(payment.paid_at);
          if (paidDate >= startDate && paidDate <= endDate) {
            incomePayments.push({
              contract_number: contract.contract_number,
              customer_name: contract.party_a?.name || "N/A",
              description: payment.description || "N/A",
              amount: payment.amount || 0,
              paid_at: payment.paid_at,
            });
            totalIncome += payment.amount || 0;
          }
        }
      });
    });

    // ========================================
    // 2. EXPENSES - Partner Contracts
    // ========================================
    // Find partner contracts that are active or signed during the selected month
    const partnerContracts = await PartnerContract.find({
      $or: [
        { signed_date: { $gte: startDate, $lte: endDate } },
        {
          start_date: { $lte: endDate },
          end_date: { $gte: startDate },
        },
      ],
    })
      .populate("partner_id", "name")
      .lean();

    const partnerExpenses = partnerContracts.map((contract) => ({
      contract_number: contract.contract_number,
      partner_name: contract.partner_id?.name || "N/A",
      title: contract.title,
      total_value: contract.total_value || 0,
      signed_date: contract.signed_date,
    }));

    const totalPartnerExpenses = partnerExpenses.reduce(
      (sum, contract) => sum + contract.total_value,
      0
    );

    // ========================================
    // 3. EXPENSES - Employee Salaries
    // ========================================
    const payrolls = await Payroll.find({
      month,
      year,
      status: "paid",
    })
      .populate({
        path: "staff_id",
        select: "full_name department_id",
        populate: {
          path: "department_id",
          select: "name",
        },
      })
      .lean();

    const salaryExpenses = payrolls.map((payroll) => ({
      staff_name: payroll.staff_id?.full_name || "N/A",
      department: payroll.staff_id?.department_id?.name || "N/A",
      total_salary: payroll.total_salary || 0,
    }));

    const totalSalaryExpenses = salaryExpenses.reduce(
      (sum, payroll) => sum + payroll.total_salary,
      0
    );

    // ========================================
    // 4. Calculate Net Revenue
    // ========================================
    const totalExpenses = totalPartnerExpenses + totalSalaryExpenses;
    const netRevenue = totalIncome - totalExpenses;

    // ========================================
    // 5. Calculate Previous Month Revenue for Comparison
    // ========================================
    const prevEventContracts = await EventContract.find({
      "payment_schedule.paid_at": { $gte: prevStartDate, $lte: prevEndDate },
    }).lean();

    let prevTotalIncome = 0;
    prevEventContracts.forEach((contract) => {
      contract.payment_schedule.forEach((payment) => {
        if (payment.paid_at) {
          const paidDate = new Date(payment.paid_at);
          if (paidDate >= prevStartDate && paidDate <= prevEndDate) {
            prevTotalIncome += payment.amount || 0;
          }
        }
      });
    });

    const prevPartnerContracts = await PartnerContract.find({
      $or: [
        { signed_date: { $gte: prevStartDate, $lte: prevEndDate } },
        {
          start_date: { $lte: prevEndDate },
          end_date: { $gte: prevStartDate },
        },
      ],
    }).lean();

    const prevTotalPartnerExpenses = prevPartnerContracts.reduce(
      (sum, contract) => sum + (contract.total_value || 0),
      0
    );

    const prevPayrolls = await Payroll.find({
      month: prevMonth,
      year: prevYear,
      status: "paid",
    }).lean();

    const prevTotalSalaryExpenses = prevPayrolls.reduce(
      (sum, payroll) => sum + (payroll.total_salary || 0),
      0
    );

    const prevTotalExpenses = prevTotalPartnerExpenses + prevTotalSalaryExpenses;
    const prevNetRevenue = prevTotalIncome - prevTotalExpenses;

    // Calculate growth percentage
    const growthPercentage =
      prevNetRevenue !== 0
        ? ((netRevenue - prevNetRevenue) / Math.abs(prevNetRevenue)) * 100
        : netRevenue > 0
        ? 100
        : 0;

    // ========================================
    // 6. Return Response
    // ========================================
    return NextResponse.json({
      success: true,
      data: {
        month,
        year,
        income: {
          total: totalIncome,
          payments: incomePayments,
        },
        expenses: {
          partner_contracts: {
            total: totalPartnerExpenses,
            contracts: partnerExpenses,
          },
          employee_salaries: {
            total: totalSalaryExpenses,
            payrolls: salaryExpenses,
          },
          total: totalExpenses,
        },
        net_revenue: netRevenue,
        previous_month: {
          month: prevMonth,
          year: prevYear,
          net_revenue: prevNetRevenue,
        },
        growth_percentage: parseFloat(growthPercentage.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
