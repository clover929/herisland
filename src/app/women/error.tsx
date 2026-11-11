'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main><section role="alert"><h1>人物资料暂时无法加载</h1><p>请稍后重试。</p><button onClick={reset}>重试</button></section></main>}
