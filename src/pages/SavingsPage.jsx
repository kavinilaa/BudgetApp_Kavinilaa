import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function SavingsPage() {
  const [profile, setProfile] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState(false);
  const [savingsForm, setSavingsForm] = useState({
    goalId: "",
    amount: "",
    description: ""
  });
  const [goalForm, setGoalForm] = useState({
    goalName: "",
    targetAmount: "",
    targetDate: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/user/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setProfile(res.data))
        .catch(() => setProfile({ name: "User" }));
      
      loadSavingsGoals();
    }
  }, []);

  const loadSavingsGoals = () => {
    const token = localStorage.getItem("token");
    API.get("/budget/savings-goals", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setSavingsGoals(res.data || []);
    }).catch(err => {
      console.error("Error loading goals:", err);
      setSavingsGoals([]);
    });
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const goalData = {
      goalName: goalForm.goalName,
      targetAmount: parseFloat(goalForm.targetAmount),
      targetDate: goalForm.targetDate || null
    };
    
    const url = editingGoal ? `/budget/savings-goal/update/${editingGoal.id}` : "/budget/savings-goal";
    const method = editingGoal ? "put" : "post";
    
    API[method](url, goalData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert(editingGoal ? "Goal updated successfully!" : "Goal created successfully!");
      setShowGoalForm(false);
      setEditingGoal(null);
      setGoalForm({ goalName: "", targetAmount: "", targetDate: "" });
      loadSavingsGoals();
    }).catch(err => {
      console.error("Goal error:", err);
      alert("Error with goal. Please check console for details.");
    });
  };

  const editGoal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      goalName: goal.goalName,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate || ""
    });
    setShowGoalForm(true);
  };

  const deleteGoal = (id) => {
    setConfirmDelete({ type: 'goal', id, message: 'Are you sure you want to delete this savings goal?' });
  };

  const handleSavingsTransfer = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const selectedGoal = savingsGoals.find(goal => goal.id === parseInt(savingsForm.goalId));
    const transferData = {
      goalId: parseInt(savingsForm.goalId),
      amount: parseFloat(savingsForm.amount),
      description: savingsForm.description || `Transfer to ${selectedGoal?.goalName || 'Savings Goal'}`
    };
    
    API.post("/budget/savings-transfer", transferData, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert("Money transferred to savings goal successfully!");
      setShowSavingsForm(false);
      setSavingsForm({ goalId: "", amount: "", description: "" });
      loadSavingsGoals();
    }).catch(err => {
      console.error("Savings transfer error:", err);
      console.error("Error response:", err.response?.data);
      alert(`Error transferring money to savings goal: ${err.response?.data?.message || err.message}`);
    });
  };

  const confirmDeleteAction = () => {
    const token = localStorage.getItem("token");
    const { id } = confirmDelete;
    
    API.delete(`/budget/savings-goal/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      alert("Savings goal deleted successfully!");
      loadSavingsGoals();
    }).catch(err => {
      console.error("Delete goal error:", err);
      alert("Error deleting savings goal.");
    });
    setConfirmDelete(null);
  };

  const deleteAllSavingsGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      for (const goal of savingsGoals) {
        await API.delete(`/budget/savings-goal/delete/${goal.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setSavingsGoals([]);
      setConfirmDeleteAll(false);
      alert("All savings goals deleted successfully!");
    } catch (error) {
      console.error("Error deleting all savings goals:", error);
      alert("Error deleting all savings goals");
    }
  };

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
        <div style={{ maxWidth: "1400px", margin: "20px auto 0" }}>
          <h1 style={{ color: "#333", textAlign: "center", marginBottom: "40px" }}>Savings Goals</h1>
          
          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#A084E8", margin: 0 }}>Your Savings Goals</h2>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                {savingsGoals.length > 0 && (
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
                <button
                  onClick={() => setShowSavingsForm(true)}
                  style={{
                    background: "linear-gradient(135deg, #4CAF50, #45A049)",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  + Add to Savings
                </button>
                <button
                  onClick={() => setShowGoalForm(true)}
                  style={{
                    background: "linear-gradient(135deg, #E7DDFF, #D4C5FF)",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    color: "#333",
                    cursor: "pointer"
                  }}
                >
                  + Add Goal
                </button>
              </div>
            </div>
            <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", margin: "0 0 20px 0", border: "1px solid #e9ecef" }}>
              <p style={{ color: "#666", fontSize: "14px", margin: "0 0 10px 0", fontWeight: "600" }}>How to use:</p>
              <p style={{ color: "#666", fontSize: "13px", margin: "0 0 5px 0" }}>1. Click <strong>"+ Add Goal"</strong> to create new savings goals (Car, Vacation, etc.)</p>
              <p style={{ color: "#666", fontSize: "13px", margin: "0" }}>2. Click <strong>"+ Add to Savings"</strong> to transfer money from your income to specific goals</p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {savingsGoals.map(goal => {
                const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <div key={goal.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem({type: 'goal', item: goal});
                      setShowDetailModal(true);
                    }}
                    style={{
                      border: "1px solid #e1e5e9",
                      borderRadius: "12px",
                      padding: "20px",
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
                    <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>{goal.goalName}</h3>
                    <p style={{ margin: "5px 0", color: "#666" }}>
                      Target: ₹{goal.targetAmount} | Saved: ₹{goal.currentAmount}
                    </p>
                    <div style={{
                      background: "#f0f0f0",
                      borderRadius: "10px",
                      height: "10px",
                      overflow: "hidden",
                      margin: "10px 0"
                    }}>
                      <div style={{
                        background: "#4caf50",
                        height: "100%",
                        width: `${Math.min(percentage, 100)}%`,
                        transition: "width 0.3s ease"
                      }}></div>
                    </div>
                    <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
                      {percentage.toFixed(1)}% completed
                    </p>
                    {goal.targetDate && (
                      <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#999" }}>
                        Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Goal Form Modal */}
        {showGoalForm && (
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
            <form onSubmit={handleGoalSubmit} style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              width: "400px",
              maxWidth: "90vw"
            }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>{editingGoal ? "Edit Savings Goal" : "Create Savings Goal"}</h3>
              <input
                type="text"
                placeholder="Goal Name"
                value={goalForm.goalName}
                onChange={(e) => setGoalForm({...goalForm, goalName: e.target.value})}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              />
              <input
                type="number"
                placeholder="Target Amount"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm({...goalForm, targetAmount: e.target.value})}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              />
              <input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm({...goalForm, targetDate: e.target.value})}
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
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </button>
                <button type="button" onClick={() => {
                  setShowGoalForm(false);
                  setEditingGoal(null);
                  setGoalForm({ goalName: "", targetAmount: "", targetDate: "" });
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

        {/* Savings Transfer Modal */}
        {showSavingsForm && (
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
            <form onSubmit={handleSavingsTransfer} style={{
              background: "white",
              padding: "30px",
              borderRadius: "16px",
              width: "400px",
              maxWidth: "90vw"
            }}>
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Add Money to Savings Goal</h3>
              <select
                value={savingsForm.goalId}
                onChange={(e) => setSavingsForm({...savingsForm, goalId: e.target.value})}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              >
                <option value="">Select a savings goal</option>
                {savingsGoals.map(goal => (
                  <option key={goal.id} value={goal.id}>{goal.goalName}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount to add"
                value={savingsForm.amount}
                onChange={(e) => setSavingsForm({...savingsForm, amount: e.target.value})}
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={savingsForm.description}
                onChange={(e) => setSavingsForm({...savingsForm, description: e.target.value})}
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
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  flex: 1
                }}>
                  Add to Savings
                </button>
                <button type="button" onClick={() => {
                  setShowSavingsForm(false);
                  setSavingsForm({ goalId: "", amount: "", description: "" });
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
                <h2 style={{ margin: 0, color: "#A084E8", fontSize: "24px" }}>{selectedItem.item.goalName}</h2>
                <button onClick={() => setShowDetailModal(false)} style={{
                  background: "#f0f0f0", border: "none", borderRadius: "50%", width: "30px", height: "30px",
                  cursor: "pointer", fontSize: "16px", color: "#666"
                }}>×</button>
              </div>
              
              <div style={{ marginBottom: "25px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Target Amount:</span>
                  <span style={{ fontSize: "18px", color: "#4caf50" }}>₹{selectedItem.item.targetAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Saved Amount:</span>
                  <span style={{ fontSize: "18px", color: "#2196F3" }}>₹{selectedItem.item.currentAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <span style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}>Remaining:</span>
                  <span style={{ fontSize: "18px", color: "#ff9800" }}>
                    ₹{(selectedItem.item.targetAmount - selectedItem.item.currentAmount).toFixed(2)}
                  </span>
                </div>
                {selectedItem.item.targetDate && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <span style={{ fontSize: "16px", color: "#666" }}>Target Date:</span>
                    <span style={{ fontSize: "16px", color: "#666" }}>{new Date(selectedItem.item.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
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
                    background: "#4caf50",
                    height: "100%",
                    width: `${Math.min((selectedItem.item.currentAmount / selectedItem.item.targetAmount) * 100, 100)}%`,
                    transition: "width 0.3s ease"
                  }}></div>
                </div>
                <div style={{ fontSize: "14px", color: "#666", textAlign: "center" }}>
                  {((selectedItem.item.currentAmount / selectedItem.item.targetAmount) * 100).toFixed(1)}% completed
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <button onClick={() => {
                  setShowDetailModal(false);
                  editGoal(selectedItem.item);
                }} style={{
                  background: "#2196F3", color: "white", border: "none", padding: "12px 24px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500"
                }}>Edit Goal</button>
                <button onClick={() => {
                  setShowDetailModal(false);
                  deleteGoal(selectedItem.item.id);
                }} style={{
                  background: "#f44336", color: "white", border: "none", padding: "12px 24px",
                  borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500"
                }}>Delete Goal</button>
              </div>
            </div>
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
              <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Delete All Savings Goals</h3>
              <p style={{ margin: "0 0 20px 0", color: "#666" }}>Are you sure you want to delete all {savingsGoals.length} savings goals? This action cannot be undone.</p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={deleteAllSavingsGoals} style={{
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
    </>
  );
}

export default SavingsPage;