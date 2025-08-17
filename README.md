This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Features

### Authentication System
- User registration and login
- **Forgot Password functionality** - Users can reset their password via email
- Password reset tokens with 1-hour expiration
- Secure password hashing with bcrypt
- JWT-based authentication

### Recipe Management
- Submit new recipes
- View and edit recipes
- Admin approval system for submitted recipes
- Public user profiles with recipe collections

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Environment Variables

### Backend (.env file in root directory)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password
FRONTEND_URL=http://localhost:3000  # Optional - will be auto-detected if not set
```

**Note**: The `FRONTEND_URL` is now optional! The system will automatically detect the frontend URL from:
1. Environment variable `FRONTEND_URL` (if set)
2. Request `Origin` header (most reliable)
3. Request `Referer` header
4. Request `Host` header
5. Fallback to `http://localhost:3000` for development

### Frontend (src/config.js)
```javascript
export const API_CONFIG = {
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'
};
```

## Forgot Password Flow

1. **Request Reset**: User clicks "Forgot Password?" on login page
2. **Email Input**: User enters their email address
3. **Token Generation**: System generates a secure reset token (valid for 1 hour)
4. **Email Delivery**: Reset link is sent to user's email
5. **Password Reset**: User clicks link and sets new password
6. **Token Invalidation**: Reset token is cleared after successful password change

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
