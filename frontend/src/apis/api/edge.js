export const deleteEdgeAPI = async (data) => {
    try {
        const response = await fetch('http://localhost:5001/api/edge_gateway/', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: data
        })

        if (!response.ok) {
            throw new Error('Failed to delete items');
        }

        return true
    } catch (error) {
        console.error('삭제 중 오류가 발생했습니다:', error.message);
        alert('삭제 중 오류가 발생했습니다.');
    }
}

export const getEdgeAPI = async () => {
    try {
        const response = await fetch(`http://localhost:5001/api/edge_gateway`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch detections');
        } 

        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error.message)
    }
} 