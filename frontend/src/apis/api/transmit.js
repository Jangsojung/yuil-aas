export const handleVerifyAPI = async (selectedFile) => {
  try {
    const response = await fetch(`http://localhost:5001/api/file/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: selectedFile,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AASX data');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('오류가 발생했습니다:', error.message);
    alert('오류가 발생했습니다.');
  }
};
