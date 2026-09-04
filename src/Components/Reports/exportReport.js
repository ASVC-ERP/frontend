import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Downloads /reports/<path>/export as an .xlsx for the given range.
// Uses the shared axios instance so the auth token + refresh interceptor apply.
export async function exportReport(path, range) {
  const res = await axios.get(`${API_URL}/reports/${path}/export`, {
    params: { from: range.from, to: range.to },
    responseType: "blob",
  });

  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${path}-report_${range.from}_${range.to}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
