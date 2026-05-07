// Export utilities - CSV and simple report generation

export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        let val = row[h] ?? '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',')
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToHTML = (title, tableData, filename = 'report') => {
  if (!tableData || tableData.length === 0) return;

  const headers = Object.keys(tableData[0]);
  const html = `
<!DOCTYPE html>
<html><head>
<title>${title}</title>
<style>
  body { font-family: 'Inter', sans-serif; padding: 40px; background: #0f172a; color: #e2e8f0; }
  h1 { color: #818cf8; margin-bottom: 8px; }
  .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; background: rgba(30,41,59,0.5); border-radius: 12px; overflow: hidden; }
  th { background: rgba(99,102,241,0.15); color: #a5b4fc; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 600; }
  td { padding: 10px 16px; border-top: 1px solid rgba(148,163,184,0.08); font-size: 13px; }
  tr:hover td { background: rgba(255,255,255,0.03); }
  .footer { margin-top: 24px; text-align: center; color: #475569; font-size: 12px; }
</style></head><body>
  <h1>${title}</h1>
  <p class="meta">Generated on ${new Date().toLocaleString()} | CampusPro</p>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${tableData.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>
  <p class="footer">CampusPro Campus Management System</p>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
};
