import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AssistantMessageRequest,
  AssistantResponse,
} from '../models/assistant.models';

@Injectable({
  providedIn: 'root',
})
export class AssistantApiService {
  private readonly http = inject(HttpClient);

  sendMessage(
    request: AssistantMessageRequest,
  ): Observable<AssistantResponse> {
    return this.http.post<AssistantResponse>(
      '/api/assistant/message',
      request,
    );
  }
}