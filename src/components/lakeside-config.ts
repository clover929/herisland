export type SocialKind='instagram'|'linkedin'|'pinterest'|'mail';
export interface FooterLink {label:string;href:string}
export interface FooterConfig {
 brand:{name:string;tagline:string;homeHref:string};
 navigation:{title:string;links:FooterLink[]}[];
 socials:{kind:SocialKind;label:string;href:string}[];
 copyright:string;
 credit:{prefix:string;label:string;href:string};
 illustration:{desktop:string;mobile:string;waterDesktop:string;waterMobile:string};
}
export const footerConfig:FooterConfig={brand:{name:'HerIsland',tagline:'每一种人生，都有自己的光。\n社区昵称与示例故事均为虚构。',homeHref:'/'},navigation:[{title:'社区',links:[{label:'发现',href:'/'},{label:'讨论广场',href:'/discussions'},{label:'发布帖子',href:'/create'}]},{title:'连接',links:[{label:'兴趣社群',href:'/communities'},{label:'我的空间',href:'/profile'}]},{title:'探索',links:[{label:'女性人物资料库',href:'/women'},{label:'小晴 Sunny',href:'/ai'}]}],socials:[],copyright:'© HerSpace · 本地演示',credit:{prefix:'自在生长',label:'回到首页',href:'/'},illustration:{desktop:'/art/lakeside-etching.svg',mobile:'/art/lakeside-etching-mobile.svg',waterDesktop:'/art/water-lines.svg',waterMobile:'/art/water-lines-mobile.svg'}};
