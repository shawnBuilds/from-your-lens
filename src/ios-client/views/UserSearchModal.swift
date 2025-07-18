import SwiftUI

struct UserSearchModal: View {
    @EnvironmentObject var appState: AppState
    @Binding var isPresented: Bool
    @State private var searchText = ""
    @State private var debouncedSearchText = ""
    @State private var filteredUsers: [User] = []
    @StateObject private var keyboardManager = KeyboardManager()
    @FocusState private var isSearchFieldFocused: Bool
    
    // MARK: - Computed Properties for UI States
    
    @ViewBuilder
    private var contentView: some View {
        if appState.isFetchingUsers {
            UserSearchLoadingView()
        } else if let error = appState.fetchUsersError {
            ErrorView(error: error) {
                Task {
                    await appState.fetchAllUsers()
                }
            }
        } else if filteredUsers.isEmpty {
            EmptyStateView(searchText: debouncedSearchText)
        } else {
            UserListView(users: filteredUsers) { user in
                appState.selectTargetUser(user)
                isPresented = false
            }
        }
    }
    
    // MARK: - Helper Methods
    
    // Debounced search text to avoid excessive filtering
    private func updateSearchText(_ newText: String) {
        searchText = newText
        
        // Record first input for debugging
        if debouncedSearchText.isEmpty && !newText.isEmpty {
            keyboardManager.recordFirstInput()
        }
        
        // Early return if filtering is disabled
        guard FeatureFlags.enableUpdateFilteredUsersInSearch else {
            return
        }
        
        // Reduced debounce times for faster response
        let debounceTime: UInt64 = debouncedSearchText.isEmpty ? 50_000_000 : 100_000_000 // Reduced from 150ms/300ms to 50ms/100ms
        
        // Debounce the search to avoid excessive filtering
        Task {
            try? await Task.sleep(nanoseconds: debounceTime)
            await MainActor.run {
                if searchText == newText { // Only update if text hasn't changed
                    debouncedSearchText = newText
                    updateFilteredUsers()
                }
            }
        }
    }
    
    private func updateFilteredUsers() {
        // Early return if filtering is disabled
        guard FeatureFlags.enableUpdateFilteredUsersInSearch else {
            return
        }
        
        // Run filtering off the main thread to prevent UI blocking
        Task {
            // Reduced delay for first filtering
            if filteredUsers.isEmpty && !debouncedSearchText.isEmpty {
                let delayTime: UInt64 = 10_000_000 // Reduced from 50ms to 10ms
                try? await Task.sleep(nanoseconds: delayTime)
            }
            
            // Pre-compute search term once
            let searchLower = debouncedSearchText.lowercased()
            
            // Only show users if there's a search term
            let newFilteredUsers: [User]
            if searchLower.isEmpty {
                newFilteredUsers = []
            } else {
                // Optimized filtering: pre-filter current user and use more efficient string operations
                newFilteredUsers = appState.allUsers.compactMap { user in
                    // Skip current user
                    guard user.id != appState.currentUser?.id else { return nil }
                    
                    // Quick checks first (email is usually faster than name)
                    if user.email.lowercased().contains(searchLower) {
                        return user
                    }
                    
                    // Then check name if available
                    if let fullName = user.fullName, !fullName.isEmpty {
                        if fullName.lowercased().contains(searchLower) {
                            return user
                        }
                    }
                    
                    return nil
                }
            }
            
            // Update UI on main thread
            await MainActor.run {
                filteredUsers = newFilteredUsers
            }
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Send Photos to Friend")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textColorPrimary)
                        .padding(.leading)
                    Spacer()
                    Button(action: { 
                        isPresented = false
                        appState.clearTargetUser()
                    }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.textColorSecondary)
                            .frame(width: 44, height: 44)
                            .background(Color.primaryColor.opacity(0.12))
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("Close")
                    .padding(.trailing, 16)
                }
                .padding(.vertical, 28)
                .background(Color.secondaryColor)
                Divider()
                
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.textColorSecondary)
                    TextField("Search by name or email...", text: $searchText)
                        .foregroundColor(.textColorPrimary)
                        .focused($isSearchFieldFocused)
                        .onChange(of: searchText) { newValue in
                            updateSearchText(newValue)
                        }
                        .onSubmit {
                            // Handle search submission if needed
                        }

                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.primaryColor.opacity(0.1))
                .cornerRadius(12)
                .padding(.horizontal, 24)
                .padding(.vertical, 16)
                
                // User List - Now using extracted content view
                contentView
            }
            .frame(maxWidth: 500, maxHeight: .infinity)
            .background(Color.secondaryColor)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 8, x: 0, y: 4)
            .onTapGesture {
                // Dismiss keyboard when tapping outside the text field
                isSearchFieldFocused = false
                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
            }
        .onAppear {
            // Fetch users in background if needed, but don't block UI
            if appState.allUsers.isEmpty {
                Task {
                    await appState.fetchAllUsers()
                }
            }
            
            // Focus search field using keyboard manager
            keyboardManager.focusSearchField($isSearchFieldFocused)
        }
        .onChange(of: isSearchFieldFocused) { isFocused in
            if isFocused {
                keyboardManager.keyboardAppearTime = Date()
            }
        }
    }
}

// MARK: - Helper Views

struct UserSearchLoadingView: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Loading users...")
                .font(.body)
                .foregroundColor(.textColorSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onTapGesture {
            // Dismiss keyboard when tapping on the loading view
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}

struct ErrorView: View {
    let error: Error
    let onRetry: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundColor(.orange)
            Text("Failed to load users")
                .font(.headline)
                .foregroundColor(.textColorPrimary)
            Text(error.localizedDescription)
                .font(.caption)
                .foregroundColor(.textColorSecondary)
                .multilineTextAlignment(.center)
            Button("Retry", action: onRetry)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.primaryColor)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onTapGesture {
            // Dismiss keyboard when tapping on the error view
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}

struct EmptyStateView: View {
    let searchText: String
    
    private var iconName: String {
        searchText.isEmpty ? "magnifyingglass" : "person.3.fill"
    }
    
    private var title: String {
        searchText.isEmpty ? "Search for a friend" : "No users match your search"
    }
    
    private var subtitle: String {
        searchText.isEmpty ? "Type a name or email to find friends" : "Try a different search term"
    }
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: iconName)
                .font(.system(size: 48))
                .foregroundColor(.textColorSecondary)
            Text(title)
                .font(.headline)
                .foregroundColor(.textColorPrimary)
            Text(subtitle)
                .font(.caption)
                .foregroundColor(.textColorSecondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onTapGesture {
            // Dismiss keyboard when tapping on the empty state view
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}

struct UserListView: View {
    let users: [User]
    let onUserSelect: (User) -> Void
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                ForEach(users) { user in
                    UserRowView(user: user) {
                        onUserSelect(user)
                    }
                }
            }
            .padding(.horizontal, 24)
        }
        .onTapGesture {
            // Dismiss keyboard when tapping on the scroll view
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
    }
}

struct UserRowView: View {
    let user: User
    let onSelect: () -> Void
    
    var displayName: String {
        if let name = user.fullName, !name.trimmingCharacters(in: .whitespaces).isEmpty {
            return name
        } else {
            return user.email
        }
    }
    

    
    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: 16) {
                // Profile Picture
                if let profileUrl = user.profilePictureUrl {
                    AsyncImage(url: URL(string: profileUrl)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Image(systemName: "person.circle.fill")
                            .foregroundColor(.textColorSecondary)
                    }
                    .frame(width: 50, height: 50)
                    .clipShape(Circle())
                    .id(profileUrl) // Force reload when URL changes
                    .transition(.opacity) // Smooth transition
                    .onAppear {
                        // Preload image to improve performance
                        if let url = URL(string: profileUrl) {
                            URLSession.shared.dataTask(with: url).resume()
                        }
                    }
                } else {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.textColorSecondary)
                }
                
                // User Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(displayName)
                        .font(.headline)
                        .foregroundColor(.textColorPrimary)
                        .lineLimit(1)
                    
                    Text(user.email)
                        .font(.caption)
                        .foregroundColor(.textColorSecondary)
                        .lineLimit(1)
                }
                
                Spacer()
                
                // Arrow
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.textColorSecondary)
            }
            .padding(.vertical, 16)
            .padding(.horizontal, 20)
            .background(Color.primaryColor.opacity(0.05))
            .cornerRadius(12)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    UserSearchModal(isPresented: .constant(true))
        .environmentObject(AppState())
} 