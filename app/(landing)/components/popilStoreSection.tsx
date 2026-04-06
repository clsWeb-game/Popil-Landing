import Image from "next/image";
import NavButton from "@/app/ui/buttons/navButton";
import { storeIcon } from "@/public/icons";

export default function PopilStoreSection() {
  return (
    <section className="relative w-full py-10 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 md:flex-row md:gap-16">
        {/* Left side - Popil butterfly logo */}
        <div className="flex flex-1 items-center justify-center">
          <Image
            src="/background/popilLogo.png"
            alt="Popil Logo"
            width={400}
            height={400}
            className="h-auto w-[250px] md:w-[350px] lg:w-[400px]"
          />
        </div>

        {/* Right side - Store description */}
        <div className="flex flex-1 flex-col gap-6">
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Popil Store
          </h2>
          <p className="text-base leading-relaxed text-white/50 md:text-lg">
            The Popil Store is the destination for music and entertainment. It&apos;s a place
            meant exclusively for Pop enthusiasts. Discover/buy movies, features, TV series, 
            audiobooks and lots more. Discover the latest tracks, and enjoy exclusive
            content from your favourite artists. With a growing library of entertainment,
            Popil Store brings all your cravings together.
          </p>
          <p className="text-base leading-relaxed text-white/50 md:text-lg">
            Unlock fresh entertainment daily. Our curated collections, trending charts,
            and personalised recommendations ensure you&apos;re always discovering new
            music, artists, and stories that match your taste. What sets Popil Store
            apart is its committed focus on creativity. Here, artists and creators
            converge to share, collaborate, and build digital art across the world.
          </p>
          <div className="pt-2">
            <NavButton
              href="/store"
              text="Visit Store"
              icon={
                <Image
                  src={storeIcon}
                  alt=""
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              }
              colorClassName=""
              className="inline-flex rounded-full bg-gradient-to-b from-primary to-secondary px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
