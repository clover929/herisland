/** Native form safety net: never accept credentials or community writes without
 * the hydrated client, validated bearer identity and normal action handler. */
export async function POST(){return Response.json({error:'页面尚未准备好，请返回并等待页面加载完成后重试。'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
