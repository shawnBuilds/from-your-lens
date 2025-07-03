import Foundation

class AuthService: AuthServiceProtocol {
    
    // MARK: - AuthServiceProtocol Implementation
    func handleReturningUser() async throws -> SessionResult {
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Checking for returning user...")
        }
        
        // Check if we have stored auth token
        let authToken = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken)
        
        if let authToken = authToken, !authToken.isEmpty {
            if FeatureFlags.enableDebugLogAuth {
                print("[AuthService] Found stored auth token, validating with server...")
            }
            
            // Make real HTTP request to verify token
            return try await validateTokenWithServer(authToken)
        } else {
            if FeatureFlags.enableDebugLogAuth {
                print("[AuthService] No stored auth token found")
            }
            return SessionResult.mockInvalid
        }
    }
    
    func logout() async throws -> LogoutResult {
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Logging out user...")
        }
        
        // Get the current token for server logout
        let authToken = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken)
        
        if let authToken = authToken, !authToken.isEmpty {
            // Try to call server logout endpoint
            do {
                try await callServerLogout(token: authToken)
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Server logout successful")
                }
            } catch {
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Server logout failed: \(error)")
                }
                // Continue with local logout even if server logout fails
            }
        }
        
        // Clear local storage
        UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
        UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.userData)
        
        return LogoutResult.mockSuccess
    }
    
    // MARK: - Token Validation
    private func validateTokenWithServer(_ token: String) async throws -> SessionResult {
        let url = URL(string: "\(APIConfig.baseURL)/auth/verify-token")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Sending token validation request to: \(url)")
        }
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Invalid response type from server")
                }
                return SessionResult.mockInvalid
            }
            
            if FeatureFlags.enableDebugLogAuth {
                print("[AuthService] Token validation response status: \(httpResponse.statusCode)")
            }
            
            switch httpResponse.statusCode {
            case 200:
                // Token is valid, parse user data
                return try await parseValidTokenResponse(data)
                
            case 401:
                // Token is invalid, clear it and return invalid session
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Token validation failed (401), clearing invalid token")
                }
                UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.authToken)
                UserDefaults.standard.removeObject(forKey: UserDefaultsKeys.userData)
                return SessionResult.mockInvalid
                
            default:
                // Other server errors
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Server error during token validation: \(httpResponse.statusCode)")
                }
                return SessionResult.mockInvalid
            }
            
        } catch {
            if FeatureFlags.enableDebugLogAuth {
                print("[AuthService] Network error during token validation: \(error)")
            }
            // On network errors, we could either:
            // 1. Return invalid session (more secure)
            // 2. Return valid session (better UX but less secure)
            // For now, we'll return invalid session to force re-authentication
            return SessionResult.mockInvalid
        }
    }
    
    private func parseValidTokenResponse(_ data: Data) async throws -> SessionResult {
        do {
            let decoder = JSONDecoder()
            let verifyResponse = try decoder.decode(VerifyTokenResponse.self, from: data)
            
            if verifyResponse.valid {
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Token validation successful for user: \(verifyResponse.user.email)")
                }
                
                // Store updated user data
                if let userData = try? JSONEncoder().encode(verifyResponse.user) {
                    UserDefaults.standard.set(userData, forKey: UserDefaultsKeys.userData)
                }
                
                return SessionResult(
                    sessionValid: true,
                    user: verifyResponse.user,
                    error: nil
                )
            } else {
                if FeatureFlags.enableDebugLogAuth {
                    print("[AuthService] Server returned valid: false")
                }
                return SessionResult.mockInvalid
            }
            
        } catch {
            if FeatureFlags.enableDebugLogAuth {
                print("[AuthService] Error parsing token validation response: \(error)")
            }
            return SessionResult.mockInvalid
        }
    }
    
    private func callServerLogout(token: String) async throws {
        let url = URL(string: "\(APIConfig.baseURL)/auth/logout")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Calling server logout endpoint")
        }
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw AuthError.networkError
        }
        
        if httpResponse.statusCode != 200 {
            if FeatureFlags.enableDebugLogAuth {
                print("[AuthService] Server logout returned status: \(httpResponse.statusCode)")
            }
            throw AuthError.serverError
        }
        
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Server logout successful")
        }
    }
    
    // MARK: - Additional Methods (to be implemented)
    func login() async throws -> SessionResult {
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Login not implemented yet")
        }
        throw AuthError.notImplemented
    }
    
    func refreshToken() async throws -> SessionResult {
        if FeatureFlags.enableDebugLogAuth {
            print("[AuthService] Token refresh not implemented yet")
        }
        throw AuthError.notImplemented
    }
}

// MARK: - Auth Errors
enum AuthError: Error, LocalizedError {
    case notImplemented
    case invalidCredentials
    case networkError
    case serverError
    
    var errorDescription: String? {
        switch self {
        case .notImplemented:
            return "Authentication method not implemented yet"
        case .invalidCredentials:
            return "Invalid credentials"
        case .networkError:
            return "Network error occurred"
        case .serverError:
            return "Server error occurred"
        }
    }
} 