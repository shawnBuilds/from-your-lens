import SwiftUI
import Combine

@MainActor
class KeyboardManager: ObservableObject {
    @Published var isKeyboardVisible = false
    @Published var keyboardAppearTime: Date?
    @Published var isKeyboardReady = false
    
    // Debug timing properties
    private var focusRequestTime: Date?
    private var keyboardWillShowTime: Date?
    private var keyboardDidShowTime: Date?
    private var firstInputTime: Date?
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupKeyboardNotifications()
    }
    
    deinit {
        cancellables.forEach { $0.cancel() }
    }
    
    // MARK: - Public Methods
    
    func focusSearchField(_ focusBinding: FocusState<Bool>.Binding) {
        let startTime = Date()
        focusRequestTime = startTime
        
        if FeatureFlags.enableDebugLogKeyboard {
            print("[KeyboardManager] 🔍 Focus request initiated at \(startTime)")
        }
        
        // Reduced delay for faster response
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) {
            let focusTime = Date()
            let delay = focusTime.timeIntervalSince(startTime)
            
            if FeatureFlags.enableDebugLogKeyboard {
                print("[KeyboardManager] 🎯 Setting focus after \(String(format: "%.3f", delay))s")
            }
            
            focusBinding.wrappedValue = true
        }
    }
    
    func recordFirstInput() {
        if firstInputTime == nil {
            firstInputTime = Date()
            let timeSinceFocus = firstInputTime!.timeIntervalSince(focusRequestTime ?? Date())
            let timeSinceKeyboardShow = firstInputTime!.timeIntervalSince(keyboardDidShowTime ?? Date())
            
            if FeatureFlags.enableDebugLogKeyboard {
                print("[KeyboardManager] ⌨️ First input detected:")
                print("  - Time since focus request: \(String(format: "%.3f", timeSinceFocus))s")
                print("  - Time since keyboard appeared: \(String(format: "%.3f", timeSinceKeyboardShow))s")
            }
        }
    }
    
    // MARK: - Private Methods
    
    private func setupKeyboardNotifications() {
        // Keyboard will show
        NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)
            .sink { [weak self] notification in
                let showTime = Date()
                self?.keyboardWillShowTime = showTime
                self?.isKeyboardVisible = true
                
                if FeatureFlags.enableDebugLogKeyboard {
                    print("[KeyboardManager] 📱 Keyboard will show at \(showTime)")
                }
            }
            .store(in: &cancellables)
        
        // Keyboard did show
        NotificationCenter.default.publisher(for: UIResponder.keyboardDidShowNotification)
            .sink { [weak self] notification in
                let showTime = Date()
                self?.keyboardDidShowTime = showTime
                self?.isKeyboardVisible = true
                self?.isKeyboardReady = true
                
                if FeatureFlags.enableDebugLogKeyboard {
                    let timeSinceFocus = showTime.timeIntervalSince(self?.focusRequestTime ?? showTime)
                    print("[KeyboardManager] ✅ Keyboard did show at \(showTime)")
                    print("  - Time since focus request: \(String(format: "%.3f", timeSinceFocus))s")
                }
            }
            .store(in: &cancellables)
        
        // Keyboard will hide
        NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)
            .sink { [weak self] _ in
                let hideTime = Date()
                self?.isKeyboardVisible = false
                self?.isKeyboardReady = false
                
                if FeatureFlags.enableDebugLogKeyboard {
                    print("[KeyboardManager] 🔽 Keyboard will hide at \(hideTime)")
                }
            }
            .store(in: &cancellables)
    }
} 