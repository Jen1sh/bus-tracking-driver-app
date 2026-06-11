# React Native Managed Template

A production-ready React Native Expo starter template with authentication flow, navigation, state management, and modern development tools pre-configured.

## ✨ Features

### Core Features

- 🚀 **Expo SDK 55** - Latest Expo framework with managed workflow
- 📱 **Expo Router** - File-based routing with native navigation
- 🎨 **Unistyles v3** - Universal styling system with theme support
- 🗄️ **Zustand** - Lightweight state management
- 🌐 **Axios** - HTTP client with interceptors pre-configured
- 🔐 **Expo Secure Store** - Secure storage for sensitive data
- 🎭 **Dark/Light Theme** - Built-in theme switching with context

### Authentication & Navigation

- ✅ Pre-built authentication flow
- 🔒 Protected routes with auth guards
- 📍 Deep linking support
- 🎯 Type-safe navigation with TypeScript

### Development Experience

- 💅 **ESLint & Prettier** - Code quality and formatting
- 📝 **TypeScript** - Full type safety
- 🎨 **Custom Fonts** - Pre-configured font loading
- 🧩 **VS Code Snippets** - Speed up development
- 🍞 **Toast Notifications** - User feedback system
- ⌨️ **Keyboard Controller** - Enhanced keyboard handling
- 🎬 **Reanimated** - Smooth animations

### Build & Deployment

- 🏗️ **EAS Build** - Production-ready build profiles
- 🔧 **Development Client** - Custom dev builds
- 📦 **Prebuild** - Native project generation

## 📋 Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For iOS development: macOS with Xcode
- For Android development: Android Studio

## 🚀 Getting Started

### 1. Clone or use this template

```bash
# Clone the repository
git clone <repository-url>
cd react-native-managed-template

# Or use as template in GitHub
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Start development server

```bash
npm start
# or
expo start
```

### 4. Run on device/simulator

```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Or scan QR code with Expo Go app
```

## 📁 Project Structure

```
react-native-managed-template/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout
│   ├── sign-in.tsx              # Sign in screen
│   └── (protected)/             # Protected routes group
│       ├── _layout.tsx
│       ├── index.tsx            # Home screen
│       └── profile.tsx          # Profile screen
├── src/
│   ├── components/              # Reusable components
│   │   ├── styled/             # Styled UI components
│   │   └── profile/            # Feature-specific components
│   ├── contexts/               # React contexts
│   │   ├── auth.context.tsx   # Authentication context
│   │   └── theme.context.tsx  # Theme management
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and configs
│   │   ├── axios.ts           # Axios instance & interceptors
│   │   ├── secure-store.ts    # Secure storage wrapper
│   │   └── date-time.ts       # Date utilities
│   ├── store/                  # Zustand stores
│   ├── unistyles/             # Theme tokens & styles
│   └── constants/             # App constants
├── assets/                     # Static assets
│   ├── fonts/
│   ├── icons/
│   └── images/
├── android/                    # Android native code
├── ios/                        # iOS native code
└── app.config.ts              # Expo app configuration
```

## 🧩 VS Code Snippets

The template includes pre-built VS Code snippets to accelerate development. These snippets generate boilerplate code with best practices baked in.

### Available Snippets

#### Component Snippet (`rnbc`)

Type `rnbc` to generate a new React Native component with:

- Proper imports (StyledText, React, View)
- Unistyles setup with theme tokens
- Component structure with default styling

```typescript
// Generated code structure:
import { StyledText } from '@/components/styled/StyledText';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const MyComponent = () => {
  return (
    <View style={styles.container}>
      <StyledText style={styles.text}>MyComponent</StyledText>
    </View>
  );
};

const styles = StyleSheet.create(({ spacings }) => ({
  container: {
    padding: spacings.sm,
  },
  text: {
    textDecorationLine: 'underline'
  },
}));

export default MyComponent;
```

#### Screen Snippet (`rnbs`)

Type `rnbs` to generate a new screen with:

- ScrollView with keyboard handling
- Expo Router integration
- Safe area insets
- Responsive padding using theme tokens

```typescript
// Generated code structure:
import { StyledText } from '@/components/styled/StyledText';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const MyScreen = () => {
  const router = useRouter();

  return (
    <ScrollView
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}>
      <StyledText variant='title'>MyScreen</StyledText>
    </ScrollView>
  );
};

const styles = StyleSheet.create(({ spacings }, rt) => ({
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: spacings.base,
    paddingBottom: spacings.xxxl,
    paddingTop: rt.insets.top + spacings.base,
  },
}));

export default MyScreen;
```

### How to Use Snippets

1. Create a new `.tsx` file in your project
2. Type the snippet prefix (`rnbc` or `rnbs`)
3. Press `Tab` or `Enter` to expand
4. The component/screen name will be auto-selected - just type your desired name
5. Press `Tab` to move to the next placeholder (if any)

These snippets ensure consistency across your codebase and save time on repetitive boilerplate code.

## 🔐 Authentication Flow

The template includes a complete authentication flow:

1. **Sign In Screen** - Entry point for unauthenticated users
2. **Auth Context** - Manages authentication state
3. **Protected Routes** - Automatically guards routes requiring authentication
4. **Secure Storage** - Persists tokens securely

## 📦 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios           # Run on iOS

# Code Quality
npm run lint          # Run ESLint with auto-fix

# Build
npm run prebuild      # Generate native projects
npm run build:dev     # Build development client locally
npm run build:prev    # Build preview build locally
npm run build:prod    # Build production build locally
```

## 🛠️ Built With

- [Expo](https://expo.dev/) - Framework and platform
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing
- [React Native](https://reactnative.dev/) - Mobile framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Unistyles](https://reactnativeunistyles.vercel.app/) - Styling solution
- [Axios](https://axios-http.com/) - HTTP client
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) - Animations
- [React Native Toast Message](https://github.com/calintamas/react-native-toast-message) - Notifications

## 📝 Configuration

### App Configuration

Update [app.config.ts](app.config.ts) with your app details:

```typescript
export default {
  name: 'Your App Name',
  slug: 'your-app-slug',
  // ... other configurations
};
```

### Environment Variables

Create a `.env` file for environment-specific variables (not included in repo):

```env
API_BASE_URL=https://your-api.com
```

### Navigation Theme

Customize navigation appearance in [src/hooks/useNavigationTheme.ts](src/hooks/useNavigationTheme.ts)

## 🚢 Deployment

### Building for Production

1. **Configure EAS**

   ```bash
   eas build:configure
   ```

2. **Build for Android/iOS**

   ```bash
   eas build --platform android
   eas build --platform ios
   ```

3. **Submit to Stores**
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the amazing framework
- React Native community for the excellent libraries
- All testers who help improve this template

## 📧 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Made with ❤️ for the React Native community
