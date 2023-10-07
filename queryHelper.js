const rowExists = (q) => {
    if (q.rowCount === 0) return false;
    return true
}

module.exports = {rowExists}