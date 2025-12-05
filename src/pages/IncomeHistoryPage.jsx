import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function IncomeHistoryPage() {
  const [profile, setProfile] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "", category: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const navigate = useNavigate();

  const fetchIncomes = () => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/transactions/incomes", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setIncomes(res.data))
        .catch(err => console.log("Failed to fetch incomes"));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setProfile(res.data))
        .catch(err => setProfile({ name: "User", email: "user@example.com" }));

      fetchIncomes();
    }
  }, []);

  const handleEdit = (income) => {
    setEditingTransaction(income);
    setEditForm({
      amount: income.amount.toString(),
      description: income.description,
      category: income.category
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.put(`/transactions/income/${editingTransaction.id}`, {
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        category: editForm.category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Income updated successfully!");
      setEditingTransaction(null);
      fetchIncomes();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update income");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        const token = localStorage.getItem("token");
        await API.delete(`/transactions/income/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess("Income deleted successfully!");
        fetchIncomes();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete income");
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const deleteAllIncomes = async () => {
    try {
      const token = localStorage.getItem("token");
      for (const income of incomes) {
        await API.delete(`/transactions/income/${income.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setSuccess("All incomes deleted successfully!");
      setIncomes([]);
      setConfirmDeleteAll(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Error deleting all incomes");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditForm({ amount: "", description: "", category: "" });
  };

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

  if (!profile) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ color: "#A084E8", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  return (
    <>
      <Sidebar />
      <div style={{
        marginLeft: "280px",
        minHeight: "100vh",
        background: "#E8EAF6",
        padding: "20px"
      }}>
        <Navbar profile={profile} />
        <div style={{ maxWidth: "900px", margin: "20px auto 0" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              style={{
                background: "transparent",
                border: "none",
                color: "#A084E8",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "20px"
              }}
            >
              ← Back to Transactions
            </button>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", marginBottom: "8px" }}>
              <h1 style={{ color: "#00B894", fontSize: "32px", fontWeight: "700", margin: 0 }}>
                Income History
              </h1>
              {incomes.length > 0 && (
                <button
                  onClick={() => setConfirmDeleteAll(true)}
                  style={{
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px"
                  }}
                >
                  Delete All
                </button>
              )}
            </div>
            <p style={{ color: "#8B8B8B", margin: 0 }}>Track all your income transactions</p>
          </div>

          {success && (
            <div style={{
              background: "rgba(0, 184, 148, 0.1)",
              color: "#00B894",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center"
            }}>{success}</div>
          )}

          {error && (
            <div style={{
              background: "rgba(255, 107, 107, 0.1)",
              color: "#D63031",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center"
            }}>{error}</div>
          )}

          {/* Total Income Card */}
          <div style={{
            background: "rgba(0, 184, 148, 0.1)",
            padding: "30px",
            borderRadius: "16px",
            border: "2px solid rgba(0, 184, 148, 0.2)",
            textAlign: "center",
            marginBottom: "30px"
          }}>
            <h3 style={{ color: "#00B894", margin: "0 0 8px 0" }}>Total Income</h3>
            <p style={{ color: "#00B894", fontSize: "32px", fontWeight: "700", margin: 0 }}>
              ₹{totalIncome.toFixed(2)}
            </p>
            <p style={{ color: "#666", margin: "8px 0 0 0" }}>{incomes.length} transactions</p>
          </div>

          {/* Income List */}
          <div style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(231, 221, 255, 0.3)",
            border: "1px solid rgba(231, 221, 255, 0.5)"
          }}>
            {incomes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p style={{ color: "#8B8B8B", fontSize: "18px", margin: "0 0 20px 0" }}>No income records found</p>
                <button
                  onClick={() => navigate("/add-transaction")}
                  style={{
                    background: "linear-gradient(135deg, #00B894, #00A085)",
                    color: "white",
                    padding: "12px 24px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  Add Your First Income
                </button>
              </div>
            ) : (
              incomes.map((income, index) => (
                <div key={index} style={{
                  background: "rgba(0, 184, 148, 0.05)",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  border: "1px solid rgba(0, 184, 148, 0.1)"
                }}>
                  {editingTransaction && editingTransaction.id === income.id ? (
                    <div>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                        style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                        placeholder="Amount"
                      />
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "8px" }}
                        placeholder="Description"
                      />
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "8px" }}
                      >
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Business">Business</option>
                        <option value="Investment">Investment</option>
                        <option value="Other">Other</option>
                      </select>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={handleSaveEdit} style={{ 
                          padding: "10px 20px", 
                          background: "#00B894", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "8px", 
                          cursor: "pointer",
                          flex: 1
                        }}>Save</button>
                        <button onClick={handleCancelEdit} style={{ 
                          padding: "10px 20px", 
                          background: "#666", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "8px", 
                          cursor: "pointer",
                          flex: 1
                        }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div>
                          <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#333", fontSize: "18px" }}>
                            {income.description}
                          </p>
                          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                            {income.category} • {income.transactionDate || new Date(income.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p style={{ margin: 0, fontWeight: "700", color: "#00B894", fontSize: "20px" }}>
                          +₹{income.amount}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleEdit(income)}
                          style={{ 
                            padding: "8px 16px", 
                            background: "#A084E8", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontSize: "14px" 
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(income.id)}
                          style={{ 
                            padding: "8px 16px", 
                            background: "#FF6B6B", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontSize: "14px" 
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Income Button */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              onClick={() => navigate("/add-transaction")}
              style={{
                background: "linear-gradient(135deg, #00B894, #00A085)",
                color: "white",
                padding: "16px 32px",
                border: "none",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0, 184, 148, 0.3)"
              }}
            >
              + Add New Income
            </button>
          </div>

          {/* Delete All Confirmation */}
          {confirmDeleteAll && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000
            }}>
              <div style={{
                background: "white",
                padding: "30px",
                borderRadius: "16px",
                width: "400px",
                maxWidth: "90vw",
                textAlign: "center"
              }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Delete All Income Records</h3>
                <p style={{ margin: "0 0 20px 0", color: "#666" }}>Are you sure you want to delete all {incomes.length} income records? This action cannot be undone.</p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <button onClick={deleteAllIncomes} style={{
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}>
                    Delete All
                  </button>
                  <button onClick={() => setConfirmDeleteAll(false)} style={{
                    background: "#ccc",
                    color: "#333",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default IncomeHistoryPage;