import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { map, Observable } from "rxjs";
@Injectable()
export class RemovePasswordInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (Array.isArray(data)) {
                    return data.map((item) => {
                        if (item && typeof item === 'object' && 'password' in item) {
                            item.password = undefined;
                        }
                        return instanceToPlain(item);
                    });
                } else if (data && typeof data === 'object' && 'password' in data) {
                    data.password = undefined;
                    return instanceToPlain(data);
                }
                return data;
            }),
        );
    }
}