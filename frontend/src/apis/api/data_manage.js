export const deleteDataAPI = async (selectedFiles) => {
  try {
    const response = await fetch(`http://localhost:5001/api/file`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ids: selectedFiles,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete items');
    }

    return true;
  } catch (error) {
    console.error('삭제 중 오류가 발생했습니다:', error.message);
    alert('삭제 중 오류가 발생했습니다.');
  }
};

export const getFilesAPI = async (start, end) => {
  try {
    const response = await fetch(
      `http://localhost:5001/api/kamp_monitoring/AASXfiles?af_kind=2&fc_idx=3&startDate=${start}&endDate=${end}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error.message);
  }
};
