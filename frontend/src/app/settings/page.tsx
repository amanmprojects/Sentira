"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Upload,
  X,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Trash2,
  Lock,
  Loader2,
  Camera,
} from "lucide-react";

// Types
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  username: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
  createdAt: string;
}

interface PasswordRequirement {
  text: string;
  met: boolean;
}

// Mock user data (replace with actual API call)
const mockUser: UserProfile = {
  id: "user_12345",
  fullName: "John Doe",
  email: "john.doe@example.com",
  emailVerified: true,
  username: "johndoe",
  phone: "+1 555 123 4567",
  bio: "AI enthusiast and content creator",
  avatarUrl: null,
  createdAt: "2026-01-15T10:30:00Z",
};

export default function SettingsPage() {
  // Profile state
  const [user] = useState<UserProfile>(mockUser);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [username, setUsername] = useState(user.username);
  const [phone, setPhone] = useState(user.phone);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState<string | null>(user.avatarUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 40) return { label: "Weak", color: "bg-aurora-rose" };
    if (strength <= 60) return { label: "Fair", color: "bg-orange-500" };
    if (strength <= 80) return { label: "Good", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const passwordRequirements: PasswordRequirement[] = [
    { text: "At least 8 characters", met: newPassword.length >= 8 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(newPassword) },
    { text: "Contains lowercase letter", met: /[a-z]/.test(newPassword) },
    { text: "Contains number", met: /[0-9]/.test(newPassword) },
    { text: "Contains special character", met: /[!@#$%^&*]/.test(newPassword) },
  ];

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName || fullName.length < 2 || fullName.length > 100) {
      newErrors.fullName = "Please enter your full name (2-100 characters)";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{2,29}$/;
    if (!username || !usernameRegex.test(username)) {
      newErrors.username =
        "Username must be 3-30 characters (letters, numbers, _ or -)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, avatar: "File size must be less than 5MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle cancel
  const handleCancel = () => {
    setFullName(user.fullName);
    setEmail(user.email);
    setUsername(user.username);
    setPhone(user.phone);
    setBio(user.bio);
    setAvatar(user.avatarUrl);
    setErrors({});
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const allRequirementsMet = passwordRequirements.every((req) => req.met);
    if (!allRequirementsMet) {
      setPasswordError("New password does not meet requirements");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsChangingPassword(false);
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmEmail.toLowerCase() !== email.toLowerCase()) return;

    setIsDeleting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // In real app, redirect to landing page
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthInfo = getStrengthLabel(passwordStrength);

  return (
    <div className="min-h-screen p-6 pt-10 selection:bg-aurora-cyan/30">
      <div className="max-w-[800px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-aurora-cyan/10 text-aurora-cyan">
            <Settings size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            
          </div>
        </div>

        {/* Profile Information Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-white mb-1">
            Profile Information
          </h2>
          <p className="text-white/40 text-sm mb-6">
            Update your personal details
          </p>

          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-[120px] h-[120px] rounded-full border-[3px] border-white/10 overflow-hidden bg-gradient-to-br from-aurora-cyan to-aurora-rose flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {getInitials(fullName)}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-aurora-deep border border-white/20 rounded-full hover:bg-white/10 transition"
              >
                <Camera size={16} className="text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm text-white/70">Change Photo</p>
              <div className="flex gap-3">
                <label
                  htmlFor="avatar-upload"
                  className="px-4 py-2 text-sm border border-white/20 rounded-lg text-white/70 hover:border-aurora-cyan hover:text-aurora-cyan transition cursor-pointer flex items-center gap-2"
                >
                  <Upload size={16} />
                  Upload Photo
                </label>
                <input
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                {avatar && (
                  <button
                    onClick={() => setAvatar(null)}
                    className="px-4 py-2 text-sm text-aurora-rose hover:text-aurora-rose/80 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
              {errors.avatar && (
                <span className="text-xs text-aurora-rose">{errors.avatar}</span>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                maxLength={100}
                className={`w-full h-12 bg-white/[0.03] border ${
                  errors.fullName ? "border-aurora-rose" : "border-white/10"
                } rounded-lg px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition`}
              />
              {errors.fullName && (
                <span className="text-xs text-aurora-rose">{errors.fullName}</span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className={`w-full h-12 bg-white/[0.03] border ${
                    errors.email ? "border-aurora-rose" : "border-white/10"
                  } rounded-lg px-4 pr-28 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition`}
                />
                {user.emailVerified ? (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/30 rounded-full flex items-center gap-1">
                    <Check size={12} /> Verified
                  </span>
                ) : (
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-aurora-cyan underline hover:text-aurora-cyan/80 transition">
                    Verify Email
                  </button>
                )}
              </div>
              {errors.email && (
                <span className="text-xs text-aurora-rose">{errors.email}</span>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="johndoe"
                  maxLength={30}
                  className={`w-full h-12 bg-white/[0.03] border ${
                    errors.username ? "border-aurora-rose" : "border-white/10"
                  } rounded-lg pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition`}
                />
              </div>
              <span className="text-xs text-white/40">
                Used for mentions and public profile (if enabled)
              </span>
              {errors.username && (
                <span className="text-xs text-aurora-rose block">
                  {errors.username}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Phone Number{" "}
                <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-lg px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition"
              />
              <span className="text-xs text-white/40">
                Used for account recovery and optional SMS notifications
              </span>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Bio <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                maxLength={500}
                rows={4}
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition resize-none"
              />
              <div className="flex justify-end">
                <span
                  className={`text-xs ${
                    bio.length > 450
                      ? bio.length >= 500
                        ? "text-aurora-rose"
                        : "text-orange-400"
                      : "text-white/40"
                  }`}
                >
                  {bio.length}/500
                </span>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between p-4 bg-white/[0.03] border border-white/10 rounded-lg">
              <span className="text-sm text-white/50">Member Since</span>
              <span className="text-sm font-medium text-white">
                {formatDate(user.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="h-11 px-8 bg-aurora-cyan text-black font-semibold rounded-lg hover:bg-aurora-cyan/90 hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              onClick={handleCancel}
              className="h-11 px-8 border border-white/20 text-white/70 font-semibold rounded-lg hover:border-aurora-cyan hover:text-aurora-cyan transition"
            >
              Cancel
            </button>
          </div>
        </motion.section>

        {/* Security Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-white/[0.02] border border-white/10 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Security</h2>
          <p className="text-white/40 text-sm mb-4">
            Manage your password and account security
          </p>

          <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/10 rounded-lg">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white flex items-center gap-2">
                <Lock size={16} className="text-white/50" />
                Password
              </span>
              <span className="text-lg text-white tracking-widest">
                ••••••••••••
              </span>
              <span className="text-xs text-white/40">
                Last changed: 15 days ago
              </span>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="h-9 px-6 border border-white/20 text-aurora-cyan font-medium rounded-lg hover:bg-aurora-cyan/10 hover:border-aurora-cyan transition"
            >
              Change
            </button>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-aurora-rose/5 border border-aurora-rose/30 rounded-2xl"
        >
          <h2 className="text-lg font-semibold text-aurora-rose mb-1 flex items-center gap-2">
            <AlertTriangle size={20} />
            Danger Zone
          </h2>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-white mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Once you delete your account, there is no going back. All your data
              will be permanently deleted.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="h-11 px-8 border-2 border-aurora-rose text-aurora-rose font-semibold rounded-lg hover:bg-aurora-rose hover:text-white transition"
            >
              Delete My Account
            </button>
          </div>
        </motion.section>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-8 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-lg px-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-lg px-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50">
                          Password strength:
                        </span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strengthInfo.color} transition-all duration-300`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-white">
                          {strengthInfo.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-lg px-4 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-cyan focus:ring-2 focus:ring-aurora-cyan/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Requirements */}
                <div className="p-4 bg-white/[0.02] rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Password requirements:
                  </h4>
                  <div className="space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-sm ${
                          req.met ? "text-green-400" : "text-white/40"
                        }`}
                      >
                        {req.met ? <Check size={14} /> : <X size={14} />}
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-aurora-rose/10 border border-aurora-rose/30 rounded-lg text-sm text-aurora-rose">
                    {passwordError}
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                  className="flex-1 h-11 bg-aurora-cyan text-black font-semibold rounded-lg hover:bg-aurora-cyan/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 h-11 border border-white/20 text-white/70 font-semibold rounded-lg hover:border-aurora-cyan hover:text-aurora-cyan transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg p-8 bg-[#161616] border-2 border-aurora-rose rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-aurora-rose flex items-center gap-2">
                  <AlertTriangle size={24} />
                  Delete Account
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-lg font-medium text-white">
                  Are you absolutely sure?
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </p>

                <div className="p-4 bg-white/[0.02] rounded-lg">
                  <p className="text-sm font-medium text-white mb-2">
                    What will be deleted:
                  </p>
                  <ul className="space-y-1 text-sm text-white/50">
                    <li>• All analyzed content and reports</li>
                    <li>• Saved searches and history</li>
                    <li>• Account settings and preferences</li>
                    <li>• API keys and integrations</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">
                    To confirm, type your email address below:
                  </label>
                  <input
                    type="email"
                    value={deleteConfirmEmail}
                    onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                    placeholder={email}
                    className="w-full h-12 bg-white/[0.03] border border-white/10 rounded-lg px-4 text-white placeholder:text-white/30 focus:outline-none focus:border-aurora-rose focus:ring-2 focus:ring-aurora-rose/20 transition"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-11 border border-white/20 text-white/70 font-semibold rounded-lg hover:border-aurora-cyan hover:text-aurora-cyan transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    isDeleting ||
                    deleteConfirmEmail.toLowerCase() !== email.toLowerCase()
                  }
                  className="flex-1 h-11 bg-aurora-rose text-white font-semibold rounded-lg hover:bg-aurora-rose/90 transition disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete My Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-green-500 text-black font-semibold rounded-lg shadow-lg flex items-center gap-2"
          >
            <Check size={20} />
            Changes saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}