# Grid Component Usage Guide

The Grid component is a powerful, feature-rich data grid system designed for modern React applications. It provides comprehensive functionality for displaying, filtering, sorting, and paginating tabular data with full theme integration and accessibility support.

## Basic Usage

```typescript
import { Grid, GridColumn } from '@shared/components';

const columns: GridColumn[] = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: 'Name', width: 200 },
  { key: 'email', title: 'Email', width: 250 },
  { key: 'status', title: 'Status', width: 120 }
];

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <Grid
      data={data}
      columns={columns}
      loading={loading}
      height="500px"
      theme="crm"
    />
  );
}
```

## Features Configuration

The Grid component uses a `features` prop to enable/disable functionality:

```typescript
<Grid
  data={data}
  columns={columns}
  features={{
    selection: 'multiple',           // 'none' | 'single' | 'multiple'
    pagination: true,                // boolean or PaginationConfig
    sorting: true,                   // boolean or SortingConfig
    filtering: {                     // boolean or FilteringConfig
      columnFilters: true,
      globalSearch: false
    }
  }}
/>
```

### Selection Modes

#### No Selection
```typescript
features={{ selection: 'none' }}
```
- No selection controls displayed
- Pure data display and navigation
- Recommended for read-only grids

#### Single Selection
```typescript
features={{ selection: 'single' }}
```
- Radio buttons for exclusive selection
- Only one row can be selected at a time
- Useful for master-detail views

#### Multiple Selection
```typescript
features={{ selection: 'multiple' }}
```
- Checkboxes for multiple row selection
- Master checkbox to select/deselect all
- Ctrl+click support for individual selection
- Useful for bulk operations

## Column Configuration

```typescript
const columns: GridColumn[] = [
  {
    key: 'name',
    title: 'Customer Name',
    width: 200,
    sortable: true,           // Enable sorting (default: true)
    filterable: true,         // Enable filtering (default: true)
    renderer: ({ value, row }) => (
      <strong>{value}</strong>
    )
  },
  {
    key: 'date',
    title: 'Date',
    width: 120,
    type: 'date',            // 'text' | 'number' | 'date' | 'boolean'
    renderer: ({ value }) => (
      new Date(value).toLocaleDateString()
    )
  },
  {
    key: 'actions',
    title: 'Actions',
    width: 100,
    sortable: false,
    filterable: false,
    renderer: ({ row }) => (
      <button onClick={() => handleEdit(row)}>
        Edit
      </button>
    )
  }
];
```

## Pagination Configuration

### Basic Pagination
```typescript
features={{ pagination: true }}
```

### Advanced Pagination
```typescript
features={{
  pagination: {
    pageSize: 25,
    pageSizeOptions: [10, 25, 50, 100],
    showPageInfo: true,
    showPageSizeSelector: true
  }
}}
```

## Event Handlers

```typescript
<Grid
  data={data}
  columns={columns}
  onRowClick={(row, index, event) => {
    console.log('Row clicked:', row);
  }}
  onRowDoubleClick={(row, index, event) => {
    // Navigate to detail view
    navigate(`/details/${row.id}`);
  }}
  onSelectionChange={(selectedRows) => {
    console.log('Selected rows:', selectedRows);
  }}
/>
```

## Loading and Empty States

```typescript
<Grid
  data={data}
  columns={columns}
  loading={isLoading}
  loadingComponent={
    <div className="custom-loading">
      <Spinner />
      <p>Loading data...</p>
    </div>
  }
  emptyComponent={
    <div className="custom-empty">
      <p>No records found</p>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  }
/>
```

## Theme Integration

The Grid component supports multiple themes:

```typescript
// CRM Theme (default)
<Grid theme="crm" />

// MFE Theme
<Grid theme="mfe" />

// Custom Theme
<Grid theme="custom" />
```

## Responsive Design

The Grid automatically adapts to different screen sizes:

- **Desktop**: Full table layout with all columns
- **Tablet**: Optimized column widths and touch-friendly controls
- **Mobile**: Card-based layout for better mobile experience

## Accessibility Features

The Grid component is fully accessible:

- **Keyboard Navigation**: Arrow keys, Tab, Enter, Space, Escape
- **Screen Reader Support**: ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **High Contrast**: Support for high contrast themes

### Keyboard Shortcuts

- `Arrow Keys`: Navigate between rows
- `Space`: Select/deselect current row
- `Enter`: Activate row (trigger onRowDoubleClick)
- `Escape`: Clear focus
- `Ctrl+A`: Select all rows (when multiple selection enabled)

## Advanced Examples

### API Integration
```typescript
function MyDataComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await api.getData();
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid
      data={data}
      columns={columns}
      loading={loading}
      features={{
        selection: 'multiple',
        pagination: true,
        sorting: true,
        filtering: { columnFilters: true }
      }}
      onRowDoubleClick={(row) => {
        navigate(`/details/${row.id}`);
      }}
    />
  );
}
```

### Custom Cell Renderers
```typescript
const columns: GridColumn[] = [
  {
    key: 'status',
    title: 'Status',
    renderer: ({ value }) => (
      <span className={`status-badge status-${value.toLowerCase()}`}>
        {value}
      </span>
    )
  },
  {
    key: 'progress',
    title: 'Progress',
    renderer: ({ value }) => (
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${value}%` }}
        />
        <span>{value}%</span>
      </div>
    )
  }
];
```

## Performance Tips

1. **Use React.memo** for custom cell renderers
2. **Implement virtual scrolling** for large datasets (>1000 rows)
3. **Optimize column renderers** to avoid expensive calculations
4. **Use pagination** to limit rendered rows
5. **Debounce filter inputs** for better performance

## Best Practices

1. **Always provide a unique key** for each row (use `rowKey` prop)
2. **Use appropriate column widths** to prevent layout shifts
3. **Implement proper loading states** for better UX
4. **Provide meaningful empty states** when no data is available
5. **Test keyboard navigation** for accessibility compliance
6. **Use semantic column types** for better filtering and sorting

## Common Patterns

### Master-Detail View
```typescript
<Grid
  features={{ selection: 'single' }}
  onRowClick={(row) => setSelectedItem(row)}
/>
```

### Bulk Operations
```typescript
<Grid
  features={{ selection: 'multiple' }}
  onSelectionChange={(selected) => setSelectedItems(selected)}
/>
```

### Read-Only Display
```typescript
<Grid
  features={{ 
    selection: 'none',
    pagination: true,
    sorting: true,
    filtering: { columnFilters: true }
  }}
/>
```

This comprehensive Grid component provides all the functionality needed for modern data display and interaction while maintaining excellent performance and accessibility standards.
