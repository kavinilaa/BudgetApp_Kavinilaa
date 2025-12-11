import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from '../contexts/ThemeContext';

function SavingsPage() {
  const { colors } = useTheme();
  const [savings, setSavings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSaving, setEditingSaving] = useState(null);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newSaving, setNewSaving] = useState({
    goalName: "",
    amount: "",
    targetAmount: "",
    description: ""
  });
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [selectedExistingSaving, setSelectedExistingSaving] = useState("");

  useEffect(() => {
    fetchSavings();
  }, []);

  const fetchSavings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:9090/api/savings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavings(data);
      }
    } catch (error) {
      console.error("Error fetching savings:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newSaving.amount) {
      alert("Please enter an amount");
      return;
    }
    
    if (isAddingToExisting && !selectedExistingSaving) {
      alert("Please select an existing goal");
      return;
    }
    
    if (!isAddingToExisting && !editingSaving && (!newSaving.goalName || !newSaving.targetAmount)) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (isAddingToExisting && !editingSaving) {
        // Adding to existing savings goal
        const existingSaving = savings.find(s => s.id.toString() === selectedExistingSaving);
        const newAmount = parseFloat(existingSaving.amount) + parseFloat(newSaving.amount);
        
        const response = await fetch(`http://localhost:9090/api/savings/${selectedExistingSaving}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            goalName: existingSaving.goalName,
            amount: newAmount,
            targetAmount: parseFloat(existingSaving.targetAmount),
            description: existingSaving.description || ""
          })
        });
        
        if (response.ok) {
          await fetchSavings();
          setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
          setSelectedExistingSaving("");
          setIsAddingToExisting(false);
          setShowForm(false);
          alert(`₹${newSaving.amount} added to ${existingSaving.goalName} successfully!`);
        } else {
          alert("Failed to add money to savings. Please try again.");
        }
      } else {
        // Creating new or editing existing
        const url = editingSaving 
          ? `http://localhost:9090/api/savings/${editingSaving.id}`
          : "http://localhost:9090/api/savings";
        const method = editingSaving ? "PUT" : "POST";
        
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            goalName: newSaving.goalName,
            amount: parseFloat(newSaving.amount),
            targetAmount: parseFloat(newSaving.targetAmount),
            description: newSaving.description || ""
          })
        });
        
        if (response.ok) {
          await fetchSavings();
          setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
          setEditingSaving(null);
          setShowForm(false);
          alert(editingSaving ? "Savings updated successfully!" : "Savings goal created successfully!");
        } else {
          alert("Failed to save savings. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("An error occurred. Please try again.");
    }
  };
  
  const handleEdit = (saving) => {
    setEditingSaving(saving);
    setIsAddingToExisting(false);
    setSelectedExistingSaving("");
    setNewSaving({
      goalName: saving.goalName,
      amount: saving.amount.toString(),
      targetAmount: saving.targetAmount.toString(),
      description: saving.description || ""
    });
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:9090/api/savings/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          await fetchSavings();
          alert("Savings goal deleted successfully!");
        } else {
          const errorText = await response.text();
          console.error("Delete error:", errorText);
          alert("Failed to delete savings goal. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting savings:", error);
        alert("An error occurred while deleting. Please try again.");
      }
    }
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "#28a745";
    if (percentage >= 75) return "#20c997";
    if (percentage >= 50) return "#ffc107";
    return "#dc3545";
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.background }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <Navbar title="Savings" />
        <div style={{ padding: "30px", background: colors.background, minHeight: 'calc(100vh - 80px)' }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #E7DDFF 0%, #D4C5FF 100%)",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "30px",
            color: "#4A4A4A"
          }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "36px", color: "#4A4A4A" }}>Savings</h1>
            <p style={{ margin: "0 0 20px 0", fontSize: "16px", opacity: 0.9, color: "#8B8B8B" }}>
              Track your savings and achieve your financial goals
            </p>
            <button
              onClick={() => {
                if (showForm && !editingSaving) {
                  // Cancel adding new savings
                  setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
                  setShowForm(false);
                } else if (showForm && editingSaving) {
                  // Cancel editing
                  setEditingSaving(null);
                  setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
                  setShowForm(false);
                } else {
                  // Show form for new savings
                  setEditingSaving(null);
                  setIsAddingToExisting(false);
                  setSelectedExistingSaving("");
                  setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
                  setShowForm(true);
                }
              }}
              style={{
                padding: "12px 30px",
                background: "white",
                color: "#4A4A4A",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              + Add Savings
            </button>
          </div>

          {/* Add Saving Form */}
          {showForm && (
            <div style={{
              background: "linear-gradient(135deg, #E7DDFF 0%, #D4C5FF 100%)",
              borderRadius: "20px",
              padding: "40px",
              marginBottom: "30px",
              boxShadow: "0 8px 20px rgba(160, 132, 232, 0.2)",
              border: "1px solid rgba(160, 132, 232, 0.2)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "30px"
              }}>
                <h3 style={{ 
                  margin: 0, 
                  color: "#4A4A4A", 
                  fontSize: "28px",
                  fontWeight: "700"
                }}>
                  {editingSaving ? "Edit Savings" : "Add Savings"}
                </h3>
              </div>
              
              {!editingSaving && (
                <div style={{
                  background: "rgba(160, 132, 232, 0.08)",
                  borderRadius: "15px",
                  padding: "25px",
                  marginBottom: "30px",
                  border: "2px solid rgba(160, 132, 232, 0.2)"
                }}>
                  <h3 style={{ color: "#4A4A4A", margin: "0 0 20px 0", fontSize: "18px", fontWeight: "600" }}>Choose Option:</h3>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      color: !isAddingToExisting ? "white" : "#4A4A4A",
                      fontSize: "16px",
                      fontWeight: "500",
                      cursor: "pointer",
                      padding: "15px 20px",
                      borderRadius: "12px",
                      background: !isAddingToExisting ? "#A084E8" : "white",
                      border: "2px solid #A084E8",
                      transition: "all 0.3s ease"
                    }}>
                      <input
                        type="radio"
                        name="savingsType"
                        checked={!isAddingToExisting}
                        onChange={() => {
                          setIsAddingToExisting(false);
                          setSelectedExistingSaving("");
                          setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
                        }}
                        style={{ transform: "scale(1.2)" }}
                      />
                      Create New Savings Goal
                    </label>
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      color: isAddingToExisting ? "white" : "#4A4A4A",
                      fontSize: "16px",
                      fontWeight: "500",
                      cursor: "pointer",
                      padding: "15px 20px",
                      borderRadius: "12px",
                      background: isAddingToExisting ? "#A084E8" : "white",
                      border: "2px solid #A084E8",
                      transition: "all 0.3s ease"
                    }}>
                      <input
                        type="radio"
                        name="savingsType"
                        checked={isAddingToExisting}
                        onChange={() => {
                          setIsAddingToExisting(true);
                          setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
                        }}
                        style={{ transform: "scale(1.2)" }}
                      />
                      Add to Existing Goal
                    </label>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {isAddingToExisting && !editingSaving ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "30px" }}>
                    <div style={{ position: "relative" }}>
                      <label style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Select Goal</label>
                      <select
                        value={selectedExistingSaving}
                        onChange={(e) => {
                          setSelectedExistingSaving(e.target.value);
                          const selected = savings.find(s => s.id.toString() === e.target.value);
                          if (selected) {
                            setNewSaving({
                              goalName: selected.goalName,
                              amount: "",
                              targetAmount: selected.targetAmount.toString(),
                              description: selected.description || ""
                            });
                          }
                        }}
                        required
                        style={{
                          width: "100%",
                          padding: "15px 20px",
                          border: "2px solid #A084E8",
                          borderRadius: "12px",
                          fontSize: "16px",
                          background: "white",
                          color: "#4A4A4A",
                          outline: "none",
                          transition: "all 0.3s ease"
                        }}
                      >
                        <option value="" style={{ color: "#333" }}>Select Existing Goal</option>
                        {savings.map(saving => (
                          <option key={saving.id} value={saving.id} style={{ color: "#333" }}>
                            {saving.goalName} (₹{saving.amount}/₹{saving.targetAmount})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Amount to Add</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={newSaving.amount}
                        onChange={(e) => setNewSaving({...newSaving, amount: e.target.value})}
                        required
                        style={{
                          width: "100%",
                          padding: "15px 20px",
                          border: "2px solid #A084E8",
                          borderRadius: "12px",
                          fontSize: "16px",
                          background: "white",
                          color: "#4A4A4A",
                          outline: "none",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "30px" }}>
                    <div style={{ position: "relative" }}>
                      <label style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Goal Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Emergency Fund"
                        value={newSaving.goalName}
                        onChange={(e) => setNewSaving({...newSaving, goalName: e.target.value})}
                        required
                        style={{
                          width: "100%",
                          padding: "15px 20px",
                          border: "2px solid #A084E8",
                          borderRadius: "12px",
                          fontSize: "16px",
                          background: "white",
                          color: "#4A4A4A",
                          outline: "none",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>{editingSaving ? "Current Amount" : "Initial Amount"}</label>
                      <input
                        type="number"
                        placeholder="₹ 0"
                        value={newSaving.amount}
                        onChange={(e) => setNewSaving({...newSaving, amount: e.target.value})}
                        required
                        style={{
                          width: "100%",
                          padding: "15px 20px",
                          border: "2px solid #A084E8",
                          borderRadius: "12px",
                          fontSize: "16px",
                          background: "white",
                          color: "#4A4A4A",
                          outline: "none",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Target Amount</label>
                      <input
                        type="number"
                        placeholder="₹ 100,000"
                        value={newSaving.targetAmount}
                        onChange={(e) => setNewSaving({...newSaving, targetAmount: e.target.value})}
                        required
                        style={{
                          width: "100%",
                          padding: "15px 20px",
                          border: "2px solid #A084E8",
                          borderRadius: "12px",
                          fontSize: "16px",
                          background: "white",
                          color: "#4A4A4A",
                          outline: "none",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                    <div style={{ position: "relative" }}>
                      <label style={{ color: "#4A4A4A", fontSize: "14px", fontWeight: "600", marginBottom: "8px", display: "block" }}>Description</label>
                      <input
                        type="text"
                        placeholder="Optional description"
                        value={newSaving.description}
                        onChange={(e) => setNewSaving({...newSaving, description: e.target.value})}
                        style={{
                          width: "100%",
                          padding: "15px 20px",
                          border: "2px solid #A084E8",
                          borderRadius: "12px",
                          fontSize: "16px",
                          background: "white",
                          color: "#4A4A4A",
                          outline: "none",
                          transition: "all 0.3s ease"
                        }}
                      />
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}>
                  <button
                    type="submit"
                    style={{
                      background: "#A084E8",
                      color: "white",
                      border: "none",
                      padding: "15px 30px",
                      borderRadius: "12px",
                      fontSize: "16px",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(160, 132, 232, 0.3)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    {editingSaving ? "Update Savings" : (isAddingToExisting ? "Add to Goal" : "Create Goal")}
                  </button>
                  {editingSaving && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSaving(null);
                        setNewSaving({ goalName: "", amount: "", targetAmount: "", description: "" });
                        setShowForm(false);
                      }}
                      style={{
                        background: "white",
                        color: "#4A4A4A",
                        border: "2px solid #A084E8",
                        padding: "15px 30px",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Savings List */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "25px"
          }}>
            {savings.map((saving) => {
              const percentage = getProgressPercentage(saving.amount, saving.targetAmount);
              const progressColor = getProgressColor(percentage);
              
              return (
                <div
                  key={saving.id}
                  onClick={() => {
                    setSelectedSaving(saving);
                    setShowDetailModal(true);
                  }}
                  style={{
                    background: colors.cardBackground,
                    borderRadius: "15px",
                    padding: "25px",
                    boxShadow: `0 2px 10px ${colors.shadow}`,
                    transition: "all 0.3s",
                    cursor: "pointer",
                    border: "1px solid #e1e5e9"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.01)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(160, 132, 232, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = `0 2px 10px ${colors.shadow}`;
                  }}
                >
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{
                      margin: "0 0 10px 0",
                      color: "#A084E8",
                      fontSize: "20px"
                    }}>{saving.goalName}</h3>
                    <p style={{ color: "#666", fontSize: "14px", margin: "0 0 15px 0" }}>
                      {saving.description}
                    </p>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "15px"
                    }}>
                      <span style={{ color: "#A084E8", fontSize: "14px", fontWeight: "600" }}>
                        ₹{saving.amount} / ₹{saving.targetAmount}
                      </span>
                      <span style={{
                        color: progressColor,
                        fontWeight: "600",
                        fontSize: "16px"
                      }}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{
                      width: "100%",
                      height: "12px",
                      background: colors.border,
                      borderRadius: "6px",
                      overflow: "hidden",
                      marginBottom: "15px"
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: progressColor,
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                    
                    <div style={{
                      fontSize: "14px",
                      color: "#A084E8",
                      fontWeight: "600"
                    }}>
                      Remaining: ₹{(saving.targetAmount - saving.amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Savings Detail Modal */}
          {showDetailModal && selectedSaving && (
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
                  <h2 style={{ margin: 0, color: "#A084E8", fontSize: "24px" }}>{selectedSaving.goalName}</h2>
                  <button onClick={() => setShowDetailModal(false)} style={{
                    background: "#f0f0f0", border: "none", borderRadius: "50%", width: "30px", height: "30px",
                    cursor: "pointer", fontSize: "16px", color: "#666"
                  }}>×</button>
                </div>
                
                <div style={{ marginBottom: "25px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>Target Amount:</span>
                    <span style={{ fontSize: "16px", color: "#4caf50" }}>₹{selectedSaving.targetAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>Current Amount:</span>
                    <span style={{ fontSize: "16px", color: "#A084E8" }}>₹{selectedSaving.amount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>Remaining:</span>
                    <span style={{ fontSize: "16px", color: (selectedSaving.targetAmount - selectedSaving.amount) >= 0 ? "#4caf50" : "#ff6b6b" }}>
                      ₹{(selectedSaving.targetAmount - selectedSaving.amount).toLocaleString()}
                    </span>
                  </div>
                  {selectedSaving.description && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "16px", color: "#666" }}>Description:</span>
                      <span style={{ fontSize: "16px", color: "#666" }}>{selectedSaving.description}</span>
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
                      background: getProgressColor(getProgressPercentage(selectedSaving.amount, selectedSaving.targetAmount)),
                      height: "100%",
                      width: `${Math.min(getProgressPercentage(selectedSaving.amount, selectedSaving.targetAmount), 100)}%`,
                      transition: "width 0.3s ease"
                    }}></div>
                  </div>
                  <div style={{ fontSize: "14px", color: "#666", textAlign: "center" }}>
                    {getProgressPercentage(selectedSaving.amount, selectedSaving.targetAmount).toFixed(1)}% completed
                  </div>
                </div>

                <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                  <button onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedSaving);
                  }} style={{
                    background: "#2196F3", color: "white", border: "none", padding: "12px 24px",
                    borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500"
                  }}>Edit Savings</button>
                  <button onClick={() => {
                    setShowDetailModal(false);
                    handleDelete(selectedSaving.id);
                  }} style={{
                    background: "#f44336", color: "white", border: "none", padding: "12px 24px",
                    borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "500"
                  }}>Delete Savings</button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px"
          }}>
            <div style={{
              background: colors.cardBackground,
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
              boxShadow: `0 2px 10px ${colors.shadow}`
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#A084E8", fontSize: "14px" }}>TOTAL SAVED</h4>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#A084E8" }}>
                ₹{savings.reduce((sum, saving) => sum + parseFloat(saving.amount), 0).toLocaleString()}
              </p>
            </div>
            
            <div style={{
              background: colors.cardBackground,
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
              boxShadow: `0 2px 10px ${colors.shadow}`
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#A084E8", fontSize: "14px" }}>TOTAL TARGET</h4>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#A084E8" }}>
                ₹{savings.reduce((sum, saving) => sum + parseFloat(saving.targetAmount), 0).toLocaleString()}
              </p>
            </div>
            
            <div style={{
              background: colors.cardBackground,
              borderRadius: "15px",
              padding: "25px",
              textAlign: "center",
              boxShadow: `0 2px 10px ${colors.shadow}`
            }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#A084E8", fontSize: "14px" }}>ACTIVE GOALS</h4>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#A084E8" }}>
                {savings.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavingsPage;