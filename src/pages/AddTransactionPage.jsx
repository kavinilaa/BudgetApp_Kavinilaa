import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AddTransactionPage() {
  const [profile, setProfile] = useState(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [goalName, setGoalName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setProfile(res.data))
        .catch(err => {
          console.log("Profile fetch failed:", err);
          setProfile({ name: "User", email: "user@example.com" });
        });
      
      // Load savings goals
      API.get("/budget/savings-goals", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setSavingsGoals(res.data || []);
      }).catch(err => {
        console.error("Error loading goals:", err);
        setSavingsGoals([]);
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (category === "Other" && !customCategory.trim()) {
      setError("Please enter a custom category name");
      return;
    }
    
    if (type === "savings" && !selectedGoal && !goalName.trim()) {
      setError("Please select an existing goal or enter a new goal name");
      return;
    }
    
    if (type === "savings" && !selectedGoal && !targetAmount) {
      setError("Please enter a target amount for your new savings goal");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      if (type === "savings") {
        // Handle savings transaction
        if (selectedGoal) {
          // Add to existing goal
          await API.post(`/budget/savings-goal/${selectedGoal}/add`, {
            amount: parseFloat(amount),
            description: description || "Savings contribution"
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          // Create new goal and add amount
          const newGoal = await API.post("/budget/savings-goal", {
            goalName: goalName,
            targetAmount: parseFloat(targetAmount),
            targetDate: date
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Add initial amount to the new goal
          await API.post(`/budget/savings-goal/${newGoal.data.id}/add`, {
            amount: parseFloat(amount),
            description: description || "Initial savings"
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      } else {
        // Handle income/expense transaction
        const finalCategory = category === "Other" ? customCategory : category;
        
        await API.post("/transactions", {
          amount: parseFloat(amount),
          description,
          type,
          category: finalCategory,
          date
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to add ${type}`);
    }
  };

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
        <div style={{
          maxWidth: "700px",
          margin: "20px auto 0"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            padding: "40px",
            borderRadius: "24px",
            boxShadow: "0 25px 50px rgba(231, 221, 255, 0.3)",
            border: "1px solid rgba(231, 221, 255, 0.5)"
          }}>
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #E7DDFF, #D4C5FF)",
                borderRadius: "50%",
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>$</div>
              <h1 style={{
                color: "#4A4A4A",
                fontSize: "28px",
                fontWeight: "700",
                margin: "0 0 8px 0"
              }}>Add Transaction</h1>
              <p style={{ color: "#8B8B8B", margin: 0 }}>Record your income, expense, or savings</p>
              {type === "income" && (
                <p style={{ color: "#00B894", fontSize: "12px", margin: "8px 0 0 0", fontStyle: "italic" }}>
                  💡 Include savings goal names in description to auto-update progress
                </p>
              )}
              {type === "savings" && (
                <p style={{ color: "#6C5CE7", fontSize: "12px", margin: "8px 0 0 0", fontStyle: "italic" }}>
                  💰 Save towards your goals and track your progress
                </p>
              )}
            </div>

            {error && (
              <div style={{
                background: "rgba(255, 107, 107, 0.1)",
                color: "#D63031",
                padding: "14px 16px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid rgba(255, 107, 107, 0.2)"
              }}>{error}</div>
            )}

            {success && (
              <div style={{
                background: "rgba(0, 184, 148, 0.1)",
                color: "#00B894",
                padding: "14px 16px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: "1px solid rgba(0, 184, 148, 0.2)",
                textAlign: "center"
              }}>{success}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("");
                    setSelectedGoal("");
                    setGoalName("");
                    setTargetAmount("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: type === "income" ? "2px solid #00B894" : "2px solid #E7DDFF",
                    borderRadius: "12px",
                    background: type === "income" ? "rgba(0, 184, 148, 0.1)" : "rgba(231, 221, 255, 0.05)",
                    color: type === "income" ? "#00B894" : "#8B8B8B",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    setCategory("");
                    setSelectedGoal("");
                    setGoalName("");
                    setTargetAmount("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: type === "expense" ? "2px solid #FF6B6B" : "2px solid #E7DDFF",
                    borderRadius: "12px",
                    background: type === "expense" ? "rgba(255, 107, 107, 0.1)" : "rgba(231, 221, 255, 0.05)",
                    color: type === "expense" ? "#FF6B6B" : "#8B8B8B",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Expense
                </button>

              </div>

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={{
                  padding: "16px 20px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "16px",
                  fontSize: "16px",
                  outline: "none",
                  background: "rgba(231, 221, 255, 0.05)"
                }}
              />

              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  padding: "16px 20px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "16px",
                  fontSize: "16px",
                  outline: "none",
                  background: "rgba(231, 221, 255, 0.05)"
                }}
              />

              {type === "savings" ? (
                <>
                  <div style={{
                    background: "rgba(108, 92, 231, 0.05)",
                    padding: "20px",
                    borderRadius: "12px",
                    border: "2px solid rgba(108, 92, 231, 0.2)"
                  }}>
                    <p style={{ margin: "0 0 15px 0", fontWeight: "600", color: "#6C5CE7" }}>
                      Select Existing Goal or Create New
                    </p>
                    
                    <select
                      value={selectedGoal}
                      onChange={(e) => {
                        setSelectedGoal(e.target.value);
                        if (e.target.value) {
                          setGoalName("");
                          setTargetAmount("");
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "16px 20px",
                        border: "2px solid #E7DDFF",
                        borderRadius: "16px",
                        fontSize: "16px",
                        outline: "none",
                        background: "white",
                        marginBottom: "15px"
                      }}
                    >
                      <option value="">-- Select Existing Goal or Create New --</option>
                      {savingsGoals.map(goal => (
                        <option key={goal.id} value={goal.id}>
                          {goal.goalName} (₹{goal.currentAmount} / ₹{goal.targetAmount})
                        </option>
                      ))}
                    </select>

                    {!selectedGoal && (
                      <>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#666" }}>
                          Or create a new savings goal:
                        </p>
                        <input
                          type="text"
                          placeholder="New Goal Name (e.g., Vacation Fund)"
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            border: "2px solid #E7DDFF",
                            borderRadius: "16px",
                            fontSize: "16px",
                            outline: "none",
                            background: "white",
                            marginBottom: "15px",
                            boxSizing: "border-box"
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Target Amount"
                          value={targetAmount}
                          onChange={(e) => setTargetAmount(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "16px 20px",
                            border: "2px solid #E7DDFF",
                            borderRadius: "16px",
                            fontSize: "16px",
                            outline: "none",
                            background: "white",
                            boxSizing: "border-box"
                          }}
                        />
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      if (e.target.value !== "Other") {
                        setCustomCategory("");
                      }
                    }}
                    required
                    style={{
                      padding: "16px 20px",
                      border: "2px solid #E7DDFF",
                      borderRadius: "16px",
                      fontSize: "16px",
                      outline: "none",
                      background: "rgba(231, 221, 255, 0.05)"
                    }}
                  >
                    <option value="">Select Category</option>
                    {type === "income" ? (
                      <>
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Business">Business</option>
                        <option value="Investment">Investment</option>
                        <option value="Gift">Gift</option>
                        <option value="Other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="Food">Food</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Bills">Bills</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Other">Other</option>
                      </>
                    )}
                  </select>

                  {category === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter custom category name"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required
                      style={{
                        padding: "16px 20px",
                        border: "2px solid #A084E8",
                        borderRadius: "16px",
                        fontSize: "16px",
                        outline: "none",
                        background: "rgba(160, 132, 232, 0.05)",
                        animation: "slideDown 0.3s ease"
                      }}
                    />
                  )}
                </>
              )}

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  padding: "16px 20px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "16px",
                  fontSize: "16px",
                  outline: "none",
                  background: "rgba(231, 221, 255, 0.05)"
                }}
              />

              <button
                type="submit"
                style={{
                  background: "linear-gradient(135deg, #E7DDFF 0%, #D4C5FF 100%)",
                  color: "#4A4A4A",
                  padding: "16px",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(231, 221, 255, 0.4)"
                }}
              >
                Add Transaction
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => navigate("/")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#A084E8",
                  cursor: "pointer",
                  fontSize: "15px",
                  fontWeight: "600"
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddTransactionPage;