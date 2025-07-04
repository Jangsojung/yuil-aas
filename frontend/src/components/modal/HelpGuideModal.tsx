import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// 예시 도움말 데이터
const helpData = [
  {
    category: '설비관리',
    slides: [
      {
        title: '설비관리',
        image: '/assets/help/facility.png',
        description: `필수로 공장, 설비그룹을 선택하여 검색할 수 있습니다. 설비명, 센서명을 입력하여 검색 가능합니다.\n\n
          동기화 버튼: 메인 db와 장비 정보를 동기화 합니다.\n\n
          설비 추가 버튼: 신규 장비를 등록할 수 있습니다.\n\n
          설비 삭제 버튼: 체크박스 선택한 장치를 삭제합니다. 메인 db에 있는 항목은 삭제되지 않습니다.`,
      },
      {
        title: '검색된 화면',
        image: '/assets/help/facility_list.png',
        description: '제1공장, 1호기를 선택하여 검색한 화면입니다.',
      },
      {
        title: '설비 등록',
        image: '/assets/help/facility_add.png',
        description: `설비 추가 버튼을 클릭하면 나오는 설비를 등록하는 팝업창입니다.\n\n
        공장, 설비그룹, 설비는 기존 내역을 선택할수도, '신규등록'으로 새로 추가할수도 있습니다.\n\n`,
      },
      {
        title: '설비 삭제',
        image: '/assets/help/facility_add.png',
        description: `다음 화면과 같이 해당 페이지에서 등록한 장비만 삭제 가능하여, 왼쪽에 체크박스가 뜹니다.\n\n
        체크박스를 선택하여 삭제할 수 있으며, 공장이 변경되면 reset됩니다. 설비그룹이 변경될 때는 항목이 유지됩니다.\n\n`,
      },
    ],
  },
  {
    category: 'Edge Gateway',
    slides: [
      {
        title: 'Edge Gateway 관리',
        image: '/assets/help/edge_gateway.png',
        description: 'Edge Gateway의 상태를 확인하고 관리할 수 있습니다.',
      },
    ],
  },
  // 필요에 따라 카테고리/슬라이드 추가
];

interface HelpGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export default function HelpGuideModal({ open, onClose }: HelpGuideModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const currentSlides = helpData[selectedCategory].slides;
  const currentSlide = currentSlides[slideIndex];

  const handleCategoryClick = (idx: number) => {
    setSelectedCategory(idx);
    setSlideIndex(0);
  };

  const handlePrev = () => setSlideIndex((idx) => Math.max(0, idx - 1));
  const handleNext = () => setSlideIndex((idx) => Math.min(currentSlides.length - 1, idx + 1));

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <div style={{ display: 'flex', minHeight: 500 }}>
        {/* 왼쪽 네비게이션 */}
        <Drawer
          variant='permanent'
          open={true}
          PaperProps={{ style: { position: 'static', width: 220, boxShadow: 'none', borderRight: '1px solid #eee' } }}
        >
          <List>
            {helpData.map((cat, idx) => (
              <ListItem key={cat.category} disablePadding>
                <ListItemButton selected={selectedCategory === idx} onClick={() => handleCategoryClick(idx)}>
                  <ListItemText primary={cat.category} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        {/* 중앙 슬라이드 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 32 }}>
          <DialogTitle style={{ width: '100%', textAlign: 'left', fontWeight: 'bold' }}>
            {currentSlide.title}
          </DialogTitle>
          <div style={{ display: 'flex', alignItems: 'center', minHeight: 300 }}>
            <IconButton onClick={handlePrev} disabled={slideIndex === 0}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              style={{ maxWidth: 400, maxHeight: 250, margin: '0 32px', border: '1px solid #eee', background: '#fff' }}
            />
            <IconButton onClick={handleNext} disabled={slideIndex === currentSlides.length - 1}>
              <ArrowForwardIosIcon />
            </IconButton>
          </div>
          <div style={{ minHeight: 60, textAlign: 'center', whiteSpace: 'pre-line', width: '100%' }}>
            {currentSlide.description}
          </div>
          {/* 페이지네이션 */}
          <div style={{ marginTop: 16 }}>
            {currentSlides.map((_, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: idx === slideIndex ? '#1976d2' : '#ccc',
                  margin: '0 4px',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
