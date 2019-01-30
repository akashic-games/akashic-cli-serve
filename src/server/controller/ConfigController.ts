import * as express from "express";
import * as EngineConfig from "../domain/EngineConfig";
import {BadRequestError} from "../common/ApiError";

export const createHandlerToGetEngineConfig = (isRaw: boolean): express.RequestHandler => {
	return (req, res, next) => {
		try {
			const urlInfo = req.header("host").split(":");
			// ポート番号80でサーバーが起動する想定はないので、ポート番号が見つからなかったらエラーを投げる
			if (urlInfo.length === 1) {
				throw new BadRequestError({ errorMessage: "portNumber is undefined" });
			}
			const engineConfigJson = EngineConfig.getEngineConfig(urlInfo[0], parseInt(urlInfo[1], 10), isRaw);
			// akashic-gameview側でレスポンスがengineConfigJsonの形式なっていることを前提にしているので、resoponseSuccessは使わない
			res.status(200).json(engineConfigJson);
		} catch (e) {
			next(e);
		}
	};
};
