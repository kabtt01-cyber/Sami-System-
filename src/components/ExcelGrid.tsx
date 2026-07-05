import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useErp } from '../context/ErpContext';
import { InvoiceGridRow, Item } from '../types/erp';
import { 
  Trash2, Plus, Copy, Filter, ArrowUpDown, ChevronDown, 
  Settings, Check, EyeOff, Lock, Unlock, GripHorizontal
} from 'lucide-react';

interface ExcelGridProps {
  rows: InvoiceGridRow[];
  onChange: (updatedRows: InvoiceGridRow[]) => void;
  onAddRow: () => void;
  onDeleteRow: (id: string) => void;
  invoiceType: string;
  onActiveCellChange?: (address: string) => void;
}

interface ColumnConfig {
  key: string;
  title: string;
  width: number;
  visible: boolean;
  frozen: boolean;
  type: 'text' | 'number' | 'select' | 'readonly';
}

const DEFAULT_COL_WIDTHS: { [key: string]: number } = {
  index: 40,
  itemId: 200,
  code: 80,
  barcode: 100,
  unit: 65,
  quantity: 70,
  unitPrice: 90,
  notes: 150,
  total: 100,
  actions: 45,
};

export const ExcelGrid: React.FC<ExcelGridProps> = ({
  rows,
  onChange,
  onAddRow,
  onDeleteRow,
  invoiceType,
  onActiveCellChange
}) => {
  const { items, showToast } = useErp();

  const storageKey = `excel_grid_layout_v3`;
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}

    return [
      { key: 'index', title: '#', width: DEFAULT_COL_WIDTHS.index, visible: true, frozen: true, type: 'readonly' },
      { key: 'itemId', title: 'المادة المحاسبية (اسم الصنف)', width: DEFAULT_COL_WIDTHS.itemId, visible: true, frozen: true, type: 'select' },
      { key: 'code', title: 'كود الصنف', width: DEFAULT_COL_WIDTHS.code, visible: true, frozen: false, type: 'readonly' },
      { key: 'barcode', title: 'الباركود', width: DEFAULT_COL_WIDTHS.barcode, visible: true, frozen: false, type: 'readonly' },
      { key: 'unit', title: 'الوحدة', width: DEFAULT_COL_WIDTHS.unit, visible: true, frozen: false, type: 'text' },
      { key: 'quantity', title: 'الكمية', width: DEFAULT_COL_WIDTHS.quantity, visible: true, frozen: false, type: 'number' },
      { key: 'unitPrice', title: 'سعر الوحدة', width: DEFAULT_COL_WIDTHS.unitPrice, visible: true, frozen: false, type: 'number' },
      { key: 'notes', title: 'الملاحظات والشرح السلعي', width: DEFAULT_COL_WIDTHS.notes, visible: true, frozen: false, type: 'text' },
      { key: 'total', title: 'الإجمالي الفرعي', width: DEFAULT_COL_WIDTHS.total, visible: true, frozen: false, type: 'readonly' },
      { key: 'actions', title: 'حذف', width: DEFAULT_COL_WIDTHS.actions, visible: true, frozen: false, type: 'readonly' },
    ];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(columns));
  }, [columns]);

  // States
  const [activeCell, setActiveCell] = useState<{ row: number; colKey: string } | null>(null);
  const [selectionStart, setSelectionStart] = useState<{ row: number; colIndex: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ row: number; colIndex: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const [editingCell, setEditingCell] = useState<{ row: number; colKey: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [focusedSearchIndex, setFocusedSearchIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterValues, setFilterValues] = useState<{ [key: string]: string }>({});
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState<string | null>(null);
  const [tableSearchText, setTableSearchText] = useState('');

  const [rowHeights, setRowHeights] = useState<{ [index: number]: number }>({});
  const [resizingRowIndex, setResizingRowIndex] = useState<number | null>(null);
  const [rowResizeStartY, setRowResizeStartY] = useState(0);
  const [rowResizeStartHeight, setRowResizeStartHeight] = useState(0);

  const [resizingColKey, setResizingColKey] = useState<string | null>(null);
  const [colResizeStartX, setColResizeStartX] = useState(0);
  const [colResizeStartWidth, setColResizeStartWidth] = useState(0);

  const [draggingColKey, setDraggingColKey] = useState<string | null>(null);
  const [showColPicker, setShowColPicker] = useState(false);

  // Undo/Redo Local History
  const [gridHistory, setGridHistory] = useState<InvoiceGridRow[][]>([]);
  const [gridHistoryIdx, setGridHistoryIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

  const orderedColumns = useMemo(() => {
    const frozen = visibleColumns.filter(c => c.frozen);
    const nonFrozen = visibleColumns.filter(c => !c.frozen);
    return [...frozen, ...nonFrozen];
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return items.slice(0, 100);
    const query = itemSearchQuery.toLowerCase();
    return items.filter(it => 
      it.name.toLowerCase().includes(query) || 
      it.code.toLowerCase().includes(query) || 
      (it.barcode && it.barcode.toLowerCase().includes(query))
    );
  }, [items, itemSearchQuery]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Notify active cell change for status bar
  useEffect(() => {
    if (onActiveCellChange) {
      if (activeCell) {
        onActiveCellChange(`السطر ${activeCell.row + 1}، العمود: ${columns.find(c => c.key === activeCell.colKey)?.title || activeCell.colKey}`);
      } else {
        onActiveCellChange('خارج الجدول');
      }
    }
  }, [activeCell, columns, onActiveCellChange]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isDropdownOpen && searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (isFilterMenuOpen && !(e.target as Element).closest('.filter-popover')) {
        setIsFilterMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen, isFilterMenuOpen]);

  const pushToGridHistory = useCallback((newRows: InvoiceGridRow[]) => {
    const nextHistory = gridHistory.slice(0, gridHistoryIdx + 1);
    nextHistory.push(JSON.parse(JSON.stringify(newRows)));
    setGridHistory(nextHistory);
    setGridHistoryIdx(nextHistory.length - 1);
  }, [gridHistory, gridHistoryIdx]);

  const handleRowsChange = (updated: InvoiceGridRow[]) => {
    pushToGridHistory(updated);
    onChange(updated);
  };

  const getColIndex = useCallback((key: string) => {
    return orderedColumns.findIndex(c => c.key === key);
  }, [orderedColumns]);

  // Clipboard Copier
  const handleCopySelection = () => {
    if (!selectionStart || !selectionEnd) return;

    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const maxCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);

    let tsvRows: string[] = [];

    for (let r = minRow; r <= maxRow; r++) {
      let tsvCols: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        const col = orderedColumns[c];
        const rowData = rows[r];
        if (!rowData || !col) continue;

        let cellVal = '';
        if (col.key === 'itemId') {
          cellVal = items.find(it => it.id === rowData.itemId)?.name || '';
        } else if (col.key === 'code') {
          cellVal = items.find(it => it.id === rowData.itemId)?.code || '';
        } else if (col.key === 'barcode') {
          cellVal = items.find(it => it.id === rowData.itemId)?.barcode || '';
        } else {
          cellVal = String((rowData as any)[col.key] || '');
        }
        tsvCols.push(cellVal);
      }
      tsvRows.push(tsvCols.join('\t'));
    }

    const tsvText = tsvRows.join('\n');
    navigator.clipboard.writeText(tsvText)
      .then(() => showToast('تم نسخ النطاق المحدد كجدول Excel', 'success'))
      .catch(() => showToast('فشل نسخ الخلايا.', 'error'));
  };

  // Excel Clipboard Paste
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) return;

      const pasteRows = text.split(/\r?\n/).map(line => line.split('\t'));
      if (pasteRows.length === 0) return;

      const startRowIdx = activeCell ? activeCell.row : 0;
      const startColIdx = activeCell ? getColIndex(activeCell.colKey) : 1; // skip index col

      let currentRows = [...rows];
      const requiredTotalRows = startRowIdx + pasteRows.length;

      if (currentRows.length < requiredTotalRows) {
        const deficit = requiredTotalRows - currentRows.length;
        for (let d = 0; d < deficit; d++) {
          currentRows.push({
            id: `grid-row-paste-${Date.now()}-${d}-${Math.random()}`,
            itemId: items[0]?.id || '',
            quantity: 1,
            unitPrice: invoiceType.includes('purchase') ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0),
            unit: items[0]?.unit || 'حبة',
            notes: '',
            total: invoiceType.includes('purchase') ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0)
          });
        }
      }

      pasteRows.forEach((rowData, rOffset) => {
        const targetRowIdx = startRowIdx + rOffset;
        if (targetRowIdx >= currentRows.length) return;

        let rowObj = { ...currentRows[targetRowIdx] };

        rowData.forEach((cellVal, cOffset) => {
          const targetColIdx = startColIdx + cOffset;
          if (targetColIdx >= orderedColumns.length) return;

          const col = orderedColumns[targetColIdx];
          if (col.type === 'readonly' && col.key !== 'code' && col.key !== 'barcode') return;

          const cleanedVal = cellVal.trim();
          if (col.key === 'itemId') {
            const matched = items.find(it => 
              it.name.toLowerCase() === cleanedVal.toLowerCase() ||
              it.code.toLowerCase() === cleanedVal.toLowerCase() ||
              (it.barcode && it.barcode === cleanedVal)
            );
            if (matched) {
              rowObj.itemId = matched.id;
              rowObj.unit = matched.unit || 'حبة';
              rowObj.unitPrice = invoiceType.includes('purchase') ? matched.purchasePrice : matched.salePrice;
            }
          } else if (col.key === 'quantity' || col.key === 'unitPrice') {
            (rowObj as any)[col.key] = Number(cleanedVal.replace(/[^0-9.-]/g, '')) || 0;
          } else if (col.key !== 'total' && col.key !== 'actions') {
            (rowObj as any)[col.key] = cleanedVal;
          }
        });

        rowObj.total = Number(rowObj.quantity || 0) * Number(rowObj.unitPrice || 0);
        currentRows[targetRowIdx] = rowObj;
      });

      handleRowsChange(currentRows);
      showToast(`تم لصق ${pasteRows.length} أسطر بنجاح من Excel`, 'success');
    } catch (err) {
      showToast('يرجى تمكين إذن القراءة من الحافظة للصق التلقائي.', 'warning');
    }
  };

  // Delete selection
  const handleDeleteSelectedCells = () => {
    if (!selectionStart || !selectionEnd) return;

    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const maxCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);

    // If entire rows are selected, we can delete them, or clear contents
    const updated = rows.map((r, rIdx) => {
      if (rIdx >= minRow && rIdx <= maxRow) {
        let rowObj = { ...r };
        for (let cIdx = minCol; cIdx <= maxCol; cIdx++) {
          const col = orderedColumns[cIdx];
          if (col.type === 'readonly' || col.key === 'actions' || col.key === 'index') continue;
          if (col.key === 'quantity' || col.key === 'unitPrice') {
            (rowObj as any)[col.key] = 0;
          } else {
            (rowObj as any)[col.key] = '';
          }
        }
        rowObj.total = Number(rowObj.quantity || 0) * Number(rowObj.unitPrice || 0);
        return rowObj;
      }
      return r;
    });

    handleRowsChange(updated);
  };

  // Insert Row Handler
  const handleInsertRowAtIndex = (idx: number) => {
    const newRowId = `grid-row-ins-${Date.now()}-${Math.random()}`;
    const defaultItem = items[0];
    const newRow = {
      id: newRowId,
      itemId: defaultItem?.id || '',
      quantity: 1,
      unitPrice: invoiceType.includes('purchase') ? (defaultItem?.purchasePrice || 0) : (defaultItem?.salePrice || 0),
      unit: defaultItem?.unit || 'حبة',
      notes: '',
      total: invoiceType.includes('purchase') ? (defaultItem?.purchasePrice || 0) : (defaultItem?.salePrice || 0)
    };

    const nextRows = [...rows];
    nextRows.splice(idx, 0, newRow);
    handleRowsChange(nextRows);
    setActiveCell({ row: idx, colKey: 'itemId' });
    showToast('تم إدراج سطر جديد', 'info');
  };

  // Keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!activeCell) return;

    const rowCount = rows.length;
    const colCount = orderedColumns.length;
    const currentColIndex = getColIndex(activeCell.colKey);
    const isEditing = editingCell !== null;

    if (isEditing && activeCell.colKey === 'itemId' && isDropdownOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedSearchIndex(prev => Math.min(filteredItems.length - 1, prev + 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedSearchIndex(prev => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = filteredItems[focusedSearchIndex];
        if (selectedItem) {
          applySelectedItem(activeCell.row, selectedItem);
        }
        return;
      }
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setEditingCell(null);
        return;
      }
    }

    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEditingValue();
        if (activeCell.row < rowCount - 1) {
          setActiveCell({ row: activeCell.row + 1, colKey: activeCell.colKey });
        } else {
          onAddRow();
          setTimeout(() => {
            setActiveCell({ row: activeCell.row + 1, colKey: activeCell.colKey });
          }, 50);
        }
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        commitEditingValue();
        if (e.shiftKey) {
          if (currentColIndex > 0) {
            setActiveCell({ row: activeCell.row, colKey: orderedColumns[currentColIndex - 1].key });
          }
        } else {
          if (currentColIndex < colCount - 1) {
            setActiveCell({ row: activeCell.row, colKey: orderedColumns[currentColIndex + 1].key });
          }
        }
        return;
      }
      if (e.key === 'Escape') {
        setEditingCell(null);
        return;
      }
      return;
    }

    // Windows classic keyboard shortcut commands
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectionStart({ row: 0, colIndex: 0 });
        setSelectionEnd({ row: rowCount - 1, colIndex: colCount - 1 });
        showToast('تم تحديد كامل خلايا الجدول', 'info');
        return;
      }
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopySelection();
        return;
      }
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteFromClipboard();
        return;
      }
      if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleCopySelection();
        handleDeleteSelectedCells();
        return;
      }
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (gridHistoryIdx > 0) {
          const prevIdx = gridHistoryIdx - 1;
          const snap = gridHistory[prevIdx];
          setGridHistoryIdx(prevIdx);
          onChange(JSON.parse(JSON.stringify(snap)));
          showToast('تراجع خطوة واحدة', 'info');
        }
        return;
      }
      if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        if (gridHistoryIdx < gridHistory.length - 1) {
          const nextIdx = gridHistoryIdx + 1;
          const snap = gridHistory[nextIdx];
          setGridHistoryIdx(nextIdx);
          onChange(JSON.parse(JSON.stringify(snap)));
          showToast('إعادة خطوة واحدة', 'info');
        }
        return;
      }
    }

    // Single Insert and Delete row keys
    if (e.key === 'Insert') {
      e.preventDefault();
      handleInsertRowAtIndex(activeCell.row);
      return;
    }

    if (e.key === 'Delete' && !e.ctrlKey) {
      e.preventDefault();
      handleDeleteSelectedCells();
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (activeCell.row > 0) {
          const nextRow = activeCell.row - 1;
          setActiveCell({ ...activeCell, row: nextRow });
          updateSelectionRange(nextRow, currentColIndex, e.shiftKey);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (activeCell.row < rowCount - 1) {
          const nextRow = activeCell.row + 1;
          setActiveCell({ ...activeCell, row: nextRow });
          updateSelectionRange(nextRow, currentColIndex, e.shiftKey);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (currentColIndex > 0) {
          const prevCol = orderedColumns[currentColIndex - 1];
          setActiveCell({ ...activeCell, colKey: prevCol.key });
          updateSelectionRange(activeCell.row, currentColIndex - 1, e.shiftKey);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (currentColIndex < colCount - 1) {
          const nextCol = orderedColumns[currentColIndex + 1];
          setActiveCell({ ...activeCell, colKey: nextCol.key });
          updateSelectionRange(activeCell.row, currentColIndex + 1, e.shiftKey);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          if (currentColIndex > 0) {
            setActiveCell({ ...activeCell, colKey: orderedColumns[currentColIndex - 1].key });
          }
        } else {
          if (currentColIndex < colCount - 1) {
            setActiveCell({ ...activeCell, colKey: orderedColumns[currentColIndex + 1].key });
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        const currentCol = orderedColumns[currentColIndex];
        if (currentCol.type !== 'readonly' && currentCol.key !== 'actions') {
          startEditing(activeCell.row, currentCol.key);
        }
        break;
      case 'Home':
        e.preventDefault();
        setActiveCell({ ...activeCell, colKey: orderedColumns[0].key });
        break;
      case 'End':
        e.preventDefault();
        setActiveCell({ ...activeCell, colKey: orderedColumns[colCount - 1].key });
        break;
      default:
        // Start typing directly to edit!
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const curCol = orderedColumns[currentColIndex];
          if (curCol.type !== 'readonly' && curCol.key !== 'actions') {
            startEditing(activeCell.row, curCol.key, e.key);
          }
        }
        break;
    }
  }, [activeCell, rows, orderedColumns, editingCell, isDropdownOpen, filteredItems, focusedSearchIndex, gridHistoryIdx, gridHistory]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' && document.activeElement !== inputRef.current) {
        return; 
      }
      if (activeCell) {
        handleKeyDown(e as any);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeCell, handleKeyDown]);

  const updateSelectionRange = (row: number, colIndex: number, shiftKey: boolean) => {
    if (!activeCell) return;
    if (shiftKey) {
      if (!selectionStart) {
        setSelectionStart({ row: activeCell.row, colIndex: getColIndex(activeCell.colKey) });
      }
      setSelectionEnd({ row, colIndex });
    } else {
      setSelectionStart({ row, colIndex });
      setSelectionEnd({ row, colIndex });
    }
  };

  const startEditing = (rowIdx: number, colKey: string, initialChar: string = '') => {
    setEditingCell({ row: rowIdx, colKey });
    const row = rows[rowIdx];
    let val = '';
    if (colKey === 'itemId') {
      const currentItem = items.find(it => it.id === row.itemId);
      val = currentItem ? currentItem.name : '';
      setItemSearchQuery(initialChar || val);
      setIsDropdownOpen(true);
      setFocusedSearchIndex(0);
    } else {
      val = initialChar || String((row as any)[colKey] || '');
    }
    setEditingValue(val);
  };

  const commitEditingValue = () => {
    if (!editingCell) return;
    const { row, colKey } = editingCell;
    const val = editingValue;

    if (colKey !== 'itemId') {
      const updated = rows.map((r, idx) => {
        if (idx === row) {
          const updatedRow = { ...r, [colKey]: colKey === 'quantity' || colKey === 'unitPrice' ? Number(val) : val };
          updatedRow.total = Number(updatedRow.quantity || 0) * Number(updatedRow.unitPrice || 0);
          return updatedRow;
        }
        return r;
      });
      handleRowsChange(updated);
    }
    setEditingCell(null);
  };

  const applySelectedItem = (rowIdx: number, item: Item) => {
    const updated = rows.map((r, idx) => {
      if (idx === rowIdx) {
        const rowUnitPrice = invoiceType.includes('purchase') ? item.purchasePrice : item.salePrice;
        return {
          ...r,
          itemId: item.id,
          unit: item.unit || 'حبة',
          unitPrice: rowUnitPrice,
          total: Number(r.quantity || 1) * rowUnitPrice
        };
      }
      return r;
    });
    handleRowsChange(updated);
    setIsDropdownOpen(false);
    setEditingCell(null);
    showToast(`تم إدراج الصنف: ${item.name}`, 'success');
  };

  const handleCellMouseDown = (row: number, colKey: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click
    const colIdx = getColIndex(colKey);
    setActiveCell({ row, colKey });
    setSelectionStart({ row, colIndex: colIdx });
    setSelectionEnd({ row, colIndex: colIdx });
    setIsSelecting(true);
    setEditingCell(null);
  };

  const handleCellMouseEnter = (row: number, colKey: string) => {
    if (!isSelecting) return;
    const colIdx = getColIndex(colKey);
    setSelectionEnd({ row, colIndex: colIdx });
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleCellMouseUp);
    return () => window.removeEventListener('mouseup', handleCellMouseUp);
  }, [isSelecting]);

  const isCellSelected = useCallback((row: number, colKey: string) => {
    if (!selectionStart || !selectionEnd) return false;
    const colIdx = getColIndex(colKey);
    
    const minRow = Math.min(selectionStart.row, selectionEnd.row);
    const maxRow = Math.max(selectionStart.row, selectionEnd.row);
    const minCol = Math.min(selectionStart.colIndex, selectionEnd.colIndex);
    const maxCol = Math.max(selectionStart.colIndex, selectionEnd.colIndex);

    return row >= minRow && row <= maxRow && colIdx >= minCol && colIdx <= maxCol;
  }, [selectionStart, selectionEnd, getColIndex]);

  // Column Drag and Drop
  const handleColDragStart = (e: React.DragEvent, key: string) => {
    setDraggingColKey(key);
    e.dataTransfer.setData('text/plain', key);
  };

  const handleColDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleColDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    const sourceKey = draggingColKey || e.dataTransfer.getData('text/plain');
    if (!sourceKey || sourceKey === targetKey) return;

    const sourceIdx = columns.findIndex(c => c.key === sourceKey);
    const targetIdx = columns.findIndex(c => c.key === targetKey);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const nextCols = [...columns];
    const [dragged] = nextCols.splice(sourceIdx, 1);
    nextCols.splice(targetIdx, 0, dragged);
    setColumns(nextCols);
    setDraggingColKey(null);
    showToast('تم تغيير ترتيب الأعمدة', 'success');
  };

  const handleColResizeMouseDown = (colKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingColKey(colKey);
    setColResizeStartX(e.clientX);
    const currentCol = columns.find(c => c.key === colKey);
    setColResizeStartWidth(currentCol ? currentCol.width : 100);
  };

  const handleRowResizeMouseDown = (rowIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingRowIndex(rowIdx);
    setRowResizeStartY(e.clientY);
    const currentHeight = rowHeights[rowIdx] || 24;
    setRowResizeStartHeight(currentHeight);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColKey) {
        const dx = e.clientX - colResizeStartX;
        const newWidth = Math.max(30, colResizeStartWidth - dx); // RTL adjustment
        setColumns(prev => prev.map(c => c.key === resizingColKey ? { ...c, width: newWidth } : c));
      }
      if (resizingRowIndex !== null) {
        const dy = e.clientY - rowResizeStartY;
        const newHeight = Math.max(18, rowResizeStartHeight + dy);
        setRowHeights(prev => ({ ...prev, [resizingRowIndex]: newHeight }));
      }
    };

    const handleMouseUp = () => {
      setResizingColKey(null);
      setResizingRowIndex(null);
    };

    if (resizingColKey || resizingRowIndex !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColKey, colResizeStartX, colResizeStartWidth, resizingRowIndex, rowResizeStartY, rowResizeStartHeight]);

  const toggleFreezeColumn = (colKey: string) => {
    setColumns(prev => prev.map(c => c.key === colKey ? { ...c, frozen: !c.frozen } : c));
    showToast('تم تعديل تثبيت العمود', 'info');
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...rows].sort((a, b) => {
      let valA = (a as any)[key];
      let valB = (b as any)[key];

      if (key === 'itemId') {
        valA = items.find(it => it.id === a.itemId)?.name || '';
        valB = items.find(it => it.id === b.itemId)?.name || '';
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    handleRowsChange(sorted);
  };

  const getFilterOptions = (colKey: string): string[] => {
    const values = rows.map(r => {
      if (colKey === 'itemId') {
        return items.find(it => it.id === r.itemId)?.name || '';
      }
      return String((r as any)[colKey] || '');
    });
    return Array.from(new Set(values)).filter(Boolean) as string[];
  };

  const applyFilter = (colKey: string, val: string) => {
    setFilterValues(prev => ({ ...prev, [colKey]: val }));
    setIsFilterMenuOpen(null);
  };

  const clearFilter = (colKey: string) => {
    setFilterValues(prev => {
      const copy = { ...prev };
      delete copy[colKey];
      return copy;
    });
    setIsFilterMenuOpen(null);
  };

  const filteredRows = useMemo(() => {
    return rows.map((r, originalIdx) => ({ r, originalIdx })).filter(({ r }) => {
      for (const [colKey, filterVal] of Object.entries(filterValues)) {
        let cellVal = '';
        if (colKey === 'itemId') {
          cellVal = items.find(it => it.id === r.itemId)?.name || '';
        } else {
          cellVal = String((r as any)[colKey] || '');
        }
        if (cellVal !== filterVal) return false;
      }

      if (tableSearchText.trim()) {
        const search = tableSearchText.toLowerCase();
        const itemName = (items.find(it => it.id === r.itemId)?.name || '').toLowerCase();
        const itemCode = (items.find(it => it.id === r.itemId)?.code || '').toLowerCase();
        const itemBarcode = (items.find(it => it.id === r.itemId)?.barcode || '').toLowerCase();
        const notes = (r.notes || '').toLowerCase();
        const quantity = String(r.quantity || '');
        const price = String(r.unitPrice || '');

        return itemName.includes(search) || 
               itemCode.includes(search) || 
               itemBarcode.includes(search) || 
               notes.includes(search) || 
               quantity.includes(search) || 
               price.includes(search);
      }

      return true;
    });
  }, [rows, filterValues, tableSearchText, items]);

  const totals = useMemo(() => {
    return rows.reduce((acc, r) => {
      acc.quantity += Number(r.quantity || 0);
      acc.unitPrice += Number(r.unitPrice || 0);
      acc.total += Number(r.total || 0);
      return acc;
    }, { quantity: 0, unitPrice: 0, total: 0 });
  }, [rows]);

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] border-2 border-zinc-400 select-none overflow-hidden" dir="rtl">
      
      {/* Grid Internal Toolbar: ultra compact retro design */}
      <div className="bg-[#e0e0e0] border-b border-zinc-400 px-1 py-1 flex items-center justify-between shrink-0 gap-2 text-[11px] font-bold text-zinc-800">
        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-zinc-600">بحث بالجدول:</span>
          <input
            type="text"
            placeholder="اكتب للفلترة الفورية..."
            value={tableSearchText}
            onChange={e => setTableSearchText(e.target.value)}
            className="bg-white border border-zinc-400 px-1 py-0.5 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-zinc-600 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] w-52 rounded-none"
          />
          {Object.keys(filterValues).length > 0 && (
            <button
              onClick={() => setFilterValues({})}
              className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
            >
              إلغاء الفلاتر ({Object.keys(filterValues).length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowColPicker(!showColPicker)}
              className="px-1.5 py-0.5 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 flex items-center gap-1 cursor-pointer active:bg-zinc-300"
            >
              <Settings className="w-3 h-3 text-zinc-600" /> تنظيم الأعمدة
            </button>
            {showColPicker && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-none shadow-lg border-2 border-zinc-500 p-1.5 z-50 text-right font-bold text-zinc-700 space-y-1">
                <div className="text-[10px] text-zinc-400 pb-1 mb-1 border-b text-center">أعمدة السند</div>
                {columns.map(c => (
                  <label key={c.key} className="flex items-center justify-between px-1 py-0.5 hover:bg-zinc-100 cursor-pointer text-[10px]">
                    <span className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={c.visible}
                        disabled={c.key === 'itemId' || c.key === 'index'}
                        onChange={() => setColumns(prev => prev.map(x => x.key === c.key ? { ...x, visible: !x.visible } : x))}
                        className="rounded-none focus:ring-0"
                      />
                      {c.title}
                    </span>
                    {c.key !== 'actions' && c.key !== 'index' && (
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFreezeColumn(c.key); }}
                        className={`p-0.5 rounded ${c.frozen ? 'bg-blue-50 text-blue-600' : 'text-zinc-300 hover:text-zinc-500'}`}
                        title="تثبيت"
                      >
                        <Lock className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onAddRow}
            className="px-2 py-0.5 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 text-zinc-800 flex items-center gap-1 cursor-pointer font-bold active:bg-zinc-300"
          >
            <Plus className="w-3 h-3" /> إضافة سطر [F3]
          </button>
          <button
            onClick={handlePasteFromClipboard}
            className="px-2 py-0.5 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 text-zinc-800 flex items-center gap-1 cursor-pointer font-bold active:bg-zinc-300"
            title="لصق البيانات من Excel"
          >
            <Copy className="w-3 h-3 text-green-700" /> لصق Excel
          </button>
        </div>
      </div>

      {/* Main Grid Table */}
      <div ref={containerRef} className="flex-1 overflow-auto bg-white border-b border-zinc-400 relative">
        <table className="border-collapse table-fixed select-none text-[11px] font-bold min-w-full">
          <thead>
            <tr className="bg-[#e0e0e0] text-zinc-700 border-b border-zinc-400 sticky top-0 z-30">
              {orderedColumns.map((col) => {
                const isFrozen = col.frozen;
                return (
                  <th
                    key={col.key}
                    draggable={col.key !== 'index' && col.key !== 'actions'}
                    onDragStart={(e) => handleColDragStart(e, col.key)}
                    onDragOver={handleColDragOver}
                    onDrop={(e) => handleColDrop(e, col.key)}
                    style={{ 
                      width: col.width,
                      position: isFrozen ? 'sticky' : 'relative',
                      right: isFrozen ? 0 : undefined,
                      zIndex: isFrozen ? 40 : 10,
                    }}
                    className={`h-6 border-l border-b border-zinc-400 text-right px-1 select-none font-bold bg-[#e0e0e0] relative cursor-move hover:bg-[#d0d0d0]`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        onClick={() => col.key !== 'actions' && col.key !== 'index' && handleSort(col.key)}
                        className="cursor-pointer hover:text-zinc-950 truncate w-full flex items-center gap-1"
                      >
                        {col.title}
                        {col.key !== 'actions' && col.key !== 'index' && (
                          <ArrowUpDown className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                        )}
                      </span>

                      {col.key !== 'actions' && col.key !== 'index' && (
                        <div className="relative filter-popover shrink-0">
                          <button
                            onClick={() => setIsFilterMenuOpen(isFilterMenuOpen === col.key ? null : col.key)}
                            className={`p-0.5 rounded hover:bg-zinc-300 ${filterValues[col.key] ? 'text-blue-700' : 'text-zinc-400'}`}
                          >
                            <Filter className="w-2.5 h-2.5" />
                          </button>
                          {isFilterMenuOpen === col.key && (
                            <div className="absolute right-0 mt-1 w-40 bg-white border-2 border-zinc-500 p-1 z-50 text-right text-[10px] shadow-lg">
                              <button
                                onClick={() => clearFilter(col.key)}
                                className="w-full text-right p-1 hover:bg-zinc-100 text-red-600 font-bold border-b pb-1 mb-1"
                              >
                                إلغاء التصفية
                              </button>
                              <div className="max-h-32 overflow-y-auto space-y-0.5">
                                {getFilterOptions(col.key).map((opt: string) => (
                                  <button
                                    key={opt}
                                    onClick={() => applyFilter(col.key, opt)}
                                    className="w-full text-right p-1 hover:bg-zinc-100 truncate block"
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Resize handle */}
                    <div
                      onMouseDown={(e) => handleColResizeMouseDown(col.key, e)}
                      className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-600 z-40"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-zinc-200">
            {filteredRows.map(({ r, originalIdx }, rowIdx) => {
              const height = rowHeights[originalIdx] || 22;

              return (
                <tr
                  key={r.id}
                  style={{ height }}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {orderedColumns.map((col) => {
                    const isFrozen = col.frozen;
                    const isActive = activeCell?.row === originalIdx && activeCell?.colKey === col.key;
                    const isSelected = isCellSelected(originalIdx, col.key);
                    const isEditing = editingCell?.row === originalIdx && editingCell?.colKey === col.key;

                    let renderedValue = '';
                    if (col.key === 'itemId') {
                      renderedValue = items.find(it => it.id === r.itemId)?.name || '';
                    } else if (col.key === 'code') {
                      renderedValue = items.find(it => it.id === r.itemId)?.code || '';
                    } else if (col.key === 'barcode') {
                      renderedValue = items.find(it => it.id === r.itemId)?.barcode || '';
                    } else if (col.key === 'total') {
                      renderedValue = Number(r.total || 0).toFixed(2);
                    } else {
                      renderedValue = String((r as any)[col.key] || '');
                    }

                    return (
                      <td
                        key={col.key}
                        style={{ 
                          width: col.width,
                          position: isFrozen ? 'sticky' : undefined,
                          right: isFrozen ? 0 : undefined,
                          zIndex: isFrozen ? 20 : 1,
                          height
                        }}
                        onMouseDown={(e) => handleCellMouseDown(originalIdx, col.key, e)}
                        onMouseEnter={() => handleCellMouseEnter(originalIdx, col.key)}
                        onDoubleClick={() => col.type !== 'readonly' && col.key !== 'actions' && startEditing(originalIdx, col.key)}
                        className={`border-l border-b border-zinc-200 px-1 relative truncate align-middle text-[11px] select-none ${
                          isFrozen ? 'bg-zinc-50 sticky shadow-[1px_0_2px_rgba(0,0,0,0.05)]' : 'bg-white'
                        } ${
                          isSelected ? 'bg-blue-800 text-white selection:bg-blue-800' : ''
                        } ${
                          isActive ? 'ring-2 ring-blue-600 ring-inset z-10' : ''
                        }`}
                      >
                        {isEditing ? (
                          col.key === 'itemId' ? (
                            <div className="absolute inset-0 z-50 bg-white" ref={searchDropdownRef}>
                              <input
                                ref={inputRef}
                                type="text"
                                value={itemSearchQuery}
                                onChange={(e) => {
                                  setItemSearchQuery(e.target.value);
                                  setIsDropdownOpen(true);
                                  setFocusedSearchIndex(0);
                                }}
                                className="w-full h-full border-0 focus:ring-0 p-1 text-[11px] font-bold text-zinc-900 bg-white"
                              />
                              {isDropdownOpen && filteredItems.length > 0 && (
                                <div className="absolute right-0 left-0 top-full mt-1 bg-white border-2 border-zinc-500 shadow-xl max-h-40 overflow-y-auto z-50 text-right">
                                  {filteredItems.map((item, idx) => (
                                    <div
                                      key={item.id}
                                      onClick={() => applySelectedItem(originalIdx, item)}
                                      onMouseEnter={() => setFocusedSearchIndex(idx)}
                                      className={`px-2 py-1 text-[10px] font-bold cursor-pointer flex justify-between items-center ${
                                        idx === focusedSearchIndex ? 'bg-blue-800 text-white' : 'text-zinc-800 hover:bg-zinc-100'
                                      }`}
                                    >
                                      <span className="truncate">{item.name}</span>
                                      <span className="font-mono text-[9px] text-zinc-400">
                                        {item.code}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <input
                              ref={inputRef}
                              type={col.type === 'number' ? 'number' : 'text'}
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={commitEditingValue}
                              className="absolute inset-0 w-full h-full border-0 focus:ring-0 p-1 text-[11px] font-mono font-bold text-zinc-900 bg-white"
                            />
                          )
                        ) : (
                          col.key === 'index' ? (
                            <div className="flex items-center justify-between w-full h-full text-zinc-400">
                              <span className="font-mono text-[10px]">{originalIdx + 1}</span>
                              <GripHorizontal className="w-3 h-3 cursor-grab opacity-0 group-hover:opacity-100 text-zinc-300" />
                            </div>
                          ) : col.key === 'actions' ? (
                            <div className="flex items-center justify-center w-full h-full">
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteRow(r.id); }}
                                className="p-0.5 text-zinc-400 hover:text-red-600 rounded cursor-pointer"
                                title="حذف"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className={`${
                              col.type === 'number' || col.key === 'total' || col.key === 'code' ? 'font-mono' : ''
                            } ${
                              col.key === 'total' ? 'font-black' : ''
                            } ${isSelected ? 'text-white' : 'text-zinc-800'}`}>
                              {renderedValue}
                            </span>
                          )
                        )}

                        {/* Row Height drag handle */}
                        {col.key === orderedColumns[0].key && (
                          <div
                            onMouseDown={(e) => handleRowResizeMouseDown(originalIdx, e)}
                            className="absolute bottom-0 right-0 left-0 h-1 cursor-row-resize hover:bg-blue-500 z-40"
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid Footers */}
      <div className="bg-[#e0e0e0] border-t border-zinc-400 h-6 shrink-0 flex items-center justify-between px-2 text-[10px] font-black text-zinc-700">
        <div className="flex gap-4">
          <span>المواد المدرجة: <span className="font-mono text-blue-800">{rows.length}</span></span>
          <span>إجمالي الكميات: <span className="font-mono text-blue-800">{totals.quantity}</span></span>
        </div>
        <div>
          <span>إجمالي البنود: <span className="font-mono text-emerald-800">{totals.total.toFixed(2)} ر.س</span></span>
        </div>
      </div>
    </div>
  );
};
