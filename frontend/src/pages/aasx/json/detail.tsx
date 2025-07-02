import { useParams, useNavigate } from 'react-router-dom';
import JSONViewer from '@uiw/react-json-view';
import { useEffect, useState } from 'react';
import { getJSONFileDetailAPI } from '../../../apis/api/json_manage';
import ActionBox from '../../../components/common/ActionBox';
import LoadingOverlay from '../../../components/loading/LodingOverlay';

const JsonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getJSONFileDetailAPI(id).then((data) => {
      setJsonData(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingOverlay />;
  if (!jsonData) return <div>데이터가 없습니다.</div>;

  return (
    <div className='table-outer'>
      <ActionBox
        buttons={[
          {
            text: '수정',
            onClick: () => navigate(`/aasx/json/edit/${id}`),
            color: 'success',
          },
          {
            text: '목록',
            onClick: () => navigate(-1),
            color: 'inherit',
            variant: 'outlined',
          },
        ]}
      />
      <div style={{ marginTop: 16 }}>
        <JSONViewer
          value={jsonData}
          collapsed={false}
          enableClipboard={true}
          displayDataTypes={false}
          style={{ fontSize: 18 }}
        />
      </div>
    </div>
  );
};

export default JsonDetail;
