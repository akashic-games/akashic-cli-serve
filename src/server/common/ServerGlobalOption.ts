export interface ServerGlobalOption {
	host: string;
	port: number;
	useRequestedHost: boolean;
	useRequestedPort: boolean;
}

export const DEFAULT_HOST = "localhost";
export const DEFAULT_PORT = 3300;

export const serverGlobalOption: ServerGlobalOption = {
	host: DEFAULT_HOST,
	port: DEFAULT_PORT,
	useRequestedHost: false,
	useRequestedPort: false
};
