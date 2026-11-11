import AudioProvider from "@/features/audio/audio-provider";
import LiquidNavigation from "@/components/motion/liquid-navigation";
import {PageReveal} from "@/components/motion/aurora-system";
import {LakesideFooter} from '@/components/lakeside-footer';
import {footerConfig} from '@/components/lakeside-config';
import Sunny from "@/components/sunny";
import GlassFilterDefs from "@/components/motion/glass-filter-defs";
import "./globals.css";
import "./herisland-theme.css";
import "@/components/motion/interaction-primitives.css";
import type {Metadata} from "next";

export const metadata:Metadata={title:"HerIsland · HerSpace 她的社区",description:"成年女性交流与互助社区 · 本地演示"};

export default function Layout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body><PageReveal/><LiquidNavigation/><AudioProvider/><GlassFilterDefs/>{children}<LakesideFooter config={footerConfig}/><Sunny cloudUnavailable={process.env.VERCEL==='1'}/></body></html>;
}
