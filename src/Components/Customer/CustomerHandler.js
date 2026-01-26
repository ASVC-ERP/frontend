import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export const useCustomerHandlers = (customers, onRefreshCustomers) => {
  const API_URL = import.meta.env.VITE_API_URL;

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  // Modal state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerTIN, setCustomerTIN] = useState("");
  const [customerTerms, setCustomerTerms] = useState("");
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Search effect
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const filtered = customers.filter((row) =>
        Object.values(row).some((field) =>
          field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(customers);
    }
  }, [customers, searchTerm]);

  // Auto-refresh effect
  useEffect(() => {
    if (searchTerm.trim() !== "") return;

    const interval = setInterval(() => {
      onRefreshCustomers();
    }, 120000);

    return () => clearInterval(interval);
  }, [onRefreshCustomers, searchTerm]);

  const handleSearch = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = customers.filter((row) =>
      Object.values(row).some((field) =>
        field?.toString().toLowerCase().includes(value)
      )
    );

    setFilteredData(filtered);
  };

  const clearForm = () => {
    setCustomerName("");
    setContactPerson("");
    setCustomerContact("");
    setCustomerAddress("");
    setCustomerTIN("");
    setCustomerTerms("");
  };

  const handleAddCustomerClick = () => {
    clearForm();
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    onRefreshCustomers();
    clearForm();
  };

  const handleSubmitCustomer = async (e) => {
    e.preventDefault();

    try {
      const newCustomer = {
        name: customerName,
        pic: contactPerson,
        number: customerContact,
        address: customerAddress,
        tin: customerTIN,
        terms: customerTerms,
      };

      Swal.fire({
        title: "Adding Customer",
        text: "Please wait while we add a new customer...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.post(`${API_URL}/customer`, newCustomer);

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Customer Added",
        text: "The customer has been added successfully!",
        showConfirmButton: false,
        timer: 1000,
      });

      onRefreshCustomers();
      handleCloseCustomerModal();
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#d33",
      });
    }
  };

  const handleEditCustomerClick = (customer) => {
    setEditingCustomer(customer);
    setCustomerName(customer.name);
    setContactPerson(customer.pic || "");
    setCustomerContact(customer.number);
    setCustomerAddress(customer.address);
    setCustomerTIN(customer.tin || "");
    setCustomerTerms(customer.terms || "");
    setShowEditModal(true);
  };

  const handleSubmitEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const updatedCustomer = {
        name: customerName,
        pic: contactPerson,
        number: customerContact,
        address: customerAddress,
        tin: customerTIN,
        terms: customerTerms,
      };
      await axios.put(
        `${API_URL}/customer/${editingCustomer.id}`,
        updatedCustomer
      );

      Swal.fire({
        icon: "success",
        title: "Customer Updated",
        text: "Customer details updated successfully!",
        showConfirmButton: false,
        timer: 1000,
      });

      onRefreshCustomers();
      handleCloseCustomerModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#d33",
      });
    }
    setShowEditModal(false);
  };

  const handleDeleteCustomer = async (customerID) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `This will permanently delete customer ${customerID}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete the customer.",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.delete(`${API_URL}/customer/${customerID}`);

      Swal.close();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `Customer ${customerID} deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      onRefreshCustomers();
    } catch (err) {
      Swal.close();
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to delete customer ${customerID}.`,
      });
    }
  };

  return {
    // Search state
    searchTerm,
    filteredData,
    handleSearch,
    // Modal state
    showCustomerModal,
    setShowCustomerModal,
    customerName,
    setCustomerName,
    contactPerson,
    setContactPerson,
    customerContact,
    setCustomerContact,
    customerAddress,
    setCustomerAddress,
    customerTIN,
    setCustomerTIN,
    customerTerms,
    setCustomerTerms,
    editingCustomer,
    showEditModal,
    setShowEditModal,
    // Handlers
    handleAddCustomerClick,
    handleCloseCustomerModal,
    handleSubmitCustomer,
    handleEditCustomerClick,
    handleSubmitEditCustomer,
    handleDeleteCustomer,
  };
};