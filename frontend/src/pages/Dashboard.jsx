import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet,
  ArrowDownCircle,
  PiggyBank,
  RefreshCw,
  Receipt,
  Tag,
  ArrowRight,
  Plus,
  BarChart2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from "recharts";
import { styles, dashboardStyles as dash, trendStyles } from "../assets/dummyStyles";
import { CATEGORY_ICONS } from "../assets/color.jsx";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../assets/categories";
import api from "../utils/api";
import AddTransactionModal from "../components/AddTransactionModal";

const CATEGORY_COLORS = ["#0d9488", "#f97316", "#0891b2", "#8b5cf6", "#ec4899", "#f59e0b", "#14b8a6"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get("/dashboard");
      if (res.success) setData(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAddIncome = async (form) => {
    await api.post("/income/add", form);
    await fetchDashboard();
  };

  const handleAddExpense = async (form) => {
    await api.post("/expense/add", form);
    await fetchDashboard();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const { monthlyIncome = 0, monthlyExpense = 0, savings = 0, savingsRate = 0, recentTransactions = [], spendByCategory = {} } = data || {};

  const categoryList = Object.entries(spendByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div>
      <div className={dash.headerContainer}>
        <div className={dash.headerContent}>
          <div>
            <h1 className={dash.headerTitle}>Dashboard</h1>
            <p className={dash.headerSubtitle}>Your financial overview for this month</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIncomeModal(true)}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl transition-all shadow hover:shadow-md hover:-translate-y-0.5 font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Add Income
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl transition-all shadow hover:shadow-md hover:-translate-y-0.5 font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Add Expense
            </button>
            <button onClick={fetchDashboard} className="p-2 rounded-lg hover:bg-white/60 transition-colors">
              <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={styles.statCards.grid}
      >
        <div className={`${styles.statCards.card} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Monthly Income</p>
              <p className={styles.statCards.cardValue}>₹{monthlyIncome.toFixed(2)}</p>
            </div>
            <div className={`${dash.walletIconContainer} bg-gradient-to-br from-teal-100 to-teal-50`}>
              <Wallet className="w-5 h-5 text-teal-600" />
            </div>
          </div>
          <p className={styles.statCards.cardFooter}>Total income this month</p>
        </div>

        <div className={`${styles.statCards.card} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Monthly Expense</p>
              <p className={styles.statCards.cardValue}>₹{monthlyExpense.toFixed(2)}</p>
            </div>
            <div className={`${dash.arrowDownIconContainer} bg-gradient-to-br from-orange-100 to-orange-50`}>
              <ArrowDownCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className={styles.statCards.cardFooter}>Total spent this month</p>
        </div>

        <div className={`${styles.statCards.card} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Savings</p>
              <p className={styles.statCards.cardValue}>₹{savings.toFixed(2)}</p>
            </div>
            <div className={`${dash.piggyBankIconContainer} bg-gradient-to-br from-cyan-100 to-cyan-50`}>
              <PiggyBank className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <span className={`inline-block mt-3 px-2 py-1 rounded-lg text-xs ${savingsRate >= 0 ? trendStyles.positiveRate : trendStyles.negativeRate}`}>
            {savingsRate}% savings rate
          </span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={`${styles.cards.base} hover:shadow-md transition-shadow duration-300 mb-6`}
      >
        <div className={styles.cards.header}>
          <h2 className={styles.cards.title}>
            <BarChart2 className="w-6 h-6 text-teal-600" /> Income vs Expense
          </h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: "This Month", Income: monthlyIncome, Expense: monthlyExpense }]} barGap={24}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={dash.tooltipContent} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
              <Legend wrapperStyle={dash.legendWrapper} />
              <Bar dataKey="Income" fill="#0d9488" radius={[8, 8, 0, 0]} maxBarSize={80} />
              <Bar dataKey="Expense" fill="#f97316" radius={[8, 8, 0, 0]} maxBarSize={80} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={styles.grid.main}
      >
        <div className={styles.grid.leftColumn}>
          <div className={`${styles.cards.base} hover:shadow-md transition-shadow duration-300`}>
            <div className={styles.transactions.cardHeader}>
              <h2 className={styles.transactions.cardTitle}>
                <Receipt className="w-5 h-5 text-teal-600" /> Recent Transactions
              </h2>
            </div>

            {recentTransactions.length === 0 ? (
              <div className={styles.transactions.emptyState}>
                <div className={styles.transactions.emptyIconContainer}>
                  <Receipt className={styles.transactions.emptyIcon} />
                </div>
                <p className={styles.transactions.emptyText}>No transactions yet this month</p>
              </div>
            ) : (
              <div className={styles.transactions.listContainer}>
                {recentTransactions.map((t) => (
                  <div key={t._id} className={styles.transactions.transactionItem}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${styles.transactions.iconWrapper(t.type)}`}>
                        {CATEGORY_ICONS[t.category] || <Tag className={styles.transactions.icon} />}
                      </div>
                      <div className={styles.transactions.details}>
                        <p className={styles.transactions.description}>{t.description}</p>
                        <p className={styles.transactions.meta}>
                          {t.category} • {new Date(t.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={styles.transactions.amount(t.type)}>
                      {t.type === "expense" ? "-" : "+"}₹{Number(t.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className={`${styles.transactions.viewAllContainer} grid grid-cols-2 gap-2`}>
              <button onClick={() => navigate("/income")} className={styles.transactions.viewAllButton}>
                View Income <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/expense")} className={styles.transactions.viewAllButton}>
                View Expenses <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.grid.rightColumn}>
          <div className={`${styles.cards.base} hover:shadow-md transition-shadow duration-300`}>
            <h2 className={styles.categories.title}>
              <Tag className={styles.categories.titleIcon} /> Spending by Category
            </h2>

            {categoryList.length === 0 ? (
              <p className="text-sm text-gray-500">No expenses recorded this month</p>
            ) : (
              <>
                <div className="h-56 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryList} dataKey="amount" nameKey="category" innerRadius={40} outerRadius={70}>
                        {categoryList.map((_, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={dash.tooltipContent} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className={styles.categories.list}>
                  {categoryList.slice(0, 5).map(({ category, amount }) => (
                    <div key={category} className={styles.categories.categoryItem}>
                      <div className="flex items-center gap-2">
                        <div className={styles.categories.categoryIconContainer}>
                          {CATEGORY_ICONS[category] || <Tag className={styles.categories.categoryIcon} />}
                        </div>
                        <span className={styles.categories.categoryName}>{category}</span>
                      </div>
                      <span className={styles.categories.categoryAmount}>₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className={styles.categories.summaryContainer}>
              <div className={styles.categories.summaryGrid}>
                <div className={styles.categories.summaryIncomeCard}>
                  <p className={styles.categories.summaryTitle}>Income</p>
                  <p className={styles.categories.summaryValue}>₹{monthlyIncome.toFixed(2)}</p>
                </div>
                <div className={styles.categories.summaryExpenseCard}>
                  <p className={styles.categories.summaryTitle}>Expense</p>
                  <p className={styles.categories.summaryValue}>₹{monthlyExpense.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AddTransactionModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        onSubmit={handleAddIncome}
        type="income"
        categories={INCOME_CATEGORIES}
        title="Add Income"
      />
      <AddTransactionModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={handleAddExpense}
        type="expense"
        categories={EXPENSE_CATEGORIES}
        title="Add Expense"
      />
    </div>
  );
};

export default Dashboard;
