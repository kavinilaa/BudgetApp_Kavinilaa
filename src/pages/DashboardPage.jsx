import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Line, Bar, Doughnut } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../Analytics.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, net: 0, savingsRate: 0 });
  const [categoryData, setCategoryData] = useState(null);
  const [last6MonthsData, setLast6MonthsData] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState('all'); // all, income, expense
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('line'); // line, bar for income vs expenses
  const [categoryChartType, setCategoryChartType] = useState('pie'); // pie, doughnut for category

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch profile
      try {
        const profileRes = await API.get("/user/profile", { headers });
        setProfile(profileRes.data);
      } catch (err) {
        const username = localStorage.getItem('username') || 'User';
        setProfile({ name: username, username, email: 'user@example.com' });
      }

      // Fetch analytics data
      const [summaryRes, categoryRes, incomeVsExpenseRes, incomesRes, expensesRes] = await Promise.all([
        API.get('/analytics/summary', { headers }),
        API.get('/analytics/category-breakdown', { headers }),
        API.get('/analytics/income-vs-expenses', { headers }),
        API.get('/transactions/incomes', { headers }),
        API.get('/transactions/expenses', { headers })
      ]);

      // Process summary data
      const summaryData = summaryRes.data;
      setSummary({
        income: summaryData.totalIncome || 0,
        expenses: summaryData.totalExpenses || 0,
        net: summaryData.netSavings || 0,
        savingsRate: summaryData.totalIncome > 0 ? ((summaryData.netSavings || 0) / summaryData.totalIncome * 100).toFixed(1) : 0
      });

      // Process category data for pie chart - filter out empty categories
      const categoryBreakdown = categoryRes.data;
      if (categoryBreakdown.labels && categoryBreakdown.labels.length > 0) {
        // Filter out categories with zero or null values
        const filteredLabels = [];
        const filteredData = [];
        categoryBreakdown.labels.forEach((label, index) => {
          const value = categoryBreakdown.data[index];
          if (value && value > 0) {
            filteredLabels.push(label);
            filteredData.push(value);
          }
        });
        
        if (filteredLabels.length > 0) {
          setCategoryData({
            labels: filteredLabels,
            datasets: [{
              data: filteredData,
              backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
              borderColor: 'white',
              borderWidth: 2
            }]
          });
        }
      }

      // Process 6-month data for line chart
      const incomeVsExpense = incomeVsExpenseRes.data;
      if (incomeVsExpense.labels && incomeVsExpense.labels.length > 0) {
        setLast6MonthsData({
          labels: incomeVsExpense.labels,
          datasets: [
            {
              label: 'Income',
              data: incomeVsExpense.incomeData,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: '#10b981',
              pointBorderColor: 'white',
              pointBorderWidth: 2
            },
            {
              label: 'Expenses',
              data: incomeVsExpense.expenseData,
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: '#ef4444',
              pointBorderColor: 'white',
              pointBorderWidth: 2
            }
          ]
        });
      }

      // Combine and sort all transactions with proper date handling
      const allTransactions = [
        ...incomesRes.data.map(t => ({ 
          ...t, 
          type: 'income', 
          date: t.transactionDate || t.createdAt,
          amount: parseFloat(t.amount || 0)
        })),
        ...expensesRes.data.map(t => ({ 
          ...t, 
          type: 'expense', 
          date: t.transactionDate || t.createdAt,
          amount: parseFloat(t.amount || 0)
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(allTransactions);
      
      // Apply month/year filtering and update everything
      applyMonthYearFilters(allTransactions);

      // Generate AI insights
      generateAIInsights(summaryData, categoryBreakdown);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply month/year filtering to all dashboard data
  const applyMonthYearFilters = (allTxns = transactions) => {
    // Filter all transactions by month/year
    const filteredByMonth = allTxns.filter(t => {
      const txnDate = new Date(t.date);
      const txnMonth = txnDate.getMonth() + 1;
      const txnYear = txnDate.getFullYear();
      return txnMonth === parseInt(filterMonth) && txnYear === parseInt(filterYear);
    });

    // Update summary based on filtered transactions
    const monthIncome = filteredByMonth
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthExpenses = filteredByMonth
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthNet = monthIncome - monthExpenses;
    const monthSavingsRate = monthIncome > 0 ? ((monthNet / monthIncome) * 100).toFixed(1) : 0;

    setSummary({
      income: monthIncome,
      expenses: monthExpenses,
      net: monthNet,
      savingsRate: monthSavingsRate
    });

    // Update category data based on filtered expenses
    const categoryMap = {};
    filteredByMonth
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const categories = Object.keys(categoryMap).filter(cat => categoryMap[cat] > 0);
    if (categories.length > 0) {
      setCategoryData({
        labels: categories,
        datasets: [{
          data: categories.map(cat => categoryMap[cat]),
          backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
          borderColor: 'white',
          borderWidth: 2
        }]
      });
    } else {
      setCategoryData(null);
    }

    // Update line chart - show current month and previous 2 months for line continuity
    const chartLabels = [];
    const chartIncomeData = [];
    const chartExpenseData = [];
    
    for (let i = 2; i >= 0; i--) {
      const targetDate = new Date(filterYear, filterMonth - 1 - i, 1);
      const targetMonth = targetDate.getMonth() + 1;
      const targetYear = targetDate.getFullYear();
      
      const monthTransactions = allTxns.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate.getMonth() + 1 === targetMonth && txnDate.getFullYear() === targetYear;
      });
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      chartLabels.push(targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      chartIncomeData.push(income);
      chartExpenseData.push(expense);
    }
    
    setLast6MonthsData({
      labels: chartLabels,
      datasets: [
        {
          label: 'Income',
          data: chartIncomeData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#10b981',
          pointBorderColor: 'white',
          pointBorderWidth: 2
        },
        {
          label: 'Expenses',
          data: chartExpenseData,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: 'white',
          pointBorderWidth: 2
        }
      ]
    });

    // Apply additional filters for recent transactions
    applyTransactionFilters(filteredByMonth);
  };

  // Filter transactions for the Recent Transactions section
  const applyTransactionFilters = (monthFilteredTxns) => {
    let filtered = [...monthFilteredTxns];
    
    // Filter by transaction type
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(t => t.type === transactionFilter);
    }
    
    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    // Filter by date (additional filter)
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const txnDate = new Date(t.date);
        if (dateFilter === 'today') {
          return txnDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return txnDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return txnDate >= monthAgo;
        }
        return true;
      });
    }
    
    setFilteredTransactions(filtered.slice(0, 10)); // Limit to 10 for display
  };

  // Apply month/year filters when they change
  useEffect(() => {
    if (transactions.length > 0) {
      applyMonthYearFilters();
    }
  }, [filterMonth, filterYear]);

  // Apply transaction-specific filters when they change
  useEffect(() => {
    if (transactions.length > 0) {
      const filteredByMonth = transactions.filter(t => {
        const txnDate = new Date(t.date);
        const txnMonth = txnDate.getMonth() + 1;
        const txnYear = txnDate.getFullYear();
        return txnMonth === parseInt(filterMonth) && txnYear === parseInt(filterYear);
      });
      applyTransactionFilters(filteredByMonth);
    }
  }, [transactionFilter, categoryFilter, dateFilter]);

  // Get unique categories from transactions
  const getUniqueCategories = () => {
    const categories = new Set();
    transactions.forEach(t => {
      if (t.category) categories.add(t.category);
    });
    return Array.from(categories).sort();
  };

  const generateAIInsights = (summaryData, categoryBreakdown) => {
    const insights = [];
    const savingsRate = summaryData.totalIncome > 0 ? (summaryData.netSavings || 0) / summaryData.totalIncome : 0;
    
    // Savings rate insights
    if (savingsRate > 0.3) {
      insights.push({ icon: '🌟', text: 'Outstanding! Your savings rate exceeds 30%. Consider diversifying investments for wealth growth.' });
    } else if (savingsRate > 0.2) {
      insights.push({ icon: '✨', text: 'Excellent savings rate! You\'re on track for financial stability.' });
    } else if (savingsRate > 0.1) {
      insights.push({ icon: '💡', text: 'Good progress! Try increasing savings to 20% for better security.' });
    } else if (savingsRate > 0) {
      insights.push({ icon: '⚡', text: 'Start small: Aim to save at least 10-15% of your income monthly.' });
    } else {
      insights.push({ icon: '⚠️', text: 'Action needed: Expenses exceed income. Review your spending patterns urgently.' });
    }

    // Spending pattern insights
    if (summaryData.currentMonthExpenses > summaryData.currentMonthIncome) {
      insights.push({ icon: '🔴', text: 'Alert: Current month expenses exceed income. Consider cutting non-essential spending.' });
    } else if (summaryData.currentMonthExpenses > 0) {
      const monthlyRate = summaryData.currentMonthIncome > 0 ? 
        (summaryData.currentMonthExpenses / summaryData.currentMonthIncome) : 0;
      if (monthlyRate < 0.7) {
        insights.push({ icon: '✅', text: 'Great job! Your spending is well under control this month.' });
      }
    }

    // Category-specific insights
    if (categoryBreakdown && categoryBreakdown.labels && categoryBreakdown.labels.length > 0) {
      const maxIndex = categoryBreakdown.data.indexOf(Math.max(...categoryBreakdown.data));
      const topCategory = categoryBreakdown.labels[maxIndex];
      const categoryPercent = ((categoryBreakdown.data[maxIndex] / summaryData.totalExpenses) * 100).toFixed(0);
      
      if (categoryPercent > 40) {
        insights.push({ icon: '📊', text: `${topCategory} accounts for ${categoryPercent}% of expenses. Consider setting a monthly budget for this category.` });
      } else {
        insights.push({ icon: '🎯', text: `Your top spending category is ${topCategory}. Monitor it to maintain balanced finances.` });
      }
    }

    // General financial advice
    if (summaryData.totalIncome > 50000 && savingsRate < 0.15) {
      insights.push({ icon: '💰', text: 'With your income level, aim to save at least 15-20% for future goals.' });
    }

    setAiInsights(insights.slice(0, 4)); // Show top 4 insights
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  if (!profile) return (
    <div className="loading-container">
      <div className="loading-text">Loading...</div>
    </div>
  );

  return (
    <>
      <Navbar profile={profile} />
      <div className="analytics-page">
        <Sidebar />
        <div className="analytics-content">
          {/* Welcome Header */}
          <div style={{ marginBottom: '25px' }}>
            <h1 style={{ marginBottom: 8, fontSize: '36px', fontWeight: '700', color: '#1f2937', letterSpacing: '-0.5px' }}>
              Welcome, {profile?.username || profile?.name || 'User'}! 👋
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px', fontWeight: '400' }}>Here's your financial overview</p>
          </div>

          {/* Overall Dashboard Month/Year Filter */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '25px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#4A4A4A' }}>📅 Viewing:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '2px solid #A084E8',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#4A4A4A'
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

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                border: '2px solid #A084E8',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                color: '#4A4A4A'
              }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          {/* Summary Cards */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '24px',
            marginBottom: '40px'
          }}>
            <div style={{
              flex: '1 1 calc(25% - 18px)',
              minWidth: '240px',
              maxWidth: '280px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
              border: '1px solid #d1fae5'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px' }}>TOTAL INCOME</span>
                <span style={{ fontSize: '20px' }}>📈</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', marginBottom: '6px' }}>₹{summary.income.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>💰 Financial inflow</div>
            </div>


            <div style={{
              flex: '1 1 calc(25% - 18px)',
              minWidth: '240px',
              maxWidth: '280px',
              background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)',
              border: '1px solid #fecaca'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px' }}>TOTAL EXPENSES</span>
                <span style={{ fontSize: '20px' }}>💸</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', marginBottom: '6px' }}>₹{summary.expenses.toFixed(2)}</div>
              <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>💳 Money spent</div>
            </div>


            <div style={{
              flex: '1 1 calc(25% - 18px)',
              minWidth: '240px',
              maxWidth: '280px',
              background: summary.net >= 0 ? 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: summary.net >= 0 ? '0 2px 8px rgba(59, 130, 246, 0.08)' : '0 2px 8px rgba(251, 146, 60, 0.08)',
              border: summary.net >= 0 ? '1px solid #dbeafe' : '1px solid #fed7aa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px' }}>NET SAVINGS</span>
                <span style={{ fontSize: '20px' }}>💰</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: summary.net >= 0 ? '#3b82f6' : '#f97316', marginBottom: '6px' }}>
                ₹{summary.net.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: summary.net >= 0 ? '#2563eb' : '#ea580c', fontWeight: '500' }}>📊 {summary.savingsRate}% savings rate</div>
            </div>


            <div style={{
              flex: '1 1 calc(25% - 18px)',
              minWidth: '240px',
              maxWidth: '280px',
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)',
              border: '1px solid #e9d5ff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px' }}>ACTIVE GOALS</span>
                <span style={{ fontSize: '20px' }}>🎯</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#8b5cf6', marginBottom: '6px' }}>0</div>
              <div style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '500' }}>🎪 Track your goals</div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            {/* 6-Month Line Chart */}
            <div style={{
              flex: '1 1 50%',
              maxWidth: '50%',
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>📊 Income vs Expenses (Last 6 Months)</h3>
                <select 
                  value={chartType} 
                  onChange={(e) => setChartType(e.target.value)}
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
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>
              {last6MonthsData ? (
                <div style={{ height: '250px' }}>
                  {chartType === 'line' ? (
                    <Line 
                      data={last6MonthsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              font: { size: 12, weight: 500 },
                              color: '#6b7280',
                              padding: 12,
                              usePointStyle: true
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#9ca3af',
                              font: { size: 11 },
                              callback: function(value) {
                                return '₹' + value.toLocaleString();
                              }
                            },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: '#9ca3af', font: { size: 11 } }
                          }
                        }
                      }}
                    />
                  ) : (
                    <Bar 
                      data={last6MonthsData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              font: { size: 12, weight: 500 },
                              color: '#6b7280',
                              padding: 12,
                              usePointStyle: true
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: '#9ca3af',
                              font: { size: 11 },
                              callback: function(value) {
                                return '₹' + value.toLocaleString();
                              }
                            },
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                          },
                          x: {
                            grid: { display: false },
                            ticks: { color: '#9ca3af', font: { size: 11 } }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="no-data">No data available</div>
              )}
            </div>

            {/* Spending by Category Pie Chart */}
            <div style={{
              flex: '1 1 50%',
              maxWidth: '50%',
              background: 'white',
              padding: '24px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>🎨 Spending by Category</h3>
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
              {categoryData && categoryData.labels.length > 0 ? (
                <div style={{ height: '250px' }}>
                  {categoryChartType === 'pie' ? (
                    <Pie 
                    data={categoryData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'bottom',
                          labels: {
                            font: { size: 10, weight: 500 },
                            color: '#6b7280',
                            padding: 8,
                            usePointStyle: true
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return `${context.label}: ₹${context.parsed.toFixed(0)} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                  ) : (
                    <Doughnut 
                      data={categoryData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              font: { size: 10, weight: 500 },
                              color: '#6b7280',
                              padding: 8,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ₹${context.parsed.toFixed(0)} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="no-data">No expense data available</div>
              )}
            </div>
          </div>

          {/* Recent Transactions & AI Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{
              background: 'white',
              padding: '28px',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>💳 Recent Transactions</h3>
                <button onClick={() => navigate('/transactions')} style={{
                  color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 500
                }}>View All →</button>
              </div>
              
              {/* Transaction Filters */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '18px',
                flexWrap: 'wrap'
              }}>
                <select 
                  value={transactionFilter} 
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    fontSize: '13px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: '#374151'
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>

                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              {/* Transaction List */}
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {loading && <div style={{color:'#6b7280', textAlign: 'center', padding: '20px'}}>Loading transactions...</div>}
                {!loading && filteredTransactions.length === 0 && (
                  <div style={{color:'#6b7280', textAlign: 'center', padding: '20px'}}>
                    {transactions.length === 0 ? 'No transactions yet' : 'No transactions match the filters'}
                  </div>
                )}
                {!loading && filteredTransactions.map(txn => (
                  <div key={`${txn.type}-${txn.id}`} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px', borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                        backgroundColor: txn.type === 'income' ? '#d1fae5' : '#fee2e2',
                        color: txn.type === 'income' ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {txn.type === 'income' ? '↑' : '↓'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{fontWeight:600, color: '#1f2937', fontSize: '14px'}}>
                          {txn.description || 'No description'}
                        </div>
                        <div style={{fontSize:12, color:'#9ca3af', marginTop: '2px'}}>
                          {new Date(txn.date).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontWeight:700, 
                        color: txn.type === 'income' ? '#10b981' : '#ef4444',
                        fontSize: '15px'
                      }}>
                        {txn.type === 'income' ? '+' : '-'}₹{txn.amount.toFixed(2)}
                      </div>
                      <div style={{
                        fontSize: '11px', 
                        color: '#6b7280', 
                        fontWeight: 500,
                        marginTop: '2px',
                        padding: '2px 8px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        display: 'inline-block'
                      }}>
                        {txn.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Transaction Summary */}
              {filteredTransactions.length > 0 && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '13px'
                }}>
                  <span style={{ color: '#6b7280' }}>
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                  </span>
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>
                    Total: ₹{filteredTransactions.reduce((sum, t) => 
                      sum + (t.type === 'income' ? t.amount : -t.amount), 0
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* AI Financial Insights */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
              padding: '28px',
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
              border: '1px solid #e9d5ff'
            }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>✨ AI Financial Insights</h3>
              <div>
                {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                  <div key={index} style={{
                    display: 'flex', gap: '12px', padding: '15px',
                    borderBottom: index < aiInsights.length - 1 ? '1px solid #f3f4f6' : 'none',
                    background: index % 2 === 0 ? '#f9fafb' : 'transparent',
                    borderRadius: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      lineHeight: 1
                    }}>{insight.icon}</span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
                      {insight.text}
                    </p>
                  </div>
                )) : (
                  <div style={{ display: 'flex', gap: '12px', padding: '15px' }}>
                    <span style={{ fontSize: '20px' }}>💡</span>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      Add transactions to receive personalized insights based on your spending patterns...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}