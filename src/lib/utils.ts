export const uid = () => crypto.randomUUID();

export const formatDate = (value: unknown) =>
  value && typeof value === "object" && "toDate" in value
    ? (value as { toDate: () => Date }).toDate().toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "Just now";

export const cn = (...v: (string | false | undefined)[]) => v.filter(Boolean).join(" ");

/**
 * Read an image File, downscale it to `max` px on its longest edge, and return
 * a compact JPEG data URL. Keeps avatars small enough to store inline in a
 * Firestore document (well under the 1MB limit). Browser-only.
 */
export function resizeImageToDataUrl(file: File, max = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image"));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas unavailable"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
