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
// extraParams (optional): merged into the query string, e.g. { limit: 100 } --
// keep this in sync with whatever the on-screen dashboard requested.
export async function exportReport(path, range, extraParams) {
  const res = await axios.get(`${API_URL}/reports/${path}/export`, {
    params: { from: range.from, to: range.to, ...extraParams },
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

// One customer's profile + order history: /reports/customers/:id/export.
export async function exportCustomerDetail(customerId, range) {
  const res = await axios.get(`${API_URL}/reports/customers/${customerId}/export`, {
    params: { from: range.from, to: range.to },
    responseType: "blob",
  });
  download(res.data, `customer-${customerId}_${range.from}_${range.to}.xlsx`);
}
