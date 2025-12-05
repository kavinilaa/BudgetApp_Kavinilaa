import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from '../contexts/ThemeContext';

function BudgetPage() {
  const { colors } = useTheme();
  const [profile, setProfile] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    budgetAmount: "",
    month: currentMonth,
    year: currentYear
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/user/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProfile(res.data))
        .catch(() => setProfile({ name: "User" }));
      
      loadBudgets();
    }
  }, []);

  const loadBudgets = () => {
    const token = localStorage.getItem("token");
    API.get(`/budget/monthly/${currentMonth}/${currentYear}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      console.log("Budgets loaded:", res.data);
      setBudgets(res.data || []);
    }).catch(err => {
      console.error("Error loading budgets:", err);
      setBudgets([]);
    });
  };

  const syncBudgets = () => {
    const token = localStorage.getItem("token");
    API.post("/budget/sync", {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      loadBudgets();
      alert("Budget synced with expenses successfully!");
    }).catch(err => console.log(err));
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const budgetData = {
      category: budgetForm.category,
      budgetAmount: parseFloat(budgetForm.budgetAmount),
      month: parseInt(budgetForm.month),
      year: parseInt(budgetForm.year)
    };
    
    const url = editingBudget ? `/budget/update/${editingBudget.id}` : "/budget/set";
    const method = editingBudget ? "put" : "post";
    
    API[method](url, budgetData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      alert(editingBudget ? "Budget updated successfully!" : "Budget set successfully!");
      setShowBudgetForm(false);
      setEditingBudget(null);
      setBudgetForm({ category: "", budgetAmount: "", month: currentMonth, year: currentYear });
      loadBudgets();
    }).catch(err => {
      console.error("Budget error:", err);
      alert("Error with budget. Please check console for details.");
    });
  };

  const editBudget = (budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      category: budget.category,
      budgetAmount: budget.budgetAmount.toString(),
      month: budget.month,
      year: budget.year
    });
    setShowBudgetForm(true);
  };

  const deleteBudget = (id) => {
    setConfirmDelete({ type: 'budget', id, message: 'Are you sure you want to delete this budget?' });
  };

  const confirmDeleteAction = () => {
    const token = localStorage.getItem("token");
    const { id } = confirmDelete;
    
    API.delete(`/budget/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert("Budget deleted successfully!");
      loadBudgets();
    }).catch(err => {
      console.error("Delete error:", err);
      alert("Error deleting budget.");
    });
    setConfirmDelete(null);
  };

  const deleteAllBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      for (const budget of budgets) {
        await API.delete(`/budget/delete/${budget.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setBudgets([]);
      setConfirmDeleteAll(false);
      alert("All budgets deleted successfully!");
    } catch (error) {
      console.error("Error deleting all budgets:", error);
      alert("Error deleting all budgets");
    }
  };

  const categories = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare", "Other"];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <Navbar profile={profile} title="Budget" />
        <div style={{
          padding: '30px',
          background: colors.background,
          minHeight: 'calc(100vh - 80px)'
        }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", paddingTop: "20px" }}>
          <h1 style={{ 
            color: "#1A237E", 
            textAlign: "center", 
            marginBottom: "30px",
            fontSize: "32px",
            fontWeight: "700"
          }}>Monthly Budget</h1>
          
          {/* Budget Section */}
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            marginBottom: "30px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ 
                color: "#5C6BC0", 
                margin: 0,
                fontSize: "22px",
                fontWeight: "600"
              }}>Monthly Budget ({new Date().toLocaleString('default', { month: 'long' })} {currentYear})</h2>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                {budgets.length > 0 && (
                  <button
                    onClick={() => setConfirmDeleteAll(true)}
                    style={{
                      background: "#F44336",
                      color: "white",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#D32F2F"}
                    onMouseLeave={(e) => e.target.style.background = "#F44336"}
                  >
                    Delete All
                  </button>
                )}
                <button
                  onClick={syncBudgets}
                  style={{
                    background: "#26A69A",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(38, 166, 154, 0.3)"
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#00897B"}
                  onMouseLeave={(e) => e.target.style.background = "#26A69A"}
                >
                  🔄 Sync
                </button>
                <button
                  onClick={() => setShowBudgetForm(true)}
                  style={{
                    background: "linear-gradient(135deg, #7E57C2, #673AB7)",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(126, 87, 194, 0.3)"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
                  onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
                >
                  + Set Budget
                </button>
              </div>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {budgets.map(budget => {
                const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
                return (
                  <div key={budget.id} 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({type: 'budget', item: budget});
                      setShowDetailModal(true);
                    }}
                    style={{
                      border: "1px solid #e1e5e9",
                      borderRadius: "12px",
                      padding: "20px",
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.01)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h3 style={{ margin: 0, color: "#333" }}>{budget.category}</h3>
                    </div>
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      Budget: ₹{budget.budgetAmount} | Spent: ₹{budget.spentAmount}
                    </p>
                    <div style={{
                      background: "#f0f0f0",
                      borderRadius: "10px",
                      height: "10px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        background: percentage > 90 ? "#ff6b6b" : percentage > 70 ? "#ffa726" : "#4caf50",
                        height: "100%",
                        width: `${Math.min(percentage, 100)}%`,
                        transition: "width 0.3s ease"
                      }}></div>
                    </div>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                      {percentage.toFixed(1)}% used
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Budget Form Modal */}
        {showBudgetForm && (
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
            <form onSubmit={handleBudgetSubmit} style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              width: "400px",
              maxWidth: "90vw"
            }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>{editingBudget ? "Edit Budget" : "Set Monthly Budget"}</h3>
              <select
                value={budgetForm.category}
                onChange={(e) => setBudgetForm({...budgetForm, category: e.target.value})}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input
                type="number"
                placeholder="Budget Amount"
                value={budgetForm.budgetAmount}
                onChange={(e) => setBudgetForm({...budgetForm, budgetAmount: e.target.value})}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={{
                  background: "#A084E8",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1
                }}>
                  {editingBudget ? "Update Budget" : "Set Budget"}
                </button>
                <button type="button" onClick={() => {
                  setShowBudgetForm(false);
                  setEditingBudget(null);
                  setBudgetForm({ category: "", budgetAmount: "", month: currentMonth, year: currentYear });
                }} style={{
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
            </form>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmDelete && (
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
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Confirm Delete</h3>
              <p style={{ margin: "0 0 20px 0", color: "#666" }}>{confirmDelete.message}</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={confirmDeleteAction} style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500"
                }}>
                  Delete
                </button>
                <button onClick={() => setConfirmDelete(null)} style={{
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

        {/* Detail Modal */}
        {showDetailModal && selectedItem && (
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
              padding: "40px",
              borderRadius: "20px",
              width: "500px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <h2 style={{ margin: 0, color: "#A084E8", fontSize: "24px" }}>{selectedItem.item.category} Budget</h2>
                <button onClick={() => setShowDetailModal(false)} style={{
                  background: "#f0f0f0", border: "none", borderRadius: "50%", width: "30px", height: "30px",
                  cursor: "pointer", fontSize: "16px", color: "#666"
                }}>×</button>
              </div>
              
              <div style={{ marginBottom: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Budget Amount:</span>
                  <span style={{ fontSize: "18px", color: "#4caf50" }}>₹{selectedItem.item.budgetAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Spent Amount:</span>
                  <span style={{ fontSize: "18px", color: "#ff6b6b" }}>₹{selectedItem.item.spentAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Remaining:</span>
                  <span style={{ fontSize: "18px", color: selectedItem.item.budgetAmount - selectedItem.item.spentAmount >= 0 ? "#4caf50" : "#ff6b6b" }}>
                    ₹{(selectedItem.item.budgetAmount - selectedItem.item.spentAmount).toFixed(2)}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                  <span style={{ fontSize: "16px", color: "#666" }}>Period:</span>
                  <span style={{ fontSize: "16px", color: "#666" }}>{selectedItem.item.month}/{selectedItem.item.year}</span>
                </div>
              </div>

              <div style={{
                background: "#f8f9fa",
                borderRadius: "12px",
                padding: "15px",
                marginBottom: "25px"
              }}>
                <div style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>Progress</div>
                <div style={{
                  background: "#e0e0e0",
                  borderRadius: "10px",
                  height: "12px",
                  overflow: "hidden",
                  marginBottom: "8px"
                }}>
                  <div style={{
                    background: (selectedItem.item.spentAmount / selectedItem.item.budgetAmount) * 100 > 90 ? "#ff6b6b" : 
                               (selectedItem.item.spentAmount / selectedItem.item.budgetAmount) * 100 > 70 ? "#ffa726" : "#4caf50",
                    height: "100%",
                    width: `${Math.min((selectedItem.item.spentAmount / selectedItem.item.budgetAmount) * 100, 100)}%`,
                    transition: "width 0.3s ease"
                  }}></div>
                </div>
                <div style={{ fontSize: "14px", color: "#666", textAlign: "center" }}>
                  {((selectedItem.item.spentAmount / selectedItem.item.budgetAmount) * 100).toFixed(1)}% used
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <button onClick={() => {
                  setShowDetailModal(false);
                  editBudget(selectedItem.item);
                }} style={{
                  background: "#2196F3", color: "white", border: "none", padding: "12px 24px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500"
                }}>Edit Budget</button>
                <button onClick={() => {
                  setShowDetailModal(false);
                  deleteBudget(selectedItem.item.id);
                }} style={{
                  background: "#f44336", color: "white", border: "none", padding: "12px 24px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500"
                }}>Delete Budget</button>
              </div>
            </div>
          </div>
        )}

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
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Delete All Budgets</h3>
              <p style={{ margin: "0 0 20px 0", color: "#666" }}>Are you sure you want to delete all {budgets.length} budgets? This action cannot be undone.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={deleteAllBudgets} style={{
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
    </div>
  );
}

export default BudgetPage;