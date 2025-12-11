import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AddTransactionPage from "./pages/AddTransactionPage";
import TransactionsPage from "./pages/TransactionsPage";
import IncomeHistoryPage from "./pages/IncomeHistoryPage";
import ExpenseHistoryPage from "./pages/ExpenseHistoryPage";
import BudgetPage from "./pages/BudgetPage";
import SavingsPage from "./pages/SavingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DashboardPage from "./pages/DashboardPage";
import ForumPage from "./pages/ForumPage";
import ExportPage from "./pages/ExportPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import SettingsPage from "./pages/SettingsPage";
import OAuthCallback from "./pages/OAuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingAIButton from "./components/FloatingAIButton";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/pageTransitions.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FloatingAIButton />
        <Routes>
          <Route path="/" element={<ProtectedRoute><div className="page-container"><HomePage /></div></ProtectedRoute>} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/profile" element={<ProtectedRoute><div className="page-container"><ProfilePage /></div></ProtectedRoute>} />
          <Route path="/add-transaction" element={<ProtectedRoute><div className="page-container"><AddTransactionPage /></div></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><div className="page-container"><TransactionsPage /></div></ProtectedRoute>} />
          <Route path="/income-history" element={<ProtectedRoute><div className="page-container"><IncomeHistoryPage /></div></ProtectedRoute>} />
          <Route path="/expense-history" element={<ProtectedRoute><div className="page-container"><ExpenseHistoryPage /></div></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><div className="page-container"><BudgetPage /></div></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><div className="page-container"><SavingsPage /></div></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><div className="page-container"><AnalyticsPage /></div></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><div className="page-container"><DashboardPage /></div></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><div className="page-container"><ForumPage /></div></ProtectedRoute>} />
          <Route path="/export" element={<ProtectedRoute><div className="page-container"><ExportPage /></div></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><div className="page-container"><AIAssistantPage /></div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div className="page-container"><SettingsPage /></div></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;