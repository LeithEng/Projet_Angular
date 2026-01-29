import { ContentType } from "../types/content-type.type";
import { FetchType } from "../types/fetch-type.type";

export interface FetchCriteria {
  type: FetchType;
  cType: ContentType;
  genre?: string; 
}