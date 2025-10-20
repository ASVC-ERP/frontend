import Swal from "sweetalert2";

export default function showAlert(type, message) {
  if (type === "success") {
    Swal.fire({
      text: message,
      icon: "success",
      showConfirmButton: false,
      timer: 2000,
    });
  } else {
    Swal.fire({
      text: message,
      icon: type, // "error", "warning", "info", "question"
      confirmButtonColor: "#1E5A84",
    });
  }
}
