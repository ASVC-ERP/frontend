import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Uses the shared axios instance so the auth token + refresh interceptor apply.
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Whole dashboard: /reports/<path>/export -> a workbook with a sheet per panel.
export async function exportReport(path, range) {
  const res = await axios.get(`${API_URL}/reports/${path}/export`, {
    params: { from: range.from, to: range.to },
    responseType: "blob",
  });
  download(res.data, `${path}-report_${range.from}_${range.to}.xlsx`);
}

// One "View full" list: /reports/detail/export?panel=... -> a one-sheet workbook.
export async function exportDetailList(panel, range) {
  const res = await axios.get(`${API_URL}/reports/detail/export`, {
    params: { panel, from: range.from, to: range.to },
    responseType: "blob",
  });
  download(res.data, `${panel}_${range.from}_${range.to}.xlsx`);
}
