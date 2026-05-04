function formatTimeAgo(date) {
  const now = new Date();
  const past = new Date(date);

  let diff = Math.floor((now - past) / 1000); // detik

  const units = [
    { label: "th", seconds: 31536000 },
    { label: "bln", seconds: 2592000 },
    { label: "h", seconds: 86400 },
    { label: "j", seconds: 3600 },
    { label: "m", seconds: 60 },
    { label: "d", seconds: 1 },
  ];

  let result = [];

  for (let u of units) {
    const value = Math.floor(diff / u.seconds);
    if (value > 0) {
      result.push(`${value}${u.label}`);
      diff -= value * u.seconds;
    }

    // maksimal 2 unit biar tidak kepanjangan
    if (result.length === 2) break;
  }

  return result.length ? result.join(" ") + " lalu" : "baru saja";
}

export default formatTimeAgo;