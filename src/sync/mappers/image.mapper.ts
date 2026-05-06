

export const mapImages = (raw: any) => {
  return raw.images.map((img: any, index: number) => ({
    id:        img.id,
    productId: raw.id,
    src:       img.src,
    alt:       img.alt ?? null,
    thumbnail: img.thumbnail ?? null,
  }));
};