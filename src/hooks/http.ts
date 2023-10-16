import i18n from "../i18n";
import sleep from "../helpers/sleep";
import axios from "axios";
import retry from "retry";
import { useState } from "../hooks/state";
import type { AxiosInstance, AxiosPromise, AxiosRequestConfig, AxiosResponse } from "axios";

interface RequestAxiosConfig extends AxiosRequestConfig {
    signalId?: string,
    delay?: number,
    withoutAbortSignal?: boolean,
    beforeRequest?: (config: RequestAxiosConfig) => Promise<void> | void;
    afterRequest?: (response: any) => Promise<void> | void;
    onConnectionError?: (message: string) => Promise<void> | void;
}

interface HttpRetryConfig {
    config?: RequestAxiosConfig,
    forever?: boolean,
    retries?: number,
    factor?: number,
    minTimeout?: number,
    retryWhen?: ((attempt: number, error: any) => boolean) | null,
    onRetry?: ((attempt: number, error: any) => void) | null
}

interface UseHttpRetry {
    get: <T = any>(url: string, config?: RequestAxiosConfig) => AxiosPromise<T>
    post: <T = any>(url: string, config?: RequestAxiosConfig) => AxiosPromise<T>
    promise: <T = any>(request: Promise<T>) => Promise<T>
}

const state = useState();
const trans = i18n.global;

export const abortSignal = {
    get ["key_name"]() {
        return "AXIOS_SIGNAL";
    },

    get ["signal"]() {
        return state.get(this.key_name, []);
    },

    add(key: string, abortController: AbortController) {
        const signal = this.signal;

        if (Array.isArray(signal[key])) {
            signal[key].push(abortController);
        } else {
            signal[key] = [abortController];
        }

        state.set(this.key_name, signal);
        return this;
    },

    abort(key: string) {
        const signal = this.signal;
        if (Array.isArray(signal[key])) {
            signal[key].forEach((signal: AbortController) => signal.abort());
            signal[key] = [];
        }
        
        state.set(this.key_name, signal);
        return this;
    },

    abortAll() {
        Object.keys(this.signal).forEach(
            key => this.abort(key)
        );
        return this;
    },

    get(key: string | null = null) {
        return (key ? (this.signal[key] || null) : this.signal);
    }
}

export const useHttp = (config: RequestAxiosConfig = {}): AxiosInstance => {
    const client: AxiosInstance = axios.create(config);

    client.interceptors.request.use(
        async (config: any) => {
            if (!config.signal && !config.withoutAbortSignal) {
                const controller = new AbortController();
                const key = config.signalId || state.get("CURRENT_ROUTE_NAME");
                abortSignal.add(key, controller);
                config.signal = controller.signal;
            }

            if (config.beforeRequest) {
                await config.beforeRequest(config);
            }

            if (config.delay) {
                await sleep(config.delay);
            }

            return config;
        }
    );

    client.interceptors.response.use(
        async response => {
            const config = (response?.config as RequestAxiosConfig);
    
            if (config?.afterRequest) {
                await config.afterRequest(response)
            }
        
            return Promise.resolve(response);
        },
        async error => {
            const config = (error?.config as RequestAxiosConfig);

            if (config?.afterRequest) {
                await config.afterRequest(error)
            }

            const assignable = {
                _message: "",
                type: {
                    connection: false,
                    cancel: false,
                    unknown: false
                }
            }
        
            if (axios.isCancel(error)) {
                assignable.type.cancel = true;
                assignable._message = trans.t("error.request-cancel");
            } else if (error.request?.status === 0) {
                assignable.type.connection = true;
                assignable._message = trans.t(navigator.onLine ? "error.cant-connect-internet" : "error.no-internet");
            } else {
                assignable.type.unknown = true;
                assignable._message = error?.toString();
            }
        
            if (assignable.type.connection && config?.onConnectionError) {
                await config.onConnectionError(assignable._message);
            }
        
            Object.assign(error, assignable);
            return Promise.reject(error);
        }
    
    );

    return client;
}

export const useHttpRetry = ({
    config      = {},
    forever     = true,
    retries     = 10,
    factor      = 1,
    minTimeout  = 2000,
    retryWhen   = null,
    onRetry     = null
}: HttpRetryConfig = {}): UseHttpRetry => {
    const applyAttempt = <T>(request: Promise<T>): Promise<T> => {
        const operation = retry.operation({
            forever,
            retries,
            factor,
            minTimeout
        });

        const r = (attempt: number, e: any) => {
            if (onRetry) onRetry(attempt, e)
            operation.retry(true as any);
        }

        return new Promise((resolve, reject) => operation.attempt((attempt: number) => {
            request.then(resolve).catch((e: any) => {
                if (retryWhen) {
                    retryWhen(attempt, e) ? r(attempt, e) : reject(e)
                } else if (e?.type?.connection && (forever || attempt < retries)) {
                    r(attempt, e);
                } else {
                    reject(e)
                }
            })
        }))
    }

    const http = useHttp(config);

    return {
        get<T = any>(url: string, config: RequestAxiosConfig = {}): AxiosPromise<T> {
            return applyAttempt<AxiosResponse<T>>(http.get(url, config));
        },
        post<T = any>(url: string, config: RequestAxiosConfig = {}): AxiosPromise<T> {
            return applyAttempt<AxiosResponse<T>>(http.post(url, config));
        },
        promise<T = any>(request: Promise<T>): Promise<T> {
            return applyAttempt<T>(request);
        }
    }
}