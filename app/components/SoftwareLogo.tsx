import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { getSoftwareLogoCandidates, PLACEHOLDER_LOGO } from "~/lib/logo";

type SoftwareLogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt" | "onError"
> & {
  alt: string;
  website?: string | null;
};

export default function SoftwareLogo({
  alt,
  website,
  ...imageProps
}: SoftwareLogoProps) {
  const [logoCandidates, setLogoCandidates] = useState<string[]>([]);
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    setLogoCandidates(
      getSoftwareLogoCandidates(website, {
        BRANDFETCH_CLIENT_ID: window.ENV?.BRANDFETCH_CLIENT_ID,
        LOGO_DEV_PUBLIC: window.ENV?.LOGO_DEV_PUBLIC,
      }),
    );
    setLogoIndex(0);
  }, [website]);

  const logoSrc = logoCandidates[logoIndex] || PLACEHOLDER_LOGO;

  return (
    <img
      {...imageProps}
      src={logoSrc}
      alt={alt}
      onError={() => {
        if (logoIndex < logoCandidates.length) {
          setLogoIndex((currentIndex) => currentIndex + 1);
        }
      }}
    />
  );
}
