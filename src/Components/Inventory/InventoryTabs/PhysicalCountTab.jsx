import { useState, useEffect } from "react";
import axios from "axios";

function PhysicalCountTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemId = item?.id || 0;

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!itemId) {
        setData([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/product/${itemId}/stock-adjustments`,
          {
            params: { itemId },
          }
        );
        setData(response.data);
      } catch (error) {
        console.error("Error fetching Physical Count:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  return (
    <div className="details-table-card">
      <div className="details-table-header">
        <div className="details-table-title">Physical Count</div>
        <div className="details-item-count">
          {data.length} adjustment{data.length === 1 ? "" : "s"}
        </div>
      </div>

      {loading ? (
        <div className="details-table-empty">Loading…</div>
      ) : data.length === 0 ? (
        <div className="details-table-empty">
          No stock adjustments for this item.
        </div>
      ) : (
        <div className="details-table-scroll">
          <table className="details-table">
            <thead>
              <tr>
                <th>From Quantity</th>
                <th>To Quantity</th>
                <th>Adjusted Quantity</th>
                <th>Date</th>
                <th>PIC</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={row.id ?? i}>
                  <td className="details-num">{row.from_quantity}</td>
                  <td className="details-num">{row.to_quantity}</td>
                  <td className="details-num">{row.adjusted_quantity}</td>
                  <td>{row.created_at}</td>
                  <td>{row.pic}</td>
                  <td>
                    <div
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "220px",
                      }}
                      title={row.remarks}
                    >
                      {row.remarks}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PhysicalCountTab;
