/**
 *
 */
import {NODE_CREATED,NODE_DELETED,NODE_DATA_CHANGED ,NODE_CHILDREN_CHANGED} from "node-zookeeper-client/lib/Event";
import sleep from "./sleep";
import log4js from "@log4js-node/log4js-api";
const logger = log4js.getLogger("thrift-rpc/Configuration.js");

export default class Configuration{
    constructor(zkClient){
        this.zkClient = zkClient;
        this.ready = false;
        this.serviceList = {};
        this.init().catch(err=>{throw new Error(err)});
    }
    init=async ()=>{
        await this.zkClient.waitUntilConnected();
        await
        await this.listService(this.zkClient,"/thrift/service");
        this.ready = true;
    }
    ensureRoot= async ()=>{
        await this.zkClient.waitUntilConnected();
        let exist = await
    }
    waitInitialization=async ()=>{
        while(true){
            if(this.ready){
                logger.info("Configuration Initialization complete!")
                return;
            }
            await sleep(500);
        }
    }
    listService=async (zkClient,rootPath)=> {
        if(!await zkClient.exists(rootPath)){
            return;
        }
        await zkClient.waitUntilConnected();
        let groups = await zkClient.getChildren(rootPath);
        if(!groups||!groups.length){
            logger.warn("没有thrift分组信息")
            return;
        }
        for(let i=0;i<groups.length;i++){
            let group = groups[i];
            await this.findGroup(zkClient,rootPath,group);
        }
    }
    findGroup=async (zkClient,rootPath,group)=> {
        let serviceNodes = await zkClient.getChildren(`${rootPath}/${group}`);
        for(let j=0;j<serviceNodes.length;j++){
            let serviceNodeName = serviceNodes[j];
            await this.findService(zkClient,rootPath,group,serviceNodeName);
            logger.info(`${group}#${serviceNodeName}`);
        }
    }
    findService=async (zkClient,rootPath,group,serviceNodeName)=> {
        let [name,version] = serviceNodeName.split("#");
        let providers = await this.findProviders(zkClient,rootPath,group,serviceNodeName);
        this.serviceList[`${group}#${serviceNodeName}`] = {name,version,providers};
    }
    findProviders=async (zkClient,rootPath,group,serviceNodeName)=> {

        let providers = await zkClient.getChildren(`${rootPath}/${group}/${serviceNodeName}`,(event)=>{
            switch (event.type){
                case NODE_CREATED:
                    logger.info("NODE_CREATED",event.path);
                    break;
                case NODE_CHILDREN_CHANGED:
                    this.findService(zkClient,rootPath,group,serviceNodeName)
                        .then(res=>logger.log("Service NODE_CHILDREN_CHANGED",event.path,JSON.stringify(this.serviceList[`${group}#${serviceNodeName}`])))
                        .catch(err=>logger.error(err));
                    break;
                case NODE_DATA_CHANGED:
                    logger.info("Service NODE_DATA_CHANGED",event.path);
                    break;
                case NODE_DELETED:
                    logger.info("Service NODE_DELETED",event.path);
                    break;
            }
        });
        let result = [];
        for(let i=0;i<providers.length;i++){
            let provider = providers[i];
            let data = await zkClient.getData(`${rootPath}/${group}/${serviceNodeName}/${provider}`);
            result.push(JSON.parse(data))
        }
        return result;
    }

}

