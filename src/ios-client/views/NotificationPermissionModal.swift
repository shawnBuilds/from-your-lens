import SwiftUI
import UserNotifications

struct NotificationPermissionModal: View {
    @Binding var isPresented: Bool
    let onEnableNotifications: () -> Void
    let onContinueWithoutNotifications: () -> Void
    
    var body: some View {
        ZStack {
            Color.black.opacity(0.4)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Header
                HStack {
                    Text("Stay Updated")
                        .font(.system(size: 28, weight: .bold))
                        .foregroundColor(.textColorPrimary)
                        .padding(.leading)
                    Spacer()
                    Button(action: { 
                        isPresented = false
                        onContinueWithoutNotifications()
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
                
                // Content
                ScrollView {
                    VStack(spacing: 24) {
                        // Icon
                        VStack(spacing: 12) {
                            Image(systemName: "bell.badge.fill")
                                .font(.system(size: 48))
                                .foregroundColor(.primaryColor)
                        }
                        .padding(.horizontal, 24)
                        
                        // Main content
                        VStack(spacing: 20) {
                            Text("Get notified when the photo search is done")
                                .font(.body)
                                .fontWeight(.medium)
                                .foregroundColor(.textColorPrimary)
                                .multilineTextAlignment(.center)
                                .lineLimit(nil)
                                .padding(.horizontal, 16)
                            
                            // Benefits list
                            VStack(spacing: 12) {
                                BenefitRow(
                                    icon: "clock.fill",
                                    title: "Real-time Updates",
                                    description: "Know when your face matching is ready"
                                )
                                
                                BenefitRow(
                                    icon: "checkmark.circle.fill",
                                    title: "Never Miss Results",
                                    description: "Review matches as soon as they're found"
                                )
                                
                                BenefitRow(
                                    icon: "person.2.fill",
                                    title: "Stay Connected",
                                    description: "Keep up with shared photos from friends"
                                )
                            }
                            .padding(.horizontal, 24)
                        }
                        
                        // Action buttons
                        VStack(spacing: 12) {
                            Button(action: {
                                isPresented = false
                                onEnableNotifications()
                            }) {
                                HStack {
                                    Image(systemName: "bell.fill")
                                        .font(.system(size: 18, weight: .semibold))
                                    Text("Enable Notifications")
                                        .font(.system(size: 18, weight: .semibold))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(Color.primaryColor)
                                .foregroundColor(.white)
                                .clipShape(RoundedRectangle(cornerRadius: 22))
                                .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                            }
                            
                            Button(action: {
                                isPresented = false
                                onContinueWithoutNotifications()
                            }) {
                                Text("Continue Without Notifications")
                                    .font(.system(size: 16, weight: .medium))
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(Color.neumorphicShadow.opacity(0.3))
                                    .foregroundColor(Color.textColorPrimary)
                                    .clipShape(RoundedRectangle(cornerRadius: 22))
                                    .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 4, x: 0, y: 2)
                            }
                        }
                        .padding(.horizontal, 24)
                    }
                    .padding(.vertical, 32)
                }
                .background(Color.secondaryColor)
            }
            .frame(maxWidth: 500, maxHeight: .infinity)
            .background(Color.secondaryColor)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
            .shadow(color: Color.neumorphicShadow.opacity(0.18), radius: 8, x: 0, y: 4)
        }
    }
}

// MARK: - Benefit Row Component
struct BenefitRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(.primaryColor)
                .frame(width: 28, height: 28)
            
            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.textColorPrimary)
                
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.textColorSecondary)
                    .lineLimit(2)
            }
            
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(Color.primaryColor.opacity(0.05))
        .cornerRadius(10)
    }
}

#Preview {
    NotificationPermissionModal(
        isPresented: .constant(true),
        onEnableNotifications: {
            print("Enable notifications tapped")
        },
        onContinueWithoutNotifications: {
            print("Continue without notifications tapped")
        }
    )
} 