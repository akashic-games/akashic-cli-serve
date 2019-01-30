import {serverGlobalOption} from "../common/ServerGlobalOption";

export interface EngineConfig {
	engine_configuration_version: string;
	engine_urls: string[];
	content_url: string;
	asset_base_url?: string;
}

export const getEngineConfig = (host: string, port: number, isRaw: boolean): EngineConfig => {
	const hostName = serverGlobalOption.useRequestedHost ? serverGlobalOption.host : host;
	const portNumber = serverGlobalOption.useRequestedPort ? serverGlobalOption.port : port;
	const gameContentDir = isRaw ? "raw" : "content";
	return {
		engine_configuration_version: "2.3.5",
		engine_urls: [
			`http://${hostName}:${portNumber}/public/external/engineFilesV1_0_8_Canvas.js`,
			`http://${hostName}:${portNumber}/public/external/playlogClientV3_2_1.js`
		],
		content_url: `http://${hostName}:${portNumber}/${gameContentDir}/game.json`,
		asset_base_url: `http://${hostName}:${portNumber}/${gameContentDir}`
	};
};
