import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { ApplicationDashboardSummary } from '../models/application-dashboard-summary.model';
import { environment } from '../../../../../environments/environment.development'; // Import from environments
// providedIn: 'root' makes this service a singleton (one instance for the whole app)
@Injectable({
    providedIn: 'root'
})

export class ApplicationService {
    private readonly http = inject(HttpClient);

    // Mock API URL - Replace this with the production backend URL later
    private readonly API_URL = `${environment.apiUrl}/applications`;

    /**
     * Fetch the new dashboard summary endpoint
     */
    getDashboardSummary(applicationId: string) {
        // Assuming the backend Result<T> wraps the actual data in a property (e.g., value or data)
        return this.http.get<any>(`${this.API_URL}/${applicationId}/dashboard-summary`);
    }
}

