import React, { useState } from "react";
import { X } from "lucide-react";
import { modalStyles as s } from "../assets/dummyStyles";

const DESCRIPTION_EXAMPLES = {
  income: {
    Salary: "e.g. October salary",
    Freelance: "e.g. Freelance project payment",
    Business: "e.g. Monthly business revenue",
    Investment: "e.g. Stock dividend",
    Gift: "e.g. Birthday gift from family",
    Other: "e.g. Refund",
  },
  expense: {
    Food: "e.g. Grocery shopping",
    Housing: "e.g. Monthly rent",
    Transport: "e.g. Fuel top-up",
    Shopping: "e.g. New shoes",
    Entertainment: "e.g. Movie night",
    Utilities: "e.g. Electricity bill",
    Healthcare: "e.g. Doctor visit",
    Other: "e.g. Miscellaneous expense",
  },
};

const AddTransactionModal = ({ isOpen, onClose, onSubmit, type, categories, title }) => {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: categories[0],
    date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const theme = type === "income" ? s.colorClasses.teal : s.colorClasses.orange;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>{title}</h2>
          <button onClick={onClose} className={s.closeButton}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div>
            <label className={s.label}>Description</label>
            <input
              type="text"
              name="description"
              required
              value={form.description}
              onChange={handleChange}
              className={s.input(theme.ring)}
              placeholder={
                DESCRIPTION_EXAMPLES[type]?.[form.category] ||
                (type === "income" ? "e.g. Monthly salary" : "e.g. Grocery shopping")
              }
            />
          </div>

          <div>
            <label className={s.label}>Amount</label>
            <input
              type="number"
              name="amount"
              required
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              className={s.input(theme.ring)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className={s.label}>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={s.input(theme.ring)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={s.label}>Date</label>
            <input
              type="date"
              name="date"
              required
              value={form.date}
              onChange={handleChange}
              className={s.input(theme.ring)}
            />
          </div>

          <button type="submit" disabled={submitting} className={s.submitButton(theme.button)}>
            {submitting ? "Saving..." : `Add ${type === "income" ? "Income" : "Expense"}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
