declare module "stremio-api-client" {
	import { EventEmitter } from "events";

	// ApiClient
	export class ApiClient {
		constructor(options?: ApiClientOptions);

		endpoint: string;

		request<T = any>(method: string, params: Record<string, any>): Promise<T>;
	}

	export interface ApiClientOptions {
		endpoint?: string;
		authKey?: string;
	}

	// ApiStore
	export class ApiStore {
		constructor(options?: ApiStoreOptions);

		endpoint: string;
		events: EventEmitter;
		user: User | null;
		addons: AddonCollection;

		login(params: LoginParams): Promise<void>;
		loginWithToken(params: LoginWithTokenParams): Promise<void>;
		authWithApple(params: AuthWithAppleParams): Promise<void>;
		register(params: RegisterParams): Promise<void>;
		logout(): Promise<void>;
		pushUser(): Promise<void>;
		pullUser(): Promise<void>;
		pushAddonCollection(): Promise<void>;
		pullAddonCollection(): Promise<void>;
	}

	export interface ApiStoreOptions {
		endpoint?: string;
		storage?: Storage;
	}

	export interface Storage {
		getJSON<T = any>(key: string): T | null;
		setJSON<T = any>(key: string, value: T): void;
	}

	export interface User {
		_id: string;
		email: string;
		authKey?: string;
		lastModified?: string;
		[key: string]: any;
	}

	export interface AddonCollection {
		load(addons: AddonDescriptor[]): void;
		save(): AddonDescriptor[];
		getAddons(): AddonDescriptor[];
	}

	export interface AddonDescriptor {
		transportUrl: string;
		[key: string]: any;
	}

	export interface LoginParams {
		email: string;
		password: string;
		fbLoginToken?: string;
	}

	export interface LoginWithTokenParams {
		token: string;
	}

	export interface AuthWithAppleParams {
		token: string;
		sub: string;
		email: string;
		name: string;
	}

	export interface RegisterParams {
		email: string;
		password: string;
	}

	// Utility function
	export function addonsDifferent(a: AddonDescriptor[], b: AddonDescriptor[]): boolean;
}