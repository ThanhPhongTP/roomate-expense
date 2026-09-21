#!/bin/bash

# ==============================================================================
# CLI MENU ĐIỀU HƯỚNG BẰNG PHÍM MŨI TÊN (⬆️ / ⬇️ / ENTER)
# Dành cho dự án Roommate Expense Calculator
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$SCRIPT_DIR/android" ]; then
    ROOT_DIR="$SCRIPT_DIR"
elif [ -f "$SCRIPT_DIR/../package.json" ]; then
    ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    ROOT_DIR="$SCRIPT_DIR"
fi

ANDROID_DIR="$ROOT_DIR/android"

# Màu sắc UI
CYAN='\033[0;36m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'
BOLD='\033[1m'
REVERSE='\033[7m'

cd "$ROOT_DIR" || exit 1

do_clean() {
    echo -e "\n${YELLOW}🧹 Đang dọn dẹp toàn bộ Cache & Build artifacts...${NC}"
    cd "$ANDROID_DIR" 2>/dev/null || cd "$ROOT_DIR/android"
    rm -rf build .gradle app/build
    cd "$ROOT_DIR"
    rm -rf node_modules/.cache .expo dist
    echo -e "${GREEN}✓ Đã dọn dẹp sạch sẽ toàn bộ Cache & Build files!${NC}\n"
}

do_type_check() {
    echo -e "\n${YELLOW}🔍 Đang kiểm tra lỗi TypeScript (tsc --noEmit)...${NC}"
    npm run type-check
    return $?
}

do_build_apk() {
    do_type_check
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Không thể build APK vì mã nguồn còn lỗi TypeScript!${NC}"
        return 1
    fi

    do_clean

    echo -e "\n${YELLOW}🏗 Đang tiến hành Build Tối Ưu Release APK (./gradlew assembleRelease)...${NC}"
    echo -e "${BLUE}Đang áp dụng Proguard R8 & nén dung lượng xuống mức nhỏ nhất...${NC}\n"

    cd "$ANDROID_DIR" || exit 1
    ./gradlew assembleRelease
    BUILD_STATUS=$?
    cd "$ROOT_DIR"

    # Tìm file APK đầu ra
    APK_OUTPUT_PATH=""
    if [ -f "$ANDROID_DIR/app/build/outputs/apk/release/app-arm64-v8a-release.apk" ]; then
        APK_OUTPUT_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-arm64-v8a-release.apk"
    elif [ -f "$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk" ]; then
        APK_OUTPUT_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
    fi

    if [ $BUILD_STATUS -eq 0 ] && [ -n "$APK_OUTPUT_PATH" ]; then
        FILE_SIZE=$(du -h "$APK_OUTPUT_PATH" | cut -f1)
        echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
        echo -e "${GREEN}${BOLD} 🎉 BUILD APK RELEASE THÀNH CÔNG RỰC RỠ! ${NC}"
        echo -e "${GREEN}${BOLD}======================================================================${NC}"
        echo -e "${BOLD}📌 File APK siêu nhẹ:${NC} $APK_OUTPUT_PATH"
        echo -e "${BOLD}📦 Dung lượng tối ưu:${NC} $FILE_SIZE"
        echo -e "${GREEN}======================================================================${NC}"
    else
        echo -e "\n${RED}${BOLD}❌ BUILD APK THẤT BẠI! Vui lòng kiểm tra lại log ở trên.${NC}"
    fi
}

do_deploy_web() {
    do_type_check
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Không thể Deploy Web vì mã nguồn còn lỗi TypeScript!${NC}"
        return 1
    fi

    echo -e "\n${YELLOW}🔍 Kiểm tra đăng nhập Firebase CLI...${NC}"
    npx -y firebase-tools@latest projects:list >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}🔑 Bạn cần đăng nhập tài khoản Firebase Google. Đang mở trình duyệt...${NC}"
        npx -y firebase-tools@latest login
    fi

    echo -e "\n${YELLOW}🏗 Đang đóng gói trang Web (npx expo export -p web)...${NC}"
    npx expo export -p web

    echo -e "\n${YELLOW}🚀 Đang đưa ứng dụng Web lên Firebase Hosting miễn phí...${NC}"
    npx -y firebase-tools@latest deploy --only hosting --project roommate-expense-app-de220

    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
        echo -e "${GREEN}${BOLD} 🎉 ĐÃ PUBLIC WEB THÀNH CÔNG! BẤM VÀO LINK ĐỂ DÙNG:${NC}"
        echo -e "${GREEN}${BOLD} 🌐 https://roommate-expense-app-de220.web.app${NC}"
        echo -e "${GREEN}${BOLD}======================================================================${NC}"
    fi
}

do_run_android() {
    echo -e "\n${YELLOW}📱 Đang chạy ứng dụng trên Android Emulator / Thiết bị thật...${NC}"
    npx expo run:android
}

do_run_ios() {
    echo -e "\n${YELLOW}🍎 Đang chạy ứng dụng trên iOS Simulator...${NC}"
    npx expo run:ios
}

do_start_metro() {
    echo -e "\n${YELLOW}🚀 Đang khởi chạy Metro Bundler (Expo Go / Dev)...${NC}"
    npm start
}

do_run_web() {
    echo -e "\n${YELLOW}🌐 Đang khởi chạy ứng dụng bản Web chạy local...${NC}"
    npm run web
}

# Xử lý tham số truyền vào
case "$1" in
    clean) do_clean; exit 0 ;;
    build|apk) do_build_apk; exit 0 ;;
    deploy|deploy-web) do_deploy_web; exit 0 ;;
    android) do_run_android; exit 0 ;;
    ios) do_run_ios; exit 0 ;;
    start) do_start_metro; exit 0 ;;
    check) do_type_check; exit 0 ;;
esac

options=(
    "🧹 Clean Cache (Xóa sạch cache Gradle, Build & Metro)"
    "📦 Build APK Release Tối Ưu Siêu Nhẹ (Type-check -> Clean -> Build APK)"
    "🌍 Public / Deploy Web App lên Google Firebase Hosting"
    "📱 Chạy Máy Ảo Android (expo run:android)"
    "🍎 Chạy Máy Ảo iOS Simulator (expo run:ios)"
    "🚀 Chạy Expo Go / Metro Server (npm start)"
    "🌐 Chạy Web App Local (npm run web)"
    "🔍 Kiểm tra lỗi TypeScript (type-check)"
    "❌ Thoát"
)

selected=0

tput civis
trap "tput cnorm; exit 0" INT TERM EXIT

while true; do
    clear
    echo -e "${CYAN}${BOLD}======================================================================${NC}"
    echo -e "${CYAN}${BOLD} 🏠 ROOMMATE EXPENSE CALCULATOR - DỤNG CỤ QUẢN LÝ DỰ ÁN ${NC}"
    echo -e "${CYAN}${BOLD}======================================================================${NC}"
    echo -e "${BOLD}Sử dụng phím mũi tên ${YELLOW}⬆️ / ⬇️${NC}${BOLD} để di chuyển, phím ${GREEN}ENTER${NC}${BOLD} để chọn:${NC}\n"

    for i in "${!options[@]}"; do
        if [ $i -eq $selected ]; then
            echo -e " ${GREEN}${BOLD}➔ 🔘 ${REVERSE} ${options[$i]} ${NC}"
        else
            echo -e "   ⚪  ${options[$i]}"
        fi
    done

    echo -e "\n${CYAN}======================================================================${NC}"

    read -rsn1 key

    if [[ $key == $'\x1b' ]]; then
        read -rsn2 key
        case $key in
            '[A')
                ((selected--))
                if [ $selected -lt 0 ]; then
                    selected=$((${#options[@]} - 1))
                fi
                ;;
            '[B')
                ((selected++))
                if [ $selected -ge ${#options[@]} ]; then
                    selected=0
                fi
                ;;
        esac
    elif [[ $key == "" ]]; then
        tput cnorm
        clear
        case $selected in
            0) do_clean; read -p "Ấn Enter để quay lại menu..." ;;
            1) do_build_apk; read -p "Ấn Enter để quay lại menu..." ;;
            2) do_deploy_web; read -p "Ấn Enter để quay lại menu..." ;;
            3) do_run_android; read -p "Ấn Enter để quay lại menu..." ;;
            4) do_run_ios; read -p "Ấn Enter để quay lại menu..." ;;
            5) do_start_metro; read -p "Ấn Enter để quay lại menu..." ;;
            6) do_run_web; read -p "Ấn Enter để quay lại menu..." ;;
            7) do_type_check; read -p "Ấn Enter để quay lại menu..." ;;
            8) echo -e "\n${GREEN}Cảm ơn bạn! Tạm biệt! 👋${NC}\n"; exit 0 ;;
        esac
        tput civis
    fi
done
