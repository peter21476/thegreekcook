# SCSS Structure Documentation

This directory contains the organized SCSS files for The Greek Cook application.

## File Structure

```
src/styles/
├── _variables.scss      # Colors, fonts, spacing, and other variables
├── _mixins.scss         # Reusable SCSS mixins
├── _base.scss           # Global styles, typography, and base elements
├── _layout.scss         # Header, footer, and layout components
├── _components.scss     # Buttons, forms, and common UI components
├── _recipes.scss        # Recipe-specific styles (cards, details, forms)
├── _admin.scss          # Admin page styles (approval, user management)
├── _utilities.scss      # Loading animations, keyframes, and utility classes
├── main.scss            # Main file that imports all partials
└── README.md            # This documentation file
```

## Import Order

The files are imported in a specific order to ensure proper cascading:

1. **Variables & Mixins** - Must come first as they're used by other files
2. **Base Styles** - Global styles and typography
3. **Layout Styles** - Header, footer, and main layout
4. **Component Styles** - Reusable UI components
5. **Feature Styles** - Specific feature styles (recipes, admin)
6. **Utility Styles** - Must come last to override other styles

## Usage

### Adding New Styles

1. **For new components**: Add to the appropriate feature file or create a new one
2. **For global styles**: Add to `_base.scss`
3. **For reusable patterns**: Create mixins in `_mixins.scss`
4. **For new variables**: Add to `_variables.scss`

### Best Practices

- Use the provided variables and mixins for consistency
- Follow the BEM methodology for class naming
- Keep files focused on a single responsibility
- Use the responsive mixins for mobile-first design
- Add utility classes to `_utilities.scss` for common patterns

### Variables Available

- **Colors**: `$primary`, `$secondary`, `$success`, `$danger`, etc.
- **Spacing**: `$spacing-xs`, `$spacing-sm`, `$spacing-md`, etc.
- **Typography**: `$font-family-primary`, `$font-size-base`, etc.
- **Breakpoints**: `$breakpoint-sm`, `$breakpoint-md`, etc.

### Mixins Available

- **Layout**: `@include flex-center`, `@include flex-between`
- **Buttons**: `@include button-base`, `@include button-variant`
- **Forms**: `@include form-control-base`
- **Cards**: `@include card-base`, `@include card-hover`
- **Responsive**: `@include mobile`, `@include tablet`, `@include desktop`
- **Grid**: `@include grid-auto-fit`, `@include grid-columns`

## Migration from App.scss

The original `App.scss` file has been split into these organized files. All existing styles have been preserved and organized by functionality.

## Maintenance

- Keep files under 500 lines when possible
- Use comments to separate sections within files
- Update this README when adding new files or patterns
- Follow the established naming conventions
