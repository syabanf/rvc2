/* Runs in <head> before first paint (see app/layout.tsx), so the right
   platform layer and member gating apply to the static HTML with no flash.
   In a browser, ?platform=ios|android|pwa previews another layer and is
   remembered. Inside Capacitor the app uses NATIVE_LOOK (the PWA design for
   now) and html[data-native] names the real OS.
   Capacitor serves the root index.html for every extensionless URL, so a
   reload of /photos/x/ would show Home: remember the URL, reset to "/" before
   React hydrates, and NativeRoute navigates there once the app is up.
   html[data-splash] shows the launch film (native app / installed PWA, once
   per session; ?splash=1 to preview in a browser). */
const NATIVE_LOOK = "'pwa'"; // "c.getPlatform()" to use the iOS / Material layers

export const BOOT_SCRIPT = `(function(){
var d=document.documentElement,p=null;
try{p=new URLSearchParams(location.search).get('platform');if(p)localStorage.setItem('rvc-platform',p);else p=localStorage.getItem('rvc-platform')}catch(e){}
var c=window.Capacitor,n=c&&c.isNativePlatform&&c.isNativePlatform();
if(n){
d.setAttribute('data-native',c.getPlatform());
p=${NATIVE_LOOK};
if(location.pathname!=='/'){try{sessionStorage.setItem('rvc-route',location.pathname+location.search)}catch(e){}history.replaceState(null,'','/')}
}
if(p!=='ios'&&p!=='android')p='pwa';
d.setAttribute('data-platform',p);
var sp=0;try{sp=(n||matchMedia('(display-mode: standalone)').matches||/[?&]splash=1/.test(location.search))&&!sessionStorage.getItem('rvc-splashed')}catch(e){}
if(sp)d.setAttribute('data-splash','1');
var m='0';try{if(localStorage.getItem('rvc-member')==='1')m='1'}catch(e){}
d.setAttribute('data-member',m);
})();`;

/* First thing in <body>: dark by default, light (white) when the visitor
   picked it. On <body> so every .theme-light rule — dialogs included — applies
   before first paint. */
export const THEME_SCRIPT = `(function(){
var t='dark';try{t=localStorage.getItem('rvc-theme')==='light'?'light':'dark'}catch(e){}
if(t==='light'){document.body.classList.add('theme-light');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#FFFFFF')}
})();`;
