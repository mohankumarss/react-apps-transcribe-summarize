import { GridState, GridColumn, SortColumn, ColumnFilter, GlobalFilter, GridProps } from '../types';
export declare function useGridState<T = any>(props: GridProps<T>): {
    state: GridState<T>;
    actions: {
        setLoading: import("react").Dispatch<import("react").SetStateAction<boolean>>;
        setError: import("react").Dispatch<import("react").SetStateAction<string | null>>;
        setCurrentPage: (page: number) => void;
        setPageSize: (size: number) => void;
        setSortColumns: import("react").Dispatch<import("react").SetStateAction<SortColumn[]>>;
        toggleSort: (columnKey: string) => void;
        setColumnFilters: import("react").Dispatch<import("react").SetStateAction<ColumnFilter[]>>;
        setGlobalFilter: import("react").Dispatch<import("react").SetStateAction<GlobalFilter>>;
        addColumnFilter: (columnKey: string, filter: any) => void;
        removeColumnFilter: (columnKey: string) => void;
        clearAllFilters: () => void;
        setSelectedRows: import("react").Dispatch<import("react").SetStateAction<Set<string | number>>>;
        selectRow: (rowKey: string | number) => void;
        deselectRow: (rowKey: string | number) => void;
        toggleRowSelection: (rowKey: string | number) => void;
        selectAllRows: () => void;
        deselectAllRows: () => void;
        setEditingCell: import("react").Dispatch<import("react").SetStateAction<{
            rowIndex: number;
            columnKey: string;
        } | null>>;
        setEditingRow: import("react").Dispatch<import("react").SetStateAction<number | null>>;
        startCellEdit: (rowIndex: number, columnKey: string) => void;
        stopCellEdit: () => void;
        setColumnWidths: import("react").Dispatch<import("react").SetStateAction<Record<string, number>>>;
        setExpandedRows: import("react").Dispatch<import("react").SetStateAction<Set<string | number>>>;
        setVisibleColumns: import("react").Dispatch<import("react").SetStateAction<GridColumn<T>[]>>;
        toggleRowExpansion: (rowKey: string | number) => void;
        setGroupBy: import("react").Dispatch<import("react").SetStateAction<string[]>>;
    };
};
//# sourceMappingURL=useGridState.d.ts.map