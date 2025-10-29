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

import Constants from 'expo-constants';

// Get API base URL from app.json extra config
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5001';

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
  // Read baseUrl from app.json extra config via expo-constants
  public baseUrl: string = API_BASE_URL;
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
    console.log('🔧 API Client initialized with baseUrl:', this.baseUrl);
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
 * @title Subscription Tracking API
 * @version 1.0.0
 * @baseUrl http://localhost:5001
 * @contact
 *
 * Complete subscription tracking API with automatic token management
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Get all categories in the system (admin only)
     *
     * @tags Admin, Categories1
     * @name GetAllCategories1
     * @summary Get All Categories
     * @request GET:/api/admin/categories
     */
    getAllCategories1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/categories`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Create new category (admin only)
     *
     * @tags Admin, Categories1
     * @name CreateCategory
     * @summary Create Category
     * @request POST:/api/admin/categories
     */
    createCategory: (
      body: {
        /** @example "Description of new category" */
        description?: string;
        /** @example "category-icon" */
        icon?: string;
        /** @example "New Category" */
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/categories`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete category from system (admin only)
     *
     * @tags Admin, Categories1
     * @name DeleteCategory
     * @summary Delete Category
     * @request DELETE:/api/admin/categories/1
     */
    deleteCategory: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/categories/1`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Get specific category details (admin only)
     *
     * @tags Admin, Categories1
     * @name GetCategoryById1
     * @summary Get Category by ID
     * @request GET:/api/admin/categories/1
     */
    getCategoryById1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/categories/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update category details (admin only)
     *
     * @tags Admin, Categories1
     * @name UpdateCategory
     * @summary Update Category
     * @request PUT:/api/admin/categories/1
     */
    updateCategory: (
      body: {
        /** @example "Updated description" */
        description?: string;
        /** @example "updated-icon" */
        icon?: string;
        /** @example "Updated Category Name" */
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/categories/1`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Upload category icon image file (admin only)
     *
     * @tags Admin, Categories1
     * @name UploadCategoryIcon
     * @summary Upload Category Icon
     * @request POST:/api/admin/categories/1/icon
     */
    uploadCategoryIcon: (
      data: {
        /** @format binary */
        icon?: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/categories/1/icon`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * @description Get all countries in the system (admin only)
     *
     * @tags Admin, Reference Data1, Countries
     * @name GetAllCountries
     * @summary Get All Countries
     * @request GET:/api/admin/countries
     */
    getAllCountries: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/countries`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Create new country (admin only)
     *
     * @tags Admin, Reference Data1, Countries
     * @name CreateCountry
     * @summary Create Country
     * @request POST:/api/admin/countries
     */
    createCountry: (
      body: {
        /** @example "JP" */
        code?: string;
        /** @example "Japan" */
        name?: string;
        /** @example "Asia" */
        region?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/countries`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete country from system (admin only)
     *
     * @tags Admin, Reference Data1, Countries
     * @name DeleteCountry
     * @summary Delete Country
     * @request DELETE:/api/admin/countries/JP
     */
    deleteCountry: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/countries/JP`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Update country details (admin only)
     *
     * @tags Admin, Reference Data1, Countries
     * @name UpdateCountry
     * @summary Update Country
     * @request PUT:/api/admin/countries/JP
     */
    updateCountry: (
      body: {
        /** @example "Updated Country Name" */
        name?: string;
        /** @example "Updated Region" */
        region?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/countries/JP`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get specific country details (admin only)
     *
     * @tags Admin, Reference Data1, Countries
     * @name GetCountryByCode
     * @summary Get Country by Code
     * @request GET:/api/admin/countries/US
     */
    getCountryByCode: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/countries/US`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all currencies in the system (admin only)
     *
     * @tags Admin, Reference Data1, Currencies
     * @name GetAllCurrencies
     * @summary Get All Currencies
     * @request GET:/api/admin/currencies
     */
    getAllCurrencies: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/currencies`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Create new currency (admin only)
     *
     * @tags Admin, Reference Data1, Currencies
     * @name CreateCurrency
     * @summary Create Currency
     * @request POST:/api/admin/currencies
     */
    createCurrency: (
      body: {
        /** @example "KRW" */
        code?: string;
        /** @example "South Korean Won" */
        name?: string;
        /** @example "₩" */
        symbol?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/currencies`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete currency from system (admin only)
     *
     * @tags Admin, Reference Data1, Currencies
     * @name DeleteCurrency
     * @summary Delete Currency
     * @request DELETE:/api/admin/currencies/KRW
     */
    deleteCurrency: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/currencies/KRW`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Update currency details (admin only)
     *
     * @tags Admin, Reference Data1, Currencies
     * @name UpdateCurrency
     * @summary Update Currency
     * @request PUT:/api/admin/currencies/KRW
     */
    updateCurrency: (
      body: {
        /** @example "Updated Currency Name" */
        name?: string;
        /** @example "Updated Symbol" */
        symbol?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/currencies/KRW`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get specific currency details (admin only)
     *
     * @tags Admin, Reference Data1, Currencies
     * @name GetCurrencyByCode
     * @summary Get Currency by Code
     * @request GET:/api/admin/currencies/USD
     */
    getCurrencyByCode: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/currencies/USD`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all admin logs with pagination (admin only)
     *
     * @tags Admin, Admin Logs
     * @name GetAllLogs
     * @summary Get All Logs
     * @request GET:/api/admin/logs
     */
    getAllLogs: (
      query?: {
        page?: string;
        limit?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/logs`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Get logs for specific admin user (admin only)
     *
     * @tags Admin, Admin Logs
     * @name GetLogsByAdminId
     * @summary Get Logs by Admin ID
     * @request GET:/api/admin/logs/admin/1
     */
    getLogsByAdminId: (
      query?: {
        page?: string;
        limit?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/logs/admin/1`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Get admin log statistics and recent activities (admin only)
     *
     * @tags Admin, Admin Logs
     * @name GetLogStatistics
     * @summary Get Log Statistics
     * @request GET:/api/admin/logs/stats
     */
    getLogStatistics: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/logs/stats`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all subscription plans in the system (admin only)
     *
     * @tags Admin, Plans
     * @name GetAllPlans
     * @summary Get All Plans
     * @request GET:/api/admin/plans
     */
    getAllPlans: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/plans`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Create new subscription plan (admin only)
     *
     * @tags Admin, Plans
     * @name CreatePlan
     * @summary Create Plan
     * @request POST:/api/admin/plans
     */
    createPlan: (
      body: {
        /** @example "monthly" */
        billing_cycle?: string;
        features?: {
          /** @example 6 */
          downloads?: number;
          /** @example "4K" */
          quality?: string;
          /** @example 4 */
          screens?: number;
        };
        /** @example true */
        is_active?: boolean;
        /** @example "Premium Plan" */
        name?: string;
        /** @example "premium" */
        slug?: string;
        /** @example 1 */
        subscription_id?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/plans`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete plan from system (admin only)
     *
     * @tags Admin, Plans
     * @name DeletePlan
     * @summary Delete Plan
     * @request DELETE:/api/admin/plans/1
     */
    deletePlan: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/plans/1`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Get specific plan details (admin only)
     *
     * @tags Admin, Plans
     * @name GetPlanById
     * @summary Get Plan by ID
     * @request GET:/api/admin/plans/1
     */
    getPlanById: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/plans/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update plan details (admin only)
     *
     * @tags Admin, Plans
     * @name UpdatePlan
     * @summary Update Plan
     * @request PUT:/api/admin/plans/1
     */
    updatePlan: (
      body: {
        /** @example "yearly" */
        billing_cycle?: string;
        features?: {
          /** @example 10 */
          downloads?: number;
          /** @example "8K" */
          quality?: string;
          /** @example 6 */
          screens?: number;
        };
        /** @example false */
        is_active?: boolean;
        /** @example "Updated Premium Plan" */
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/plans/1`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get all price records in the system (admin only)
     *
     * @tags Admin, Prices
     * @name GetAllPrices
     * @summary Get All Prices
     * @request GET:/api/admin/prices
     */
    getAllPrices: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/prices`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Create new price record (admin only)
     *
     * @tags Admin, Prices
     * @name CreatePrice
     * @summary Create Price
     * @request POST:/api/admin/prices
     */
    createPrice: (
      body: {
        /** @example "US" */
        country_code?: string;
        /** @example "USD" */
        currency?: string;
        /** @example 1 */
        plan_id?: number;
        /** @example 12.99 */
        price?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/prices`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete price record from system (admin only)
     *
     * @tags Admin, Prices
     * @name DeletePrice
     * @summary Delete Price
     * @request DELETE:/api/admin/prices/1
     */
    deletePrice: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/prices/1`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Get specific price record (admin only)
     *
     * @tags Admin, Prices
     * @name GetPriceById
     * @summary Get Price by ID
     * @request GET:/api/admin/prices/1
     */
    getPriceById: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/prices/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update price record (admin only)
     *
     * @tags Admin, Prices
     * @name UpdatePrice
     * @summary Update Price
     * @request PUT:/api/admin/prices/1
     */
    updatePrice: (
      body: {
        /** @example "EUR" */
        currency?: string;
        /** @example 15.99 */
        price?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/prices/1`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get all subscriptions in the system (admin only)
     *
     * @tags Admin, Subscriptions
     * @name GetAllSubscriptions1
     * @summary Get All Subscriptions
     * @request GET:/api/admin/subscriptions
     */
    getAllSubscriptions1: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/subscriptions`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Create new subscription (admin only)
     *
     * @tags Admin, Subscriptions
     * @name CreateSubscription
     * @summary Create Subscription
     * @request POST:/api/admin/subscriptions
     */
    createSubscription: (
      body: {
        /** @example 1 */
        category_id?: number;
        /** @example 9.99 */
        default_price?: number;
        /** @example "Description of new subscription" */
        description?: string;
        /** @example "https://example.com/logo.png" */
        logo_url?: string;
        /** @example "New Subscription" */
        name?: string;
        /** @example "https://example.com" */
        website_url?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/subscriptions`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Delete subscription from system (admin only)
     *
     * @tags Admin, Subscriptions
     * @name DeleteSubscription
     * @summary Delete Subscription
     * @request DELETE:/api/admin/subscriptions/1
     */
    deleteSubscription: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/subscriptions/1`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Get specific subscription details (admin only)
     *
     * @tags Admin, Subscriptions
     * @name GetSubscriptionById
     * @summary Get Subscription by ID
     * @request GET:/api/admin/subscriptions/1
     */
    getSubscriptionById: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/subscriptions/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update subscription details (admin only)
     *
     * @tags Admin, Subscriptions
     * @name UpdateSubscription
     * @summary Update Subscription
     * @request PUT:/api/admin/subscriptions/1
     */
    updateSubscription: (
      body: {
        /** @example 2 */
        category_id?: number;
        /** @example 12.99 */
        default_price?: number;
        /** @example "Updated description" */
        description?: string;
        /** @example "https://example.com/updated-logo.png" */
        logo_url?: string;
        /** @example "Updated Subscription Name" */
        name?: string;
        /** @example "https://updated-example.com" */
        website_url?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/subscriptions/1`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get all users in the system (admin only)
     *
     * @tags Admin, Users
     * @name GetAllUsers
     * @summary Get All Users
     * @request GET:/api/admin/users
     */
    getAllUsers: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/users`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Delete user from system (admin only)
     *
     * @tags Admin, Users
     * @name DeleteUser
     * @summary Delete User
     * @request DELETE:/api/admin/users/1
     */
    deleteUser: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/users/1`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Get specific user details (admin only)
     *
     * @tags Admin, Users
     * @name GetUserById
     * @summary Get User by ID
     * @request GET:/api/admin/users/1
     */
    getUserById: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/admin/users/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update user details (admin only)
     *
     * @tags Admin, Users
     * @name UpdateUser
     * @summary Update User
     * @request PUT:/api/admin/users/1
     */
    updateUser: (
      body: {
        /** @example "TRY" */
        currency?: string;
        /** @example "updated@example.com" */
        email?: string;
        /** @example "Updated Name" */
        name?: string;
        /** @example "TR" */
        region?: string;
        /** @example "customer" */
        role?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/admin/users/1`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get most popular custom subscriptions (admin only)
     *
     * @tags Analytics
     * @name TopCustomSubscriptions
     * @summary Top Custom Subscriptions
     * @request GET:/api/analytics/custom-subscriptions
     */
    topCustomSubscriptions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/custom-subscriptions`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get complete analytics dashboard with all statistics (admin only)
     *
     * @tags Analytics
     * @name CompleteDashboard
     * @summary Complete Dashboard
     * @request GET:/api/analytics/dashboard
     */
    completeDashboard: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/dashboard`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get dashboard overview statistics (admin only)
     *
     * @tags Analytics
     * @name DashboardOverview
     * @summary Dashboard Overview
     * @request GET:/api/analytics/overview
     */
    dashboardOverview: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/overview`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get most popular subscription plans (admin only)
     *
     * @tags Analytics
     * @name MostPopularPlans
     * @summary Most Popular Plans
     * @request GET:/api/analytics/popular-plans
     */
    mostPopularPlans: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/popular-plans`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get most popular preset subscriptions (admin only)
     *
     * @tags Analytics
     * @name MostPopularSubscriptions
     * @summary Most Popular Subscriptions
     * @request GET:/api/analytics/popular-subscriptions
     */
    mostPopularSubscriptions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/popular-subscriptions`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get revenue breakdown by category (admin only)
     *
     * @tags Analytics
     * @name RevenueByCategory
     * @summary Revenue by Category
     * @request GET:/api/analytics/revenue-by-category
     */
    revenueByCategory: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/revenue-by-category`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get user segmentation by billing cycle, currency, and region (admin only)
     *
     * @tags Analytics
     * @name UserSegmentation
     * @summary User Segmentation
     * @request GET:/api/analytics/user-segmentation
     */
    userSegmentation: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/analytics/user-segmentation`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Login - Token auto-saved
     *
     * @tags Auth
     * @name Login
     * @summary Login
     * @request POST:/api/auth/login
     */
    login: (
      body: {
        /** @example "john@example.com" */
        email?: string;
        /** @example "123456" */
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/auth/login`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get profile - Token auto-used (Collection Auth)
     *
     * @tags Customer, Profile
     * @name GetProfile
     * @summary Get Profile
     * @request GET:/api/auth/profile
     */
    getProfile: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/profile`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Update user profile (region, currency, name)
     *
     * @tags Customer, Profile
     * @name UpdateProfile
     * @summary Update Profile
     * @request PUT:/api/auth/profile
     */
    updateProfile: (
      body: {
        /** @example "TRY" */
        currency?: string;
        /** @example "John Doe Updated" */
        name?: string;
        /** @example "TR" */
        region?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/auth/profile`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Register a new user - Token auto-saved
     *
     * @tags Auth
     * @name Register
     * @summary Register
     * @request POST:/api/auth/register
     */
    register: (
      body: {
        /** @example "john@example.com" */
        email?: string;
        /** @example "John Doe" */
        name?: string;
        /** @example "123456" */
        password?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/auth/register`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Filter subscriptions by category (1=Streaming, 2=Music, etc.)
     *
     * @tags Customer, Subscription Catalog
     * @name GetSubscriptionsByCategory
     * @summary Get Subscriptions by Category
     * @request GET:/api/catalog/subscriptions
     */
    getSubscriptionsByCategory: (
      query?: {
        category_id?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/catalog/subscriptions`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description Get subscription details with plans and prices (filtered by user's region)
     *
     * @tags Customer, Subscription Catalog
     * @name GetSubscriptionDetails
     * @summary Get Subscription Details
     * @request GET:/api/catalog/subscriptions/1
     */
    getSubscriptionDetails: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/catalog/subscriptions/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all plans for a subscription (Basic, Standard, Premium)
     *
     * @tags Customer, Subscription Catalog
     * @name GetSubscriptionPlans
     * @summary Get Subscription Plans
     * @request GET:/api/catalog/subscriptions/1/plans
     */
    getSubscriptionPlans: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/catalog/subscriptions/1/plans`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all subscription categories (Streaming, Music, AI, etc.)
     *
     * @tags Customer, Categories
     * @name GetAllCategories
     * @summary Get All Categories
     * @request GET:/api/categories
     */
    getAllCategories: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/categories`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get single category details
     *
     * @tags Customer, Categories
     * @name GetCategoryById
     * @summary Get Category by ID
     * @request GET:/api/categories/1
     */
    getCategoryById: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/categories/1`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all my active subscriptions
     *
     * @tags Customer, My Subscriptions
     * @name GetMySubscriptions
     * @summary Get My Subscriptions
     * @request GET:/api/my-subscriptions
     */
    getMySubscriptions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/my-subscriptions`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Delete subscription from my list
     *
     * @tags Customer, My Subscriptions
     * @name DeleteMySubscription
     * @summary Delete My Subscription
     * @request DELETE:/api/my-subscriptions/1
     */
    deleteMySubscription: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/my-subscriptions/1`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description Update subscription details (price, billing date, status)
     *
     * @tags Customer, My Subscriptions
     * @name UpdateMySubscription
     * @summary Update My Subscription
     * @request PUT:/api/my-subscriptions/1
     */
    updateMySubscription: (
      body: {
        /** @example 250 */
        custom_price?: number;
        /** @example "2024-03-01" */
        next_billing_date?: string;
        /** @example "Updated gym membership price" */
        notes?: string;
        /** @example "active" */
        status?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/my-subscriptions/1`,
        method: "PUT",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Add custom subscription (not in catalog)
     *
     * @tags Customer, My Subscriptions
     * @name AddCustomSubscription
     * @summary Add Custom Subscription
     * @request POST:/api/my-subscriptions/custom
     */
    addCustomSubscription: (
      body: {
        /** @example "monthly" */
        custom_billing_cycle?: string;
        /** @example 11 */
        custom_category_id?: number;
        /** @example "TRY" */
        custom_currency?: string;
        /** @example "Local Gym Membership" */
        custom_name?: string;
        /** @example 200 */
        custom_price?: number;
        /** @example "2024-02-01" */
        next_billing_date?: string;
        /** @example "Fitness center membership" */
        notes?: string;
        /** @example "2024-01-01" */
        start_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/my-subscriptions/custom`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Add subscription from catalog (Netflix, Spotify, etc.)
     *
     * @tags Customer, My Subscriptions
     * @name AddPresetSubscription
     * @summary Add Preset Subscription
     * @request POST:/api/my-subscriptions/preset
     */
    addPresetSubscription: (
      body: {
        /** @example "2024-02-01" */
        next_billing_date?: string;
        /** @example "Netflix Premium plan" */
        notes?: string;
        /** @example 3 */
        plan_id?: number;
        /** @example "2024-01-01" */
        start_date?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/api/my-subscriptions/preset`,
        method: "POST",
        body: body,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Get subscription statistics and monthly costs
     *
     * @tags Customer, My Subscriptions
     * @name GetMySubscriptionStats
     * @summary Get My Subscription Stats
     * @request GET:/api/my-subscriptions/stats
     */
    getMySubscriptionStats: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/my-subscriptions/stats`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all countries list
     *
     * @tags Customer, Reference Data
     * @name GetCountries
     * @summary Get Countries
     * @request GET:/api/reference/countries
     */
    getCountries: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/reference/countries`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get countries filtered by region (e.g., Europe, Asia, North America)
     *
     * @tags Customer, Reference Data
     * @name GetCountriesByRegion
     * @summary Get Countries by Region
     * @request GET:/api/reference/countries/region/Europe
     */
    getCountriesByRegion: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/reference/countries/region/Europe`,
        method: "GET",
        ...params,
      }),

    /**
     * @description Get all currencies list
     *
     * @tags Customer, Reference Data
     * @name GetCurrencies
     * @summary Get Currencies
     * @request GET:/api/reference/currencies
     */
    getCurrencies: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/reference/currencies`,
        method: "GET",
        ...params,
      }),
  };
  health = {
    /**
     * @description Check if server is running
     *
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
