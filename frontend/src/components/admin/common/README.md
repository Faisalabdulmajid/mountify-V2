# Admin Components

This directory contains reusable admin components for the Sistem Rekomendasi Gunung application.

## Components

### AdminToolbar

A flexible toolbar component with search functionality and filters.

**Props:**

- `searchTerm` (string): Current search term
- `onSearchChange` (function): Callback for search changes
- `searchPlaceholder` (string): Placeholder text for search input
- `filters` (array): Array of filter configurations
- `extraActions` (React.Node): Additional action buttons
- `className` (string): Additional CSS classes

**Filter Configuration:**

```javascript
{
  label: "Filter Label",
  type: "select" | "range",
  value: currentValue,
  onChange: onChangeCallback,
  disabled: boolean,
  options: [{ value: "1", label: "Option 1" }], // for select type
  minPlaceholder: "Min", // for range type
  maxPlaceholder: "Max"  // for range type
}
```

### AdminTable

A flexible table component with sorting capabilities.

**Props:**

- `columns` (array): Column configurations
- `data` (array): Table data
- `sortConfig` (object): Current sort configuration
- `onSort` (function): Sort callback
- `loading` (boolean): Loading state
- `emptyMessage` (string): Message when no data
- `className` (string): Additional CSS classes

**Column Configuration:**

```javascript
{
  key: "column_key",
  label: "Column Label",
  width: "120px",
  sortable: true,
  render: (item, index) => <CustomComponent />
}
```

### AdminPagination

A pagination component with items per page selector.

**Props:**

- `currentPage` (number): Current page number
- `totalPages` (number): Total number of pages
- `itemsPerPage` (number): Items per page
- `totalItems` (number): Total number of items
- `onPageChange` (function): Page change callback
- `onItemsPerPageChange` (function): Items per page change callback
- `indexOfFirstItem` (number): Index of first item on page
- `currentItemsLength` (number): Number of items on current page
- `className` (string): Additional CSS classes

### StatusBadge

A consistent badge component for status display.

**Props:**

- `status` (string): Status text to display
- `type` (string): Badge type - "status", "difficulty", or "custom"
- `className` (string): Additional CSS classes

## Usage Examples

### Basic AdminToolbar

```javascript
<AdminToolbar
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search items..."
  filters={[
    {
      label: "Status",
      type: "select",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "all", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]}
/>
```

### Basic AdminTable

```javascript
<AdminTable
  columns={[
    {
      key: "id",
      label: "ID",
      width: "60px",
      render: (item, index) => index + 1,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      width: "200px",
    },
    {
      key: "status",
      label: "Status",
      render: (item) => <StatusBadge status={item.status} type="status" />,
    },
  ]}
  data={tableData}
  sortConfig={sortConfig}
  onSort={handleSort}
/>
```

### Basic AdminPagination

```javascript
<AdminPagination
  currentPage={currentPage}
  totalPages={totalPages}
  itemsPerPage={itemsPerPage}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
  onItemsPerPageChange={setItemsPerPage}
  indexOfFirstItem={indexOfFirstItem}
  currentItemsLength={currentItems.length}
/>
```

## Styling

Each component comes with its own CSS file and follows consistent design patterns:

- Clean, modern appearance
- Responsive design
- Consistent spacing and colors
- Hover effects and transitions
- Accessibility considerations

## Best Practices

1. **Consistent Data Structure**: Ensure your data objects have consistent key names
2. **Error Handling**: Handle loading and error states appropriately
3. **Performance**: Use React.memo for components that receive complex props
4. **Accessibility**: Ensure proper ARIA labels and keyboard navigation
5. **Responsive Design**: Test components on different screen sizes
