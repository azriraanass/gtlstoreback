import { create } from "domain";
import { StockStatus } from "src/products/entities/product-stock.entity";

export const mapProduct = (raw: any) => {
  const getMeta = (key: string) =>
    raw.meta_data.find((m: any) => m.key === key)?.value ?? null;

  return {
    
    id:               raw.id,
    name:             raw.name,
    slug:             raw.slug?.trim() !== '' ? raw.slug : `product-${raw.id}`,
    url:              raw.permalink?.includes('post_type=product') ? null : raw.permalink,
    reference:        getMeta('_ref_origine'),
    internalId:       getMeta('_id_interne'),
    price:            parseFloat(raw.price) || 0,
    regularPrice:     parseFloat(raw.regular_price) || 0,
    salePrice:        raw.sale_price ? parseFloat(raw.sale_price) : null,
    onSale:           raw.on_sale,
    currency:         'MAD',
    brand:            raw.attributes.find((a: any) => a.slug === 'pa_brands')?.options[0] ?? null,
    specifications:   getMeta('_specifications'),
    shortDescription: raw.short_description || null,
    description:      raw.description || null,
    createdAt:         new Date(raw.date_created),
    averageRating:    raw.average_rating,
    ratingCount:      raw.rating_count,

    stock: {
      productId: raw.id,
      status:    raw.stock_status as StockStatus,
      quantity:  raw.stock_quantity ?? 0,
    },

    images: raw.images.map((img: any, index: number) => ({
      id:        img.id,
      productId: raw.id,
      src:       img.src,
      alt:       img.alt ?? null,
      thumbnail: img.thumbnail ?? null,
    })),

    categories: raw.categories.map((cat: any) => ({
      id:   cat.id,
      name: cat.name,
      slug: cat.slug,
    })),
  };
};