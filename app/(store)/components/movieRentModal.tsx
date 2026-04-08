"use client";

import { Dialog } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Play, MonitorPlay } from "lucide-react";
import { calenderIcon, clockIcon } from "@/public/icons";

type MovieData = {
  id?: string;
  _id?: string;
  movieName?: string;
  // Dummy data fields (legacy)
  movieDescription?: string;
  movieYear?: string | number;
  duration?: string;
  quality?: string;
  rentPrice?: string | number;
  rentDuration?: string;

  productionName?: string;
  producerName?: string;
  directorName?: string;
  movieDuration?: string;
  description?: string;
  year?: string | number;
  certificate?: string;
  genreName?: string;
  languageName?: string;
  country?: string;
  rating?: string | number;
  castDetails?: Array<{
    name?: string;
    characterName?: string;
    role?: string;
    image?: string;
    _id?: string;
  }>;

  bannerImage?: string;
  coverImage?: string;
  image?: string;
  rental?: {
    isActive?: boolean;
    price?: number;
    durationHours?: number;
  };
  isRented?: boolean;
};

function getImagePath(path?: string) {
  if (!path) return "";
  return path.replace("../public", "");
}

export default function MovieRentModal({
  movie,
  onClose,
}: {
  movie: MovieData | null;
  onClose: () => void;
}) {
  const open = movie !== null;
  const rawImg = getImagePath(
    movie?.coverImage ?? movie?.bannerImage ?? movie?.image,
  );
  // Temporary: avoid next/image remote-host restriction by using a local placeholder
  // for any http(s) URL until remotePatterns/domains are finalized.
  const img =
    rawImg.startsWith("http://") || rawImg.startsWith("https://")
      ? "/dummyMovies/movie-2.jpg"
      : rawImg;

  const displayYear = movie?.movieYear ?? movie?.year;
  const displayDuration = movie?.duration ?? movie?.movieDuration;
  const displayDescription = movie?.movieDescription ?? movie?.description;
  const displayQuality = movie?.quality;
  const displayRentPrice = movie?.rentPrice ?? movie?.rental?.price;
  const displayRentDuration =
    movie?.rentDuration ??
    (movie?.rental?.durationHours != null ? `${movie.rental.durationHours}h` : undefined);
  const displayCertificate = movie?.certificate ?? (typeof movie?.rating === "string" ? movie.rating : undefined);
  const displayRatingNumber = typeof movie?.rating === "number" ? movie.rating : undefined;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full max-w-[980px] overflow-hidden rounded-2xl bg-[#1B1B1D] shadow-2xl">
                  {/* Poster image */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    {img && (
                      <Image
                        src={img}
                        alt={movie?.movieName ?? "Movie poster"}
                        fill
                        className="object-cover"
                        sizes="400px"
                        priority
                      />
                    )}

                    {/* Close button */}
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
                        aria-label="Close"
                      >
                        <X className="size-4 text-white" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-3 px-6 pb-6 pt-5">
                    <Dialog.Title className="[font-family:var(--font-montserrat)] text-[32px] font-extrabold uppercase leading-[1.05] tracking-tight text-white md:text-[36px]">
                      {movie?.movieName ?? ""}
                    </Dialog.Title>

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-white/90">
                      {displayYear != null && (
                        <span className="flex items-center gap-1 text-[13px]">
                          <Image src={calenderIcon} alt="" width={16} height={16} />
                          {displayYear}
                        </span>
                      )}
                      {displayCertificate && (
                        <span className="rounded-xl bg-linear-to-b from-[#40454A] to-[#202329] px-2.5 py-1">
                          {displayCertificate}
                        </span>
                      )}
                      {displayRatingNumber != null && (
                        <span className="rounded-xl bg-linear-to-b from-[#40454A] to-[#202329] px-2.5 py-1">
                          {displayRatingNumber}
                        </span>
                      )}
                      {displayQuality && (
                        <span className="rounded-md border border-primary px-2 py-0.5">
                          {displayQuality}
                        </span>
                      )}
                      {displayDuration && (
                        <span className="flex items-center gap-1 text-[13px]">
                          <Image src={clockIcon} alt="" width={16} height={16} />
                          {displayDuration}
                        </span>
                      )}
                      {movie?.genreName && (
                        <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">
                          {movie.genreName}
                        </span>
                      )}
                      {movie?.languageName && (
                        <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-white/80">
                          {movie.languageName}
                        </span>
                      )}
                    </div>

                    {/* Credits */}
                    {(movie?.productionName ||
                      movie?.directorName ||
                      movie?.producerName) && (
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                        {movie?.productionName && (
                          <span>
                            <span className="text-white/40">Production:</span>{" "}
                            {movie.productionName}
                          </span>
                        )}
                        {movie?.directorName && (
                          <span>
                            <span className="text-white/40">Director:</span>{" "}
                            {movie.directorName}
                          </span>
                        )}
                        {movie?.producerName && (
                          <span>
                            <span className="text-white/40">Producer:</span>{" "}
                            {movie.producerName}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {displayDescription && (
                      <p className="max-w-[900px] text-sm leading-relaxed text-white/60">
                        {displayDescription}
                      </p>
                    )}

                    {/* Cast */}
                    {movie?.castDetails && movie.castDetails.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                          Cast
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {movie.castDetails.slice(0, 6).map((c, idx) => (
                            <div
                              key={c._id ?? `${c.name ?? "cast"}-${idx}`}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                            >
                              <p className="text-sm font-semibold text-white/85">
                                {c.name ?? "Unknown"}
                              </p>
                              {(c.role || c.characterName) && (
                                <p className="text-xs text-white/55">
                                  {c.role ? c.role : ""}
                                  {c.role && c.characterName ? " • " : ""}
                                  {c.characterName ? c.characterName : ""}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rent button */}
                    {displayRentPrice != null && (
                      <button
                        type="button"
                        className="[font-family:var(--font-montserrat)] mt-2 flex w-full items-center justify-center gap-2.5 rounded-full bg-linear-to-b from-primary to-secondary py-3.5 text-[15px] font-bold text-white shadow-lg shadow-[#ff8c00]/25 transition-opacity hover:opacity-90"
                      >
                        <MonitorPlay className="size-[18px]" />
                        Rent for ₹{displayRentPrice}
                        {displayRentDuration ? (
                          <span className="text-white/80"> • {displayRentDuration}</span>
                        ) : null}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
