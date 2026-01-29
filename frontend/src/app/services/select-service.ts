import { Subject } from "rxjs";
import { Movie, TVShow } from "../models/tmdb.model";
import { Injectable } from "@angular/core";


@Injectable({
  providedIn: "root",
})
export class SelectService {
    #selectedContent= new Subject<Movie | TVShow>();
    
    selectContent$ = this.#selectedContent.asObservable();

    
    selectContent(content : Movie | TVShow) {
        this.#selectedContent.next(content);
    }

}