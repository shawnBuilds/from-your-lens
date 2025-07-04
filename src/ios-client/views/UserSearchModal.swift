import SwiftUI

struct UserSearchModal: View {
    @EnvironmentObject var appState: AppState
    @Binding var isPresented: Bool
    @State private var searchText = ""
    
    var filteredUsers: [User] {
        if searchText.isEmpty {
            return appState.allUsers
        } else {
            return appState.allUsers.filter { user in
                let fullName = user.fullName?.lowercased() ?? ""
                let email = user.email.lowercased()
                let searchLower = searchText.lowercased()
                return fullName.contains(searchLower) || email.contains(searchLower)
            }
        }
    }
    
    var body: some View {
        ZStack {
            Color.secondaryColor
                .ignoresSafeArea()
            
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
                        .textFieldStyle(PlainTextFieldStyle())
                        .foregroundColor(.textColorPrimary)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Color.primaryColor.opacity(0.1))
                .cornerRadius(12)
                .padding(.horizontal, 24)
                .padding(.vertical, 16)
                
                // User List
                if appState.isFetchingUsers {
                    VStack(spacing: 16) {
                        ProgressView()
                            .scaleEffect(1.2)
                        Text("Loading users...")
                            .font(.body)
                            .foregroundColor(.textColorSecondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error = appState.fetchUsersError {
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
                        Button("Retry") {
                            Task {
                                await appState.fetchAllUsers()
                            }
                        }
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(Color.primaryColor)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filteredUsers.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "person.3.fill")
                            .font(.system(size: 48))
                            .foregroundColor(.textColorSecondary)
                        Text(searchText.isEmpty ? "No users found" : "No users match your search")
                            .font(.headline)
                            .foregroundColor(.textColorPrimary)
                        Text(searchText.isEmpty ? "Other users will appear here once they join" : "Try a different search term")
                            .font(.caption)
                            .foregroundColor(.textColorSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(filteredUsers) { user in
                                UserRowView(user: user) {
                                    appState.selectTargetUser(user)
                                    isPresented = false
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                    }
                }
            }
            .frame(maxWidth: 500, maxHeight: .infinity)
            .padding(.vertical, 0)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 8, x: 0, y: 4)
        }
        .onAppear {
            if appState.allUsers.isEmpty {
                Task {
                    await appState.fetchAllUsers()
                }
            }
        }
    }
}

struct UserRowView: View {
    let user: User
    let onSelect: () -> Void
    
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
                } else {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 50))
                        .foregroundColor(.textColorSecondary)
                }
                
                // User Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(user.displayName)
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