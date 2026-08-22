export type Language = "vi" | "en";

export const translations = {
  vi: {
    // Navigation
    nav_home: "Trang Chủ",
    nav_calendar: "Lịch Tương Tác",
    nav_settings: "Cài Đặt & Feedback",
    nav_admin: "Admin Analytics",
    nav_navigation: "// DÂN BỐ DỰ ÁN",
    nav_system_admin: "// HỆ THỐNG ADMIN",

    // Header & Greeting
    greeting_morning: "Chào buổi sáng",
    greeting_afternoon: "Chào buổi chiều",
    greeting_evening: "Chào buổi tối",
    welcome_sub: "Hệ thống quản lý công việc phong cách Cyber Terminal",
    streak_count: "ngày liên tục",

    // Quick Capture Modal
    quick_capture_title: "TẠO TASK NHANH",
    quick_capture_placeholder: "Nhập tên công việc cần làm...",
    quick_capture_desc_placeholder: "Ghi chú bổ sung (không bắt buộc)...",
    quick_capture_priority: "Độ ưu tiên",
    quick_capture_category: "Danh mục",
    quick_capture_no_category: "Không chọn",
    quick_capture_due: "Hạn hoàn thành",
    quick_capture_submit: "TẠO TASK [ENTER]",
    quick_capture_creating: "ĐANG TẠO...",
    quick_capture_hint: "Tip: Bấm Esc để đóng, Enter để lưu nhanh",

    // Task List & Cards
    tasks_all: "TẤT CẢ",
    tasks_todo: "CẦN LÀM",
    tasks_in_progress: "ĐANG LÀM",
    tasks_completed: "ĐÃ XONG",
    task_priority_high: "🔴 Cao",
    task_priority_medium: "🟡 TB",
    task_priority_low: "🟢 Thấp",
    task_empty: "Chưa có task nào trong danh mục này",
    task_add_new: "THÊM TASK MỚI",
    task_delete_confirm: "Bạn có chắc chắn muốn xóa task này?",
    task_mark_complete: "Đánh dấu hoàn thành",
    task_mark_todo: "Chuyển về Cần làm",

    // Calendar
    calendar_title: "LỊCH TƯƠNG TÁC",
    calendar_sub: "Tự động đồng bộ với due date & chấm chỉ báo màu tiến độ",
    calendar_today: "Hôm nay",
    calendar_month: "Tháng",
    calendar_week: "Tuần",
    calendar_day: "Ngày",
    calendar_tasks_for: "TASK NGÀY",
    calendar_no_tasks: "Không có task nào trong ngày này",

    // Settings & Preferences
    settings_title: "CÀI ĐẶT & PHẢN HỒI",
    settings_sub: "Tùy chỉnh giao diện, ngôn ngữ và đóng góp ý kiến cho Life OS",
    settings_appearance: "GIAO DIỆN & NGÔN NGỮ",
    settings_theme: "Chế độ giao diện",
    settings_theme_dark: "Cyber Dark (Tối)",
    settings_theme_light: "Cyber Light (Sáng)",
    settings_language: "Ngôn ngữ hiển thị",
    settings_lang_vi: "Tiếng Việt (VI)",
    settings_lang_en: "English (EN)",
    settings_feedback_title: "GỬI PHẢN HỒI CHO HỆ THỐNG",
    settings_feedback_rating: "Mức độ hài lòng (1-10)",
    settings_feedback_reason: "Lý do bạn sử dụng hàng ngày",
    settings_feedback_pain: "Điểm chưa hài lòng",
    settings_feedback_feature: "Tính năng mong muốn thêm",
    settings_feedback_submit: "GỬI PHẢN HỒI",
    settings_feedback_success: "Cảm ơn bạn đã gửi phản hồi đóng góp phát triển Life OS!",

    // Misc & Auth
    account: "Tài Khoản",
    sign_out: "Đăng xuất",
    sign_in: "Đăng nhập",
    user: "Người dùng",
  },
  en: {
    // Navigation
    nav_home: "Dashboard",
    nav_calendar: "Interactive Calendar",
    nav_settings: "Settings & Feedback",
    nav_admin: "Admin Analytics",
    nav_navigation: "// NAVIGATION",
    nav_system_admin: "// SYSTEM ADMIN",

    // Header & Greeting
    greeting_morning: "Good morning",
    greeting_afternoon: "Good afternoon",
    greeting_evening: "Good evening",
    welcome_sub: "Cyber Terminal style productivity system",
    streak_count: "day streak",

    // Quick Capture Modal
    quick_capture_title: "QUICK TASK CAPTURE",
    quick_capture_placeholder: "Enter task title...",
    quick_capture_desc_placeholder: "Additional notes (optional)...",
    quick_capture_priority: "Priority",
    quick_capture_category: "Category",
    quick_capture_no_category: "None",
    quick_capture_due: "Due Date",
    quick_capture_submit: "CREATE TASK [ENTER]",
    quick_capture_creating: "CREATING...",
    quick_capture_hint: "Tip: Press Esc to close, Enter to save quickly",

    // Task List & Cards
    tasks_all: "ALL",
    tasks_todo: "TO DO",
    tasks_in_progress: "IN PROGRESS",
    tasks_completed: "COMPLETED",
    task_priority_high: "🔴 High",
    task_priority_medium: "🟡 Med",
    task_priority_low: "🟢 Low",
    task_empty: "No tasks found in this section",
    task_add_new: "ADD NEW TASK",
    task_delete_confirm: "Are you sure you want to delete this task?",
    task_mark_complete: "Mark as completed",
    task_mark_todo: "Move to To Do",

    // Calendar
    calendar_title: "INTERACTIVE CALENDAR",
    calendar_sub: "Auto-synchronized due dates & progress status dots",
    calendar_today: "Today",
    calendar_month: "Month",
    calendar_week: "Week",
    calendar_day: "Day",
    calendar_tasks_for: "TASKS FOR",
    calendar_no_tasks: "No tasks scheduled for this day",

    // Settings & Preferences
    settings_title: "SETTINGS & FEEDBACK",
    settings_sub: "Customize appearance, language, and provide feedback for Life OS",
    settings_appearance: "APPEARANCE & LANGUAGE",
    settings_theme: "Theme Mode",
    settings_theme_dark: "Cyber Dark",
    settings_theme_light: "Cyber Light",
    settings_language: "Display Language",
    settings_lang_vi: "Tiếng Việt (VI)",
    settings_lang_en: "English (EN)",
    settings_feedback_title: "SUBMIT FEEDBACK",
    settings_feedback_rating: "Satisfaction Rating (1-10)",
    settings_feedback_reason: "Why do you use Life OS daily?",
    settings_feedback_pain: "Pain points or difficulties",
    settings_feedback_feature: "Requested features",
    settings_feedback_submit: "SUBMIT FEEDBACK",
    settings_feedback_success: "Thank you for contributing your feedback to Life OS!",

    // Misc & Auth
    account: "Account",
    sign_out: "Sign Out",
    sign_in: "Sign In",
    user: "User",
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;
