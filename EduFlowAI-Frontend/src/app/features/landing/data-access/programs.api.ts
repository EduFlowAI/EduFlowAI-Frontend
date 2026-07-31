import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  extractPrograms,
  normalizeProgram,
  Program,
  ProgramsApiResponse,
} from '../models/program.model';

@Injectable({ providedIn: 'root' })
export class ProgramsApi {
  private readonly http = inject(HttpClient);
  private readonly programsUrl = '/api/programs';

  getPrograms(): Observable<readonly Program[]> {
    return this.http
      .get<ProgramsApiResponse>(this.programsUrl)
      .pipe(
        map((response) =>
          extractPrograms(response).map((program, index) => normalizeProgram(program, index)),
        ),
      );
  }
}
