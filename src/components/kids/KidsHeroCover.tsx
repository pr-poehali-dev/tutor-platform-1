interface KidsHeroCoverProps {
  src: string;
  alt: string;
  /** Подпись поверх нижней части картинки */
  caption?: string;
  /** Цвет свечения рамки, напр. "shadow-emerald-500/20" */
  glow?: string;
}

/** Тёплая обложка-иллюстрация для hero-секций разделов «Малыша». */
export default function KidsHeroCover({ src, alt, caption, glow = "shadow-pink-500/20" }: KidsHeroCoverProps) {
  return (
    <figure className={`relative rounded-3xl overflow-hidden border border-white/12 shadow-2xl ${glow}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={1024}
        height={640}
        className="w-full aspect-[16/10] object-cover"
      />
      {caption && (
        <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-3">
          <span className="text-white/85 text-xs md:text-sm font-medium">{caption}</span>
        </figcaption>
      )}
    </figure>
  );
}
