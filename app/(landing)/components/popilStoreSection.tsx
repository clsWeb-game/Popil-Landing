import Image from "next/image";
import NavButton from "@/app/ui/buttons/navButton";
import { storeIcon } from "@/public/icons";

export default function PopilStoreSection() {
  return (
    <section className="relative w-full">
      <div className="mx-auto flex  sm:w-[calc(100%-150px)] w-[calc(100%-50px)] flex-col items-center gap-12 md:flex-col xl:flex-row md:gap-16">
        {/* Left side - Popil butterfly logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/background/popilLogo.png"
            alt="Popil Logo"
            width={892}
            height={892}
            className="w-[300px] md:w-[450px] xl:w-[892px]"
          />
        </div>

        {/* Right side - Store description */}
        <div className="flex flex-1 flex-col gap-10 max-w-2xl">
          <h2 className="font-heading text-3xl font-bold text-transparent bg-clip-text bg-linear-to-b from-primary to-secondary md:text-4xl lg:text-[75px]">
            Popil Store
          </h2>
          <p className="text-base leading-relaxed text-white md:text-lg">
            The Popil Store is the destination for music and entertainment. It&apos;s a place
            meant exclusively for Pop enthusiasts. Discover/buy movies, features, TV series, 
            audiobooks and lots more. Discover the latest tracks, and enjoy exclusive
            content from your favourite artists. With a growing library of entertainment,
            Popil Store brings all your cravings together.
          </p>
          <p className="text-base leading-relaxed text-white md:text-lg">
            Unlock fresh entertainment daily. Our curated collections, trending charts,
            and personalised recommendations ensure you&apos;re always discovering new
            music, artists, and stories that match your taste. What sets Popil Store
            apart is its committed focus on creativity. Here, artists and creators
            converge to share, collaborate, and build digital art across the world.
          </p>
          <div className="pt-2">
            <NavButton
              href="/store"
              text="Popil Store"
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
              className="inline-flex rounded-full bg-linear-to-b from-primary to-secondary px-4 md:px-8 py-2 md:py-5  font-semibold text-white transition-opacity hover:opacity-90 text-base"
            />
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-[-30rem]  z-[-1]">
        <Image
          src="/background/effect.png"
          alt="Store Background"
          width={1920}
          height={1080}
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
