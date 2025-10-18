import { GridColumn } from '../types';
import { ResponsiveColumnConfig } from '../utils/responsive';
export interface ResponsiveGridState {
    currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    containerWidth: number;
    visibleColumns: GridColumn[];
    responsiveConfig: Map<string, ResponsiveColumnConfig>;
    shouldStack: boolean;
    shouldCompact: boolean;
}
export interface ResponsiveState {
    currentBreakpoint: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    visibleColumns: string[];
    shouldStack: boolean;
    shouldCompact: boolean;
}
export interface ResponsiveConfig {
    breakpoints: Record<string, number>;
    hiddenColumns: Record<string, string[]>;
    stackedLayout?: boolean;
    compactMode?: boolean;
}
export declare function useResponsiveGrid<T = any>(columns: GridColumn<T>[], containerRef: React.RefObject<HTMLElement>): ResponsiveGridState;
export declare function useResponsive<T = any>(columns: GridColumn<T>[], config?: ResponsiveConfig): ResponsiveState;
export declare function useResponsiveColumns<T = any>(columns: GridColumn<T>[], containerWidth: number, responsive: ResponsiveState): GridColumn<T>[];
export declare function useResponsiveFeatures(responsive: ResponsiveState): {
    virtualization: boolean;
    pagination: {
        showPageInfo: boolean;
        showPageSizeSelector: boolean;
        showQuickJumper: boolean;
        maxPageNumbers: number;
    };
    filtering: {
        columnFilters: boolean;
        globalSearch: boolean;
        advancedFilters: boolean;
        filterPresets: boolean;
    };
    selection: {
        showSelectAll: boolean;
        showBulkActions: boolean;
    };
    editing: {
        inlineEditing: boolean;
        popupEditing: boolean;
    };
    export: {
        showInToolbar: boolean;
        showInMenu: boolean;
    };
};
export declare function useTouchGestures(onSwipeLeft?: () => void, onSwipeRight?: () => void, onPinch?: (scale: number) => void): void;
export declare function getResponsiveStyles(responsive: ResponsiveState): {
    container: {
        fontSize: string;
        padding: string;
    };
    header: {
        height: string;
        fontSize: string;
    };
    row: {
        height: string;
        padding: string;
    };
    cell: {
        padding: string;
        fontSize: string;
    };
    pagination: {
        buttonSize: string;
        spacing: string;
    };
};
//# sourceMappingURL=useResponsive.d.ts.map