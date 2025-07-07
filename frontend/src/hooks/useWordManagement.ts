import { useState, useCallback, useEffect } from 'react';
import { getWordsAPI, updateWordsAPI } from '../apis/api/data_manage';

interface Word {
  as_kr: string;
  as_en: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useWordManagement = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [selectedItems, setSelectedItems] = useState<Word[]>([]);
  const [modifiedData, setModifiedData] = useState<{ [key: string]: string }>({});
  const [editingValues, setEditingValues] = useState<{ [key: string]: string }>({});
  const [showUnmatchedOnly, setShowUnmatchedOnly] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const getWords = useCallback(async () => {
    try {
      const response = await getWordsAPI();
      if (response && Array.isArray(response)) {
        setWords(response);
        applyFilters(response);
      } else {
        setWords([]);
        setFilteredWords([]);
      }
    } catch (error) {
      console.error('단어 목록을 가져오는 중 오류 발생:', error);
      setWords([]);
      setFilteredWords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = useCallback(
    (wordList: Word[]) => {
      let filtered = wordList;

      if (searchKeyword.trim()) {
        const keyword = searchKeyword.toLowerCase();
        filtered = filtered.filter(
          (word) =>
            (word.as_kr && word.as_kr.toLowerCase().includes(keyword)) ||
            (word.as_en && word.as_en.toLowerCase().includes(keyword))
        );
      }

      if (showUnmatchedOnly) {
        filtered = filtered.filter((word) => !word.as_en || word.as_en.trim() === '');
      }

      setFilteredWords(filtered);
    },
    [searchKeyword, showUnmatchedOnly]
  );

  const handleSearchKeywordChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const handleSearch = useCallback(() => {
    applyFilters(words);
  }, [applyFilters, words]);

  const handleUnmatchedOnly = useCallback((checked: boolean) => {
    setShowUnmatchedOnly(checked);
    setSelectedItems([]);
    setModifiedData({});
    setEditingValues({});
  }, []);

  useEffect(() => {
    applyFilters(words);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUnmatchedOnly, words]);

  const handleItemCheckboxChange = useCallback((item: Word) => {
    setSelectedItems((prev) => {
      const isSelected = prev.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en);
      if (isSelected) {
        const key = `${item.as_kr}|${item.as_en}`;
        setModifiedData((prevData) => {
          const newData = { ...prevData };
          delete newData[key];
          return newData;
        });
        setEditingValues((prevData) => {
          const newData = { ...prevData };
          delete newData[key];
          return newData;
        });
        return prev.filter((selected) => !(selected.as_kr === item.as_kr && selected.as_en === item.as_en));
      } else {
        return [...prev, item];
      }
    });
  }, []);

  const handleSelectAllCurrentPage = useCallback(
    (currentPageItems: Word[], checked: boolean) => {
      if (checked) {
        const newSelectedItems = [...selectedItems];
        currentPageItems.forEach((item) => {
          if (!newSelectedItems.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en)) {
            newSelectedItems.push(item);
          }
        });
        setSelectedItems(newSelectedItems);
      } else {
        const newSelectedItems = selectedItems.filter(
          (selected) =>
            !currentPageItems.some((pageItem) => pageItem.as_kr === selected.as_kr && pageItem.as_en === selected.as_en)
        );
        setSelectedItems(newSelectedItems);

        const keysToRemove = currentPageItems.map((item) => `${item.as_kr}|${item.as_en}`);
        setModifiedData((prevData) => {
          const newData = { ...prevData };
          keysToRemove.forEach((key) => delete newData[key]);
          return newData;
        });
        setEditingValues((prevData) => {
          const newData = { ...prevData };
          keysToRemove.forEach((key) => delete newData[key]);
          return newData;
        });
      }
    },
    [selectedItems]
  );

  const handleEnglishChange = useCallback((originalData: Word, newEnglish: string) => {
    const key = `${originalData.as_kr}|${originalData.as_en || ''}`;
    setEditingValues((prev) => ({
      ...prev,
      [key]: newEnglish,
    }));

    setModifiedData((prev) => ({
      ...prev,
      [key]: newEnglish,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (Object.keys(modifiedData).length === 0) {
      return { success: false, message: '수정할 데이터가 없습니다.' };
    }

    const invalidEntries = Object.keys(modifiedData).filter((key) => {
      const new_as_en = modifiedData[key];
      const validPattern = /^[a-zA-Z0-9_]+$/;
      return !validPattern.test(new_as_en);
    });

    if (invalidEntries.length > 0) {
      return {
        success: false,
        message: '식별 ID는 영어, 숫자, _만 사용 가능합니다.',
      };
    }

    try {
      const updates = Object.keys(modifiedData).map((key) => {
        const [as_kr, original_as_en] = key.split('|');
        const new_as_en = modifiedData[key];

        return {
          as_kr: as_kr,
          original_as_en: original_as_en === '' ? null : original_as_en,
          new_as_en: new_as_en,
        };
      });

      await updateWordsAPI(updates);
      setModifiedData({});
      setEditingValues({});
      setSelectedItems([]);
      await getWords();

      return { success: true, message: '저장되었습니다.' };
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      return { success: false, message: '저장 중 오류가 발생했습니다.' };
    }
  }, [modifiedData, getWords]);

  const getEditingValue = useCallback(
    (item: Word) => {
      const key = `${item.as_kr}|${item.as_en || ''}`;
      return editingValues[key] !== undefined ? editingValues[key] : item.as_en;
    },
    [editingValues]
  );

  const isItemSelected = useCallback(
    (item: Word) => {
      return selectedItems.some((selected) => selected.as_kr === item.as_kr && selected.as_en === item.as_en);
    },
    [selectedItems]
  );

  const isAllCurrentPageSelected = useCallback(
    (currentPageItems: Word[]) => {
      return currentPageItems.length > 0 && currentPageItems.every((item) => isItemSelected(item));
    },
    [isItemSelected]
  );

  const isSomeCurrentPageSelected = useCallback(
    (currentPageItems: Word[]) => {
      const selectedCount = currentPageItems.filter((item) => isItemSelected(item)).length;
      return selectedCount > 0 && selectedCount < currentPageItems.length;
    },
    [isItemSelected]
  );

  return {
    words,
    filteredWords,
    selectedItems,
    modifiedData,
    editingValues,
    showUnmatchedOnly,
    searchKeyword,
    getWords,
    handleUnmatchedOnly,
    handleItemCheckboxChange,
    handleSelectAllCurrentPage,
    handleEnglishChange,
    handleSave,
    getEditingValue,
    isItemSelected,
    isAllCurrentPageSelected,
    isSomeCurrentPageSelected,
    handleSearchKeywordChange,
    handleSearch,
  };
};
