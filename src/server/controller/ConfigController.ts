import * as express from "express";
import * as EngineConfig from "../domain/EngineConfig";
import { InternalServerError } from "../common/ApiError";
import {serverGlobalConfig} from "../common/ServerGlobalConfig";

export const createHandlerToGetEngineConfig = (isRaw: boolean): express.RequestHandler => {
	return (req, res, next) => {
		try {
			const urlInfo = req.header("host").split(":");
			// 80番ポートでサーバーが起動する想定はない(そもそも起動できない)ので、ポート番号が見つからなかったらエラーを投げる
			if (urlInfo.length === 1) {
				throw new InternalServerError({ errorMessage: "can not connect to port 80" });
			}
			const hostName = serverGlobalConfig.useRequestedHostName ? serverGlobalConfig.hostName : urlInfo[0];
			const port = serverGlobalConfig.useRequestedPort ? serverGlobalConfig.port : parseInt(urlInfo[1], 10);
			const baseUrl = `http://${hostName}:${port}`;
			const engineConfigJson = EngineConfig.getEngineConfig(baseUrl, isRaw);
			// akashic-gameview側でレスポンスがengineConfigJsonの形式なっていることを前提にしているので、resoponseSuccessは使わない
			res.status(200).json(engineConfigJson);
		} catch (e) {
			next(e);
		}
	};
};
