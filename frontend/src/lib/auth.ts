import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

const POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "";
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "";

const userPool = new CognitoUserPool({
  UserPoolId: POOL_ID,
  ClientId: CLIENT_ID,
});

export interface AuthResult {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  email: string;
}

export function signIn(email: string, password: string): Promise<AuthResult> {
  return new Promise((resolve, reject) => {
    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session: CognitoUserSession) => {
        const result: AuthResult = {
          accessToken: session.getAccessToken().getJwtToken(),
          idToken: session.getIdToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
          email,
        };

        localStorage.setItem("access_token", result.accessToken);
        localStorage.setItem("id_token", result.idToken);
        localStorage.setItem("refresh_token", result.refreshToken);
        localStorage.setItem("user_email", email);

        resolve(result);
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: (_userAttributes) => {
        // If Cognito requires a new password, set it to the same one
        user.completeNewPasswordChallenge(password, {}, {
          onSuccess: (session: CognitoUserSession) => {
            const result: AuthResult = {
              accessToken: session.getAccessToken().getJwtToken(),
              idToken: session.getIdToken().getJwtToken(),
              refreshToken: session.getRefreshToken().getToken(),
              email,
            };
            localStorage.setItem("access_token", result.accessToken);
            localStorage.setItem("id_token", result.idToken);
            localStorage.setItem("refresh_token", result.refreshToken);
            localStorage.setItem("user_email", email);
            resolve(result);
          },
          onFailure: (err) => reject(err),
        });
      },
    });
  });
}

export function signOut(): void {
  const currentUser = userPool.getCurrentUser();
  if (currentUser) {
    currentUser.signOut();
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_email");
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  if (!token) return false;

  // Basic JWT expiry check
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_email");
}
