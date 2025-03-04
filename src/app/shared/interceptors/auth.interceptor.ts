import { HttpInterceptorFn } from "@angular/common/http";

/**
* Functional HTTP Interceptor for attaching JWT token to all requests.
*/

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
	const token = localStorage.getItem("token");
	// Clone the request and add the Authorization header if token exists
	const authReq = token
		? req.clone({
				setHeaders: {
					Authorization: `Bearer ${token}`,
				},
		  })

		: req;
	return next(authReq);
};

 