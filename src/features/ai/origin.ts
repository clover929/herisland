const loopback=new Set(['localhost','127.0.0.1','[::1]']);
/** Next dev may normalize request.url to localhost despite a loopback Host header.
 * Only development allows these explicit aliases, with identical protocol/port.
 * Forwarded headers are deliberately not trusted.
 */
export function allowedOrigin(request:Request,development=process.env.NODE_ENV==='development'):boolean{
 if(request.headers.get('sec-fetch-site')==='cross-site')return false;
 const raw=request.headers.get('origin');
 if(!raw)return true; // CLI clients have no browser Origin.
 try{
 const origin=new URL(raw),target=new URL(request.url);
 if(raw!==origin.origin||origin.username||origin.password)return false;
 if(origin.origin===target.origin)return true;
 if(!development||!loopback.has(origin.hostname)||!loopback.has(target.hostname)||origin.protocol!==target.protocol||origin.port!==target.port)return false;
 const host=request.headers.get('host');
 if(!host)return false;
 const actual=new URL(target.protocol+'//'+host);
 return actual.host===host&&loopback.has(actual.hostname)&&actual.port===target.port;
 }catch{return false}
}
