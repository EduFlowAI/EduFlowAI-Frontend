import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { ApplicationDashboardSummary } from '../models/application-dashboard-summary.model';
import { environment } from '../../../../../environments/environment.development'; // Import from environments
import { Observable } from 'rxjs';
import { 
    ApplicationDetailsDto, 
    ApplicationRequestDto, 
    Result, 
    UpdateApplicationPreferencesDto 
  } from '../models/application.model';

// providedIn: 'root' makes this service a singleton (one instance for the whole app)
@Injectable({
    providedIn: 'root'
})

export class ApplicationService {
    private readonly http = inject(HttpClient);
    // Mock API URL - Replace this with the production backend URL later
    private readonly baseUrl = `${environment.apiUrl}/api/modules/admission/applications`;

    /**
     * Fetch the new dashboard summary endpoint
     */
    getDashboardSummary(applicationId: string) {
        // Assuming the backend Result<T> wraps the actual data in a property (e.g., value or data)
        return this.http.get<any>(`${this.baseUrl}/${applicationId}/dashboard-summary`);
    }

    /**
     * Creates a new draft application.
     * Maps to POST: api/modules/admission/applications/draft
     * @param request request The application request data containing cycle and preferences
     * @returns Observable of the operation result
     */
    createDraft(request: ApplicationRequestDto): Observable<Result<ApplicationDetailsDto>> {
        return this.http.post<Result<ApplicationDetailsDto>>(`${this.baseUrl}/draft`, request);
    }

    /**
     * Retrieves full application details for editing.
     * Maps to GET: api/modules/admission/applications/{applicationId}
     * @param applicationId applicationId The unique identifier of the application
     * @returns Observable of the operation result containing application details
     */
    getApplicationDetails(applicationId: string): Observable<Result<ApplicationDetailsDto>> {
        return this.http.get<Result<ApplicationDetailsDto>>(`${this.baseUrl}/${applicationId}`);
    }

    /**
     * Updates application preferences.
     * Maps to PUT: api/modules/admission/applications/{applicationId}/preferences
     * @param applicationId applicationId The unique identifier of the application
     * @param request request The updated preferences data
     * @returns Observable of the operation result
     */
    updatePreferences(applicationId: string, request: UpdateApplicationPreferencesDto): Observable<Result<ApplicationDetailsDto>> {
        return this.http.put<Result<ApplicationDetailsDto>>(`${this.baseUrl}/${applicationId}/preferences`, request);
    }
}

