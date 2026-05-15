export const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(value || 0);
