// generate ticket code dengan format: TCK-YYYYMMDD-RANDOM
const generateTicketCode = () => {
  const date = new Date();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `TC-${yyyy}${mm}${dd}-${random}`;
};

// Cek ketersediaan kode tiket di database
export const generateUniqueTicketCode = async (client) => {
  let ticketCode = "";
  let isUnique = false;

  while (!isUnique) {
    ticketCode = generateTicketCode();

    const check = await client.query(
      `SELECT 1 FROM tickets WHERE ticket_code = $1 LIMIT 1`,
      [ticketCode],
    );

    if (check.rowCount === 0) {
      isUnique = true;
    }
  }

  return ticketCode;
};


