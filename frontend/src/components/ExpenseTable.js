import { useState } from "react";

const CATEGORY_STYLES = {
  "Food & Dining": { background: "#fef3e2", color: "#8a5200" },
  "Travel":        { background: "#e5f0fb", color: "#0c447c" },
  "Health":        { background: "#e5f5ec", color: "#0f5e38" },
  "Shopping":      { background: "#f0e8fb", color: "#4a2d8a" },
  "Bills & Utilities": { background: "#faeae4", color: "#8a2e10" },
  "Entertainment": { background: "#fbeaf0", color: "#72243e" },
  "Education":     { background: "#e1f5ee", color: "#085041" },
  "Other":         { background: "#f1efe8", color: "#444441" },
};

const ALL_CATEGORIES = ["All", ...Object.keys(CATEGORY_STYLES)];

const s = {
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(30,25,20,0.1)",
    padding: "24px",
    marginTop: "24px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    color: "#1a1814",
    margin: 0,
  },
  filterBar: { display: "flex", gap: "6px", flexWrap: "wrap" },
  filterBtn: {
    padding: "5px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    border: "1px solid rgba(30,25,20,0.15)",
    background: "#fff",
    cursor: "pointer",
    color: "#7a7670",
    transition: "all 0.12s",
  },
  filterBtnActive: {
    background: "#1a1814",
    color: "#fff",
    borderColor: "#1a1814",
  },
  searchBox: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid rgba(30,25,20,0.12)",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "13px",
    color: "#1a1814",
    background: "#f7f5f0",
    outline: "none",
    marginBottom: "16px",
    boxSizing: "border-box",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    fontSize: "11px",
    fontWeight: "500",
    color: "#7a7670",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0 12px 12px",
    borderBottom: "1px solid rgba(30,25,20,0.1)",
  },
  td: {
    padding: "14px 12px",
    fontSize: "13px",
    color: "#1a1814",
    borderBottom: "1px solid rgba(30,25,20,0.07)",
  },
  pill: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "500",
  },
  amountNeg: { fontWeight: "500", color: "#c4431a" },
  amountPos: { fontWeight: "500", color: "#1d6b43" },
  actionBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#b4b2a9",
    fontSize: "13px",
    padding: "4px 6px",
    borderRadius: "4px",
    transition: "color 0.12s",
  },
  empty: {
    textAlign: "center",
    padding: "40px 0",
    color: "#7a7670",
    fontSize: "13px",
  },
  summary: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "24px",
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(30,25,20,0.08)",
    fontSize: "13px",
  },
};

export default function ExpenseTable({ expenses = [], onDelete, onEdit, search, setSearch }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      !search ||
      (e.title || e.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.category || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || e.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const total = filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const getCategoryStyle = (cat) =>
    CATEGORY_STYLES[cat] || { background: "#f1efe8", color: "#444441" };

  return (
    <div style={s.card} id="expenses">
      {/* Header */}
      <div style={s.header}>
        <h2 style={s.title}>Recent Expenses</h2>
        <div style={s.filterBar}>
          {ALL_CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              style={{
                ...s.filterBtn,
                ...(activeFilter === cat ? s.filterBtnActive : {}),
              }}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <input
        style={s.searchBox}
        placeholder="Search expenses by name or category..."
        value={search}
        onChange={(e) => setSearch && setSearch(e.target.value)}
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={s.empty}>No expenses found.</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Description</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Method</th>
              <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((expense, i) => {
              const isLast = i === filtered.length - 1;
              const catStyle = getCategoryStyle(expense.category);
              const amount = parseFloat(expense.amount || 0);
              return (
                <tr key={expense.id || i}>
                  <td style={{ ...s.td, ...(isLast ? { borderBottom: "none" } : {}) }}>
                    <span style={{ fontWeight: "500" }}>
                      {expense.title || expense.description || "—"}
                    </span>
                    {expense.notes && (
                      <div style={{ fontSize: "11px", color: "#7a7670", marginTop: "2px" }}>
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ ...s.td, ...(isLast ? { borderBottom: "none" } : {}) }}>
                    <span style={{ ...s.pill, ...catStyle }}>
                      {expense.category || "Other"}
                    </span>
                  </td>
                  <td style={{ ...s.td, color: "#7a7670", ...(isLast ? { borderBottom: "none" } : {}) }}>
                    {expense.date
                      ? new Date(expense.date).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td style={{ ...s.td, color: "#7a7670", ...(isLast ? { borderBottom: "none" } : {}) }}>
                    {expense.payment_method || "—"}
                  </td>
                  <td style={{ ...s.td, textAlign: "right", ...(isLast ? { borderBottom: "none" } : {}) }}>
                    <span style={amount >= 0 ? s.amountNeg : s.amountPos}>
                      {amount >= 0 ? "−" : "+"}₹{Math.abs(amount).toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td style={{ ...s.td, ...(isLast ? { borderBottom: "none" } : {}) }}>
                    <button
                      style={s.actionBtn}
                      title="Edit"
                      onClick={() => onEdit && onEdit(expense)}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#1a1814")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#b4b2a9")}
                    >
                      ✎
                    </button>
                    <button
                      style={{ ...s.actionBtn, marginLeft: "4px" }}
                      title="Delete"
                      onClick={() => onDelete && onDelete(expense.id)}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#c4431a")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#b4b2a9")}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Summary */}
      {filtered.length > 0 && (
        <div style={s.summary}>
          <span style={{ color: "#7a7670" }}>{filtered.length} transactions</span>
          <span style={{ fontWeight: "500" }}>
            Total: <span style={{ color: "#c4431a" }}>₹{total.toLocaleString("en-IN")}</span>
          </span>
        </div>
      )}
    </div>
  );
}