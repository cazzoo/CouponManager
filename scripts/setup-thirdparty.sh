#!/bin/bash

# PocketBase Binary Setup Script
# Downloads PocketBase v0.36.1 binaries for all platforms

set -e  # Exit on any error

VERSION="0.36.1"
BASE_URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
THIRDPARTY_DIR="${REPO_ROOT}/thirdparty/pocketbase"

echo "======================================"
echo "PocketBase Binary Setup Script"
echo "======================================"
echo "Version: ${VERSION}"
echo "Target directory: ${THIRDPARTY_DIR}"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to detect current platform
detect_platform() {
    local os_name
    local arch

    # Detect OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        os_name="darwin"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        os_name="linux"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        os_name="windows"
    else
        echo -e "${RED}Error: Unable to detect OS${NC}"
        echo "OSTYPE: $OSTYPE"
        exit 1
    fi

    # Detect architecture
    arch=$(uname -m)
    case $arch in
        arm64|aarch64)
            arch="arm64"
            ;;
        x86_64|amd64)
            arch="amd64"
            ;;
        *)
            echo -e "${RED}Error: Unsupported architecture: ${arch}${NC}"
            exit 1
            ;;
    esac

    echo "${os_name}-${arch}"
}

# Function to download and extract binary
download_binary() {
    local platform=$1
    local binary_name=$2
    local url=$3
    local output_file="${THIRDPARTY_DIR}/${binary_name}"

    echo -n "Downloading ${binary_name}..."

    # Download using curl
    if ! curl -sL "${url}" -o "/tmp/pocketbase-${platform}.zip"; then
        echo -e " ${RED}FAILED${NC}"
        echo "Failed to download from: ${url}"
        echo "Please check your internet connection and try again."
        exit 1
    fi

    # Verify download has content (not empty)
    if [[ ! -s "/tmp/pocketbase-${platform}.zip" ]]; then
        echo -e " ${RED}FAILED${NC}"
        echo "Downloaded file is empty or corrupted."
        rm -f "/tmp/pocketbase-${platform}.zip"
        exit 1
    fi

    # Extract binary to temp directory first to avoid conflicts
    local temp_extract_dir="/tmp/pocketbase-extract-${platform}"
    rm -rf "${temp_extract_dir}"
    mkdir -p "${temp_extract_dir}"

    if ! unzip -q -o -d "${temp_extract_dir}" "/tmp/pocketbase-${platform}.zip"; then
        echo -e " ${RED}FAILED${NC}"
        echo "Failed to extract binary from zip file."
        rm -f "/tmp/pocketbase-${platform}.zip"
        rm -rf "${temp_extract_dir}"
        exit 1
    fi

    # Clean up zip file
    rm -f "/tmp/pocketbase-${platform}.zip"

    # Move binary from temp to final location with correct name
    # Windows binary has .exe extension
    local extracted_binary="${temp_extract_dir}/pocketbase"
    if [[ "$platform" == "windows-amd64" ]] && [[ ! -f "${extracted_binary}" ]]; then
        extracted_binary="${temp_extract_dir}/pocketbase.exe"
    fi

    if [[ ! -f "${extracted_binary}" ]]; then
        echo -e " ${RED}FAILED${NC}"
        echo "Binary not found in extracted files: ${extracted_binary}"
        ls -la "${temp_extract_dir}"
        rm -rf "${temp_extract_dir}"
        exit 1
    fi

    # Remove old binary if exists
    if [[ -f "${output_file}" ]]; then
        rm -f "${output_file}"
    fi

    # Move to final location
    if ! mv "${extracted_binary}" "${output_file}"; then
        echo -e " ${RED}FAILED${NC}"
        echo "Failed to move binary to ${output_file}."
        rm -rf "${temp_extract_dir}"
        exit 1
    fi

    # Clean up temp directory (keep only LICENSE and CHANGELOG from first extraction)
    # Remove CHANGELOG.md and LICENSE.md if they exist in thirdparty dir
    rm -f "${THIRDPARTY_DIR}/CHANGELOG.md"
    rm -f "${THIRDPARTY_DIR}/LICENSE.md"

    # Clean up temp extract directory
    rm -rf "${temp_extract_dir}"

    # Make binary executable (Unix only - skip for Windows)
    if [[ "$platform" != "windows" ]] && [[ "$platform" != "windows-amd64" ]]; then
        if [[ ! -f "${output_file}" ]]; then
            echo -e " ${RED}FAILED${NC}"
            echo "Binary file not found after extraction: ${output_file}"
            exit 1
        fi

        if ! chmod +x "${output_file}"; then
            echo -e " ${RED}FAILED${NC}"
            echo "Failed to set executable permission."
            rm -f "${output_file}"
            exit 1
        fi
    fi

    # Verify file size (should be around 48MB)
    local file_size=$(stat -f%z "${output_file}" 2>/dev/null || stat -c%s "${output_file}" 2>/dev/null)
    local expected_size=$((48 * 1024 * 1024))  # 48MB in bytes

    if [[ $file_size -lt $((expected_size / 2)) ]]; then
        echo -e " ${YELLOW}WARNING${NC}"
        echo "Downloaded file size (${file_size} bytes) is smaller than expected (~48MB)."
        echo "The file may be corrupted or incomplete."
        exit 1
    fi

    echo -e " ${GREEN}DONE${NC}"
}

# Detect current platform
CURRENT_PLATFORM=$(detect_platform)
echo -e "Detected platform: ${GREEN}${CURRENT_PLATFORM}${NC}"
echo ""

# Download all platform binaries
echo "Downloading PocketBase binaries for all platforms..."
echo ""

# macOS ARM64 (Apple Silicon)
echo -n "[1/4] macOS ARM64..."
DOWNLOAD_URL="${BASE_URL}/pocketbase_${VERSION}_darwin_arm64.zip"
BINARY_NAME="pocketbase-darwin-arm64"
download_binary "darwin-arm64" "${BINARY_NAME}" "${DOWNLOAD_URL}"

# macOS Intel
echo -n "[2/4] macOS Intel..."
DOWNLOAD_URL="${BASE_URL}/pocketbase_${VERSION}_darwin_amd64.zip"
BINARY_NAME="pocketbase-darwin-amd64"
download_binary "darwin-amd64" "${BINARY_NAME}" "${DOWNLOAD_URL}"

# Linux x64
echo -n "[3/4] Linux x64..."
DOWNLOAD_URL="${BASE_URL}/pocketbase_${VERSION}_linux_amd64.zip"
BINARY_NAME="pocketbase-linux-amd64"
download_binary "linux-amd64" "${BINARY_NAME}" "${DOWNLOAD_URL}"

# Windows x64
echo -n "[4/4] Windows x64..."
DOWNLOAD_URL="${BASE_URL}/pocketbase_${VERSION}_windows_amd64.zip"
BINARY_NAME="pocketbase-windows-amd64.exe"
download_binary "windows-amd64" "${BINARY_NAME}" "${DOWNLOAD_URL}"

# Create .gitkeep file
touch "${THIRDPARTY_DIR}/.gitkeep"

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "======================================"
echo ""
echo "Downloaded binaries:"
ls -lh "${THIRDPARTY_DIR}" | grep -E "pocketbase-|\.gitkeep"
echo ""
echo "Next steps:"
echo "1. Run: npm install"
echo "2. Run: pnpm pb:start"
echo ""
