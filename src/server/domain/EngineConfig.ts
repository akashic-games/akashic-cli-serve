import { Global } from "../common/Global";

declare const global: Global;

export interface EngineConfig {
	engine_configuration_version: string;
	engine_urls: string[];
	content_url: string;
	asset_base_url?: string;
}

export const getEngineConfig = (isRaw: boolean): EngineConfig => {
	const gameContentDir = isRaw ? "raw" : "content";
	return {
		engine_configuration_version: "2.3.5",
		engine_urls: [
			`http://${global.host}:${global.port}/public/external/engineFilesV1_0_8_Canvas.js`,
			`http://${global.host}:${global.port}/public/external/playlogClientV3_2_1.js`
		],
		content_url: `http://${global.host}:${global.port}/${gameContentDir}/game.json`,
		asset_base_url: `http://${global.host}:${global.port}/${gameContentDir}`
	};
};
