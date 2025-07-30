// Show/hide subcategory and size fields based on selected category in Django admin (tab-friendly)
(function() {
  function isOneSizeCategory(selected) {
    selected = selected.toLowerCase();
    return (
      selected.includes('basic top') ||
      selected.includes('sweatpant') ||
      selected.includes('suit')
    );
  }

  function toggleFields() {
    var categorySelect = document.getElementById('id_category');
    var subcategoryRow = document.querySelector('.form-row.field-subcategory, .form-group.field-subcategory');
    var oneSizeRow = document.querySelector('.form-row.field-sizes, .form-group.field-sizes');
    var normalSizeRows = [
      document.querySelector('.form-row.field-stock_M, .form-group.field-stock_M'),
      document.querySelector('.form-row.field-stock_L, .form-group.field-stock_L'),
      document.querySelector('.form-row.field-stock_XL, .form-group.field-stock_XL'),
      document.querySelector('.form-row.field-stock_2XL, .form-group.field-stock_2XL')
    ];
    if (!categorySelect) return;
    var selected = categorySelect.options[categorySelect.selectedIndex].text;
    if (subcategoryRow) {
      subcategoryRow.style.display = '';
    }
    if (isOneSizeCategory(selected)) {
      if (oneSizeRow) oneSizeRow.style.display = '';
      normalSizeRows.forEach(function(row) { if (row) row.style.display = 'none'; });
    } else {
      if (oneSizeRow) oneSizeRow.style.display = 'none';
      normalSizeRows.forEach(function(row) { if (row) row.style.display = ''; });
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    var categorySelect = document.getElementById('id_category');
    if (categorySelect) {
      categorySelect.addEventListener('change', toggleFields);
      toggleFields();
    }
  });
})(); 