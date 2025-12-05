import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import '../Analytics.css';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AnalyticsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6months');
  const [showExportModal, setShowExportModal] = useState(false);
  const [transactionType, setTransactionType] = useState('all'); // all, income, expense
  const [incomeExpenseChartType, setIncomeExpenseChartType] = useState('bar'); // bar, line
  const [categoryChartType, setCategoryChartType] = useState('pie'); // pie, doughnut
  const [analyticsData, setAnalyticsData] = useState({
    monthlySpending: { labels: [], data: [] },
    categoryBreakdown: { labels: [], data: [] },
    incomeVsExpenses: { labels: [], incomeData: [], expenseData: [] },
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      currentMonthIncome: 0,
      currentMonthExpenses: 0,
      topSpendingCategory: 'None'
    }
  });
  const [transactions, setTransactions] = useState([]);
  const [filteredSummary, setFilteredSummary] = useState({ income: 0, expense: 0, net: 0 });
  const navigate = useNavigate();

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all analytics data including transactions
      const [monthlyRes, categoryRes, incomeVsExpenseRes, summaryRes, incomesRes, expensesRes] = await Promise.all([
        API.get('/analytics/monthly-spending', { headers }),
        API.get('/analytics/category-breakdown', { headers }),
        API.get('/analytics/income-vs-expenses', { headers }),
        API.get('/analytics/summary', { headers }),
        API.get('/transactions/incomes', { headers }),
        API.get('/transactions/expenses', { headers })
      ]);

      setAnalyticsData({
        monthlySpending: monthlyRes.data,
        categoryBreakdown: categoryRes.data,
        incomeVsExpenses: incomeVsExpenseRes.data,
        summary: summaryRes.data
      });

      // Combine all transactions for filtering
      const allTxns = [
        ...incomesRes.data.map(t => ({ ...t, type: 'income', date: t.transactionDate || t.createdAt, amount: parseFloat(t.amount || 0) })),
        ...expensesRes.data.map(t => ({ ...t, type: 'expense', date: t.transactionDate || t.createdAt, amount: parseFloat(t.amount || 0) }))
      ];
      setTransactions(allTxns);
      updateFilteredSummary(allTxns, 'all');
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData({
        monthlySpending: { labels: [], data: [] },
        categoryBreakdown: { labels: [], data: [] },
        incomeVsExpenses: { labels: [], incomeData: [], expenseData: [] },
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          netSavings: 0,
          currentMonthIncome: 0,
          currentMonthExpenses: 0,
          topSpendingCategory: 'None'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFilteredSummary = (txns, type) => {
    let filtered = txns;
    
    if (type !== 'all') {
      filtered = filtered.filter(t => t.type === type);
    }
    
    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    setFilteredSummary({
      income,
      expense,
      net: income - expense
    });
  };



  useEffect(() => {
    updateFilteredSummary(transactions, transactionType);
  }, [transactionType, transactions]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch profile
      API.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => setProfile(res.data))
        .catch(err => {
          const username = localStorage.getItem('username') || 'User';
          setProfile({ name: username, email: 'user@example.com' });
        });

      // Fetch analytics data
      fetchAnalyticsData();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const monthlySpendingChartData = {
    labels: analyticsData.monthlySpending.labels || [],
    datasets: [
      {
        label: 'Monthly Spending',
        data: analyticsData.monthlySpending.data || [],
        borderColor: '#A084E8',
        backgroundColor: 'rgba(160, 132, 232, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Filter out categories with zero or null values
  const categoryChartData = {
    labels: (analyticsData.categoryBreakdown.labels || []).filter((label, index) => {
      const value = (analyticsData.categoryBreakdown.data || [])[index];
      return value && value > 0;
    }),
    datasets: [
      {
        data: (analyticsData.categoryBreakdown.data || []).filter(value => value && value > 0),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const incomeExpenseChartData = {
    labels: analyticsData.incomeVsExpenses.labels || [],
    datasets: [
      {
        label: 'Income',
        data: analyticsData.incomeVsExpenses.incomeData || [],
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: analyticsData.incomeVsExpenses.expenseData || [],
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const exportData = () => {
    const data = JSON.stringify(analyticsData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-data.json';
    a.click();
    setShowExportModal(false);
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
        <div style={{ maxWidth: "1400px", margin: "20px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px", flexWrap: "wrap", gap: "20px" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <h1 style={{ color: "#1f2937", margin: 0, fontSize: "36px", fontWeight: "800", letterSpacing: '-0.5px' }}>📊 Financial Analytics</h1>
              <p style={{ color: "#6b7280", margin: "10px 0 0 0", fontSize: "15px", fontWeight: "400" }}>
                Welcome back, {profile?.name || profile?.username || 'User'}! Here are your financial insights.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <select 
                value={transactionType} 
                onChange={(e) => setTransactionType(e.target.value)} 
                style={{
                  padding: "10px 16px", borderRadius: "12px", border: "2px solid #e5e7eb",
                  fontSize: "14px", background: "white", cursor: "pointer", fontWeight: "600",
                  color: "#374151", transition: "all 0.2s"
                }}>
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expenses Only</option>
              </select>
              
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{
                padding: "8px 12px", borderRadius: "10px", border: "2px solid #e5e7eb",
                fontSize: "14px", background: "white", cursor: "pointer", fontWeight: "500",
                color: "#374151"
              }}>
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
              
              <button onClick={() => window.print()} style={{
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", border: "none",
                padding: "10px 20px", borderRadius: "12px", cursor: "pointer", fontSize: "14px",
                fontWeight: "600", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)"
              }}>📝 Export PDF</button>
              
              <button onClick={fetchAnalyticsData} style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", border: "none",
                padding: "10px 20px", borderRadius: "12px", cursor: "pointer", fontSize: "14px",
                fontWeight: "600", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                transition: "all 0.2s"
              }}>🔄 Refresh</button>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <div style={{ color: "#A084E8", fontSize: "18px" }}>Loading analytics...</div>
            </div>
          ) : (
            <>
              {/* Filtered Transaction Summary Banner */}
              {transactionType !== 'all' && (
                <div style={{
                  background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  padding: "20px 30px",
                  borderRadius: "16px",
                  color: "white",
                  marginBottom: "25px",
                  boxShadow: "0 8px 20px rgba(240,147,251,0.3)"
                }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "10px", opacity: 0.9 }}>
                    Filtered View: {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    <div>
                      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Income</div>
                      <div style={{ fontSize: "24px", fontWeight: "700" }}>₹{filteredSummary.income.toFixed(0)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Expenses</div>
                      <div style={{ fontSize: "24px", fontWeight: "700" }}>₹{filteredSummary.expense.toFixed(0)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>Net</div>
                      <div style={{ fontSize: "24px", fontWeight: "700" }}>₹{filteredSummary.net.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Health Overview */}
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "35px",
                borderRadius: "24px",
                color: "white",
                marginBottom: "32px",
                textAlign: "center",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.25)"
              }}>
                <h2 style={{ margin: "0 0 24px 0", fontSize: "22px", fontWeight: "700" }}>💼 Financial Health Overview</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>₹{analyticsData.summary.totalIncome?.toFixed(0) || '0'}</div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Income</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>₹{analyticsData.summary.totalExpenses?.toFixed(0) || '0'}</div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>Total Expenses</div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: "28px", 
                      fontWeight: "700", 
                      marginBottom: "5px",
                      color: (analyticsData.summary.netSavings || 0) >= 0 ? "#4CAF50" : "#FF6B6B"
                    }}>₹{analyticsData.summary.netSavings?.toFixed(0) || '0'}</div>
                    <div style={{ fontSize: "14px", opacity: 0.9 }}>{(analyticsData.summary.netSavings || 0) >= 0 ? "Net Savings" : "Deficit"}</div>
                  </div>
                </div>
              </div>

              {/* Advanced Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                <div style={{ 
                  background: "white", 
                  padding: "24px", 
                  borderRadius: "16px", 
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  borderLeft: "5px solid #4CAF50"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "#666", fontSize: "13px", fontWeight: "600" }}>SAVINGS RATE</h4>
                    <span style={{ fontSize: "20px" }}>📈</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#4CAF50" }}>
                    {analyticsData.summary.totalIncome > 0 ? (((analyticsData.summary.netSavings || 0) / analyticsData.summary.totalIncome) * 100).toFixed(1) : '0.0'}%
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                    {analyticsData.summary.totalIncome > 0 && (((analyticsData.summary.netSavings || 0) / analyticsData.summary.totalIncome) * 100) > 20 ? '✨ Excellent!' : 'Keep improving'}
                  </div>
                </div>
                
                <div style={{ 
                  background: "white", 
                  padding: "20px", 
                  borderRadius: "12px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderLeft: "4px solid #FF6B6B"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "#666", fontSize: "13px", fontWeight: "600" }}>THIS MONTH</h4>
                    <span style={{ fontSize: "20px" }}>📅</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#FF6B6B" }}>
                    ₹{analyticsData.summary.currentMonthExpenses?.toFixed(0) || '0'}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                    Income: ₹{analyticsData.summary.currentMonthIncome?.toFixed(0) || '0'}
                  </div>
                </div>
                
                <div style={{ 
                  background: "white", 
                  padding: "20px", 
                  borderRadius: "12px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderLeft: "4px solid #FF9800"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "#666", fontSize: "13px", fontWeight: "600" }}>TOP CATEGORY</h4>
                    <span style={{ fontSize: "20px" }}>🎯</span>
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: "#FF9800", wordBreak: "break-word" }}>
                    {analyticsData.summary.topSpendingCategory || 'None'}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                    Highest spending
                  </div>
                </div>
                
                <div style={{ 
                  background: "white", 
                  padding: "20px", 
                  borderRadius: "12px", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  borderLeft: "4px solid #667eea"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "#666", fontSize: "13px", fontWeight: "600" }}>TRANSACTIONS</h4>
                    <span style={{ fontSize: "20px" }}>💳</span>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: "#667eea" }}>
                    {transactions.length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>
                    Total recorded
                  </div>
                </div>
              </div>

              {/* Monthly Spending Trend */}
              <div style={{
                background: "white",
                padding: "28px",
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                marginBottom: "32px",
                border: "1px solid #f3f4f6"
              }}>
                <h3 style={{ color: "#1f2937", margin: "0 0 24px 0", fontSize: "18px", fontWeight: "700" }}>
                  📊 Spending Trends Analysis
                </h3>
                <div style={{ height: "250px" }}>
                  {analyticsData.monthlySpending.labels.length > 0 ? (
                    <Line data={monthlySpendingChartData} options={chartOptions} />
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#999" }}>
                      No spending data available for the selected period
                    </div>
                  )}
                </div>
              </div>

              {/* Charts Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{
                  background: "white",
                  padding: "28px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #f3f4f6"
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: "#1f2937", margin: 0, fontSize: "18px", fontWeight: "700" }}>🎨 Expense Distribution</h3>
                    <select 
                      value={categoryChartType} 
                      onChange={(e) => setCategoryChartType(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px',
                        background: 'white',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#374151'
                      }}
                    >
                      <option value="pie">Pie Chart</option>
                      <option value="doughnut">Doughnut Chart</option>
                    </select>
                  </div>
                  <div style={{ height: "250px" }}>
                    {categoryChartType === 'pie' ? (
                      <Pie data={categoryChartData} options={chartOptions} />
                    ) : (
                      <Doughnut data={categoryChartData} options={chartOptions} />
                    )}
                  </div>
                </div>

                <div style={{
                  background: "white",
                  padding: "28px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #f3f4f6"
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: "#1f2937", margin: 0, fontSize: "18px", fontWeight: "700" }}>📊 Income vs Expenses</h3>
                    <select 
                      value={incomeExpenseChartType} 
                      onChange={(e) => setIncomeExpenseChartType(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px',
                        background: 'white',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: '#374151'
                      }}
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                    </select>
                  </div>
                  <div style={{ height: "250px" }}>
                    {incomeExpenseChartType === 'bar' ? (
                      <Bar data={incomeExpenseChartData} options={chartOptions} />
                    ) : (
                      <Line data={incomeExpenseChartData} options={chartOptions} />
                    )}
                  </div>
                </div>
              </div>

              {/* Financial Recommendations */}
              <div style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "25px",
                borderRadius: "16px",
                color: "white",
                marginTop: "25px"
              }}>
                <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>Financial Recommendations</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div style={{ background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Savings Optimization</div>
                    <div style={{ fontSize: "13px", opacity: 0.9 }}>
                      {analyticsData.summary.totalIncome > 0 && (analyticsData.summary.netSavings || 0) / analyticsData.summary.totalIncome > 0.2 
                        ? "Excellent savings rate! Consider investing surplus funds for better returns."
                        : "Try to increase your savings rate by reducing unnecessary expenses."}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "5px" }}>Budget Allocation</div>
                    <div style={{ fontSize: "13px", opacity: 0.9 }}>
                      {analyticsData.summary.topSpendingCategory !== 'None' 
                        ? `Monitor ${analyticsData.summary.topSpendingCategory} expenses. Set monthly limits for better control.`
                        : "Start tracking your expenses by category to get better insights."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{
                background: "white",
                padding: "25px",
                borderRadius: "16px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                marginTop: "25px"
              }}>
                <h3 style={{ color: "#333", margin: "0 0 15px 0", fontSize: "18px" }}>Quick Actions</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
                  <button onClick={() => navigate('/add-transaction')} style={{
                    background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                    color: "white", border: "none", padding: "15px", borderRadius: "12px",
                    cursor: "pointer", fontSize: "14px", fontWeight: "600"
                  }}>Add Transaction</button>
                  <button onClick={() => navigate('/expense-history')} style={{
                    background: "linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)",
                    color: "white", border: "none", padding: "15px", borderRadius: "12px",
                    cursor: "pointer", fontSize: "14px", fontWeight: "600"
                  }}>Expense History</button>
                  <button onClick={() => navigate('/income-history')} style={{
                    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                    color: "white", border: "none", padding: "15px", borderRadius: "12px",
                    cursor: "pointer", fontSize: "14px", fontWeight: "600"
                  }}>Income History</button>
                  <button onClick={() => navigate('/profile')} style={{
                    background: "linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)",
                    color: "white", border: "none", padding: "15px", borderRadius: "12px",
                    cursor: "pointer", fontSize: "14px", fontWeight: "600"
                  }}>Profile Settings</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "30px", borderRadius: "16px", width: "400px", textAlign: "center"
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Export Financial Data</h3>
            <p style={{ margin: "0 0 20px 0", color: "#666" }}>Download your financial data as JSON file</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={exportData} style={{
                background: "#4CAF50", color: "white", border: "none", padding: "12px 24px",
                borderRadius: "8px", cursor: "pointer", fontWeight: "500"
              }}>Download</button>
              <button onClick={() => setShowExportModal(false)} style={{
                background: "#ccc", color: "#333", border: "none", padding: "12px 24px",
                borderRadius: "8px", cursor: "pointer"
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AnalyticsPage;