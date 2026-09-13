import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Plus, Wallet, TrendingDown, Hash, Download, ShoppingBag } from "lucide-react";
import { expensePageStyles as exp, dashboardStyles as dash, styles } from "../assets/dummyStyles";
import { EXPENSE_CATEGORY_ICONS, colorClasses } from "../assets/color.jsx";
import api from "../utils/api";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionItem from "../components/TransactionItem";
import { EXPENSE_CATEGORIES as CATEGORIES } from "../assets/categories";

const RANGES = ["daily", "weekly", "monthly", "yearly"];
const EXPENSE_COLORS = ["#f97316", "#ea580c", "#fb923c", "#fdba74", "#f59e0b", "#d97706", "#facc15", "#eab308"];

const Expense = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalExpense: 0, averageExpense: 0, numberOfTransactions: 0 });
  const [range, setRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchExpenses = useCallback(async () => {
    const { data } = await api.get("/expense/get");
    setExpenses(data);
  }, []);

  const fetchOverview = useCallback(async (r) => {
    const { data } = await api.get(`/expense/overview?range=${r}`);
    if (data.success) setSummary(data.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchExpenses(), fetchOverview(range)]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleAdd = async (form) => {
    await api.post("/expense/add", form);
    await Promise.all([fetchExpenses(), fetchOverview(range)]);
  };

  const handleDelete = async (id) => {
    await api.delete(`/expense/delete/${id}`);
    await Promise.all([fetchExpenses(), fetchOverview(range)]);
  };

  const handleUpdate = async (id, form) => {
    await api.put(`/expense/update/${id}`, form);
    await Promise.all([fetchExpenses(), fetchOverview(range)]);
  };

  const handleExport = async () => {
    const res = await api.get("/expense/downloadexcel", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "expense_details.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const categoryData = Object.values(
    expenses.reduce((acc, cur) => {
      acc[cur.category] = acc[cur.category] || { name: cur.category, value: 0 };
      acc[cur.category].value += Number(cur.amount);
      return acc;
    }, {}),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={exp.container}
    >
      <div className={exp.headerCard}>
        <div className={exp.headerContainer}>
          <div>
            <h1 className={exp.headerTitle}>Expenses</h1>
            <p className={exp.headerSubtitle}>Track and manage where your money goes</p>
          </div>
          <button onClick={() => setShowModal(true)} className={exp.addButton}>
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>

        <div className={exp.timeframePositioning}>
          <div className={dash.timeFrameWrapper}>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={dash.timeFrameButton(range === r)}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={exp.cardsGrid}>
        <div className={`${styles.statCards.card} ${exp.borderOrange} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Total Expense</p>
              <p className={styles.statCards.cardValue}>₹{summary.totalExpense.toFixed(2)}</p>
            </div>
            <div className={`${exp.iconOrange} bg-gradient-to-br from-orange-100 to-orange-50`}>
              <Wallet className={`w-5 h-5 ${exp.textOrange}`} />
            </div>
          </div>
        </div>
        <div className={`${styles.statCards.card} ${exp.borderAmber} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Average Expense</p>
              <p className={styles.statCards.cardValue}>₹{summary.averageExpense.toFixed(2)}</p>
            </div>
            <div className={`${exp.iconAmber} bg-gradient-to-br from-amber-100 to-amber-50`}>
              <TrendingDown className={`w-5 h-5 ${exp.textAmber}`} />
            </div>
          </div>
        </div>
        <div className={`${styles.statCards.card} ${exp.borderYellow} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Transactions</p>
              <p className={styles.statCards.cardValue}>{summary.numberOfTransactions}</p>
            </div>
            <div className={`${exp.iconYellow} bg-gradient-to-br from-yellow-100 to-yellow-50`}>
              <Hash className={`w-5 h-5 ${exp.textYellow}`} />
            </div>
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className={`${exp.chartContainer} hover:shadow-md transition-shadow duration-300`}>
          <div className={exp.chartHeader}>
            <h2 className={exp.chartTitle}>
              <ShoppingBag className="w-5 h-5 text-orange-600" /> Spending by Category
            </h2>
            <button onClick={handleExport} className={exp.chartExportButton}>
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
          <div className={exp.chartHeight}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={exp.tooltipContent} />
                <Legend wrapperStyle={dash.legendWrapper} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className={`${exp.transactionsContainer} hover:shadow-md transition-shadow duration-300`}>
        <div className={exp.transactionsHeader}>
          <h2 className={exp.transactionsTitle}>All Expenses</h2>
        </div>

        {!loading && expenses.length === 0 && (
          <div className={exp.emptyState}>
            <div className={exp.emptyStateIcon}>
              <ShoppingBag className="w-6 h-6 text-orange-500" />
            </div>
            <p className={exp.emptyStateText}>No expenses recorded yet</p>
            <p className={exp.emptyStateSubtext}>Add your first expense to get started</p>
          </div>
        )}

        <div className={exp.transactionsList}>
          {expenses.map((expense) => (
            <TransactionItem
              key={expense._id}
              transaction={expense}
              classes={colorClasses.expense}
              icon={EXPENSE_CATEGORY_ICONS[expense.category] || EXPENSE_CATEGORY_ICONS.Other}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {expenses.length > 0 && (
          <button onClick={handleExport} className={exp.viewAllButton}>
            <Download className="w-4 h-4" /> Export to Excel
          </button>
        )}
      </div>

      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAdd}
        type="expense"
        categories={CATEGORIES}
        title="Add Expense"
      />
    </motion.div>
  );
};

export default Expense;
