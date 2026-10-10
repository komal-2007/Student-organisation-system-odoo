const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#e8e7f0"/><path d="M0 590 290 330l185 165 195-230 530 415v120H0Z" fill="#c9c5e5"/><circle cx="900" cy="210" r="72" fill="#d8d4eb"/><text x="600" y="735" text-anchor="middle" fill="#4a456e" font-family="Arial,sans-serif" font-size="34" letter-spacing="6">SKYLINE</text></svg>',
)}`;

function PublicImage({ src, ...imageProps }) {
  function useFallback(event) {
    if (event.currentTarget.src !== FALLBACK_IMAGE) {
      event.currentTarget.src = FALLBACK_IMAGE;
    }
  }

  return <img {...imageProps} src={src} onError={useFallback} />;
}

export default PublicImage;
