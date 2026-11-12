/** Cloud Run terminates HTTPS before Next.js. Compare the browser with an exact,
 * operator-configured external origin instead of trusting forwarded headers. */
export function cloudbaseAllowedOrigin(request:Request,expected=process.env.APP_ORIGIN){
 if(request.headers.get('sec-fetch-site')==='cross-site')return false;
 if(!expected)return false;
 try{const url=new URL(expected);if(url.origin!==expected)return false;if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))return false;
 const origin=request.headers.get('origin');return !origin||origin===expected;
 }catch{return false}
}
