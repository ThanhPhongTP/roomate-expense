import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * Cấu hình kết nối Firebase Project chính thức cho Roommate Expense App
 */
export const firebaseConfig = {
  apiKey: "AIzaSyB8gKpqN6MQNSK7f3MrL_jjFnKUi6xIUvQ",
  authDomain: "roommate-expense-app-de220.firebaseapp.com",
  projectId: "roommate-expense-app-de220",
  storageBucket: "roommate-expense-app-de220.firebasestorage.app",
  messagingSenderId: "139001950582",
  appId: "1:139001950582:web:4e62615060e404e46e4a57",
  measurementId: "G-QFQ29YDGNH",
};

// Đảm bảo chỉ initializeApp 1 lần duy nhất trong React Native
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Khởi tạo Cloud Firestore Database Instance
export const db = getFirestore(app);

// Kiểm tra xem cấu hình đã sẵn sàng hay chưa
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.projectId &&
    firebaseConfig.apiKey &&
    firebaseConfig.projectId !== "your-app-id"
  );
};
