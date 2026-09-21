#!/bin/bash

# ==============================================================================
# Script Tự Động Clean & Build APK Release cho Roommate Expense Calculator
# ==============================================================================

# Màu sắc thông báo
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}======================================================================${NC}"
echo -e "${BLUE}${BOLD} 🚀 BẮT ĐẦU QUÁ TRÌNH THỰC THI CLEAN & BUILD APK RELEASE ${NC}"
echo -e "${BLUE}${BOLD}======================================================================${NC}"

# Đường dẫn thư mục dự án
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"
APK_OUTPUT_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"

cd "$PROJECT_DIR" || exit 1

# 1. Kiểm tra TypeScript
echo -e "\n${YELLOW}🔍 1. Kiểm tra TypeScript (Type Check)...${NC}"
if npm run type-check; then
    echo -e "${GREEN}✓ Type check thành công! Không có lỗi TypeScript.${NC}"
else
    echo -e "${RED}❌ Có lỗi TypeScript! Vui lòng sửa lỗi trước khi build APK.${NC}"
    exit 1
fi

# 2. Làm sạch Cache & Build cũ
echo -e "\n${YELLOW}🧹 2. Làm sạch Cache Gradle & Build cũ (Cleaning cache)...${NC}"
cd "$ANDROID_DIR" || exit 1
rm -rf build .gradle app/build
echo -e "${GREEN}✓ Đã xóa sạch thư mục cache .gradle và build!${NC}"

# 3. Tiến hành Build APK Release
echo -e "\n${YELLOW}🏗 3. Tiến hành Build Release APK (./gradlew assembleRelease)...${NC}"
echo -e "${BLUE}Quá trình này có thể mất từ 1 - 3 phút tùy theo máy...${NC}\n"

./gradlew assembleRelease

BUILD_STATUS=$?

# 4. Kiểm tra kết quả
if [ $BUILD_STATUS -eq 0 ] && [ -f "$APK_OUTPUT_PATH" ]; then
    FILE_SIZE=$(du -h "$APK_OUTPUT_PATH" | cut -f1)
    echo -e "\n${GREEN}${BOLD}======================================================================${NC}"
    echo -e "${GREEN}${BOLD} 🎉 BUILD APK RELEASE THÀNH CÔNG RỰC RỠ! ${NC}"
    echo -e "${GREEN}${BOLD}======================================================================${NC}"
    echo -e "${BOLD}📌 Đường dẫn file APK:${NC} $APK_OUTPUT_PATH"
    echo -e "${BOLD}📦 Dung lượng APK:${NC} $FILE_SIZE"
    echo -e "${GREEN}======================================================================${NC}"
else
    echo -e "\n${RED}${BOLD}======================================================================${NC}"
    echo -e "${RED}${BOLD} ❌ BUILD APK THẤT BẠI! Vui lòng kiểm tra lại log lỗi ở trên. ${NC}"
    echo -e "${RED}${BOLD}======================================================================${NC}"
    exit 1
fi
