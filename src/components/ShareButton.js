import React, { useState } from 'react';
import '../component-css/share-button.css';

export default function ShareButton({ url, title, description }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url
        });
        return;
      } catch (err) {
        // User cancelled or error occurred, fall back to clipboard
        console.log('Share cancelled or failed:', err);
      }
    }

    // Fallback to clipboard
    await copyToClipboard();
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      fallbackCopy();
    }
  }

  function fallbackCopy() {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  return (
    <button 
      onClick={handleShare} 
      className="share-button"
      title="Share this campsite"
    >
      {copied ? (
        <>
          ✓ Link Copied!
        </>
      ) : (
        <>
          🔗 Share
        </>
      )}
    </button>
  );
}
