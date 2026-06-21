import Swal from "sweetalert2";
import "./swal.css";

export const imsSwal = Swal.mixin({
  customClass: {
    popup: "ims-swal",
    title: "ims-swal-title",
    htmlContainer: "ims-swal-text",
    confirmButton: "ims-swal-confirm",
    cancelButton: "ims-swal-cancel",
    denyButton: "ims-swal-deny",
  },
  buttonsStyling: false,
});

export const showLoadingSwal = (title = "Processing", text = "Please wait...") => {
  return imsSwal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => imsSwal.showLoading(),
  });
};

export const showSuccessSwal = (title = "Success", text = "Operation completed successfully.") => {
  return imsSwal.fire({
    icon: "success",
    iconColor: "#639922",
    title,
    text,
    confirmButtonText: "OK",
  });
};

export const showErrorSwal = (title = "Error", text = "Something went wrong.") => {
  return imsSwal.fire({
    icon: "error",
    iconColor: "#dc3545",
    title,
    text,
    confirmButtonText: "OK",
  });
};

export const showWarningSwal = (title = "Warning", text = "Please check your input.") => {
  return imsSwal.fire({
    icon: "warning",
    iconColor: "#f59e0b",
    title,
    text,
    confirmButtonText: "OK",
  });
};

export const showConfirmSwal = ({
  title = "Are you sure?",
  html = "",
  text = "",
  confirmButtonText = "Yes",
  cancelButtonText = "Cancel",
  confirmColor = "blue",
} = {}) => {
  const confirmClass =
    confirmColor === "green"
      ? "ims-swal-confirm-green"
      : confirmColor === "red"
      ? "ims-swal-confirm-red"
      : "ims-swal-confirm";

  return imsSwal.fire({
    icon: "warning",
    title,
    html,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    customClass: {
      popup: "ims-swal",
      title: "ims-swal-title",
      htmlContainer: "ims-swal-text",
      confirmButton: confirmClass,
      cancelButton: "ims-swal-cancel",
    },
    buttonsStyling: false,
  });
};