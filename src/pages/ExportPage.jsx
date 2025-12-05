import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportStatus(`Generating ${format.toUpperCase()} export...`);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:9090/api/export/${format}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        
        // Check if response is plain text (error/info message only)
        if (contentType && contentType.includes("text/plain")) {
          const text = await response.text();
          alert("ℹ️ " + text);
          setExportStatus(`ℹ️ ${text}`);
        } else if (contentType && contentType.includes("application/json")) {
          // Handle JSON response
          const data = await response.json();
          alert(data.message || JSON.stringify(data));
          setExportStatus(`ℹ️ ${data.message || 'Response received'}`);
        } else {
          // Download file (CSV, PDF, ODF, or any binary)
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          
          // Determine file extension based on format or content type
          let extension = format;
          if (contentType && contentType.includes("application/pdf")) {
            extension = "pdf";
          } else if (contentType && contentType.includes("text/csv")) {
            extension = "csv";
          }
          
          a.href = url;
          a.download = `financial_report_${new Date().getTime()}.${extension}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
          setExportStatus(`✅ ${format.toUpperCase()} downloaded successfully!`);
        }
      } else {
        const contentType = response.headers.get("content-type");
        let errorText = "Unknown error";
        
        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          errorText = error.message || JSON.stringify(error);
        } else {
          errorText = await response.text();
        }
        
        console.error("Export failed:", errorText);
        setExportStatus(`❌ Failed to export ${format.toUpperCase()}: ${errorText}`);
      }
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      setExportStatus(`❌ Error exporting ${format.toUpperCase()}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus(""), 5000);
    }
  };

  const handleCloudBackup = (provider) => {
    alert(`${provider} integration coming soon! This will allow you to backup your data directly to ${provider}.`);
  };

  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: "280px", minHeight: "100vh", background: "#E8EAF6" }}>
        <Navbar />
        <div style={{ padding: "30px" }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "20px",
            padding: "40px",
            marginBottom: "30px",
            color: "white"
          }}>
            <h1 style={{ margin: "0 0 10px 0", fontSize: "36px" }}>📥 Export & Backup</h1>
            <p style={{ margin: 0, fontSize: "16px", opacity: 0.9 }}>
              Download your financial data or backup to cloud storage
            </p>
          </div>

          {exportStatus && (
            <div style={{
              background: exportStatus.includes("✅") ? "#d4edda" : "#f8d7da",
              color: exportStatus.includes("✅") ? "#155724" : "#721c24",
              padding: "15px 20px",
              borderRadius: "10px",
              marginBottom: "20px",
              fontSize: "16px",
              fontWeight: "600"
            }}>
              {exportStatus}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            {/* PDF Export */}
            <div style={{
              background: "white",
              borderRadius: "15px",
              padding: "30px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "all 0.3s"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📄</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#1A237E", fontSize: "22px" }}>PDF Report</h3>
              <p style={{ margin: "0 0 20px 0", color: "#666", lineHeight: "1.6" }}>
                Download a comprehensive PDF report with all your transactions, budgets, and financial summary.
              </p>
              <button
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#FF5252",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  opacity: isExporting ? 0.6 : 1,
                  transition: "all 0.3s"
                }}
                onMouseOver={(e) => !isExporting && (e.target.style.transform = "translateY(-2px)")}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Download PDF
              </button>
            </div>

            {/* CSV Export */}
            <div style={{
              background: "white",
              borderRadius: "15px",
              padding: "30px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "all 0.3s"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📊</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#1A237E", fontSize: "22px" }}>CSV Data</h3>
              <p style={{ margin: "0 0 20px 0", color: "#666", lineHeight: "1.6" }}>
                Export your transaction data in CSV format for use in Excel, Google Sheets, or other tools.
              </p>
              <button
                onClick={() => handleExport("csv")}
                disabled={isExporting}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  opacity: isExporting ? 0.6 : 1,
                  transition: "all 0.3s"
                }}
                onMouseOver={(e) => !isExporting && (e.target.style.transform = "translateY(-2px)")}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Download CSV
              </button>
            </div>

            {/* ODF Export */}
            <div style={{
              background: "white",
              borderRadius: "15px",
              padding: "30px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              transition: "all 0.3s"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "15px" }}>📝</div>
              <h3 style={{ margin: "0 0 10px 0", color: "#1A237E", fontSize: "22px" }}>ODF Format</h3>
              <p style={{ margin: "0 0 20px 0", color: "#666", lineHeight: "1.6" }}>
                Export data in Open Document Format (ODF) compatible with LibreOffice and OpenOffice.
              </p>
              <button
                onClick={() => handleExport("odf")}
                disabled={isExporting}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#FF9800",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: isExporting ? "not-allowed" : "pointer",
                  opacity: isExporting ? 0.6 : 1,
                  transition: "all 0.3s"
                }}
                onMouseOver={(e) => !isExporting && (e.target.style.transform = "translateY(-2px)")}
                onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
              >
                Download ODF
              </button>
            </div>
          </div>

          {/* Cloud Backup Section */}
          <div style={{
            background: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            <h2 style={{ margin: "0 0 20px 0", color: "#1A237E", fontSize: "24px" }}>☁️ Cloud Backup</h2>
            <p style={{ margin: "0 0 30px 0", color: "#666", lineHeight: "1.6" }}>
              Automatically backup your financial data to cloud storage providers
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              {/* Google Drive */}
              <div style={{
                border: "2px solid #E8EAF6",
                borderRadius: "12px",
                padding: "25px",
                textAlign: "center",
                transition: "all 0.3s",
                cursor: "pointer"
              }}
              onClick={() => handleCloudBackup("Google Drive")}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#4285F4";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#E8EAF6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: "56px", marginBottom: "15px" }}>📁</div>
                <h4 style={{ margin: "0 0 8px 0", color: "#1A237E", fontSize: "18px" }}>Google Drive</h4>
                <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
                  Backup to your Google Drive account
                </p>
                <div style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "#4285F4",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  Connect
                </div>
              </div>

              {/* Dropbox */}
              <div style={{
                border: "2px solid #E8EAF6",
                borderRadius: "12px",
                padding: "25px",
                textAlign: "center",
                transition: "all 0.3s",
                cursor: "pointer"
              }}
              onClick={() => handleCloudBackup("Dropbox")}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#0061FF";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#E8EAF6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: "56px", marginBottom: "15px" }}>📦</div>
                <h4 style={{ margin: "0 0 8px 0", color: "#1A237E", fontSize: "18px" }}>Dropbox</h4>
                <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
                  Backup to your Dropbox account
                </p>
                <div style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "#0061FF",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  Connect
                </div>
              </div>

              {/* OneDrive */}
              <div style={{
                border: "2px solid #E8EAF6",
                borderRadius: "12px",
                padding: "25px",
                textAlign: "center",
                transition: "all 0.3s",
                cursor: "pointer"
              }}
              onClick={() => handleCloudBackup("OneDrive")}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = "#0078D4";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = "#E8EAF6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{ fontSize: "56px", marginBottom: "15px" }}>☁️</div>
                <h4 style={{ margin: "0 0 8px 0", color: "#1A237E", fontSize: "18px" }}>OneDrive</h4>
                <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
                  Backup to your OneDrive account
                </p>
                <div style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "#0078D4",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>
                  Connect
                </div>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div style={{
            background: "#FFF3E0",
            border: "2px solid #FFB74D",
            borderRadius: "12px",
            padding: "20px",
            marginTop: "30px"
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#E65100", fontSize: "18px" }}>ℹ️ Export Information</h3>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#666", lineHeight: "1.8" }}>
              <li><strong>PDF Report:</strong> Includes summary charts, transaction history, and budget analysis</li>
              <li><strong>CSV Data:</strong> Raw data export compatible with Excel and Google Sheets</li>
              <li><strong>ODF Format:</strong> Open Document Format for LibreOffice and OpenOffice</li>
              <li><strong>Cloud Backup:</strong> Automatic daily backups to your preferred cloud storage</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default ExportPage;
