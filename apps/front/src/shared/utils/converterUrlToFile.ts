export const convertUrlToFile = async (url: string | undefined) => {
  if (!url) return null;

  const fileName = url.split('/').pop();

  try {
    const response = await fetch(`http://localhost:8080/${url}`, {
      credentials: 'include',
      headers: {
        Accept: 'image/png,image/jpeg,application/pdf',
        Origin: window.location.origin,
      },
    });

    const blob = await response.blob();

    const fileType = /\.png$/i.test(url)
      ? 'image/png'
      : /\.pdf$/i.test(url)
        ? 'application/pdf'
        : /\.jpe?g$/i.test(url)
          ? 'image/jpeg'
          : 'image/jpeg';

    return new File([blob], fileName || 'file', { type: fileType });
  } catch {
    throw new Error('Error converting URL to file');
  }
};
