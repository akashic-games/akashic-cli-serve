import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as socketio from "socket.io";
import * as commander from "commander";
import * as util from "util";
import chalk from "chalk";
import { PlayManager, RunnerManager, setSystemLogger } from "@akashic/headless-driver";
import { Global } from "./common/Global";
import { createScriptAssetController } from "./controller/ScriptAssetController";
import { createApiRouter } from "./route/ApiRoute";
import { createConfigRouter } from "./route/ConfigRoute";
import { RunnerStore } from "./domain/RunnerStore";
import { PlayStore } from "./domain/PlayStore";
import { SocketIOAMFlowManager } from "./domain/SocketIOAMFlowManager";

// hostやportをどこからでも参照できるようにするために暫定的にglobalを使う
// TODO: globalやめる。socket.io や express にコードに global.port を晒してまでやることではない。
declare const global: Global;

// 渡されたパラメータを全てstringに変換する
// chalkを使用する場合、ログ出力時objectの中身を展開してくれないためstringに変換する必要がある
function convertStrings(params: any[]): string[] {
	return params.map(param => {
		if (typeof param === "object") {
			return util.inspect(param, {depth: null});
		} else {
			return param.toString();
		}
	});
}

// TODOこのファイルを改名してcli.tsにする
export function run(argv: any): void {
	const DEFAULT_PORT = 3300;
	const DEFAULT_HOST = "localhost";

	const ver = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "..", "package.json"), "utf8")).version;
	commander
		.version(ver)
		.description("Development server for Akashic Engine to debug multiple-player games")
		.usage("[options] <gamepath>")
		.option("-p, --port <port>", `The port number to listen. default: ${DEFAULT_PORT}`, (x => parseInt(x, 10)), DEFAULT_PORT)
		.option("-H, --hostname <hostname>", `The host name of the server. default: ${DEFAULT_HOST}`, DEFAULT_HOST)
		.option("-v, --verbose", `display detail information on console.`)
		.parse(argv);

	if (isNaN(commander.port)) {
		console.error("Invalid --port option: " + commander.port);
		process.exit(1);
	}

	global.host = commander.hostname;
	global.port = commander.port;
	if (commander.verbose) {
		setSystemLogger({
			info: (...messages: any[]) => {
				console.log(chalk.gray(...convertStrings(messages)));
			},
			debug: (...messages: any[]) => {
				console.log(chalk.gray(...convertStrings(messages)));
			},
			warn: (...messages: any[]) => {
				console.warn(chalk.yellow(...convertStrings(messages)));
			},
			error: (...messages: any[]) => {
				console.error(chalk.red(...convertStrings(messages)));
			}
		});
	} else {
		setSystemLogger({
			info: (...messages: any[]) => {
				// {}だけだとtslintでエラーになるのでコメントアウトだけ入れる
			},
			debug: (...messages: any[]) => {
				// {}だけだとtslintでエラーになるのでコメントアウトだけ入れる
			},
			warn: (...messages: any[]) => {
				// {}だけだとtslintでエラーになるのでコメントアウトだけ入れる
			},
			error: (...messages: any[]) => {
				console.error(chalk.red(...convertStrings(messages)));
			}
		});
	}

	const targetDir = commander.args.length > 0 ? commander.args[0] : process.cwd();
	const playManager = new PlayManager();
	const runnerManager = new RunnerManager(playManager);
	const playStore = new PlayStore({playManager});
	const runnerStore = new RunnerStore({runnerManager});
	const amflowManager = new SocketIOAMFlowManager({playStore});

	// TODO ここでRunner情報を外部からPlayStoreにねじ込むのではなく、PlayEntity や PlayEntity#createRunner() を作って管理する方が自然
	runnerStore.onRunnerCreate.add(arg => playStore.registerRunner(arg));
	runnerStore.onRunnerRemove.add(arg => playStore.unregisterRunner(arg));

	const app = express();
	const httpServer = http.createServer(app);
	const io = socketio(httpServer);

	app.use((req, res, next) => {
		res.removeHeader("X-Powered-By");
		res.removeHeader("ETag");
		res.header("Cache-Control", ["private", "no-store", "no-cache", "must-revalidate", "proxy-revalidate"].join(","));
		res.header("no-cache", "Set-Cookie");
		next();
	});
	app.use(bodyParser.json());
	const scriptAssetRouter = express.Router();
	scriptAssetRouter.get("/:scriptName(*.js$)", createScriptAssetController(targetDir));

	app.use("^\/$", (req, res, next) => res.redirect("/public/"));
	app.use("/content", scriptAssetRouter);
	app.use("/content/", express.static(targetDir)); // コンテンツのスクリプトアセット加工後のパス。クライアント側でゲームを動かすために必要。
	app.use("/raw/", express.static(targetDir)); // コンテンツのスクリプトアセット加工前のパス。サーバー側でゲームを動かすために必要。
	app.use("/public/", express.static(path.join(__dirname, "..", "..", "www")));
	app.use("/api/", createApiRouter({ targetDir, playStore, runnerStore, amflowManager, io }));
	app.use("/config/", createConfigRouter());

	io.on("connection", (socket: socketio.Socket) => { amflowManager.setupSocketIOAMFlow(socket); });
	// TODO 全体ブロードキャストせず該当するプレイにだけ通知するべき？
	playStore.onPlayStatusChange.add(arg => { io.emit("playStatusChange", arg); });
	playStore.onPlayDurationStateChange.add(arg => { io.emit("playDurationStateChange", arg); });
	playStore.onPlayCreate.add(arg => { io.emit("playCreate", arg); });
	playStore.onPlayerJoin.add(arg => { io.emit("playerJoin", arg); });
	playStore.onPlayerLeave.add(arg => { io.emit("playerLeave", arg); });
	playStore.onClientInstanceAppear.add(arg => { io.emit("clientInstanceAppear", arg); });
	playStore.onClientInstanceDisappear.add(arg => { io.emit("clientInstanceDisappear", arg); });
	runnerStore.onRunnerCreate.add(arg => { io.emit("runnerCreate", arg); });
	runnerStore.onRunnerRemove.add(arg => { io.emit("runnerRemove", arg); });
	runnerStore.onRunnerPause.add(arg => { io.emit("runnerPause", arg); });
	runnerStore.onRunnerResume.add(arg => { io.emit("runnerResume", arg); });

	httpServer.listen(global.port, () => {
		// サーバー起動のログに関してはSystemLoggerで使用していない色を使いたいので緑を選択
		console.log(chalk.green(`Hosting ${targetDir} on http://${global.host}:${global.port}`));
	});
}
