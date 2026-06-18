/**
 * Converts a local project asset PNG to a Base64 string.
 * @param assetPath Path to the asset relative to your public root (e.g., '/assets/logo.png')
 */
export default async function imgToBase64(assetPath: string): Promise<string> {
    // 1. Fetch the local asset file from the server
    const response = await fetch(assetPath);
    const blob = await response.blob();

    // 2. Read the file binary contents as a Data URL
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

// Example Usage:
// const base64 = await imgToBase64('/assets/logo.png');
