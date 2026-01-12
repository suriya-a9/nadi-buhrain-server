module.exports = function formatDate(date, withTime = false) {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    if (withTime) {
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}, ${hours}:${minutes}`;
    }
    return `${day}-${month}-${year}`;
}