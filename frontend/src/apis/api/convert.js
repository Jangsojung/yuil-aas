export const getBasesAPI = async () => {
  try {
    const response = await fetch(`http://localhost:5001/api/base_code/bases`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch detections');
    }

    const data = await response.json();

    return data;
  } catch (err) {
    console.log(err.message);
  }
};

export const insertBaseAPI = async (formattedStartDate, formattedEndDate, selectedConvert) => {
  try {
    const response = await fetch(`http://localhost:5001/api/convert?fc_idx=3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ start: formattedStartDate, end: formattedEndDate, ids: selectedConvert }),
    });

    if (!response.ok) {
      throw new Error('Failed to insert converts');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err.message);
  }
};
