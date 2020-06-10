/**
 * This module enables efficient rendering of large table.
 *
 * It consists modeling of Table HTML Markup Hierarchy
 *
 * | Table Constituent | HTML Element             | View Layer Class  | Model Layer Class | TypeScript Interface |
 * | ----------------- | ------------------------ | ----------------- | ----------------- | -------------------- |
 * | Cell              | HTMLTableCellElement     | DataCellElement   | Datum             | DatumLike            |
 * | Row               | HTMLTableRowElement      | DataElement       | Data              | DataLike             |
 * | Section           | HTMLTableSectionElement  | DataSectionElement| DataCollection    | DataCollectionLike   |
 *
 * @module TableDataManager
 */
