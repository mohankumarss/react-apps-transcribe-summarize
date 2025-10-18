import { GridColumn, FilterValue } from '../types';
import './ColumnFilterInput.css';
export interface ColumnFilterInputProps<T = any> {
    column: GridColumn<T>;
    value: FilterValue;
    onChange: (filter: FilterValue) => void;
    onClear: () => void;
}
export declare function ColumnFilterInput<T = any>({ column, value, onChange, onClear }: ColumnFilterInputProps<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=ColumnFilterInput.d.ts.map