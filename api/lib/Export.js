const xlsx = require('node-xlsx');

class Export {
    constructor() {}
    

    /**
     * 
     * @param {Array} titles Excel tablosunun başlıkları
     * @param {Array} columns Excel tablosuna yazılacak verilerin isimleri
     * @param {Array} data Excel tablosuna yazılacak veriler
     * @returns 
     */
    toExcel(titles, columns, data) {
        let rows = [];
        rows.push(titles);
        for(let item of data) {
            let column = [];
            for(let key of columns) {
                column.push(item[key]);
            }
            rows.push(column);
        }
        return xlsx.build([{name: "KATEGORİLER", data: rows}])   ;
    }   
    
}

module.exports = Export;