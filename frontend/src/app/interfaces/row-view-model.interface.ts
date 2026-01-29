import { Movie, TVShow } from "../models/tmdb.model";

export interface RowViewModel {
  items: (Movie | TVShow)[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
}