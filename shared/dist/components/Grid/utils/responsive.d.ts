import { GridColumn } from '../types';
export declare const BREAKPOINTS: {
    readonly mobile: 768;
    readonly tablet: 1024;
    readonly desktop: 1025;
};
export declare const COLUMN_PRIORITIES: {
    readonly id: 1;
    readonly name: 1;
    readonly title: 1;
    readonly status: 1;
    readonly actions: 1;
    readonly action: 1;
    readonly dateOfCall: 1;
    readonly phoneNumber: 1;
    readonly date: 2;
    readonly timeOfCall: 2;
    readonly email: 2;
    readonly inboundOutbound: 2;
    readonly callLength: 3;
    readonly notes: 3;
    readonly description: 3;
};
export interface ResponsiveColumnConfig {
    mobile: {
        visible: boolean;
        width?: string | number;
        minWidth?: number;
        flex?: number;
    };
    tablet: {
        visible: boolean;
        width?: string | number;
        minWidth?: number;
        flex?: number;
    };
    desktop: {
        visible: boolean;
        width?: string | number;
        minWidth?: number;
        flex?: number;
    };
}
export declare function pixelToFlexRatio(pixelWidth: number, totalWidth: number): number;
export declare function calculateTotalWidth(columns: GridColumn[]): number;
export declare function getColumnPriority(columnKey: string): number;
export declare function shouldColumnBeVisible(column: GridColumn, breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean;
export declare function generateResponsiveConfig(columns: GridColumn[]): Map<string, ResponsiveColumnConfig>;
export declare function getCurrentBreakpoint(width: number): 'mobile' | 'tablet' | 'desktop';
export declare function generateGridTemplate(columns: GridColumn[], breakpoint: 'mobile' | 'tablet' | 'desktop', config: Map<string, ResponsiveColumnConfig>): string;
export declare function getResponsiveColumnStyles(column: GridColumn, breakpoint: 'mobile' | 'tablet' | 'desktop', config: Map<string, ResponsiveColumnConfig>): React.CSSProperties;
export declare function getVisibleColumns(columns: GridColumn[], breakpoint: 'mobile' | 'tablet' | 'desktop', config: Map<string, ResponsiveColumnConfig>): GridColumn[];
//# sourceMappingURL=responsive.d.ts.map