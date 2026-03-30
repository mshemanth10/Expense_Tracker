import { useEffect, useState } from "react";
import api from "../services/api";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseTable from "../components/ExpenseTable";
import Layout from "../layout/Layout";
import { toast } from "react-toastify";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExpenses = () => {
    setLoading(true);
    api.get("/api/expenses/")
      .then((res) => setExpenses(res.data))
      .catch(() => { toast.error("Session expired."); window.location = "/"; })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = (data) => {
    if (editingExpense) {
      api.put(`/api/expenses/${editingExpense.id}/`, data)
        .then(() => { toast.success("Expense updated"); setEditingExpense(null); fetchExpenses(); })
        .catch(() => toast.error("Failed to update"));
    } else {
      api.post("/api/expenses/", data)
        .then(() => { toast.success("Expense added"); fetchExpenses(); })
        .catch(() => toast.error("Failed to add expense"));
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this expense?")) return;
    api.delete(`/api/expenses/${id}/`)
      .then(() => { toast.success("Deleted"); fetchExpenses(); })
      .catch(() => toast.error("Failed to delete"));
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "#111", margin: 0 }}>
          Expenses
        </h1>
        <p style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          Manage and track all your expense entries
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
          <div className="spinner-border text-primary" />
        </div>
      )}

      <ExpenseForm
        onSubmit={handleSubmit}
        editingExpense={editingExpense}
        onCancelEdit={() => setEditingExpense(null)}
      />

      <ExpenseTable
        expenses={expenses}
        onDelete={handleDelete}
        onEdit={setEditingExpense}
        search={search}
        setSearch={setSearch}
      />
    </Layout>
  );
}
