/** Only return to the existing public directory, never to an arbitrary URL. */
export function womenReturn(value:unknown){return typeof value==='string'&&value.length<=2048&&(value==='/women'||value.startsWith('/women?'))?value:'/women'}
