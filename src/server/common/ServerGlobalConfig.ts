export interface ServerGlobalConfig {
	hostname: string;
	port: number;
	useRequestedHostname: boolean;
	useRequestedPort: boolean;
}

export const DEFAULT_HOSTNAME = "localhost";
export const DEFAULT_PORT = 3300;

export const serverGlobalConfig: ServerGlobalConfig = {
	hostname: DEFAULT_HOSTNAME,
	port: DEFAULT_PORT,
	useRequestedHostname: false,
	useRequestedPort: false
};
