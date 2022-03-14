"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@polkadot/api");
let api;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new api_1.WsProvider('wss://testnet3.chainx.org');
    api = new api_1.ApiPromise(({ provider }));
    api.on('connected', () => {
        console.log('connect wss');
    });
    api.on('disconnected', () => { });
    api.on('error', (error) => { });
    api.on('ready', () => {
        console.log('connect ready');
    });
    yield api.isReady;
    const transferCallIndex = Buffer.from(api.tx.xAssets.transfer.callIndex).toString('hex');
    console.log('transferCallIndex', transferCallIndex);
    //获取区块的所有交易
    function getTransfers() {
        return __awaiter(this, void 0, void 0, function* () {
            //获取当前最新块高
            const blockNumber = yield api.derive.chain.bestNumber();
            const blockHash = yield api.rpc.chain.getBlockHash(blockNumber);
            const block = yield api.rpc.chain.getBlock(blockHash);
            const estrinsics = block.block.extrinsics;
            const transfers = [];
            for (let i = 0; i < estrinsics.length; i++) {
                const e = estrinsics[i];
                if (Buffer.from(e.method.callIndex).toString('hex') === transferCallIndex) {
                    const allEvents = yield api.query.system.events.at(blockHash);
                    const events = (allEvents.toJSON() || [])
                        .filter(({ phase }) => phase.type === 'ApplyExtrinsic' && phase.value.eqn(i))
                        .map(event => {
                        const o = event.toJSON();
                        o.method = event.event.data.method;
                        return o;
                    });
                    const result = events[events.length - 1].method;
                    transfers.push({
                        index: i,
                        blockHash: blockHash.toHex(),
                        blockNumber: blockNumber,
                        result,
                        tx: {
                            signature: e.signature.toJSON(),
                            method: e.method.toJSON(),
                        },
                        events: events,
                        txHash: e.hash.toHex(),
                    });
                }
            }
            return transfers;
        });
    }
    // getTransfers()
    //构造交易并发送
    function signAndSendExtrinsic() {
        return __awaiter(this, void 0, void 0, function* () {
            // get account balance
            const accountAsset = yield api.query.system.account('5VLqoJHjoTM4xT2fHB3KdzyjH8ryXySHraBFP2E9haKg1ewF');
            console.log('bobAssets: ', accountAsset.toJSON());
            const extrinsic = api.tx.balances.transfer('5VLqoJHjoTM4xT2fHB3KdzyjH8ryXySHraBFP2E9haKg1ewF', 1);
            console.log('Function: ', extrinsic.method.toHex());
            // 签名并发送交易 0x0000000000000000000000000000000000000000000000000000000000000000 是用于签名的私钥
            yield extrinsic.signAndSend('0x0000000000000000000000000000000000000000000000000000000000000000', (error, response) => {
                if (error) {
                    console.log(error);
                }
                else if (response === 'Finalized') {
                    if (response.result === 'ExtrinsicSuccess') {
                        console.log('交易成功');
                    }
                }
            });
        });
    }
    // signAndSendExtrinsic()
}))();
