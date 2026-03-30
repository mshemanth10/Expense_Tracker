import { useEffect, useState } from "react";
import api from "../services/api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import Charts from "../components/Charts";
import Layout from "../layout/Layout";
import { toast } from "react-toastify";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const METRIC_THEMES = [
  { bg: "linear-gradient(135deg,#c4431a,#e85520)", icon: "💸", textColor: "#fff" },
  { bg: "linear-gradient(135deg,#7c3aed,#9f5cf7)", icon: "📅", textColor: "#fff" },
  { bg: "linear-gradient(135deg,#0891b2,#06b6d4)", icon: "📈", textColor: "#fff" },
  { bg: "linear-gradient(135deg,#059669,#10b981)", icon: "🏆", textColor: "#fff" },
];

const s = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  pageTitle: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "30px",
    color: "#111",
    margin: 0,
    fontWeight: 700,
  },
  pageSub: { fontSize: "13px", color: "#888", marginTop: "5px" },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  metricCard: {
    borderRadius: "16px",
    padding: "22px 24px",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  metricIcon: {
    fontSize: "22px",
    marginBottom: "10px",
    display: "block",
  },
  metricLabel: {
    fontSize: "11px",
    fontWeight: "600",
    opacity: 0.75,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  metricValue: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "26px",
    fontWeight: 700,
    lineHeight: 1,
    color: "#fff",
  },
  metricTag: {
    display: "inline-block",
    marginTop: "8px",
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
  },

  // AI card
  aiCard: {
    background: "linear-gradient(135deg, #111218 0%, #1e2033 100%)",
    borderRadius: "16px",
    padding: "22px 26px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    border: "1px solid rgba(196,67,26,0.25)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },
  aiIconWrap: {
    width: "40px", height: "40px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#c4431a,#e85520)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", flexShrink: 0,
  },
  aiTitle: {
    fontSize: "10px",
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  aiText: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.85)",
    lineHeight: "1.75",
    whiteSpace: "pre-line",
  },

  spinner: {
    display: "flex",
    justifyContent: "center",
    padding: "20px 0",
  },
};

function MetricCard({ label, value, tag, theme }) {
  return (
    <div style={{ ...s.metricCard, background: theme.bg }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.12)"; }}
    >
      <span style={s.metricIcon}>{theme.icon}</span>
      <div style={s.metricLabel}>{label}</div>
      <div style={s.metricValue}>{value}</div>
      {tag && <div style={s.metricTag}>{tag}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");

  // ── Fetch expenses ──────────────────────────────────────
  const fetchExpenses = () => {
    setLoading(true);
    api
      .get("/api/expenses/")
      .then((res) => setExpenses(res.data))
      .catch(() => {
        toast.error("Session expired. Please login again.");
        window.location = "/";
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
    api
      .get("/api/gemini-advisor/")
      .then((res) => setAiAdvice(res.data.insight))
      .catch(() => {});
  }, []);

  // ── Add / Update ────────────────────────────────────────
  const handleSubmit = (data) => {
    if (editingExpense) {
      api
        .put(`/api/expenses/${editingExpense.id}/`, data)
        .then(() => {
          toast.success("Expense updated");
          setEditingExpense(null);
          fetchExpenses();
        })
        .catch(() => toast.error("Failed to update expense"));
    } else {
      api
        .post("/api/expenses/", data)
        .then(() => {
          toast.success("Expense added");
          fetchExpenses();
        })
        .catch(() => toast.error("Failed to add expense"));
    }
  };

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = (id) => {
    if (!window.confirm("Delete this expense?")) return;
    api
      .delete(`/api/expenses/${id}/`)
      .then(() => {
        toast.success("Expense deleted");
        fetchExpenses();
      })
      .catch(() => toast.error("Failed to delete expense"));
  };

  // ── Metrics ─────────────────────────────────────────────
  const totalAmount = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const monthTotal = monthExpenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  // Top category this month
  const catTotals = {};
  monthExpenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + parseFloat(e.amount || 0);
  });
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  // ── Chart data ──────────────────────────────────────────
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount || 0);
  });

  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [{ data: Object.values(categoryTotals) }],
  };

  const monthlyTotals = {};
  expenses.forEach((e) => {
    const month = new Date(e.date).toLocaleString("default", { month: "short" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(e.amount || 0);
  });

  const barData = {
    labels: Object.keys(monthlyTotals),
    datasets: [{ label: "Monthly Spending", data: Object.values(monthlyTotals) }],
  };

  const username = localStorage.getItem("username") || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Layout>
      {loading && (
        <div style={s.spinner}><div className="spinner-border text-primary" /></div>
      )}

      {/* Header */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>{greeting}, {username} 👋</h1>
          <p style={s.pageSub}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — here's your financial summary
          </p>
        </div>
      </div>

      {/* Metric cards */}
      <div style={s.metricsGrid}>
        <MetricCard
          label="Total spent (all time)"
          value={`₹${totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          tag={`${expenses.length} transactions`}
          theme={METRIC_THEMES[0]}
        />
        <MetricCard
          label="This month"
          value={`₹${monthTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          tag={`${monthExpenses.length} transactions`}
          theme={METRIC_THEMES[1]}
        />
        <MetricCard
          label="Avg per transaction"
          value={expenses.length > 0
            ? `₹${(totalAmount / expenses.length).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
            : "₹0"}
          tag="overall"
          theme={METRIC_THEMES[2]}
        />
        <MetricCard
          label="Top category"
          value={topCat ? topCat[0].split(" ")[0] : "—"}
          tag={topCat ? `₹${topCat[1].toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "no data"}
          theme={METRIC_THEMES[3]}
        />
      </div>

      {aiAdvice && (
        <div style={s.aiCard}>
          <div style={s.aiIconWrap}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={s.aiTitle}>Gemini AI Advisor</div>
            <p style={s.aiText}>{aiAdvice}</p>
          </div>
        </div>
      )}

      {/* Expense Form (has its own Add button + modal) */}
      <ExpenseForm
        onSubmit={handleSubmit}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      {/* Expense Table */}
      <ExpenseTable
        expenses={expenses}
        onDelete={handleDelete}
        onEdit={setEditingExpense}
        search={search}
        setSearch={setSearch}
      />

      {/* Charts */}
      <Charts pieData={pieData} barData={barData} />
    </Layout>
  );
}