import Swal from "sweetalert2";

export const checkDuplicateProduct = (itemName, existingItems, currentIndex = -1) => {
  const alreadyExists = existingItems.some(
    (item, idx) => idx !== currentIndex && item.itemName === itemName
  );

  if (alreadyExists) {
    Swal.fire({
      icon: "warning",
      iconColor: "#1E5A84",
      title: "Duplicate Product",
      text: `${itemName} is already in the order list.`,
      confirmButtonColor: "#1E5A84",
    });
    return true;
  }
  return false;
};