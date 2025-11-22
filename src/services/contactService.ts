import { Api } from './tracking/tracking-api';

export interface ContactFormRequest {
    email?: string;
    message?: string;
    subject?: string;
    username?: string;
}

class ContactService {
    private api: Api<string>;

    constructor() {
        this.api = new Api<string>();
    }

    private get baseUrl() {
        return this.api.baseUrl;
    }

    private async fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(id);
            return response;
        } catch (error) {
            clearTimeout(id);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout. Please check your connection and try again.');
                }
                if (error.message.includes('Network request failed')) {
                    throw new Error('Cannot connect to server. Please check your network connection.');
                }
            }
            throw error;
        }
    }

    async submitContactForm(data: ContactFormRequest): Promise<void> {
        try {
            const response = await this.fetchWithTimeout(`${this.baseUrl}/api/contact/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
            }

            // If the response is empty or success, we assume it worked.
            // The API definition returns void, but usually there's a JSON response.
            // We'll try to parse it but not fail if it's empty.
            try {
                await response.json();
            } catch (e) {
                // Ignore JSON parse error for void response
            }

        } catch (error) {
            console.error('[Contact] Failed to submit contact form:', error);
            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();

                if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
                    throw new Error('Network error. Please check your connection and try again.');
                } else if (errorMessage.includes('429')) {
                    throw new Error('Too many requests. Please try again later.');
                } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
                    throw new Error('Invalid request. Please check your input and try again.');
                } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
                    throw new Error('Server error. Please try again later.');
                }
            }
            throw new Error('Failed to submit contact form. Please try again.');
        }
    }
}

export const contactService = new ContactService();
