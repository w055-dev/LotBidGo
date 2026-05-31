const ExcelJS = require('exceljs');

class ExportService {
  async toExcel(data, columns, filename) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Отчёт');

    sheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 20
    }));

    data.forEach((row) => sheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();
    return { buffer, filename };
  }
}

module.exports = new ExportService();