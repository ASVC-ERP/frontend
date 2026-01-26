const BASE_URL = `${API_BASE_URL}/customer`;

export async function fetchCustomers() {
  const res = await fetch(BASE_URL);

  if (!res.ok)
    throw new Error('Failed to fetch customers');
  return res.json();
}

export async function fetchCustomerById(id) {
  const res = await fetch(`${BASE_URL}/${id}`);

  if (!res.ok)
    throw new Error('Failed to fetch customer');
  return res.json();
}

export async function createCustomer(payload) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok)
    throw new Error('Failed to create customer');
  return res.json();
}

export async function updateCustomer(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok)
    throw new Error('Failed to update customer');
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok)
    throw new Error('Failed to delete customer');
  return res.json();
}
