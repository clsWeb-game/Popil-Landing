"use client";

import { Dialog } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ImageOff, X, MonitorPlay, CheckCircle, Loader2, LogIn } from "lucide-react";
import { calenderIcon, clockIcon } from "@/public/icons";
import React, { useCallback, useEffect, useState } from "react";
import { useFetch } from "@/hooks/useFetch";
import { useRentalCheckout } from "@/hooks/useRentalCheckout";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type MovieData = {
  id?: string;
  _id?: string;
  movieName?: string;
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

type RentalStatusResponse = {
  status: string;
  hasRental: boolean;
  rentalStatus: {
    rentalId: string;
    endsAt: string;
    remainingMs: number;
    remainingHrs: number;
  } | null;
};

function getImagePath(path?: string) {
  if (!path) return "";
  return path.replace("../public", "");
}

function formatRemaining(hrs: number): string {
  if (hrs >= 24) {
    const days = Math.floor(hrs / 24);
    const leftHrs = hrs % 24;
    return leftHrs > 0 ? `${days}d ${leftHrs}h` : `${days}d`;
  }
  return `${hrs}h`;
}

function isLoggedIn(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("token");
}

export default function MovieRentModal({
  movie,
  onClose,
  contentType = "Movies",
  onRentSuccess,
}: {
  movie: MovieData | null;
  onClose: () => void;
  contentType?: "Movies" | "Series";
  onRentSuccess?: (movieId: string) => void;
}) {
  const open = movie !== null;
  const movieId = movie?.id || movie?._id || "";
  const router = useRouter();

  const [imgError, setImgError] = useState(false);
  const [rentSuccess, setRentSuccess] = useState(false);

  const { rentMovie, renting, error: rentError, clearError } = useRentalCheckout();

  const {
    data: statusData,
    loading: statusLoading,
    run: fetchStatus,
  } = useFetch<RentalStatusResponse>("/user/rental/rentalStatus", "GET", {
    params: { contentId: movieId, contentType },
    manual: true,
  });

  useEffect(() => {
    setImgError(false);
    setRentSuccess(false);
    clearError();
    if (open && movieId && isLoggedIn()) {
      fetchStatus(undefined, { contentId: movieId, contentType });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, open]);

  const hasRental = statusData?.hasRental === true;
  const remainingHrs = statusData?.rentalStatus?.remainingHrs ?? 0;

  const handleRent = useCallback(async () => {
    if (!movieId) return;

    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    try {
      // Close the modal before opening Razorpay checkout popup
      // (prevents two stacked modals and avoids layout issues on smaller screens).
      onClose();
      await rentMovie(movieId, contentType);
      toast.success("Rental successful");
      onRentSuccess?.(movieId);
    } catch (err: unknown) {
      const e = err as {
        message?: string;
        status?: number;
        response?: { data?: { message?: string } };
      };
      if (e?.message === "dismissed") return;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Rental failed";
      toast.error(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, contentType, rentMovie, onClose, router]);

  const rawImg = getImagePath(
    movie?.coverImage ?? movie?.bannerImage ?? movie?.image,
  );
  const isRemote =
    rawImg.startsWith("http://") || rawImg.startsWith("https://");

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

  const loggedIn = typeof window !== "undefined" ? isLoggedIn() : true;

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
                <div className="relative flex w-[calc(100vw-2rem)] max-w-[980px] max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-[#1B1B1D] shadow-2xl">
                  {/* Poster image */}
                  <div className="relative aspect-video w-full max-h-[48vh] shrink-0 overflow-hidden">
                    {!rawImg || imgError ? (
                      <div className="absolute inset-0 grid place-items-center bg-white/5">
                        <div className="flex flex-col items-center gap-2 text-white/70">
                          <ImageOff className="h-10 w-10" />
                          <span className="text-sm font-medium">
                            Image not available
                          </span>
                        </div>
                      </div>
                    ) : isRemote ? (
                      <img
                        src={rawImg}
                        alt={movie?.movieName ?? "Movie poster"}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <Image
                        src={rawImg}
                        alt={movie?.movieName ?? "Movie poster"}
                        fill
                        className="object-cover"
                        sizes="980px"
                        priority
                        onError={() => setImgError(true)}
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

                  {/* Content (scrolls if modal is short) */}
                  <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5 pt-4 md:px-6 md:pb-6 md:pt-5">
                    <Dialog.Title className="[font-family:var(--font-montserrat)] text-[26px] font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-[28px] md:text-[32px]">
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
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/60 sm:text-sm">
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
                      <p className="max-w-[900px] text-[13px] leading-relaxed text-white/60 sm:text-sm">
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

                    {/* Rent / Status section */}
                    {displayRentPrice != null && (
                      <div className="flex flex-col gap-2 pb-1">
                        {!loggedIn ? (
                          /* Not logged in */
                          <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="[font-family:var(--font-montserrat)] mt-2 flex w-fit items-center justify-center gap-2.5 rounded-full bg-white/10 px-14 py-3.5 text-[15px] font-bold text-white transition-opacity hover:bg-white/15"
                          >
                            <LogIn className="size-[18px]" />
                            Login to Rent
                          </button>
                        ) : statusLoading ? (
                          /* Checking rental status */
                          <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
                            <Loader2 className="size-4 animate-spin" />
                            Checking rental status...
                          </div>
                        ) : hasRental || rentSuccess ? (
                          /* Already rented */
                          <div className="mt-2 flex items-center gap-3 rounded-full bg-emerald-500/15 px-6 py-3.5 w-fit">
                            <CheckCircle className="size-5 text-emerald-400" />
                            <span className="text-[15px] font-bold text-emerald-400">
                              Rented
                            </span>
                            {hasRental && remainingHrs > 0 && (
                              <span className="text-[13px] text-emerald-400/70">
                                Expires in {formatRemaining(remainingHrs)}
                              </span>
                            )}
                          </div>
                        ) : (
                          /* Rent button */
                          <>
                          <button
                              type="button"
                              disabled={renting}
                              onClick={handleRent}
                            className="[font-family:var(--font-montserrat)] mt-1 flex w-fit items-center justify-center gap-2.5 rounded-full bg-linear-to-b from-primary to-secondary px-10 py-3 text-[14px] font-bold text-white shadow-lg shadow-[#ff8c00]/25 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:px-14 sm:py-3.5 sm:text-[15px]"
                            >
                              {renting ? (
                                <Loader2 className="size-[18px] animate-spin" />
                              ) : (
                                <MonitorPlay className="size-[18px]" />
                              )}
                              {renting ? "Processing..." : `Rent for ₹${displayRentPrice}`}
                              {!renting && displayRentDuration ? (
                                <span className="text-white/80"> • {displayRentDuration}</span>
                              ) : null}
                            </button>
                            {rentError && (
                              <p className="text-sm text-red-400">{rentError}</p>
                            )}
                          </>
                        )}
                      </div>
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
