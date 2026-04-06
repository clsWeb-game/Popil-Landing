import StoreSlider from "../components/storeSlider";
import MovieSlider from "../components/movieSlider";
import { rentableMoviesData } from "../../../dummyData/dummyData";
import Subscription from "../components/subscription";
import Footer from "../components/Footer";

export default function StorePage() {
  return (
    <>
    <StoreSlider />
    <MovieSlider title="Rentable Movies" data={rentableMoviesData} />
    <MovieSlider title="Rentable Web Series" data={rentableMoviesData} />
    <MovieSlider title="Popil Trending Movies" data={rentableMoviesData} />
    <Subscription /> 
    </>
  );
}

