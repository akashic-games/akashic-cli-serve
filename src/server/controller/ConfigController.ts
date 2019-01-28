import * as express from "express";
import * as EngineConfig from "../domain/EngineConfig";

export const handleToGetEngineConfig = (req: express.Request, res: express.Response, next: Function): void => {
	try {
		const engineConfigJson = EngineConfig.getEngineConfig(false);
		// akashic-gameview側でレスポンスがengineConfigJsonの形式なっていることを前提にしているので、resoponseSuccessは使わない
		res.status(200).json(engineConfigJson);
	} catch (e) {
		next(e);
	}
};

export const handleToGetRawEngineConfig = (req: express.Request, res: express.Response, next: Function): void => {
	try {
		const engineConfigJson = EngineConfig.getEngineConfig(true);
		// headless-driver側でレスポンスがengineConfigJsonの形式なっていることを前提にしているので、resoponseSuccessは使わない
		res.status(200).json(engineConfigJson);
	} catch (e) {
		next(e);
	}
};
