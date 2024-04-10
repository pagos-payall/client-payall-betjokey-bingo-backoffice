const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
const hh = String(today.getHours()).padStart(2, '0');
const MM = String(today.getMinutes()).padStart(2, '0');
export const isoShortDate = () => yyyy + '-' + mm + '-' + dd + 'T' + hh + ':' + MM;