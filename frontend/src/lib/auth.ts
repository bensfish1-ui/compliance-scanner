import type {
  CognitoUserPool as CognitoUserPoolType,
  CognitoUserSession as CognitoUserSessionType,
} from "amazon-cognito-identity-js";

const POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || "eu-north-1_KF9aDU71S";
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || "cblredme7p5e0sa5bfarfc4t0";

// Lazy-init the user pool to avoid errors during SSR/build
let _userPool: CognitoUserPoolType | null = null;
function getUserPool(): CognitoUserPoolType {
  if (_userPool) return _userPool;
  // Dynamic import at runtime only
  const { CognitoUserPool } = require("amazon-cognito-identity-js");
  _userPool = new CognitoUserPool({
    UserPoolId: POOL_ID,
    ClientId: CLIENT_ID,
  });
  return _userPool!;
}

export interface AuthResult {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  email: string;
}

export function signIn(email: string, password: string): Promise<AuthResult> {
  const { CognitoUser, AuthenticationDetails } = require("amazon-cognito-identity-js");
  const userPool = getUserPool();

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
      onSuccess: (session: CognitoUserSessionType) => {
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
      onFailure: (err: any) => {
        reject(err);
      },
      newPasswordRequired: (_userAttributes: any) => {
        user.completeNewPasswordChallenge(password, {}, {
          onSuccess: (session: CognitoUserSessionType) => {
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
          onFailure: (err: any) => reject(err),
        });
      },
    });
  });
}

export function signOut(): void {
  try {
    const currentUser = getUserPool().getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
  } catch {
    // Ignore errors during sign out
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
