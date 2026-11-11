import Link from 'next/link';
export default function NotFound(){return <main><section className="narrow empty"><h1>这条小路暂时没有通往页面</h1><p>链接可能已失效。可以回到岛屿，从功能导航重新出发。</p><Link className="primary" href="/">返回岛屿</Link><p><Link href="/discussions">讨论广场</Link> · <Link href="/women">女性人物资料库</Link></p></section></main>}
