import { useState, useEffect } from "react";

const CATEGORIES = [
  "Food & Dining",
  "Travel",
  "Health",
  "Shopping",
  "Bills & Utilities",
  "Entertainment",
  "Education",
  "Other",
];

const PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Cash", "Net Banking"];

const s = {
  // Trigger button
  triggerBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "#c4431a",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "24px",
  },
  // Overlay
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20,15,10,0.55)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modal: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "440px",
    border: "1px solid rgba(30,25,20,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "22px",
    color: "#1a1814",
    marginBottom: "4px",
  },
  modalSub: {
    fontSize: "13px",
    color: "#7a7670",
    marginBottom: "24px",
  },
  formGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: "500",
    color: "#7a7670",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid rgba(30,25,20,0.15)",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "14px",
    color: "#1a1814",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  select: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid rgba(30,25,20,0.15)",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "14px",
    color: "#1a1814",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  actions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  cancelBtn: {
    padding: "10px 18px",
    background: "none",
    border: "1px solid rgba(30,25,20,0.15)",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "13px",
    color: "#7a7670",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "#c4431a",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontFamily: "inherit",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "Food & Dining",
    payment_method: "UPI",
    notes: "",
  });

  // When editing, open modal and fill form
  useEffect(() => {
    if (editingExpense) {
      setForm({
        title: editingExpense.title || editingExpense.description || "",
        amount: editingExpense.amount || "",
        date: editingExpense.date || new Date().toISOString().split("T")[0],
        category: editingExpense.category || "Food & Dining",
        payment_method: editingExpense.payment_method || "UPI",
        notes: editingExpense.notes || "",
      });
      setOpen(true);
    }
  }, [editingExpense]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.title || !form.amount || !form.date) return;
    onSubmit(form);
    setOpen(false);
    setForm({
      title: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category: "Food & Dining",
      payment_method: "UPI",
      notes: "",
    });
  };

  const handleClose = () => {
    setOpen(false);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <>
      {/* Open button — only show when NOT triggered by edit */}
      {!editingExpense && (
        <button style={s.triggerBtn} onClick={() => setOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Expense
        </button>
      )}

      {/* Modal */}
      {open && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </h2>
            <p style={s.modalSub}>
              {editingExpense ? "Update the expense details below" : "Record a new transaction"}
            </p>

            {/* Description */}
            <div style={s.formGroup}>
              <label style={s.label}>Description</label>
              <input
                style={s.input}
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Swiggy order"
                onFocus={(e) => (e.target.style.borderColor = "#c4431a")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(30,25,20,0.15)")}
              />
            </div>

            {/* Amount + Date */}
            <div style={s.formRow}>
              <div style={s.formGroup}>
                <label style={s.label}>Amount (₹)</label>
                <input
                  style={s.input}
                  name="amount"
                  type="number"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  onFocus={(e) => (e.target.style.borderColor = "#c4431a")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(30,25,20,0.15)")}
                />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Date</label>
                <input
                  style={s.input}
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  onFocus={(e) => (e.target.style.borderColor = "#c4431a")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(30,25,20,0.15)")}
                />
              </div>
            </div>

            {/* Category */}
            <div style={s.formGroup}>
              <label style={s.label}>Category</label>
              <select style={s.select} name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Payment Method */}
            <div style={s.formGroup}>
              <label style={s.label}>Payment Method</label>
              <select style={s.select} name="payment_method" value={form.payment_method} onChange={handleChange}>
                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div style={s.formGroup}>
              <label style={s.label}>Notes (optional)</label>
              <input
                style={s.input}
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add a note..."
                onFocus={(e) => (e.target.style.borderColor = "#c4431a")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(30,25,20,0.15)")}
              />
            </div>

            <div style={s.actions}>
              <button style={s.cancelBtn} onClick={handleClose}>Cancel</button>
              <button style={s.submitBtn} onClick={handleSubmit}>
                {editingExpense ? "Update Expense" : "Save Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}