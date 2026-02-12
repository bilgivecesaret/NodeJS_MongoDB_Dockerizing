const xlsx = require('node-xlsx');


class Import {
    fromExcel(file) {
        const rows = xlsx.parse(file.buffer)[0].data; // buffer direkt
        return rows;
    }

    parseExcelDate(value) {
        if (!value) return new Date();

        if (typeof value === 'number') {
            return new Date(Math.round((value - 25569) * 86400 * 1000));
        }

        if (typeof value === 'string') {
            const parts = value.split(' ');
            if (parts.length !== 2) return new Date();
            const [datePart, timePart] = parts;
            const [day, month, year] = datePart.split('.');
            if (!day || !month || !year) return new Date();
            const isoStr = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${timePart}`;
            const d = new Date(isoStr);
            return isNaN(d.getTime()) ? new Date() : d;
        }

        return new Date();
    }
}

module.exports = Import;


