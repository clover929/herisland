'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <main><section className="narrow empty" role="alert"><h1>页面暂时没有准备好</h1><p>可以重试；浏览器中的已有内容不会因此被清除。</p><button onClick={reset}>重试页面</button> <Link href="/">返回岛屿</Link></section></main>}
