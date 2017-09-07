
export default (ms)=> {

   return new Promise((resolve,reject)=>{
       try {
           setTimeout(()=>resolve(true),ms);
       }catch (error){
           reject(error);
       }

    })
}