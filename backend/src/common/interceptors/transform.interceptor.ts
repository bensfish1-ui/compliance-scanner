import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Standard API response wrapper.
 * All successful responses are wrapped in: { success: true, data: ..., meta: ..., timestamp: ... }
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // If the response already has our standard shape (e.g., paginated responses), pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Extract meta if the service returned { data, meta } shape
        let responseData = data;
        let meta: Record<string, any> | undefined;

        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          responseData = data.data;
          meta = data.meta;
        }

        return {
          success: true,
          data: responseData,
          meta,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
