import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function TransactionsPage() {
  const [profile, setProfile] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "", category: "", customCategory: "" });
  const [showDetails, setShowDetails] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  
  const navigate = useNavigate();

  const fetchTransactions = () => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/transactions/incomes", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setIncomes(res.data))
        .catch(err => console.log("Failed to fetch incomes"));

      API.get("/transactions/expenses", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setExpenses(res.data))
        .catch(err => console.log("Failed to fetch expenses"));
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch profile
      API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setProfile(res.data))
        .catch(err => setProfile({ name: "User", email: "user@example.com" }));

      // Fetch transactions
      fetchTransactions();
    }
  }, []);

  const handleEdit = (transaction, type) => {
    const predefinedCategories = type === "income" 
      ? ["Salary", "Freelance", "Business", "Investment", "Gift"]
      : ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Healthcare"];
    
    const isCustomCategory = !predefinedCategories.includes(transaction.category);
    
    setEditingTransaction({ ...transaction, type });
    setEditForm({
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: isCustomCategory ? "Other" : transaction.category,
      customCategory: isCustomCategory ? transaction.category : ""
    });
  };

  const handleSaveEdit = async () => {
    if (editForm.category === "Other" && !editForm.customCategory.trim()) {
      setError("Please enter a custom category name");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const finalCategory = editForm.category === "Other" ? editForm.customCategory : editForm.category;
      
      await API.put(`/transactions/${editingTransaction.type}/${editingTransaction.id}`, {
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        category: finalCategory
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Transaction updated successfully!");
      setEditingTransaction(null);
      fetchTransactions();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update transaction");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        const token = localStorage.getItem("token");
        console.log(`Deleting ${type} with ID: ${id}`);
        const response = await API.delete(`/transactions/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Delete response:", response.data);
        setSuccess("Transaction deleted successfully!");
        fetchTransactions();
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        console.error("Delete error:", err);
        const errorMessage = err.response?.data?.message || err.response?.data || "Failed to delete transaction";
        setError(errorMessage);
        setTimeout(() => setError(""), 3000);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditForm({ amount: "", description: "", category: "", customCategory: "" });
  };

  const toggleDetails = (id) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Get all unique categories
  const getAllCategories = () => {
    const incomeCategories = [...new Set(incomes.map(i => i.category))];
    const expenseCategories = [...new Set(expenses.map(e => e.category))];
    return [...new Set([...incomeCategories, ...expenseCategories])].sort();
  };

  // Filter transactions
  const filterTransactions = (transactions, type) => {
    return transactions.filter(transaction => {
      // Type filter
      if (filterType !== "all" && filterType !== type) return false;
      
      // Category filter
      if (filterCategory !== "all" && transaction.category !== filterCategory) return false;
      
      // Search query
      if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Month/Year filter (primary filter)
      const txnDate = new Date(transaction.date || transaction.transactionDate || transaction.createdAt);
      const txnMonth = txnDate.getMonth() + 1;
      const txnYear = txnDate.getFullYear();
      
      if (filterMonth && txnMonth !== parseInt(filterMonth)) return false;
      if (filterYear && txnYear !== parseInt(filterYear)) return false;
      
      // Date range filter - use date field (optional additional filter)
      const txnDateStr = transaction.date || transaction.transactionDate || transaction.createdAt;
      if (startDate && txnDateStr < startDate) return false;
      if (endDate && txnDateStr > endDate) return false;
      
      // Amount range filter
      if (minAmount && transaction.amount < parseFloat(minAmount)) return false;
      if (maxAmount && transaction.amount > parseFloat(maxAmount)) return false;
      
      return true;
    });
  };

  const filteredIncomes = filterTransactions(incomes, "income");
  const filteredExpenses = filterTransactions(expenses, "expense");

  const clearFilters = () => {
    setFilterType("all");
    setFilterCategory("all");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setFilterMonth(new Date().getMonth() + 1);
    setFilterYear(new Date().getFullYear());
  };

  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const balance = totalIncome - totalExpense;

  if (!profile) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ color: "#A084E8", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  return (
    <>
      <Navbar profile={profile} />
      <div style={{
        minHeight: "calc(100vh - 80px)",
        background: "linear-gradient(135deg, #E7DDFF 0%, #F5F2FF 50%, #FFFFFF 100%)",
        padding: "20px",
        display: "flex",
        gap: "20px"
      }}>
        <Sidebar />
        <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1 style={{ color: "#4A4A4A", fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0" }}>
              Transaction Dashboard
            </h1>
            <p style={{ color: "#8B8B8B", margin: 0 }}>Track your income and expenses</p>
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

          {/* Filtering Section - Simplified */}
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "16px",
            marginBottom: "30px",
            boxShadow: "0 8px 24px rgba(160, 132, 232, 0.12)",
            border: "1px solid rgba(231, 221, 255, 0.5)"
          }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
              {/* Month Filter */}
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "2px solid #A084E8",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                  minWidth: "140px",
                  fontWeight: "600",
                  color: "#4A4A4A"
                }}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              {/* Year Filter */}
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "2px solid #A084E8",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                  minWidth: "120px",
                  fontWeight: "600",
                  color: "#4A4A4A"
                }}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                  minWidth: "140px"
                }}
              >
                <option value="all">All Types</option>
                <option value="income">💰 Income</option>
                <option value="expense">💳 Expense</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  background: "white",
                  cursor: "pointer",
                  minWidth: "160px"
                }}
              >
                <option value="all">All Categories</option>
                {getAllCategories().map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Date Filter */}
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  minWidth: "150px"
                }}
              />

              {/* Search */}
              <input
                type="text"
                placeholder="🔍 Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "10px 16px",
                  border: "2px solid #E7DDFF",
                  borderRadius: "10px",
                  fontSize: "14px",
                  outline: "none",
                  minWidth: "150px",
                  maxWidth: "200px"
                }}
              />

              {/* Export PDF Button */}
              <button
                onClick={() => window.print()}
                style={{
                  background: "linear-gradient(135deg, #A084E8, #8B6FDE)",
                  color: "white",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(160, 132, 232, 0.3)",
                  whiteSpace: "nowrap"
                }}
              >
                📄 Export PDF
              </button>

              {/* Clear Button */}
              {(filterType !== "all" || filterCategory !== "all" || searchQuery || startDate) && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: "linear-gradient(135deg, #FF6B6B, #FF5252)",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                    whiteSpace: "nowrap"
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Month/Year Display */}
            <div style={{ marginTop: "12px", fontSize: "14px", color: "#4A4A4A", fontWeight: "600" }}>
              📅 Showing transactions for: <span style={{ color: "#A084E8" }}>
                {new Date(filterYear, filterMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Compact Filter Summary */}
            {(filterType !== "all" || filterCategory !== "all" || searchQuery || startDate) && (
              <div style={{ marginTop: "8px", fontSize: "13px", color: "#8B8B8B" }}>
                <strong style={{ color: "#A084E8" }}>Filtered Results:</strong> {filteredIncomes.length + filteredExpenses.length} transaction(s)
              </div>
            )}
          </div>

          {/* Summary Overview - Single Row */}
          <div style={{
            display: "flex",
            gap: "16px",
            marginBottom: "30px",
            padding: "20px",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)",
            justifyContent: "space-around",
            flexWrap: "wrap"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#00B894", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>💰 INCOME</div>
              <div style={{ color: "#00B894", fontSize: "24px", fontWeight: "700" }}>₹{totalIncome.toFixed(2)}</div>
              <div style={{ color: "#8B8B8B", fontSize: "11px" }}>{filteredIncomes.length} transaction(s)</div>
            </div>
            <div style={{ width: "1px", background: "#E7DDFF" }}></div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FF6B6B", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>💳 EXPENSES</div>
              <div style={{ color: "#FF6B6B", fontSize: "24px", fontWeight: "700" }}>₹{totalExpense.toFixed(2)}</div>
              <div style={{ color: "#8B8B8B", fontSize: "11px" }}>{filteredExpenses.length} transaction(s)</div>
            </div>
            <div style={{ width: "1px", background: "#E7DDFF" }}></div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: balance >= 0 ? "#A084E8" : "#FF8C42", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>
                {balance >= 0 ? "📈 BALANCE" : "📉 DEFICIT"}
              </div>
              <div style={{ color: balance >= 0 ? "#A084E8" : "#FF8C42", fontSize: "24px", fontWeight: "700" }}>
                ₹{Math.abs(balance).toFixed(2)}
              </div>
              <div style={{ color: "#8B8B8B", fontSize: "11px" }}>{balance >= 0 ? "Surplus" : "Deficit"}</div>
            </div>
          </div>

          {/* History Navigation Buttons */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "40px",
            maxWidth: "900px",
            margin: "0 auto 40px auto"
          }}>
            <button
              onClick={() => navigate("/income-history")}
              style={{
                background: "linear-gradient(135deg, #00B894, #00A085)",
                color: "white",
                padding: "40px 50px",
                border: "none",
                borderRadius: "24px",
                fontSize: "24px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 15px 35px rgba(0, 184, 148, 0.4)",
                transition: "all 0.3s ease",
                textAlign: "center",
                minHeight: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 184, 148, 0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(0, 184, 148, 0.4)";
              }}
            >
              Income History
            </button>
            
            <button
              onClick={() => navigate("/expense-history")}
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #FF5252)",
                color: "white",
                padding: "40px 50px",
                border: "none",
                borderRadius: "24px",
                fontSize: "24px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 15px 35px rgba(255, 107, 107, 0.4)",
                transition: "all 0.3s ease",
                textAlign: "center",
                minHeight: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(255, 107, 107, 0.5)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 35px rgba(255, 107, 107, 0.4)";
              }}
            >
              Expense History
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ textAlign: "center", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
            <button
              onClick={() => navigate("/add-transaction")}
              style={{
                background: "linear-gradient(135deg, #E7DDFF 0%, #D4C5FF 100%)",
                color: "#4A4A4A",
                padding: "16px 32px",
                border: "none",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(231, 221, 255, 0.4)"
              }}
            >
              + Add New Transaction
            </button>
            <button
              onClick={() => navigate("/analytics")}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "16px 32px",
                border: "none",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)"
              }}
            >
              📊 View Analytics
            </button>
          </div>

          {/* Recent Transactions Section */}
          <div style={{ marginTop: "40px" }}>
            <h2 style={{ color: "#4A4A4A", fontSize: "22px", fontWeight: "700", marginBottom: "20px" }}>
              💼 Recent Transactions
            </h2>
            
            {/* Combined Transactions Grid */}
            {(filteredIncomes.length > 0 || filteredExpenses.length > 0) && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {/* Combine and sort all transactions by date */}
                {[...filteredIncomes.map(t => ({...t, type: 'income'})), ...filteredExpenses.map(t => ({...t, type: 'expense'}))]
                  .sort((a, b) => new Date(b.transactionDate || b.createdAt) - new Date(a.transactionDate || a.createdAt))
                  .map((transaction) => (
                    <div key={`${transaction.type}-${transaction.id}`} style={{
                      background: transaction.type === 'income' 
                        ? "linear-gradient(135deg, rgba(0, 184, 148, 0.08) 0%, rgba(0, 184, 148, 0.02) 100%)"
                        : "linear-gradient(135deg, rgba(255, 107, 107, 0.08) 0%, rgba(255, 107, 107, 0.02) 100%)",
                      border: transaction.type === 'income'
                        ? "2px solid rgba(0, 184, 148, 0.2)"
                        : "2px solid rgba(255, 107, 107, 0.2)",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                      transform: "perspective(1000px) rotateX(1deg)",
                      transition: "all 0.2s ease"
                    }}>
                      {editingTransaction?.id === transaction.id && editingTransaction?.type === transaction.type ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            style={{
                              padding: "10px",
                              border: "2px solid #E7DDFF",
                              borderRadius: "8px",
                              fontSize: "13px",
                              outline: "none"
                            }}
                            placeholder="Amount"
                          />
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            style={{
                              padding: "10px",
                              border: "2px solid #E7DDFF",
                              borderRadius: "8px",
                              fontSize: "13px",
                              outline: "none"
                            }}
                            placeholder="Description"
                          />
                          <select
                            value={editForm.category}
                            onChange={(e) => {
                              setEditForm({ ...editForm, category: e.target.value, customCategory: "" });
                            }}
                            style={{
                              padding: "10px",
                              border: "2px solid #E7DDFF",
                              borderRadius: "8px",
                              fontSize: "13px",
                              outline: "none"
                            }}
                          >
                            {transaction.type === 'income' ? (
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
                          {editForm.category === "Other" && (
                            <input
                              type="text"
                              value={editForm.customCategory}
                              onChange={(e) => setEditForm({ ...editForm, customCategory: e.target.value })}
                              style={{
                                padding: "10px",
                                border: "2px solid #A084E8",
                                borderRadius: "8px",
                                fontSize: "13px",
                                outline: "none",
                                background: "rgba(160, 132, 232, 0.05)"
                              }}
                              placeholder="Enter custom category"
                            />
                          )}
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={handleSaveEdit}
                              style={{
                                flex: 1,
                                padding: "8px",
                                background: "#00B894",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600"
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                flex: 1,
                                padding: "8px",
                                background: "#8B8B8B",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600"
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ 
                                  fontSize: "20px", 
                                  fontWeight: "700", 
                                  color: transaction.type === 'income' ? "#00B894" : "#FF6B6B"
                                }}>
                                  ₹{transaction.amount.toFixed(2)}
                                </span>
                                <span style={{
                                  background: transaction.type === 'income' 
                                    ? "rgba(0, 184, 148, 0.15)" 
                                    : "rgba(255, 107, 107, 0.15)",
                                  color: transaction.type === 'income' ? "#00B894" : "#FF6B6B",
                                  padding: "3px 10px",
                                  borderRadius: "10px",
                                  fontSize: "11px",
                                  fontWeight: "600"
                                }}>
                                  {transaction.category}
                                </span>
                              </div>
                              <p style={{ color: "#4A4A4A", fontSize: "13px", margin: "0 0 4px 0" }}>
                                {transaction.description}
                              </p>
                              <p style={{ color: "#8B8B8B", fontSize: "11px", margin: 0 }}>
                                {new Date(transaction.transactionDate || transaction.createdAt).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                            <div style={{ display: "flex", gap: "6px", flexDirection: "column" }}>
                              <button
                                onClick={() => handleEdit(transaction, transaction.type)}
                                style={{
                                  padding: "6px 12px",
                                  background: transaction.type === 'income' 
                                    ? "rgba(0, 184, 148, 0.1)" 
                                    : "rgba(255, 107, 107, 0.1)",
                                  color: transaction.type === 'income' ? "#00B894" : "#FF6B6B",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600"
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(transaction.id, transaction.type)}
                                style={{
                                  padding: "6px 12px",
                                  background: "rgba(255, 107, 107, 0.15)",
                                  color: "#D63031",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  fontWeight: "600"
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {filteredIncomes.length === 0 && filteredExpenses.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(255, 255, 255, 0.5)",
                borderRadius: "16px",
                border: "2px dashed rgba(160, 132, 232, 0.3)"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <h3 style={{ color: "#4A4A4A", fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
                  {incomes.length === 0 && expenses.length === 0 ? "No Transactions Yet" : "No Matching Transactions"}
                </h3>
                <p style={{ color: "#8B8B8B", marginBottom: "20px" }}>
                  {incomes.length === 0 && expenses.length === 0 
                    ? "Start tracking your finances by adding your first transaction"
                    : "Try adjusting your filters to see more results"}
                </p>
                {incomes.length === 0 && expenses.length === 0 ? (
                  <button
                    onClick={() => navigate("/add-transaction")}
                    style={{
                      background: "linear-gradient(135deg, #E7DDFF 0%, #D4C5FF 100%)",
                      color: "#4A4A4A",
                      padding: "12px 24px",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(231, 221, 255, 0.4)"
                    }}
                  >
                    + Add Transaction
                  </button>
                ) : (
                  <button
                    onClick={clearFilters}
                    style={{
                      background: "linear-gradient(135deg, #A084E8 0%, #8B6FDE 100%)",
                      color: "white",
                      padding: "12px 24px",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(160, 132, 232, 0.4)"
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TransactionsPage;
