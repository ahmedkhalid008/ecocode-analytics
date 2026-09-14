import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalyticsSummary, WorkloadCO2Ranking } from "./types";

/**
 * Exports workload telemetry dataset to a downloadable CSV file using PapaParse.
 */
export function exportToCSV(
  rankings: WorkloadCO2Ranking[],
  filename: string = `ecocode_telemetry_${new Date().toISOString().slice(0, 10)}.csv`
): void {
  if (!rankings || rankings.length === 0) {
    alert("No telemetry data available to export.");
    return;
  }

  const exportData = rankings.map((item) => ({
    "Workload Name": item.workload_name,
    "Category": item.workload_category,
    "Total Executions": item.total_runs,
    "Avg Duration (sec)": item.avg_execution_time_sec,
    "Total Energy (kWh)": item.total_energy_kwh,
    "Total CO2 Emitted (g)": item.total_co2_grams,
  }));

  const csvString = Papa.unparse(exportData);
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a professional PDF Carbon & FinOps Audit Report using jsPDF and autoTable.
 */
export function exportToPDF(
  summary: AnalyticsSummary | null,
  rankings: WorkloadCO2Ranking[],
  orgName: string = "Tenant Organization",
  timeRange: string = "30d"
): void {
  if (!rankings || rankings.length === 0) {
    alert("No telemetry data available to generate PDF audit report.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [16, 185, 129]; // Emerald #10B981
  const darkTextColor = [15, 23, 42];  // Slate 900 #0F172A
  const textMutedColor = [100, 116, 139]; // Slate 500

  // 1. Header Banner (Emerald Green)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("EcoCode Analytics", 14, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Software Carbon Telemetry & Green FinOps Audit Report", 14, 21);

  // 2. Report Metadata
  const generatedDate = new Date().toLocaleString();
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Organization: ${orgName}`, 14, 36);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(textMutedColor[0], textMutedColor[1], textMutedColor[2]);
  doc.text(`Report Period: ${timeRange.toUpperCase()} | Generated: ${generatedDate}`, 14, 42);

  // 3. Executive KPI Summary Box
  if (summary) {
    doc.setFillColor(248, 250, 252); // Background #F8FAFC
    doc.setDrawColor(226, 232, 240); // Border #E2E8F0
    doc.roundedRect(14, 47, 182, 30, 3, 3, "FD");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("EXECUTIVE FINOPS KPI SUMMARY", 18, 54);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

    const col1X = 18;
    const col2X = 75;
    const col3X = 135;

    doc.text(`Total Cost: $${summary.total_cost_usd.toFixed(2)}`, col1X, 62);
    doc.text(`Total Energy: ${summary.total_energy_kwh.toFixed(4)} kWh`, col2X, 62);
    doc.text(`Total CO2: ${summary.total_co2_grams.toFixed(2)} gCO2eq`, col3X, 62);

    doc.text(`Total Executions: ${summary.total_runs}`, col1X, 70);
    doc.text(`Optimization Savings: ${summary.estimated_savings_pct}%`, col2X, 70);
    doc.text(`Electricity Rate: $0.15 / kWh`, col3X, 70);
  }

  // 4. Tabular Breakdown using autoTable
  const tableRows = rankings.map((item) => [
    item.workload_name,
    item.workload_category,
    item.total_runs.toString(),
    `${item.avg_execution_time_sec.toFixed(4)}s`,
    `${item.total_energy_kwh.toFixed(4)}`,
    `${item.total_co2_grams.toFixed(2)} g`,
  ]);

  autoTable(doc, {
    startY: summary ? 83 : 48,
    head: [["Workload Name", "Category", "Executions", "Avg Duration", "Energy (kWh)", "CO2 Emitted"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [5, 150, 105], // Emerald 600 #059669
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35 },
      2: { cellWidth: 22, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Footer Page Numbers
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(textMutedColor[0], textMutedColor[1], textMutedColor[2]);
    doc.text(
      `EcoCode Analytics Green FinOps Platform • Confidential • Page ${i} of ${totalPages}`,
      105,
      290,
      { align: "center" }
    );
  }

  // Save PDF
  const filename = `ecocode_green_finops_audit_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
