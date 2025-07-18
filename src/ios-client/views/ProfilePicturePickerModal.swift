import SwiftUI
import PhotosUI
import SwiftyCrop

struct ProfilePicturePickerModal: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject var appState: AppState
    @Binding var hasPromptedForProfilePicture: Bool
    let isAutoPrompt: Bool
    
    @State private var selectedItem: PhotosPickerItem?
    @State private var selectedImageData: Data?
    @State private var isUploading = false
    @State private var uploadError: String?
    @State private var showRemoveConfirmation = false
    @State private var showCropper = false
    @State private var croppingImage: UIImage?
    @State private var pendingCropImage: UIImage?
    private let userService = UserService()
    
    // SwiftyCrop configuration for increased sensitivity
    private let cropConfig = SwiftyCropConfiguration(zoomSensitivity: 3.0)
    
    init(appState: AppState, hasPromptedForProfilePicture: Binding<Bool>, isAutoPrompt: Bool = false) {
        self.appState = appState
        self._hasPromptedForProfilePicture = hasPromptedForProfilePicture
        self.isAutoPrompt = isAutoPrompt
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Header
                VStack(spacing: 12) {
                    Text("Profile Picture")
                        .font(.title2)
                        .fontWeight(.semibold)
                        .foregroundColor(.primaryColor)
                    
                    if isAutoPrompt {
                        Text("Upload a selfie so we know what you look like!")
                            .font(.subheadline)
                            .foregroundColor(.textColorSecondary)
                            .multilineTextAlignment(.center)
                    } else {
                        Text("Upload a selfie so we can recognize your face in other photos")
                            .font(.subheadline)
                            .foregroundColor(.textColorSecondary)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.top)
                
                // Main State-Driven Area
                if let selectedImageData = selectedImageData, let uiImage = UIImage(data: selectedImageData) {
                    // PREVIEW STATE
                    VStack(spacing: 8) {
                        Text("Preview")
                            .font(.caption)
                            .foregroundColor(.textColorSecondary)
                        ZStack {
                            Circle()
                                .fill(Color.secondaryColor)
                                .frame(width: 140, height: 140)
                                .shadow(color: .neumorphicShadow.opacity(0.5), radius: 10, x: 0, y: 4)
                                .overlay(
                                    Circle()
                                        .stroke(Color.primaryColor, lineWidth: 3)
                                )
                            Image(uiImage: uiImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 120, height: 120)
                                .clipShape(Circle())
                        }
                        .padding(.bottom, 8)
                        // Upload Button (in place of Choose from Library)
                        Button(action: {
                            Task {
                                await uploadProfilePicture(imageData: selectedImageData)
                            }
                        }) {
                            HStack(spacing: 8) {
                                if isUploading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                } else {
                                    Image(systemName: "arrow.up.circle.fill")
                                }
                                Text(isUploading ? "Uploading..." : "Set as Profile Picture")
                                    .fontWeight(.medium)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.secondaryColor)
                            .foregroundColor(.primaryColor)
                            .cornerRadius(12)
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.primaryColor, lineWidth: 2)
                            )
                            .shadow(color: Color.primaryColor.opacity(0.15), radius: 6, x: 0, y: 2)
                        }
                        .disabled(isUploading)
                        // Error Message
                        if let uploadError = uploadError {
                            Text(uploadError)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                        }
                    }
                } else {
                    // CURRENT STATE
                    VStack(spacing: 8) {
                        Text("Current")
                            .font(.caption)
                            .foregroundColor(.textColorSecondary)
                        if let user = appState.currentUser {
                            ZStack {
                                Circle()
                                    .fill(Color.secondaryColor)
                                    .frame(width: 140, height: 140)
                                    .shadow(color: .neumorphicShadow.opacity(0.5), radius: 10, x: 0, y: 4)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.primaryColor, lineWidth: 3)
                                    )
                                AsyncImage(url: URL(string: user.profilePictureUrl ?? "")) { image in
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                } placeholder: {
                                    AsyncImage(url: URL(string: APIConfig.profilePicURL)) { phase in
                                        switch phase {
                                        case .empty:
                                            Circle()
                                                .fill(Color(.systemGray5))
                                                .frame(width: 120, height: 120)
                                                .overlay(
                                                    Image(systemName: "person.fill")
                                                        .foregroundColor(.textColorSecondary)
                                                        .font(.system(size: 48))
                                                )
                                        case .success(let image):
                                            image
                                                .resizable()
                                                .aspectRatio(contentMode: .fill)
                                                .frame(width: 120, height: 120)
                                                .clipShape(Circle())
                                        case .failure:
                                            Circle()
                                                .fill(Color(.systemGray5))
                                                .frame(width: 120, height: 120)
                                                .overlay(
                                                    Image(systemName: "person.fill")
                                                        .foregroundColor(.textColorSecondary)
                                                        .font(.system(size: 48))
                                                )
                                        @unknown default:
                                            Circle()
                                                .fill(Color(.systemGray5))
                                                .frame(width: 120, height: 120)
                                        }
                                    }
                                }
                                .frame(width: 120, height: 120)
                                .clipShape(Circle())
                            }
                            .padding(.bottom, 8)
                            // Remove Profile Picture Button
                            if let url = user.profilePictureUrl, !url.isEmpty, url != APIConfig.profilePicURL {
                                Button(action: { showRemoveConfirmation = true }) {
                                    HStack(spacing: 8) {
                                        Image(systemName: "trash")
                                        Text("Remove Profile Picture")
                                    }
                                    .font(.subheadline)
                                    .foregroundColor(.red)
                                    .padding(.vertical, 6)
                                    .padding(.horizontal, 16)
                                    .background(Color.secondaryColor)
                                    .cornerRadius(8)
                                }
                                .alert(isPresented: $showRemoveConfirmation) {
                                    Alert(
                                        title: Text("Remove Profile Picture?"),
                                        message: Text("Are you sure you want to remove your profile picture?"),
                                        primaryButton: .destructive(Text("Remove")) {
                                            Task { await removeProfilePicture() }
                                        },
                                        secondaryButton: .cancel()
                                    )
                                }
                            }
                        }
                        // Choose from Library Button (in place of upload)
                        PhotosPicker(
                            selection: $selectedItem,
                            matching: .images,
                            photoLibrary: .shared()
                        ) {
                            HStack(spacing: 16) {
                                Image(systemName: "photo.on.rectangle.angled")
                                    .font(.title)
                                    .foregroundColor(.primaryColor)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text("Choose from Library")
                                        .font(.headline)
                                        .foregroundColor(.primaryColor)
                                    Text("Pick a clear selfie for face recognition")
                                        .font(.caption)
                                        .foregroundColor(.textColorSecondary)
                                }
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.caption)
                                    .foregroundColor(.textColorSecondary)
                            }
                            .padding()
                            .background(Color.secondaryColor)
                            .cornerRadius(14)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14)
                                    .stroke(Color.primaryColor, lineWidth: 2)
                            )
                            .shadow(color: Color.primaryColor.opacity(0.15), radius: 6, x: 0, y: 2)
                        }
                        .onChange(of: selectedItem) { newItem in
                            Task {
                                await loadImage(from: newItem)
                            }
                        }
                    }
                }
                
                Spacer()
            }
            .padding(.horizontal, 24)
            .padding(.top, 32)
            .frame(maxHeight: .infinity, alignment: .center)
            .background(Color.secondaryColor)
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(.primaryColor)
                }
            }
            .fullScreenCover(isPresented: $showCropper) {
                if let croppingImage = croppingImage {
                    SwiftyCropView(
                        imageToCrop: croppingImage,
                        maskShape: .circle,
                        configuration: cropConfig
                    ) { croppedImage in
                        if let croppedImage = croppedImage,
                           let croppedData = croppedImage.jpegData(compressionQuality: 0.95) {
                            selectedImageData = croppedData
                        }
                        showCropper = false
                    }
                }
            }
            .onChange(of: pendingCropImage) { newImage in
                guard let newImage = newImage else { return }
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                    croppingImage = newImage
                    showCropper = true
                    pendingCropImage = nil
                }
            }
        }
    }
    
    private func loadImage(from item: PhotosPickerItem?) async {
        guard let item = item else { return }
        do {
            if let data = try await item.loadTransferable(type: Data.self), let uiImage = UIImage(data: data) {
                pendingCropImage = uiImage
                uploadError = nil
            }
        } catch {
            uploadError = "Failed to load image: \(error.localizedDescription)"
        }
    }
    
    private func uploadProfilePicture(imageData: Data) async {
        isUploading = true
        uploadError = nil
        
        do {
            // Get auth token
            guard let authToken = UserDefaults.standard.string(forKey: UserDefaultsKeys.authToken) else {
                uploadError = "No authentication token found"
                isUploading = false
                return
            }
            
            // Create multipart form data
            let boundary = UUID().uuidString
            var request = URLRequest(url: URL(string: "\(APIConfig.baseURL)/api/users/profile-picture")!)
            request.httpMethod = "POST"
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
            request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
            
            // Build multipart body
            var body = Data()
            
            // Add file data
            body.append("--\(boundary)\r\n".data(using: .utf8)!)
            body.append("Content-Disposition: form-data; name=\"profilePicture\"; filename=\"profile.jpg\"\r\n".data(using: .utf8)!)
            body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
            body.append(imageData)
            body.append("\r\n".data(using: .utf8)!)
            
            // Add closing boundary
            body.append("--\(boundary)--\r\n".data(using: .utf8)!)
            
            request.httpBody = body
            
            if FeatureFlags.enableDebugLogAuth {
                print("[ProfilePicturePicker] Uploading profile picture to server...")
            }
            
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                uploadError = "Invalid response from server"
                isUploading = false
                return
            }
            
            if httpResponse.statusCode == 200 {
                // Parse successful response
                let decoder = JSONDecoder()
                let uploadResponse = try decoder.decode(ProfilePictureUploadResponse.self, from: data)
                
                if FeatureFlags.enableDebugLogAuth {
                    print("[ProfilePicturePicker] Upload successful, new URL: \(uploadResponse.profilePictureUrl)")
                }
                
                // Update local user data
                if let currentUser = appState.currentUser {
                    let updatedUser = User(
                        id: currentUser.id,
                        googleId: currentUser.googleId,
                        email: currentUser.email,
                        fullName: currentUser.fullName,
                        profilePictureUrl: uploadResponse.profilePictureUrl,
                        createdAt: currentUser.createdAt,
                        lastLogin: currentUser.lastLogin
                    )
                    appState.currentUser = updatedUser
                    
                    // Save to UserDefaults
                    if let userData = try? JSONEncoder().encode(updatedUser) {
                        UserDefaults.standard.set(userData, forKey: UserDefaultsKeys.userData)
                    }
                }
                
                // Reset prompt flag so user won't be prompted again
                hasPromptedForProfilePicture = false
                
                dismiss()
            } else {
                // Handle error response
                if let errorData = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let errorMessage = errorData["error"] as? String {
                    uploadError = errorMessage
                } else {
                    uploadError = "Upload failed with status: \(httpResponse.statusCode)"
                }
                
                if FeatureFlags.enableDebugLogAuth {
                    print("[ProfilePicturePicker] Upload failed with status: \(httpResponse.statusCode)")
                }
            }
            
        } catch {
            uploadError = "Upload failed: \(error.localizedDescription)"
            if FeatureFlags.enableDebugLogAuth {
                print("[ProfilePicturePicker] Upload error: \(error)")
            }
        }
        
        isUploading = false
    }
    
    private func removeProfilePicture() async {
        isUploading = true
        uploadError = nil
        guard let user = appState.currentUser else { return }
        do {
            // Call backend to remove PFP (set to null)
            try await userService.removeProfilePicture(userId: user.id)
            // Update local user state
            await MainActor.run {
                appState.currentUser = User(
                    id: user.id,
                    googleId: user.googleId,
                    email: user.email,
                    fullName: user.fullName,
                    profilePictureUrl: nil,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                )
                isUploading = false
                selectedImageData = nil
            }
        } catch {
            await MainActor.run {
                uploadError = "Failed to remove profile picture. Please try again."
                isUploading = false
            }
        }
    }
}

// MARK: - Response Models
struct ProfilePictureUploadResponse: Codable {
    let message: String
    let profilePictureUrl: String
    let user: User
}

#Preview {
    ProfilePicturePickerModal(
        appState: AppState(),
        hasPromptedForProfilePicture: .constant(false),
        isAutoPrompt: false
    )
} 