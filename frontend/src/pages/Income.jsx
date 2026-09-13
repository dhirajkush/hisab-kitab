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
import { Plus, Wallet, TrendingUp, Hash, Download, PiggyBank } from "lucide-react";
import { incomeStyles as inc, dashboardStyles as dash, styles } from "../assets/dummyStyles";
import { INCOME_CATEGORY_ICONS, INCOME_COLORS, colorClasses } from "../assets/color.jsx";
import api from "../utils/api";
import AddTransactionModal from "../components/AddTransactionModal";
import TransactionItem from "../components/TransactionItem";
import { INCOME_CATEGORIES as CATEGORIES } from "../assets/categories";

const RANGES = ["daily", "weekly", "monthly", "yearly"];

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, averageIncome: 0, numberOfTransactions: 0 });
  const [range, setRange] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchIncomes = useCallback(async () => {
    const { data } = await api.get("/income/get");
    setIncomes(data);
  }, []);

  const fetchOverview = useCallback(async (r) => {
    const { data } = await api.get(`/income/overview?range=${r}`);
    if (data.success) setSummary(data.data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchIncomes(), fetchOverview(range)]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleAdd = async (form) => {
    await api.post("/income/add", form);
    await Promise.all([fetchIncomes(), fetchOverview(range)]);
  };

  const handleDelete = async (id) => {
    await api.delete(`/income/delete/${id}`);
    await Promise.all([fetchIncomes(), fetchOverview(range)]);
  };

  const handleUpdate = async (id, form) => {
    await api.put(`/income/update/${id}`, form);
    await Promise.all([fetchIncomes(), fetchOverview(range)]);
  };

  const handleExport = async () => {
    const res = await api.get("/income/downloadexcel", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "income_details.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const categoryData = Object.values(
    incomes.reduce((acc, cur) => {
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
      className={inc.wrapper}
    >
      <div className={inc.headerContainer}>
        <div className={inc.header}>
          <div>
            <h1 className={inc.headerTitle}>Income</h1>
            <p className={inc.headerSubtitle}>Track and manage every source of income</p>
          </div>
          <button onClick={() => setShowModal(true)} className={inc.addButton}>
            <Plus className="w-4 h-4" /> Add Income
          </button>
        </div>

        <div className={dash.timeFrameContainer}>
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

      <div className={inc.summaryGrid}>
        <div className={`${styles.statCards.card} ${inc.borderGreen} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Total Income</p>
              <p className={styles.statCards.cardValue}>₹{summary.totalIncome.toFixed(2)}</p>
            </div>
            <div className={`${inc.iconGreen} bg-gradient-to-br from-green-100 to-green-50`}>
              <Wallet className={`w-5 h-5 ${inc.textGreen}`} />
            </div>
          </div>
        </div>
        <div className={`${styles.statCards.card} ${inc.borderBlue} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Average Income</p>
              <p className={styles.statCards.cardValue}>₹{summary.averageIncome.toFixed(2)}</p>
            </div>
            <div className={`${inc.iconBlue} bg-gradient-to-br from-blue-100 to-blue-50`}>
              <TrendingUp className={`w-5 h-5 ${inc.textBlue}`} />
            </div>
          </div>
        </div>
        <div className={`${styles.statCards.card} ${inc.borderPurple} hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Transactions</p>
              <p className={styles.statCards.cardValue}>{summary.numberOfTransactions}</p>
            </div>
            <div className={`${inc.iconPurple} bg-gradient-to-br from-purple-100 to-purple-50`}>
              <Hash className={`w-5 h-5 ${inc.textPurple}`} />
            </div>
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className={`${inc.chartContainer} hover:shadow-md transition-shadow duration-300`}>
          <div className={inc.chartHeaderContainer}>
            <h2 className={inc.chartTitle}>
              <PiggyBank className="w-5 h-5 text-green-600" /> Income by Category
            </h2>
          </div>
          <div className={inc.chartHeight}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={INCOME_COLORS[i % INCOME_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={inc.tooltipContent} />
                <Legend wrapperStyle={dash.legendWrapper} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className={`${inc.listContainer} hover:shadow-md transition-shadow duration-300`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={inc.sectionTitle}>All Income</h2>
        </div>

        {!loading && incomes.length === 0 && (
          <div className={inc.emptyStateContainer}>
            <div className={inc.emptyStateIcon}>
              <PiggyBank className="w-6 h-6 text-green-500" />
            </div>
            <p className={inc.emptyStateText}>No income recorded yet</p>
            <p className={inc.emptyStateSubtext}>Add your first income to get started</p>
            <button onClick={() => setShowModal(true)} className={inc.emptyStateButton}>
              <Plus className="w-4 h-4" /> Add Income
            </button>
          </div>
        )}

        <div className={inc.transactionList}>
          {incomes.map((income) => (
            <TransactionItem
              key={income._id}
              transaction={income}
              classes={colorClasses.income}
              icon={INCOME_CATEGORY_ICONS[income.category] || INCOME_CATEGORY_ICONS.Other}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        {incomes.length > 0 && (
          <button onClick={handleExport} className={inc.viewAllButton}>
            <Download className="w-4 h-4" /> Export to Excel
          </button>
        )}
      </div>

      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAdd}
        type="income"
        categories={CATEGORIES}
        title="Add Income"
      />
    </motion.div>
  );
};

export default Income;
