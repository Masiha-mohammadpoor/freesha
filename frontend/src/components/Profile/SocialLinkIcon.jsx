"use client";

import {
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaTelegram,
  FaFacebook,
  FaLink,
} from "react-icons/fa";
import { SiX } from "react-icons/si";

const SocialLinkIcon = ({ url, size = 24, className = "" }) => {
  if (!url) return <FaLink size={size} className={className} />;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, "");

    const path = urlObj.pathname.replace(/^\/|\/$/g, "");

    switch (hostname) {
      case "instagram.com":
        return (
          <FaInstagram size={size} className={`text-primary ${className}`} />
        );
      case "twitter.com":
        return (
          <FaTwitter size={size} className={`text-primary ${className}`} />
        );
      case "x.com":
        return <SiX size={size} className={`text-primary ${className}`} />;
      case "linkedin.com":
        return (
          <FaLinkedin size={size} className={`text-primary ${className}`} />
        );
      case "github.com":
        return <FaGithub size={size} className={`text-primary ${className}`} />;
      case "t.me":
      case "telegram.me":
        return (
          <FaTelegram size={size} className={`text-primary ${className}`} />
        );
      case "facebook.com":
      case "fb.com":
        return (
          <FaFacebook size={size} className={`text-primary ${className}`} />
        );
      default:
        return <FaLink size={size} className={`text-primary ${className}`} />;
    }
  } catch {
    return <FaLink size={size} className={`text-primary ${className}`} />;
  }
};

export default SocialLinkIcon;
