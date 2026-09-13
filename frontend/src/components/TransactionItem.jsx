import React, { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { transactionItemStyles as s } from "../assets/dummyStyles";

const TransactionItem = ({ transaction, classes, icon, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    description: transaction.description,
    amount: transaction.amount,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setForm({ description: transaction.description, amount: transaction.amount });
    setError("");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!form.description.trim() || form.amount === "" || Number(form.amount) < 0) {
      setError("Enter a valid description and amount");
      return;
    }
    setSaving(true);
    try {
      await onUpdate(transaction._id, {
        description: form.description,
        amount: Number(form.amount),
      });
      setIsEditing(false);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={s.container(isEditing, classes)}>
      <div className={s.mainContainer}>
        <div className={s.iconContainer("p-2 rounded-lg", classes)}>{icon}</div>
        <div className={s.contentContainer}>
          {isEditing ? (
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={s.input(!!error, classes)}
            />
          ) : (
            <>
              <p className={s.description}>{transaction.description}</p>
              <p className={s.details}>
                {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
              </p>
            </>
          )}
        </div>
      </div>

      <div className={s.actionsContainer}>
        {isEditing ? (
          <div className={s.amountContainer}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={s.amountInput(!!error, classes)}
            />
          </div>
        ) : (
          <div className={s.amountContainer}>
            <span className={s.amountText("font-bold", classes)}>
              {transaction.type === "expense" ? "-" : "+"}₹{Number(transaction.amount).toFixed(2)}
            </span>
          </div>
        )}

        <div className={s.buttonsContainer}>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={s.saveButton(classes)}
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={s.cancelButton}
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={startEdit} className={s.editButton(classes)} title="Edit">
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(transaction._id)}
                className={s.deleteButton(classes)}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      {isEditing && error && <p className={s.errorText}>{error}</p>}
    </div>
  );
};

export default TransactionItem;
