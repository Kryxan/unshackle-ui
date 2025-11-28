# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Fork of unshackle-dl/unshackle-ui

### Added

- **Interactive Terminal Page**: Full-featured bash shell with WebSocket connection
  - Real-time terminal emulation using xterm.js
  - WebSocket connection to `/api/terminal` for actual shell execution
  - Theme-aware terminal colors (automatic dark/light mode switching)
  - GRC (Generic Colouriser) color support for command output
  - Automatic .bashrc loading on connection
  - Full-height terminal with minimal padding and no UI chrome
  - ResizeObserver for dynamic terminal fitting to viewport
  - Terminal navigation tab with Terminal icon
- **Runtime Settings Page**: Configure API endpoints and keys at runtime without rebuilding
  - Unshackle API base URL configuration
  - Unshackle API key management with show/hide toggle
  - TMDB API key management with show/hide toggle
  - Configuration validation and status indicators
  - Environment variable override system (runtime > env > defaults)
  - Reset to defaults functionality
- **Two-Step Search Workflow**: Complete TMDB → Service Selection → Results flow
  - TMDB content selection with poster grid
  - Service selection step with multi-select checkboxes
  - Aggregated results display from multiple services
  - Retry and back navigation between steps
- **Settings Navigation Tab**: Dedicated Settings page accessible from main navigation
- **Accessibility Compliance**: Added ARIA labels to form controls for WCAG 2.1 compliance
- **Cross-Platform File Casing**: `forceConsistentCasingInFileNames` enabled in all TypeScript configs

### Changed

- **Service Discovery**: Removed hardcoded service definitions, all services now discovered at runtime via `/api/services`
- **Type System Overhaul**: Updated `ServiceInfo` and `DownloadJob` types to match actual unshackle serve API
  - `ServiceInfo` now uses `tag`, `url`, `aliases`, `geofence`, `title_regex`, `help` (legacy `id`/`name` maintained for compatibility)
  - `DownloadJob` now uses `job_id`, `title_id`, `created_time` (legacy `id`/`start_time` maintained for compatibility)
- **Search Implementation**: Replaced simplified search with full two-step workflow from original repository
  - `SimpleSearchHero` for TMDB query input
  - `TMDBSelectionGrid` for content selection
  - `ServiceSearchStep` for service selection with new API format support
  - `ContentGrid` for final results display
- **TypeScript Configuration**:
  - Changed ES2023 → ES2022 in `tsconfig.node.json` (ES2023 not officially supported)
  - Added `strict` mode to root `tsconfig.json`
  - Added `forceConsistentCasingInFileNames` to all config files for cross-platform compatibility
- **Service Components**: Updated to use dynamic service identifiers
  - Service cards, auth modals, and config modals now use `service.tag || service.id`
  - Service-specific settings check both `tag` and `id` properties
- **Navigation Icons**: Changed Services tab icon from Settings gear to Cloud icon

### Fixed

- **TypeScript Errors**: Resolved all 51+ compilation errors
  - Null safety checks throughout downloads store
  - Optional chaining for potentially undefined properties
  - Proper type guards for job ID fallbacks
  - Date parsing null checks in store-manager
  - Array filtering for undefined values in bulk operations
- **WebSocket Integration**:
  - Fixed status type casting in connection confirmations
  - Added `getBaseURL()` method to UnshackleAPIClient
  - Corrected polling status type handling
- **API Client**: Fixed service search test to use dynamic service identifiers
- **Download Components**:
  - Null-safe job ID handling in cancel/retry operations
  - Removed unused imports (Film, Music icons)
  - Fixed bulk retry to filter undefined IDs
- **Service Selector**: Fixed service toggle to check both `id` and `tag` properties
- **Toast Notifications**: Updated to use sonner API (`toast.success`/`toast.error` with description)

### Removed

- **Mock Data**: Deleted `src/lib/mock-data.ts` with hardcoded service definitions (NF, DSNP, AMZN, ATVP, MAX)
- **Hardcoded Service References**: Cleared `preferredServices` and `selectedServices` default arrays
- **Old Connection Status Component**: Removed `connection-status-indicator-old.tsx`
- **Unused Imports**: Cleaned up unused icon imports and utility functions across multiple components

### Technical Improvements

- **Build Success**: Clean build with 0 TypeScript errors (down from 51+)
- **Type Safety**: Enhanced strict type checking with comprehensive null/undefined handling
- **Code Quality**: Removed dead code, unused variables, and redundant type definitions
- **Maintainability**: Dynamic service discovery eliminates build-time dependencies on service configuration

### Infrastructure

- **Zustand Store**: Added `settings-store.ts` for runtime API configuration with localStorage persistence
- **Settings Page**: New `settings-page.tsx` with comprehensive configuration UI
- **Tab System**: Extended `TabId` type to include 'settings'
- **Export Updates**: Updated `pages/index.ts` and `stores/index.ts` to include new modules

## Notes

This fork maintains backward compatibility with the original unshackle-ui design while adding:

1. Runtime configuration without Docker rebuilds
2. Complete two-step search workflow from original repository
3. Full type safety with actual API response formats
4. Cross-platform file system compatibility
5. Accessibility compliance (WCAG 2.1)

The application is production-ready for Docker deployment with dynamic service discovery and runtime configuration capabilities.

---

Based on [unshackle-dl/unshackle-ui](https://github.com/unshackle-dl/unshackle-ui)
