import { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";

function CostHistoryTab({ item }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemID = item?.itemID || "";

  const API_URL = import.meta.env.VITE_API_URL;

  const customStyles = {
    headCells: {
      style: {
        fontSize: "0.875rem",
        fontWeight: "600",
        color: "#1E5A84",
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!itemID) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching cost history for item:", itemID);

        const costRes = await axios.get(
          `${API_URL}/supplier-invoice/costs/${itemID}`
        );

        console.log("Cost history data:", costRes.data);

        const costData = costRes.data;

        console.log("Final merged data (to setState):", costData);

        setData(costData);
      } catch (error) {
        console.error("❌ Error fetching cost history:", error);

        setData([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemID]);

  // Define table columns
  const columns = [
    {
      id: 1,
      name: "PO #",
      selector: (row) => row.supplier_invoices?.po_number ?? "",
      sortable: true,
      grow: 0.8,
      wrap: true,
    },

    {
      id: 2,
      name: "Date",
      selector: (row) =>
        row.supplier_invoices?.purchase_date
          ? new Date(row.supplier_invoices.purchase_date).getTime()
          : 0,
      cell: (row) => {
        if (!row.supplier_invoices?.purchase_date) return "";
        const d = new Date(row.supplier_invoices.purchase_date);
        return `${d.getMonth() + 1}/${d.getDate()}/${String(
          d.getFullYear()
        ).slice(-2)}`;
      },
      sortable: true,
      grow: 0.8,
      wrap: true,
    },

    {
      id: 3,
      name: "Invoice ID",
      selector: (row) => row.supplier_invoices?.invoice_number ?? "",
      sortable: true,
      grow: 1,
      wrap: true,
    },

    {
      id: 4,
      name: "Quantity",
      selector: (row) => Number(row.quantity ?? 0),
      sortable: true,
      grow: 0.8,
      wrap: true,
    },

    {
      id: 5,
      name: "Currency",
      selector: (row) => row.supplier_invoices?.suppliers?.currency ?? "",
      sortable: true,
      grow: 0.8,
      wrap: true,
    },

    {
      id: 6,
      name: "Conversion Factor",
      selector: (row) => Number(row.supplier_invoices?.conversion_factor ?? 0),
      sortable: true,
      wrap: true,
      grow: 1.2,
    },

    {
      id: 7,
      name: "Cost",
      selector: (row) => Number(row.unit_cost ?? 0),
      cell: (row) =>
        row.unit_cost
          ? Number(row.unit_cost).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })
          : "",
      sortable: true,
      wrap: true,
      grow: 1,
    },

    {
      id: 8,
      name: "Supplier",
      selector: (row) => row.supplier_invoices?.suppliers?.name ?? "",
      sortable: true, // ✅ now sortable safely
      wrap: true,
      grow: 2,
    },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="200px"
        customStyles={customStyles}
        dense
        defaultSortFieldId={1}
        defaultSortAsc={false}
      />
    </div>
  );
}

export default CostHistoryTab;
