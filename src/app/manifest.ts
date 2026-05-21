import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AQLIYA — منصة ذكاء مؤسسي خاص ومحكوم",
    short_name: "AQLIYA",
    description:
      "منصة ذكاء مؤسسي خاص ومحكوم تقدم خطوط أنظمة متخصصة تربط البيانات، الإجراءات، المخرجات، والأدلة داخل بيئة واحدة قابلة للمراجعة والاعتماد.",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0A0F24",
    theme_color: "#1E3A8A",
    dir: "rtl",
    lang: "ar",
    icons: [
      {
        src: "/brand/Favicons/symbol (1).svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/brand/Favicons/symbol (1).svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/brand/Favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/brand/Favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/brand/Favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/brand/Favicons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/Favicons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
