# Feature: Dynamic User Avatars

This document outlines the implementation of the dynamic, colored user avatars in the Shortcut Store application.

## 1. Summary

The user profile avatar in the main header has been updated. Instead of a generic icon, logged-in users will now see a circular avatar containing the first two initials of their username. The background color of this avatar is randomly assigned upon registration from a curated palette and remains persistent for that user.

## 2. Backend Changes

### `accounts.models.User`

A new field was added to the custom `User` model to store the avatar's hex color code:

```python
# accounts/models.py

class User(AbstractUser):
    # ... other fields
    avatar_color = models.CharField(
        max_length=7,
        blank=True,
        help_text="Hex color code for the user's avatar background, e.g., #RRGGBB."
    )
```

A corresponding database migration (`accounts/migrations/0002_add_avatar_color.py`) was created to apply this schema change.

### `accounts.api_views.register_view`

The user registration view was updated to assign a random color upon account creation.

-   A predefined color palette was added:

    ```python
    AVATAR_COLOR_PALETTE = [
        '#2F4F4F',  # Dark Slate Gray
        '#A0522D',  # Sienna
        '#DAA520',  # Goldenrod
        '#4682B4',  # Steel Blue
        '#800000',  # Maroon
        '#6B8E23',  # Olive Drab
    ]
    ```

-   The `register_view` now randomly selects a color from this list and saves it to the new `user.avatar_color` field.

### `accounts.serializers.UserProfileSerializer`

The `avatar_color` field was added to the `UserProfileSerializer` to ensure it is included in the user data returned by the API.

## 3. Frontend Changes

### `frontend/src/context/AuthContext.tsx`

The `AuthProvider` was significantly refactored:

-   It now uses the real authentication services (`loginService`, `registerService`, `getCurrentUser`) instead of mock data.
-   The `User` interface was updated to match the backend model, including the new `username` and `avatar_color` fields.
-   It manages a global `isLoading` state to handle asynchronous user fetching on application load.

### `frontend/src/components/Header.tsx`

The header component was modified to display the new avatar:

-   A helper function, `getInitials()`, was added to extract the first two characters of a string.
-   The user menu button now renders a `<div>` styled as a colored circle.
-   The `backgroundColor` is set dynamically using the `user.avatar_color` property from the `AuthContext`.
-   The user's initials are displayed inside the circle.

```jsx
// Example of the new avatar structure in Header.tsx

{user ? (
  <div className="relative">
    <button>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: user.avatar_color || '#059669' }}
      >
        {getInitials(user.username)}
      </div>
      <span className="hidden md:block">{user.username}</span>
      {/* ... */}
    </button>
    {/* ... dropdown */}
  </div>
) : (
  <Link to="/login">Login</Link>
)}
```

## 4. How to Customize

-   **To change the color palette:** Modify the `AVATAR_COLOR_PALETTE` list in `accounts/api_views.py`.
-   **To change the avatar style:** Modify the JSX and CSS classes in `frontend/src/components/Header.tsx`. 