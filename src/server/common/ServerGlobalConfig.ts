export interface ServerGlobalConfig {
	hostName: string;
	port: number;
	useRequestedHostName: boolean;
	useRequestedPort: boolean;
}

export const DEFAULT_HOSTNAME = "localhost";
export const DEFAULT_PORT = 3300;

export const serverGlobalConfig: ServerGlobalConfig = {
	hostName: DEFAULT_HOSTNAME,
	port: DEFAULT_PORT,
	useRequestedHostName: false,
	useRequestedPort: false
};
