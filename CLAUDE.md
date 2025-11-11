# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript + Vite project that serves as a file comparison tool, specifically designed for comparing browser tab collections. The application allows users to upload files, compare their contents, and visualize differences in a hierarchical tree structure.

## Key Components

1. **FileComparisonPage.vue** - Main page component that handles file uploads and triggers comparisons
2. **FileOperator.vue** - Component for managing file operations and displaying collections
3. **Tree.vue** - Hierarchical tree view for displaying collections, windows, and tabs
4. **Checkbox.vue** - Custom checkbox component with indeterminate state handling
5. **Store** - Pinia store for state management (selector.ts)
6. **Utils** - Utility functions for data formatting and comparison (data.ts, hash.ts)

## Data Structure

The application works with a hierarchical data structure:
- Collections (top level)
  - Windows/Folders (second level)
    - Tabs/Links (third level)

## Development Commands

### Start Development Server
```bash
npm run dev
# or
pnpm dev
```

### Build for Production
```bash
npm run build
# or
pnpm build
```

### Preview Production Build
```bash
npm run preview
# or
pnpm preview
```

## Architecture Notes

1. **State Management**: Uses Pinia for state management, particularly for tracking selected items in the tree view
2. **Data Processing**: Implements custom algorithms for comparing collections based on titles and hashes
3. **UI Framework**: Uses TailwindCSS with DaisyUI components for styling
4. **File Handling**: Reads JSON files and processes them into a standardized format
5. **Comparison Logic**: Compares collections by generating SHA-256 hashes for deduplication

## Key Utilities

- `formatData()` - Standardizes data structure from different file formats
- `compareCollectionsByTitleImproved()` - Enhanced comparison function that handles collections with duplicate titles
- `hashCollection()` - Generates stable hashes for collections to identify duplicates

## Styling

The project uses TailwindCSS with DaisyUI components. Styles are scoped to individual components with global styles in `style.css`.