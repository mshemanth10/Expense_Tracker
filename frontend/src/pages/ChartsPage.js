import { useEffect, useState } from "react";
import api from "../services/api";
import Charts from "../components/Charts";
import Layout from "../layout/Layout";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ChartsPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/expenses/")
      .then((res) => setExpenses(res.data))
      .catch(() => { window.location = "/"; })
      .finally(() => setLoading(false));
  }, []);

  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount || 0);
  });

  const monthlyTotals = {};
  expenses.forEach((e) => {
    const month = new Date(e.date).toLocaleString("default", { month: "short", year: "2-digit" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + parseFloat(e.amount || 0);
  });

  const pieData = { labels: Object.keys(categoryTotals), datasets: [{ data: Object.values(categoryTotals) }] };
  const barData = { labels: Object.keys(monthlyTotals), datasets: [{ label: "Monthly Spending", data: Object.values(monthlyTotals) }] };

  // Summary stats
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const topCat = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const avgTx = expenses.length > 0 ? total / expenses.length : 0;

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "#111", margin: 0 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          Visual breakdown of your spending patterns
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Spent", value: `₹${total.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, bg: "linear-gradient(135deg,#c4431a,#e85520)", icon: "💸" },
              { label: "Top Category", value: topCat ? topCat[0] : "—", sub: topCat ? `₹${topCat[1].toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "", bg: "linear-gradient(135deg,#7c3aed,#9f5cf7)", icon: "🏆" },
              { label: "Avg Transaction", value: `₹${avgTx.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, bg: "linear-gradient(135deg,#0891b2,#06b6d4)", icon: "📊" },
            ].map((card) => (
              <div key={card.label} style={{ background: card.bg, borderRadius: 16, padding: "22px 24px", color: "#fff" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 26, fontWeight: 700 }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          {expenses.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 16, padding: 60, textAlign: "center", color: "#888" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#1a1814", marginBottom: 8 }}>No data yet</h3>
              <p style={{ fontSize: 14 }}>Add some expenses and your charts will appear here.</p>
            </div>
          ) : (
            <Charts pieData={pieData} barData={barData} />
          )}
        </>
      )}
    </Layout>
  );
}
