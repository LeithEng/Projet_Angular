import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Genre } from '../../models/tmdb.model'; 

@Component({
  selector: 'app-genre-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genre-cell.component.html',
  styleUrl: './genre-cell.component.css'
})
export class GenreCellComponent {
  
  genre = input.required<Genre>();
}
