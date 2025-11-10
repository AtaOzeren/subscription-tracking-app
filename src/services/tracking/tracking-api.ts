/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:5001";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title WebinarMaker API Collection
 * @version 1.0.0
 * @baseUrl http://localhost:5001
 * @contact
 *
 * Clerk-based authentication API collection for WebinarMaker backend. Authentication flow: 1) Register via Clerk API, 2) Accept tenant invitation, 3) Login via Clerk API to get session token
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * @description API Info
   *
   * @tags System
   * @name ApiInfo
   * @summary API Info
   * @request GET:/
   */
  apiInfo = (params: RequestParams = {}) =>
    this.request<void, any>({
      path: `/`,
      method: "GET",
      ...params,
    });

  api = {
    /**
     * @description DEPRECATED: This endpoint is kept for backward compatibility but should not be used for new implementations. Use 'Register User (Clerk API)' instead.
     *
     * @tags Authentication
     * @name ClerkCallbackDeprecated
     * @summary Clerk Callback (Deprecated)
     * @request POST:/api/auth/clerk-callback
     */
    clerkCallbackDeprecated: (
      body: {
        /** @example "" */
        clerkUserId?: string;
        /** @example "" */
        email?: string;
        /** @example "" */
        firstName?: string;
        /** @example "" */
        lastName?: string;
        /** @example "" */
        tenant?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/auth/clerk-callback`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Step 2: Login with Clerk credentials. Returns a Clerk session token that should be used for all authenticated requests. Note: User must have accepted a tenant invitation first.
     *
     * @tags Authentication
     * @name 2LoginUserClerkApi
     * @summary 2. Login User (Clerk API)
     * @request POST:/api/auth/clerk-login
     */
    "2LoginUserClerkApi": (
      body: {
        /** @example "john.doe@example.com" */
        email?: string;
        /** @example "SecurePassword123!" */
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/auth/clerk-login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Step 1: Register as tenant owner. If tenant doesn't exist, it will be created and you become the owner. If tenant exists, you must be invited by the owner.
     *
     * @tags Authentication
     * @name 1RegisterUserClerkApi
     * @summary 1. Register User (Clerk API)
     * @request POST:/api/auth/clerk-register
     */
    "1RegisterUserClerkApi": (
      body: {
        /** @example "john.doe@example.com" */
        email?: string;
        /** @example "John" */
        firstName?: string;
        /** @example "Doe" */
        lastName?: string;
        /** @example "SecurePassword123!" */
        password?: string;
        /** @example "Acme Corp" */
        tenant?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/auth/clerk-register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 🔍 **Flexible Employees API**\n\nThis single request supports all filtering, sorting, and pagination options. Use environment variables to customize the query.\n\n**📋 Available Parameters:**\n- `role`: Filter by role (owner, admin, editor)\n- `isActive`: Filter by active status (true, false)\n- `search`: Search across firstName, lastName, and email\n- `sortBy`: Sort field (firstName, lastName, email, role, isActive, createdAt, updatedAt)\n- `sortOrder`: Sort direction (asc, desc)\n- `page`: Page number (default: 1)\n- `limit`: Items per page (default: 20, max: 100)\n\n**💡 Usage Examples:**\n```\n// Filter by admin role\nSet employeeRole = "admin"\n\n// Search for users\nSet searchTerm = "john"\n\n// Sort by name\nSet sortBy = "firstName", sortOrder = "asc"\n\n// Combine everything\nSet employeeRole = "admin", searchTerm = "john", sortBy = "lastName", sortOrder = "desc", page = "1", limit = "10"\n```\n\n**🔧 Environment Variables:**\n- `employeeRole`: Role filter\n- `employeeStatus`: Active status filter\n- `searchTerm`: Search term\n- `sortBy`: Sort field\n- `sortOrder`: Sort direction\n- `page`: Page number\n- `limit`: Page limit
     *
     * @tags Employee Management
     * @name GetEmployeesFlexible
     * @summary Get Employees (Flexible)
     * @request GET:/api/employees
     */
    getEmployeesFlexible: (
      query?: {
        /** Filter by role (owner, admin, editor) */
        role?: string;
        /** Filter by active status (true, false) */
        isActive?: string;
        /** Search across firstName, lastName, and email */
        search?: string;
        /** Sort field (firstName, lastName, email, role, isActive, createdAt, updatedAt) */
        sortBy?: string;
        /** Sort direction (asc, desc) */
        sortOrder?: string;
        /** Page number */
        page?: string;
        /** Items per page */
        limit?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/employees`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Invite Employee
     *
     * @tags Employee Management
     * @name InviteEmployee
     * @summary Invite Employee
     * @request POST:/api/employees/invite
     */
    inviteEmployee: (
      body: {
        /** @example "new.employee@example.com" */
        email?: string;
        /** @example "editor" */
        role?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/employees/invite`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete Employee
     *
     * @tags Employee Management
     * @name DeleteEmployee
     * @summary Delete Employee
     * @request DELETE:/api/employees/{employeeId}
     */
    deleteEmployee: (employeeId: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/employees/${employeeId}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Update Employee Role
     *
     * @tags Employee Management
     * @name UpdateEmployeeRole
     * @summary Update Employee Role
     * @request PUT:/api/employees/{employeeId}/role
     */
    updateEmployeeRole: (
      employeeId: string,
      body: {
        /** @example "admin" */
        role?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/employees/${employeeId}/role`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Accept a tenant invitation. The invitation token is provided in the invitation link sent by the tenant owner. After accepting, the user can login using the Clerk Login endpoint.
     *
     * @tags Invitations
     * @name AcceptInvitation
     * @summary Accept Invitation
     * @request POST:/api/invitations/{invitationToken}/accept
     */
    acceptInvitation: (
      invitationToken: string,
      body: {
        /** @example "" */
        clerkUserId?: string;
        /** @example "" */
        firstName?: string;
        /** @example "" */
        lastName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/invitations/${invitationToken}/accept`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Decline a tenant invitation. This will remove the invitation from the system.
     *
     * @tags Invitations
     * @name DeclineInvitation
     * @summary Decline Invitation
     * @request POST:/api/invitations/{invitationToken}/decline
     */
    declineInvitation: (invitationToken: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/invitations/${invitationToken}/decline`,
        method: "POST",
        ...params,
      }),

    /**
     * @description Get Profile
     *
     * @tags Profile
     * @name GetProfile
     * @summary Get Profile
     * @request GET:/api/profile
     */
    getProfile: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/profile`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update Profile
     *
     * @tags Profile
     * @name UpdateProfile
     * @summary Update Profile
     * @request PUT:/api/profile
     */
    updateProfile: (
      body: {
        /** @example "John Updated" */
        firstName?: string;
        /** @example "Doe Updated" */
        lastName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/profile`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 🏢 **Flexible Tenant API**\n\nGets tenant information with flexible filtering and sorting for embedded employees. Uses the same environment variables as the Employees API.\n\n**📋 Available Parameters:**\n- `role`: Filter employees by role (owner, admin, editor)\n- `isActive`: Filter employees by active status (true, false)\n- `search`: Search across employee firstName, lastName, and email\n- `sortBy`: Sort employees by field (firstName, lastName, email, role, isActive, createdAt, updatedAt)\n- `sortOrder`: Sort direction (asc, desc)\n- `page`: Page number for employee pagination (default: 1)\n- `limit`: Items per page for employee pagination (default: 20, max: 100)\n\n**💡 Usage Examples:**\n```\n// Get tenant with only admin employees\nSet employeeRole = "admin"\n\n// Get tenant with active employees sorted by name\nSet employeeStatus = "true", sortBy = "firstName", sortOrder = "asc"\n\n// Search tenant employees\nSet searchTerm = "john"\n```\n\n**🔧 Response:**\nReturns tenant object with employees array and employeePagination metadata when pagination is used.
     *
     * @tags Tenant Management
     * @name GetTenantFlexible
     * @summary Get Tenant (Flexible)
     * @request GET:/api/tenants
     */
    getTenantFlexible: (
      query?: {
        /** Filter employees by role (owner, admin, editor) */
        role?: string;
        /** Filter employees by active status (true, false) */
        isActive?: string;
        /** Search across employee firstName, lastName, and email */
        search?: string;
        /** Sort field (firstName, lastName, email, role, isActive, createdAt, updatedAt) */
        sortBy?: string;
        /** Sort direction (asc, desc) */
        sortOrder?: string;
        /** Page number for pagination */
        page?: string;
        /** Items per page for pagination */
        limit?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/tenants`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Update Tenant
     *
     * @tags Tenant Management
     * @name UpdateTenant
     * @summary Update Tenant
     * @request PUT:/api/tenants
     */
    updateTenant: (
      body: {
        /** @example "acme.com" */
        domain?: string;
        /** @example "https://example.com/logo.png" */
        logo?: string;
        /** @example "Acme Corp Updated" */
        name?: string;
        /** @example "{"theme": "dark", "timezone": "UTC"}" */
        settings?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/tenants`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),
  };
  health = {
    /**
     * @description Health Check
     *
     * @tags System
     * @name HealthCheck
     * @summary Health Check
     * @request GET:/health
     */
    healthCheck: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/health`,
        method: "GET",
        ...params,
      }),
  };
}
