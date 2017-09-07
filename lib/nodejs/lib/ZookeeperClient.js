import zookeeper from "node-zookeeper-client";
import sleep from "./sleep";
import log4js from "@log4js-node/log4js-api";
const logger = log4js.getLogger("thrift-rpc/ZookeeperClient.js");
/**
 * Zookeeper客户端
 */
export default class ZookeeperClient{
    constructor({zkAddress,sessionTimeout=3000,spinDelay=1000,retries=0,connectTimeout=5000}){
        this.client = zookeeper.createClient(zkAddress,{sessionTimeout, spinDelay, retries});
        this.connectTimeout = connectTimeout;
        this.connected = false;
        this.client.once('connected',()=>{
            logger.info('Connected to ZooKeeper.');
            this.connected = true;
        });
        this.client.connect();
    }
    waitUntilConnected=async ()=>{
        let endTime = new Date().getTime()+this.connectTimeout;
        while(true){
            if(this.connected){
                return;
            }
            if(new Date().getTime()>endTime){
                this.client.close();
                throw new Error(`zookeeper client ${this.client.getSessionId().toString("hex")} connectTimeout!`);
            }
            await sleep(500);
        }
    }
    getChildren=(path,listener)=>{
        return new Promise((resolve,reject)=>{
            this.client.getChildren(
                path,
                listener
                ,
                (error, children, stat)=> {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(children);
                }
            );
        });
    }
    getData=(path,listener)=>{
        return new Promise((resolve,reject)=>{
            this.client.getData(
                path,
                listener,
                (error, data, stat) =>{
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(data);
                }
            );
        })
    }
    exists= async (path)=>{
        return new Promise((resolve,reject)=>{
            this.client.exists(path, function (error, stat) {
                if (error) {
                    console.log(error.stack);
                    reject(error);
                    return;
                }
                if (stat) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        })

    }
    create=async (path,mode,data)=>{
        return new Promise((resolve,reject)=>{
            this.client.create(
                path,
                data?new Buffer(JSON.stringify(data)):null,
                mode,//持久
                function (error, path) {
                    if (error) {
                        console.error(error,path)
                        reject(error);
                        return;
                    }
                    resolve(true);

                }
            );
        })
    }

}



