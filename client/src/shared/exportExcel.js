export default async function exportExcel(endpoint, filename, setError) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/exports/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Ошибка экспорта');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    if (setError) setError('Ошибка экспорта');
  }
}