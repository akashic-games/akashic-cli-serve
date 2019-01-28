import * as express from "express";
import { handleToGetEngineConfig, handleToGetRawEngineConfig } from "../controller/ConfigController";

export const createConfigRouter = (): express.Router => {
	const configRouter = express.Router();

	configRouter.get("/engine", handleToGetEngineConfig);
	// /engineとの相違点はスクリプトアセット加工前のコンテンツを含む情報を投げること
	// サーバー側でインスタンスを立ち上げる時は加工前のスクリプトアセットを参照する必要がある
	configRouter.get("/engine/raw", handleToGetRawEngineConfig);

	return configRouter;
};
